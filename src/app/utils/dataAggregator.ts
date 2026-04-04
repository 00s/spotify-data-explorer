import { ParsedData, AggregatedStats, StreamingHistoryMusic } from '../types/spotify';
import { format, parseISO, startOfMonth, startOfDay, differenceInDays } from 'date-fns';
import { processStreamingHistoryWithSessions } from './sessionProcessor';
import { computeBoundariesFromCatalog } from './historyBoundaries';

// Convert milliseconds to hours
export function msToHours(ms: number): number {
  return ms / (1000 * 60 * 60);
}

// Convert milliseconds to minutes
export function msToMinutes(ms: number): number {
  return ms / (1000 * 60);
}

// Get the current year for filtering
const currentYear = new Date().getFullYear();

// Aggregate all streaming data into useful statistics
export function aggregateData(data: ParsedData): AggregatedStats {
  const { streamingHistoryMusic, streamingHistoryPodcast } = data;

  // Normalize the streaming history items to handle both formats
  const normalizedMusic = streamingHistoryMusic.map((item) => ({
    ts: item.ts || item.endTime || '',
    ms_played: item.ms_played || item.msPlayed || 0,
    track_name: item.master_metadata_track_name || item.trackName || 'Unknown Track',
    artist_name: item.master_metadata_album_artist_name || item.artistName || 'Unknown Artist',
  }));

  // Calculate total listening time
  const totalListeningTime = normalizedMusic.reduce((sum, item) => sum + item.ms_played, 0);
  
  // Calculate listening time for current year
  const totalListeningTimeYear = normalizedMusic
    .filter((item) => {
      try {
        const year = new Date(item.ts).getFullYear();
        return year === currentYear;
      } catch {
        return false;
      }
    })
    .reduce((sum, item) => sum + item.ms_played, 0);

  // Aggregate top artists
  const artistMap = new Map<string, { playTime: number; playCount: number }>();
  normalizedMusic.forEach((item) => {
    const artist = item.artist_name;
    const existing = artistMap.get(artist) || { playTime: 0, playCount: 0 };
    artistMap.set(artist, {
      playTime: existing.playTime + item.ms_played,
      playCount: existing.playCount + 1,
    });
  });

  const topArtists = Array.from(artistMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.playTime - a.playTime)
    .slice(0, 50);

  // Aggregate top tracks
  const trackMap = new Map<string, { artist: string; playTime: number; playCount: number }>();
  normalizedMusic.forEach((item) => {
    const track = item.track_name;
    const artist = item.artist_name;
    const key = `${track}|||${artist}`;
    const existing = trackMap.get(key) || { artist, playTime: 0, playCount: 0 };
    trackMap.set(key, {
      artist,
      playTime: existing.playTime + item.ms_played,
      playCount: existing.playCount + 1,
    });
  });

  const topTracks = Array.from(trackMap.entries())
    .map(([key, stats]) => {
      const [name] = key.split('|||');
      return { name, ...stats };
    })
    .sort((a, b) => b.playTime - a.playTime)
    .slice(0, 50);

  // Aggregate top podcasts
  const podcastMap = new Map<string, { playTime: number; episodeCount: number }>();
  streamingHistoryPodcast.forEach((item) => {
    const show = item.episode_show_name || item.podcastName || 'Unknown Show';
    const existing = podcastMap.get(show) || { playTime: 0, episodeCount: 0 };
    podcastMap.set(show, {
      playTime: existing.playTime + (item.ms_played || item.msPlayed || 0),
      episodeCount: existing.episodeCount + 1,
    });
  });

  const topPodcasts = Array.from(podcastMap.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.playTime - a.playTime)
    .slice(0, 20);

  // Aggregate listening by month
  const monthMap = new Map<string, { musicTime: number; podcastTime: number }>();
  
  normalizedMusic.forEach((item) => {
    try {
      const date = parseISO(item.ts);
      const monthKey = format(startOfMonth(date), 'yyyy-MM');
      const existing = monthMap.get(monthKey) || { musicTime: 0, podcastTime: 0 };
      monthMap.set(monthKey, {
        ...existing,
        musicTime: existing.musicTime + item.ms_played,
      });
    } catch (error) {
      // Skip invalid dates
    }
  });

  streamingHistoryPodcast.forEach((item) => {
    try {
      // Handle both ISO format and "YYYY-MM-DD HH:mm" format
      const timestamp = item.ts || item.endTime || '';
      const date = parseISO(timestamp.replace(' ', 'T'));
      const monthKey = format(startOfMonth(date), 'yyyy-MM');
      const existing = monthMap.get(monthKey) || { musicTime: 0, podcastTime: 0 };
      monthMap.set(monthKey, {
        ...existing,
        podcastTime: existing.podcastTime + (item.ms_played || item.msPlayed || 0),
      });
    } catch (error) {
      // Skip invalid dates
    }
  });

  const listeningByMonth = Array.from(monthMap.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Aggregate listening by day (last 90 days only to keep it manageable)
  const dayMap = new Map<string, { musicTime: number; podcastTime: number }>();
  const today = new Date();
  
  normalizedMusic.forEach((item) => {
    try {
      const date = parseISO(item.ts);
      if (differenceInDays(today, date) <= 90) {
        const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
        const existing = dayMap.get(dayKey) || { musicTime: 0, podcastTime: 0 };
        dayMap.set(dayKey, {
          ...existing,
          musicTime: existing.musicTime + item.ms_played,
        });
      }
    } catch (error) {
      // Skip invalid dates
    }
  });

  streamingHistoryPodcast.forEach((item) => {
    try {
      // Handle both ISO format and "YYYY-MM-DD HH:mm" format
      const timestamp = item.ts || item.endTime || '';
      const date = parseISO(timestamp.replace(' ', 'T'));
      if (differenceInDays(today, date) <= 90) {
        const dayKey = format(startOfDay(date), 'yyyy-MM-dd');
        const existing = dayMap.get(dayKey) || { musicTime: 0, podcastTime: 0 };
        dayMap.set(dayKey, {
          ...existing,
          podcastTime: existing.podcastTime + (item.ms_played || item.msPlayed || 0),
        });
      }
    } catch (error) {
      // Skip invalid dates
    }
  });

  const listeningByDay = Array.from(dayMap.entries())
    .map(([day, stats]) => ({ day, ...stats }))
    .sort((a, b) => a.day.localeCompare(b.day));

  // Process sessions for advanced temporal analysis
  let sessionCatalog;
  let historyBoundaries;
  try {
    const sessionData = processStreamingHistoryWithSessions(data);
    sessionCatalog = sessionData.catalog;
    historyBoundaries = computeBoundariesFromCatalog(sessionCatalog);
  } catch (error) {
    console.error('Error processing sessions:', error);
    sessionCatalog = undefined;
    historyBoundaries = undefined;
  }

  return {
    totalListeningTime,
    totalListeningTimeYear,
    topArtists,
    topTracks,
    topPodcasts,
    listeningByMonth,
    listeningByDay,
    sessionCatalog,
    historyBoundaries,
  };
}

// Format duration in a human-readable way
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours.toLocaleString()}h ${minutes}m`;
  }
  return `${minutes.toLocaleString()}m`;
}

// Format large numbers
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}