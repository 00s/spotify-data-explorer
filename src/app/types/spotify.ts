// Spotify Data Types

export interface StreamingHistoryMusic {
  ts: string;
  username?: string;
  platform?: string;
  ms_played: number;
  conn_country?: string;
  ip_addr_decrypted?: string;
  user_agent_decrypted?: string;
  master_metadata_track_name?: string;
  master_metadata_album_artist_name?: string;
  master_metadata_album_album_name?: string;
  spotify_track_uri?: string;
  episode_name?: string;
  episode_show_name?: string;
  spotify_episode_uri?: string;
  reason_start?: string;
  reason_end?: string;
  shuffle?: boolean;
  skipped?: boolean;
  offline?: boolean;
  offline_timestamp?: number;
  incognito_mode?: boolean;
  // Also support simple format from basic streaming history
  endTime?: string;
  artistName?: string;
  trackName?: string;
  msPlayed?: number;
}

export interface StreamingHistoryPodcast {
  ts: string;
  username?: string;
  platform?: string;
  ms_played: number;
  conn_country?: string;
  episode_name?: string;
  episode_show_name?: string;
  spotify_episode_uri?: string;
  // Also support basic format
  endTime?: string;
  episodeName?: string;
  podcastName?: string;
  msPlayed?: number;
}

export interface Playlist {
  name: string;
  lastModifiedDate?: string;
  items?: PlaylistItem[];
  description?: string;
  numberOfFollowers?: number;
}

export interface PlaylistItem {
  track?: {
    trackName?: string;
    artistName?: string;
    albumName?: string;
    trackUri?: string;
  };
  episode?: {
    episodeName?: string;
    showName?: string;
    episodeUri?: string;
  };
  addedDate?: string;
}

export interface YourLibrary {
  tracks?: string[];
  albums?: string[];
  shows?: string[];
  episodes?: string[];
  artists?: string[];
  bannedTracks?: string[];
}

export interface SearchQuery {
  platform?: string;
  searchTime?: string;
  searchQuery?: string;
  searchInteractionURIs?: string[];
}

export interface Follow {
  followerCount?: number;
  followingUsersCount?: number;
  dismissingUsersCount?: number;
}

export interface Payment {
  paymentDate?: string;
  subscriptionType?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
}

export interface WrappedData {
  year?: number;
  topArtists?: Array<{ artistName: string; playCount?: number }>;
  topTracks?: Array<{ trackName: string; artistName?: string; playCount?: number }>;
  topGenres?: string[];
  totalMinutesListened?: number;
  topPodcasts?: Array<{ showName: string; episodeCount?: number }>;
}

export interface PodcastInteractivity {
  timestamp?: string;
  showName?: string;
  episodeName?: string;
  action?: string;
  rating?: number;
}

export interface MessageData {
  messageId?: string;
  timestamp?: string;
  conversationId?: string;
  senderId?: string;
  content?: string;
}

export interface SpotifyFile {
  name: string;
  content: any;
  category: string;
  isSensitive: boolean;
  included: boolean;
  description: string;
}

export interface ParsedData {
  streamingHistoryMusic: StreamingHistoryMusic[];
  streamingHistoryPodcast: StreamingHistoryPodcast[];
  playlists: Playlist[];
  library: YourLibrary | null;
  searchQueries: SearchQuery[];
  follow: Follow | null;
  payments: Payment[];
  wrapped: WrappedData | null;
  podcastInteractivity: PodcastInteractivity[];
  messages: MessageData[];
}

export interface AggregatedStats {
  totalListeningTime: number;
  totalListeningTimeYear: number;
  topArtists: Array<{ name: string; playTime: number; playCount: number }>;
  topTracks: Array<{ name: string; artist: string; playTime: number; playCount: number }>;
  topPodcasts: Array<{ name: string; playTime: number; episodeCount: number }>;
  listeningByMonth: Array<{ month: string; musicTime: number; podcastTime: number }>;
  listeningByDay: Array<{ day: string; musicTime: number; podcastTime: number }>;
  sessionCatalog?: SessionCatalog;
  historyBoundaries?: HistoryBoundaries;
}

// History boundaries and time filters
export interface HistoryBoundaries {
  startDate: Date;
  endDate: Date;

  // Formatted strings for display
  formattedStart: string;
  formattedEnd: string;
  shortFormattedStart: string;
  shortFormattedEnd: string;

  // Time span metrics
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  spanDescription: string;

  // Data quality metrics
  dataQuality: {
    totalItems: number;
    totalSessions: number;
    coverageDays: number;
    coveragePercent: number;
    longestGap: {
      start: Date;
      end: Date;
      durationDays: number;
    } | null;
  };
}

export interface TimeFilter {
  mode: 'day' | 'week' | 'month' | 'year' | 'all' | 'custom';
  startDate: Date;
  endDate: Date;
  label: string;
}

// Unified streaming item (music or podcast)
export interface StreamingHistoryItem {
  // Core identification
  id: string;
  type: 'music' | 'podcast';

  // Temporal data (original)
  endTime?: string;
  ts?: string;
  msPlayed?: number;
  ms_played?: number;

  // Music-specific fields
  trackName?: string;
  artistName?: string;
  albumName?: string;
  master_metadata_track_name?: string;
  master_metadata_album_artist_name?: string;
  master_metadata_album_album_name?: string;
  trackUri?: string;
  spotify_track_uri?: string;

  // Podcast-specific fields
  episodeName?: string;
  podcastName?: string;
  episode_name?: string;
  episode_show_name?: string;
  episodeUri?: string;
  spotify_episode_uri?: string;

  // Shared metadata
  platform?: string;
  username?: string;
  conn_country?: string;
  reason_start?: string;
  reason_end?: string;
  shuffle?: boolean;
  skipped?: boolean;
  offline?: boolean;
  incognito_mode?: boolean;
}

// Normalized streaming item with computed temporal fields
export interface NormalizedStreamingItem extends StreamingHistoryItem {
  // Computed temporal fields
  endTimestampSeconds: number;
  startTimestampSeconds: number;
  durationSeconds: number;

  // Session metadata
  sessionId: string;
  sessionIndex: number;

  // Ordering
  globalIndex: number;
}

// Listening session aggregate
export interface ListeningSession {
  sessionId: string;
  startTimestamp: number;
  endTimestamp: number;
  durationSeconds: number;
  itemCount: number;

  // Content breakdown
  musicCount: number;
  podcastCount: number;
  musicDuration: number;
  podcastDuration: number;

  // Temporal context
  date: string;
  dayOfWeek: number;
  hourOfDay: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

  // Items in this session
  items: NormalizedStreamingItem[];
}

// Session catalog with lookup maps
export interface SessionCatalog {
  sessions: ListeningSession[];
  totalSessions: number;
  averageSessionDuration: number;
  longestSession: ListeningSession | null;

  // Temporal aggregates for charting
  sessionsByDate: Map<string, ListeningSession[]>;
  sessionsByDayOfWeek: Map<number, ListeningSession[]>;
  sessionsByHour: Map<number, ListeningSession[]>;
  sessionsByTimeOfDay: Map<string, ListeningSession[]>;
}