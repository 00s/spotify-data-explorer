import { format, parseISO } from 'date-fns';
import {
  StreamingHistoryItem,
  NormalizedStreamingItem,
  ListeningSession,
  SessionCatalog,
  StreamingHistoryMusic,
  StreamingHistoryPodcast,
  ParsedData,
} from '../types/spotify';

// Session gap threshold: 60 minutes in seconds
const SESSION_GAP_THRESHOLD = 3600;

/**
 * Convert raw streaming history (music + podcast) into unified StreamingHistoryItem array
 */
export function unifyStreamingHistory(data: ParsedData): StreamingHistoryItem[] {
  const unified: StreamingHistoryItem[] = [];

  // Convert music items
  data.streamingHistoryMusic.forEach((item, index) => {
    unified.push({
      id: `music_${index}`,
      type: 'music',
      ...item,
    });
  });

  // Convert podcast items
  data.streamingHistoryPodcast.forEach((item, index) => {
    unified.push({
      id: `podcast_${index}`,
      type: 'podcast',
      ...item,
    });
  });

  return unified;
}

/**
 * Compute start/end timestamps for a streaming item
 */
function computeTimestamps(item: StreamingHistoryItem, index: number): NormalizedStreamingItem {
  // Parse endTime: handle both "YYYY-MM-DD HH:mm" and ISO formats
  const endTimeStr = item.ts || item.endTime || '';
  let endDate: Date;

  try {
    // Convert "YYYY-MM-DD HH:mm" to ISO format "YYYY-MM-DDTHH:mm"
    const isoStr = endTimeStr.includes('T') ? endTimeStr : endTimeStr.replace(' ', 'T');
    endDate = parseISO(isoStr);
  } catch (error) {
    // Fallback to current time if parsing fails
    endDate = new Date();
  }

  const endTimestampSeconds = Math.floor(endDate.getTime() / 1000);

  // Calculate duration and start time
  const msPlayed = item.ms_played || item.msPlayed || 0;
  const durationSeconds = Math.round(msPlayed / 1000);
  const startTimestampSeconds = endTimestampSeconds - durationSeconds;

  return {
    ...item,
    endTimestampSeconds,
    startTimestampSeconds,
    durationSeconds,
    sessionId: '',
    sessionIndex: 0,
    globalIndex: index,
  };
}

/**
 * Sort items by timeline (start time, then end time for ties)
 */
function sortByTimeline(items: NormalizedStreamingItem[]): NormalizedStreamingItem[] {
  const sorted = [...items].sort((a, b) => {
    if (a.startTimestampSeconds !== b.startTimestampSeconds) {
      return a.startTimestampSeconds - b.startTimestampSeconds;
    }
    return a.endTimestampSeconds - b.endTimestampSeconds;
  });

  // Update global index after sorting
  sorted.forEach((item, index) => {
    item.globalIndex = index;
  });

  return sorted;
}

/**
 * Generate a unique session ID based on start timestamp
 */
function generateSessionId(startTimestamp: number, sessionCounter: number): string {
  const date = new Date(startTimestamp * 1000);
  const dateStr = format(date, 'yyyy-MM-dd');
  const timeStr = format(date, 'HHmm');
  return `session_${dateStr}_${timeStr}_${sessionCounter}`;
}

/**
 * Detect listening sessions based on gap threshold
 */
function detectSessions(items: NormalizedStreamingItem[]): NormalizedStreamingItem[] {
  if (items.length === 0) return items;

  let sessionCounter = 0;
  let currentSessionId = generateSessionId(items[0].startTimestampSeconds, sessionCounter);
  let sessionIndex = 0;

  // Assign first item
  items[0].sessionId = currentSessionId;
  items[0].sessionIndex = sessionIndex;

  // Walk through remaining items
  for (let i = 1; i < items.length; i++) {
    const prevItem = items[i - 1];
    const currItem = items[i];

    // Calculate gap between end of previous item and start of current
    const gapSeconds = currItem.startTimestampSeconds - prevItem.endTimestampSeconds;

    // Check if we should start a new session
    if (gapSeconds > SESSION_GAP_THRESHOLD) {
      // New session
      sessionCounter++;
      currentSessionId = generateSessionId(currItem.startTimestampSeconds, sessionCounter);
      sessionIndex = 0;
    } else {
      // Continue current session
      sessionIndex++;
    }

    currItem.sessionId = currentSessionId;
    currItem.sessionIndex = sessionIndex;
  }

  return items;
}

/**
 * Classify time of day based on hour
 */
function classifyTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Build session metadata and catalog
 */
