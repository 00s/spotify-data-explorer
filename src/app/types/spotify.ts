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
}