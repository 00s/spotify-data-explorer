import { ParsedData, StreamingHistoryItem } from '../context/DataContext';
import { format, parseISO, startOfMonth, startOfDay, differenceInMilliseconds } from 'date-fns';

export interface TimeSeriesData {
  date: string;
  minutes: number;
  plays: number;
}

export interface TopItem {
  name: string;
  artist?: string;
  plays: number;
  minutes: number;
}

export interface OverviewStats {
  totalMinutes: number;
  totalPlays: number;
  topArtists: TopItem[];
  topTracks: TopItem[];
  topPodcasts: TopItem[];
  timeSeriesMonthly: TimeSeriesData[];
}

export const calculateOverviewStats = (data: ParsedData): OverviewStats => {
  const { streamingHistory } = data;

  // Calculate total time and plays
  let totalMs = 0;
  let totalPlays = 0;

  const artistMap = new Map<string, { plays: number; ms: number }>();
  const trackMap = new Map<string, { plays: number; ms: number; artist: string }>();
  const podcastMap = new Map<string, { plays: number; ms: number }>();
  const monthlyMap = new Map<string, { ms: number; plays: number }>();

  streamingHistory.forEach((item) => {
    const ms = item.ms_played || 0;
    totalMs += ms;
    totalPlays += 1;

    // Track artists
    const artist = item.master_metadata_album_artist_name;
    if (artist) {
      const existing = artistMap.get(artist) || { plays: 0, ms: 0 };
      artistMap.set(artist, {
        plays: existing.plays + 1,
        ms: existing.ms + ms,
      });
    }

    // Track tracks
    const track = item.master_metadata_track_name;
    if (track && artist) {
      const key = `${track}|${artist}`;
      const existing = trackMap.get(key) || { plays: 0, ms: 0, artist };
      trackMap.set(key, {
        plays: existing.plays + 1,
        ms: existing.ms + ms,
        artist,
      });
    }

    // Track podcasts
    const podcast = item.episode_show_name;
    if (podcast) {
      const existing = podcastMap.get(podcast) || { plays: 0, ms: 0 };
      podcastMap.set(podcast, {
        plays: existing.plays + 1,
        ms: existing.ms + ms,
      });
    }

    // Monthly aggregation
    if (item.ts) {
      try {
        const date = parseISO(item.ts);
        const monthKey = format(startOfMonth(date), 'yyyy-MM');
        const existing = monthlyMap.get(monthKey) || { ms: 0, plays: 0 };
        monthlyMap.set(monthKey, {
          ms: existing.ms + ms,
          plays: existing.plays + 1,
        });
      } catch (e) {
        // Skip invalid dates
      }
    }
  });

  // Top artists
  const topArtists = Array.from(artistMap.entries())
    .map(([name, data]) => ({
      name,
      plays: data.plays,
      minutes: Math.round(data.ms / 60000),
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // Top tracks
  const topTracks = Array.from(trackMap.entries())
    .map(([key, data]) => {
      const [name] = key.split('|');
      return {
        name,
        artist: data.artist,
        plays: data.plays,
        minutes: Math.round(data.ms / 60000),
      };
    })
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 10);

  // Top podcasts
  const topPodcasts = Array.from(podcastMap.entries())
    .map(([name, data]) => ({
      name,
      plays: data.plays,
      minutes: Math.round(data.ms / 60000),
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 10);

  // Time series
  const timeSeriesMonthly = Array.from(monthlyMap.entries())
    .map(([date, data]) => ({
      date,
      minutes: Math.round(data.ms / 60000),
      plays: data.plays,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalMinutes: Math.round(totalMs / 60000),
    totalPlays,
    topArtists,
    topTracks,
    topPodcasts,
    timeSeriesMonthly,
  };
};

export const filterStreamingHistory = (
  history: StreamingHistoryItem[],
  filters: {
    startDate?: Date;
    endDate?: Date;
    platform?: string;
    country?: string;
  }
): StreamingHistoryItem[] => {
  return history.filter((item) => {
    if (filters.startDate || filters.endDate) {
      try {
        const itemDate = parseISO(item.ts);
        if (filters.startDate && itemDate < filters.startDate) return false;
        if (filters.endDate && itemDate > filters.endDate) return false;
      } catch {
        return false;
      }
    }

    if (filters.platform && item.platform !== filters.platform) return false;
    if (filters.country && item.conn_country !== filters.country) return false;

    return true;
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }
  return `${days}d`;
};

export const getTopSearches = (searches: any[]): { query: string; count: number }[] => {
  const queryMap = new Map<string, number>();

  searches.forEach((search) => {
    const query = search.searchQuery || search.query;
    if (query) {
      queryMap.set(query, (queryMap.get(query) || 0) + 1);
    }
  });

  return Array.from(queryMap.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
};