function buildSessionCatalog(items: NormalizedStreamingItem[]): SessionCatalog {
  // Group items by sessionId
  const sessionMap = new Map<string, NormalizedStreamingItem[]>();

  items.forEach((item) => {
    const existing = sessionMap.get(item.sessionId) || [];
    existing.push(item);
    sessionMap.set(item.sessionId, existing);
  });

  // Build session objects
  const sessions: ListeningSession[] = [];

  for (const [sessionId, sessionItems] of sessionMap.entries()) {
    const firstItem = sessionItems[0];
    const lastItem = sessionItems[sessionItems.length - 1];

    const session: ListeningSession = {
      sessionId,
      startTimestamp: firstItem.startTimestampSeconds,
      endTimestamp: lastItem.endTimestampSeconds,
      durationSeconds: lastItem.endTimestampSeconds - firstItem.startTimestampSeconds,
      itemCount: sessionItems.length,

      // Content breakdown
      musicCount: sessionItems.filter((i) => i.type === 'music').length,
      podcastCount: sessionItems.filter((i) => i.type === 'podcast').length,
      musicDuration: sessionItems
        .filter((i) => i.type === 'music')
        .reduce((sum, i) => sum + i.durationSeconds, 0),
      podcastDuration: sessionItems
        .filter((i) => i.type === 'podcast')
        .reduce((sum, i) => sum + i.durationSeconds, 0),

      // Temporal context
      date: format(new Date(firstItem.startTimestampSeconds * 1000), 'yyyy-MM-dd'),
      dayOfWeek: new Date(firstItem.startTimestampSeconds * 1000).getDay(),
      hourOfDay: new Date(firstItem.startTimestampSeconds * 1000).getHours(),
      timeOfDay: classifyTimeOfDay(
        new Date(firstItem.startTimestampSeconds * 1000).getHours()
      ),

      items: sessionItems,
    };

    sessions.push(session);
  }

  // Build lookup maps
  const sessionsByDate = new Map<string, ListeningSession[]>();
  const sessionsByDayOfWeek = new Map<number, ListeningSession[]>();
  const sessionsByHour = new Map<number, ListeningSession[]>();
  const sessionsByTimeOfDay = new Map<string, ListeningSession[]>();

  sessions.forEach((session) => {
    // By date
    const dateSessions = sessionsByDate.get(session.date) || [];
    dateSessions.push(session);
    sessionsByDate.set(session.date, dateSessions);

    // By day of week
    const dowSessions = sessionsByDayOfWeek.get(session.dayOfWeek) || [];
    dowSessions.push(session);
    sessionsByDayOfWeek.set(session.dayOfWeek, dowSessions);

    // By hour
    const hourSessions = sessionsByHour.get(session.hourOfDay) || [];
    hourSessions.push(session);
    sessionsByHour.set(session.hourOfDay, hourSessions);

    // By time of day
    const todSessions = sessionsByTimeOfDay.get(session.timeOfDay) || [];
    todSessions.push(session);
    sessionsByTimeOfDay.set(session.timeOfDay, todSessions);
  });

  // Calculate statistics
  const totalDuration = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const longestSession =
    sessions.length > 0
      ? sessions.reduce((longest, s) =>
          s.durationSeconds > longest.durationSeconds ? s : longest
        )
      : null;

  return {
    sessions,
    totalSessions: sessions.length,
    averageSessionDuration: sessions.length > 0 ? totalDuration / sessions.length : 0,
    longestSession,
    sessionsByDate,
    sessionsByDayOfWeek,
    sessionsByHour,
    sessionsByTimeOfDay,
  };
}

/**
 * Main processing pipeline: convert raw streaming history into sessions
 */
export function processStreamingHistoryWithSessions(
  data: ParsedData
): {
  items: NormalizedStreamingItem[];
  catalog: SessionCatalog;
} {
  // Step 1: Unify music and podcast history
  const unified = unifyStreamingHistory(data);

  // Step 2: Compute timestamps
  const normalized = unified.map((item, index) => computeTimestamps(item, index));

  // Step 3: Sort by timeline
  const sorted = sortByTimeline(normalized);

  // Step 4: Detect sessions
  const sessionized = detectSessions(sorted);

  // Step 5: Build session catalog
  const catalog = buildSessionCatalog(sessionized);

  return {
    items: sessionized,
    catalog,
  };
}

/**
 * Get daily session statistics for visualization
 */
export function getDailySessionStats(catalog: SessionCatalog, date: string) {
  const sessions = catalog.sessionsByDate.get(date) || [];

  return {
    date,
    sessionCount: sessions.length,
    totalListeningTime: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
    musicTime: sessions.reduce((sum, s) => sum + s.musicDuration, 0),
    podcastTime: sessions.reduce((sum, s) => sum + s.podcastDuration, 0),
    averageSessionLength:
      sessions.length > 0
        ? sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / sessions.length
        : 0,
  };
}

/**
 * Get hourly listening pattern for visualization
 */
export function getHourlyListeningPattern(catalog: SessionCatalog) {
  const hourlyData = [];

  for (let hour = 0; hour < 24; hour++) {
    const sessions = catalog.sessionsByHour.get(hour) || [];
    hourlyData.push({
      hour,
      sessionCount: sessions.length,
      totalTime: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      musicTime: sessions.reduce((sum, s) => sum + s.musicDuration, 0),
      podcastTime: sessions.reduce((sum, s) => sum + s.podcastDuration, 0),
    });
  }

  return hourlyData;
}

/**
 * Get session length distribution for visualization
 */
export function getSessionLengthDistribution(catalog: SessionCatalog) {
  const buckets = {
    short: 0, // < 30 min
    medium: 0, // 30-60 min
    long: 0, // 60-120 min
    veryLong: 0, // > 120 min
  };

  catalog.sessions.forEach((session) => {
    const minutes = session.durationSeconds / 60;
    if (minutes < 30) buckets.short++;
    else if (minutes < 60) buckets.medium++;
    else if (minutes < 120) buckets.long++;
    else buckets.veryLong++;
  });

  return buckets;
}

/**
 * Get listening by time of day breakdown
 */
export function getTimeOfDayBreakdown(catalog: SessionCatalog) {
  return ['morning', 'afternoon', 'evening', 'night'].map((timeOfDay) => {
    const sessions = catalog.sessionsByTimeOfDay.get(timeOfDay) || [];
    return {
      timeOfDay,
      sessionCount: sessions.length,
      totalTime: sessions.reduce((sum, s) => sum + s.durationSeconds, 0),
      musicTime: sessions.reduce((sum, s) => sum + s.musicDuration, 0),
      podcastTime: sessions.reduce((sum, s) => sum + s.podcastDuration, 0),
    };
  });
}
