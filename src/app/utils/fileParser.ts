import JSZip from 'jszip';
import { SpotifyFile, ParsedData } from '../types/spotify';

// Categorize files based on their names
export function categorizeFile(fileName: string): {
  category: string;
  isSensitive: boolean;
  description: string;
} {
  const lowerName = fileName.toLowerCase();

  if (lowerName.includes('streaminghistory') && lowerName.includes('music')) {
    return {
      category: 'Streaming History (Music)',
      isSensitive: false,
      description: 'Your music listening history with timestamps, track names, and artists',
    };
  }
  
  if (lowerName.includes('streaminghistory') && lowerName.includes('podcast')) {
    return {
      category: 'Streaming History (Podcasts)',
      isSensitive: false,
      description: 'Your podcast listening history with episode names and shows',
    };
  }
  
  if (lowerName.includes('streaminghistory') || lowerName.includes('streaming_history')) {
    return {
      category: 'Streaming History',
      isSensitive: false,
      description: 'Your listening history with timestamps, track/episode names',
    };
  }

  if (lowerName.includes('playlist')) {
    return {
      category: 'Playlists',
      isSensitive: false,
      description: 'Your created and followed playlists with track lists',
    };
  }

  if (lowerName.includes('yourlibrary') || lowerName.includes('library')) {
    return {
      category: 'Library',
      isSensitive: false,
      description: 'Your saved tracks, albums, artists, and shows',
    };
  }

  if (lowerName.includes('searchqueries') || lowerName.includes('search')) {
    return {
      category: 'Search Queries',
      isSensitive: false,
      description: 'Your search history within Spotify',
    };
  }

  if (lowerName.includes('identifiers')) {
    return {
      category: 'Identifiers',
      isSensitive: true,
      description: 'Personal identifiers and account information (SENSITIVE)',
    };
  }

  if (lowerName.includes('userdata') || lowerName.includes('user_data')) {
    return {
      category: 'User Data',
      isSensitive: true,
      description: 'Personal user information and profile data (SENSITIVE)',
    };
  }

  if (lowerName.includes('payment')) {
    return {
      category: 'Payments',
      isSensitive: true,
      description: 'Payment history and subscription information (SENSITIVE)',
    };
  }

  if (lowerName.includes('message') || lowerName.includes('conversation')) {
    return {
      category: 'Messages',
      isSensitive: true,
      description: 'Chat and message data (SENSITIVE)',
    };
  }

  if (lowerName.includes('follow')) {
    return {
      category: 'Follow',
      isSensitive: false,
      description: 'Follower and following information',
    };
  }

  if (lowerName.includes('wrapped')) {
    return {
      category: 'Wrapped',
      isSensitive: false,
      description: 'Annual Wrapped statistics and highlights',
    };
  }

  if (lowerName.includes('podcast') && lowerName.includes('interactivity')) {
    return {
      category: 'Podcast Interactivity',
      isSensitive: false,
      description: 'Podcast ratings and reactions',
    };
  }
  
  if (lowerName.includes('inferences')) {
    return {
      category: 'Inferences',
      isSensitive: false,
      description: 'Spotify-generated insights about your preferences',
    };
  }

  return {
    category: 'Other',
    isSensitive: false,
    description: 'Other Spotify data',
  };
}

// Parse ZIP file and extract JSON files
export async function parseZipFile(file: File): Promise<SpotifyFile[]> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(file);
  const spotifyFiles: SpotifyFile[] = [];

  for (const [fileName, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir && fileName.endsWith('.json')) {
      const content = await zipEntry.async('text');
      try {
        const parsed = JSON.parse(content);
        const { category, isSensitive, description } = categorizeFile(fileName);
        
        spotifyFiles.push({
          name: fileName,
          content: parsed,
          category,
          isSensitive,
          included: !isSensitive, // Exclude sensitive files by default
          description,
        });
      } catch (error) {
        console.error(`Error parsing ${fileName}:`, error);
      }
    }
  }

  return spotifyFiles;
}

// Parse individual JSON files
export async function parseJSONFiles(files: FileList): Promise<SpotifyFile[]> {
  const spotifyFiles: SpotifyFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.name.endsWith('.json')) {
      const content = await file.text();
      try {
        const parsed = JSON.parse(content);
        const { category, isSensitive, description } = categorizeFile(file.name);
        
        spotifyFiles.push({
          name: file.name,
          content: parsed,
          category,
          isSensitive,
          included: !isSensitive,
          description,
        });
      } catch (error) {
        console.error(`Error parsing ${file.name}:`, error);
      }
    }
  }

  return spotifyFiles;
}

// Combine all included files into a single parsed data object
export function combineSpotifyFiles(files: SpotifyFile[]): ParsedData {
  const data: ParsedData = {
    streamingHistoryMusic: [],
    streamingHistoryPodcast: [],
    playlists: [],
    library: null,
    searchQueries: [],
    follow: null,
    payments: [],
    wrapped: null,
    podcastInteractivity: [],
    messages: [],
  };

  files
    .filter((f) => f.included)
    .forEach((file) => {
      const category = file.category.toLowerCase();
      const content = file.content;

      // Handle streaming history - check if it's music or podcast based on content
      if (category.includes('streaming history')) {
        if (Array.isArray(content)) {
          content.forEach((item) => {
            // Determine if it's a podcast or music based on the presence of episode fields
            if (item.episode_name || item.episode_show_name || item.spotify_episode_uri) {
              data.streamingHistoryPodcast.push(item);
            } else {
              // It's music (or treat it as music if we can't tell)
              data.streamingHistoryMusic.push(item);
            }
          });
        }
      } else if (category.includes('playlist')) {
        // Handle both single playlist objects and arrays
        if (Array.isArray(content)) {
          data.playlists.push(...content);
        } else {
          data.playlists.push(content);
        }
      } else if (category.includes('library')) {
        data.library = content;
      } else if (category.includes('search')) {
        data.searchQueries.push(...(Array.isArray(content) ? content : [content]));
      } else if (category.includes('follow')) {
        data.follow = content;
      } else if (category.includes('payment')) {
        data.payments.push(...(Array.isArray(content) ? content : [content]));
      } else if (category.includes('wrapped')) {
        data.wrapped = content;
      } else if (category.includes('podcast') && category.includes('interactivity')) {
        data.podcastInteractivity.push(...(Array.isArray(content) ? content : [content]));
      } else if (category.includes('message')) {
        data.messages.push(...(Array.isArray(content) ? content : [content]));
      }
    });

  return data;
}