import { useMemo } from 'react';
import {
  ParsedData,
  AggregatedStats,
  StreamingHistoryMusic,
  StreamingHistoryPodcast,
  NormalizedStreamingItem,
  ListeningSession,
  TimeFilterState,
} from '../types/spotify';
import { isDateInRange } from '../utils/timeFilterUtils';

// Filter streaming history items by date range
export function useFilteredItems(data: ParsedData | null, filter: TimeFilterState): NormalizedStreamingItem[] {
  return useMemo(() => {
    if (!data) return [];

    const allItems: NormalizedStreamingItem[] = [];

    // Process music
    data.streamingHistoryMusic.forEach((item, index) => {
      const timestamp = item.ts || item.endTime;
      if (!timestamp) return;

      const endDate = new Date(timestamp);
      if (!isDateInRange(endDate, filter)) return;

      const msPlayed = item.ms_played || item.msPlayed || 0;
      const endTimestampSeconds = endDate.getTime() / 1000;
      const durationSeconds = msPlayed / 1000;
      const startTimestampSeconds = endTimestampSeconds - durationSeconds;

      allItems.push({
        id: `music-${index}`,
        type: 'music',
        ...item,
        endTimestampSeconds,
        startTimestampSeconds,
        durationSeconds,
        sessionId: '',
        sessionIndex: 0,
        globalIndex: index,
      });
    });

    // Process podcasts
    data.streamingHistoryPodcast.forEach((item, index) => {
      const timestamp = item.ts || item.endTime;
      if (!timestamp) return;

      const endDate = new Date(timestamp);
      if (!isDateInRange(endDate, filter)) return;

      const msPlayed = item.ms_played || item.msPlayed || 0;
      const endTimestampSeconds = endDate.getTime() / 1000;
      const durationSeconds = msPlayed / 1000;
      const startTimestampSeconds = endTimestampSeconds - durationSeconds;

      allItems.push({
        id: `podcast-${index}`,
        type: 'podcast',
        ...item,
        endTimestampSeconds,
        startTimestampSeconds,
        durationSeconds,
        sessionId: '',
        sessionIndex: 0,
        globalIndex: index,
      });
    });

    // Sort by end timestamp
    return allItems.sort((a, b) => a.endTimestampSeconds - b.endTimestampSeconds);
  }, [data, filter]);
}

// Filter sessions by date range
export function useFilteredSessions(
  stats: AggregatedStats | null,
  filter: TimeFilterState
): ListeningSession[] {
  return useMemo(() => {
    if (!stats?.sessionCatalog?.sessions) return [];

    return stats.sessionCatalog.sessions.filter((session) => {
      const sessionDate = new Date(session.startTimestamp * 1000);
      return isDateInRange(sessionDate, filter);
    });
  }, [stats, filter]);
}

// Calculate filtered statistics
export function useFilteredStats(
  filteredItems: NormalizedStreamingItem[],
  filteredSessions: ListeningSession[]
): {
  totalListeningTime: number;
  topArtists: Array<{ name: string; playTime: number; playCount: number }>;
  topTracks: Array<{ name: string; artist: string; playTime: number; playCount: number }>;
  topPodcasts: Array<{ name: string; playTime: number; episodeCount: number }>;
  listeningByDay: Array<{ day: string; musicTime: number; podcastTime: number }>;
  listeningByHour: Array<{ hour: number; musicTime: number; podcastTime: number }>;
} {
  return useMemo(() => {
    // Calculate total listening time
    const totalListeningTime = filteredItems.reduce(
      (sum, item) => sum + (item.ms_played || item.msPlayed || 0),
      0
    );

    // Calculate top artists
    const artistMap = new Map<string, { playTime: number; playCount: number }>();
    filteredItems.forEach((item) => {
      if (item.type !== 'music') return;
      const artist =
        item.master_metadata_album_artist_name || item.artistName || 'Unknown Artist';
      const existing = artistMap.get(artist) || { playTime: 0, playCount: 0 };
      artistMap.set(artist, {
        playTime: existing.playTime + (item.ms_played || item.msPlayed || 0),
        playCount: existing.playCount + 1,
      });
    });
    const topArtists = Array.from(artistMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.playTime - a.playTime)
      .slice(0, 10);

    // Calculate top tracks
    const trackMap = new Map<string, { artist: string; playTime: number; playCount: number }>();
    filteredItems.forEach((item) => {
      if (item.type !== 'music') return;
      const track = item.master_metadata_track_name || item.trackName || 'Unknown Track';
      const artist =
        item.master_metadata_album_artist_name || item.artistName || 'Unknown Artist';
      const key = `${track}|||${artist}`;
      const existing = trackMap.get(key) || { artist, playTime: 0, playCount: 0 };
      trackMap.set(key, {
        artist,
        playTime: existing.playTime + (item.ms_played || item.msPlayed || 0),
        playCount: existing.playCount + 1,
      });
    });
    const topTracks = Array.from(trackMap.entries())
      .map(([key, data]) => {
        const [name] = key.split('|||');
        return { name, ...data };
      })
      .sort((a, b) => b.playTime - a.playTime)
      .slice(0, 10);

    // Calculate top podcasts
    const podcastMap = new Map<string, { playTime: number; episodeCount: number }>();
    filteredItems.forEach((item) => {
      if (item.type !== 'podcast') return;
      const podcast = item.episode_show_name || item.podcastName || 'Unknown Podcast';
      const existing = podcastMap.get(podcast) || { playTime: 0, episodeCount: 0 };
      podcastMap.set(podcast, {
        playTime: existing.playTime + (item.ms_played || item.msPlayed || 0),
        episodeCount: existing.episodeCount + 1,
      });
    });
    const topPodcasts = Array.from(podcastMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.playTime - a.playTime)
      .slice(0, 10);

    // Calculate listening by day
    const dayMap = new Map<string, { musicTime: number; podcastTime: number }>();
    filteredItems.forEach((item) => {
      const date = new Date((item.ts || item.endTime) as string);
      const dayKey = date.toISOString().split('T')[0];
      const existing = dayMap.get(dayKey) || { musicTime: 0, podcastTime: 0 };
      const time = item.ms_played || item.msPlayed || 0;
      dayMap.set(dayKey, {
        musicTime: existing.musicTime + (item.type === 'music' ? time : 0),
        podcastTime: existing.podcastTime + (item.type === 'podcast' ? time : 0),
      });
    });
    const listeningByDay = Array.from(dayMap.entries())
      .map(([day, data]) => ({ day, ...data }))
      .sort((a, b) => a.day.localeCompare(b.day));

    // Calculate listening by hour
    const hourMap = new Map<number, { musicTime: number; podcastTime: number }>();
    filteredItems.forEach((item) => {
      const date = new Date((item.ts || item.endTime) as string);
      const hour = date.getHours();
      const existing = hourMap.get(hour) || { musicTime: 0, podcastTime: 0 };
      const time = item.ms_played || item.msPlayed || 0;
      hourMap.set(hour, {
        musicTime: existing.musicTime + (item.type === 'music' ? time : 0),
        podcastTime: existing.podcastTime + (item.type === 'podcast' ? time : 0),
      });
    });
    const listeningByHour = Array.from(hourMap.entries())
      .map(([hour, data]) => ({ hour, ...data }))
      .sort((a, b) => a.hour - b.hour);

    return {
      totalListeningTime,
      topArtists,
      topTracks,
      topPodcasts,
      listeningByDay,
      listeningByHour,
    };
  }, [filteredItems, filteredSessions]);
}
