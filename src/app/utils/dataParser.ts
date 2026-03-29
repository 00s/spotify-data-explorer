import JSZip from 'jszip';
import type { UploadedFile, ProcessedData } from '../types/spotify';

// Detect file type based on filename and content
export function detectFileType(filename: string, content: any): UploadedFile {
  const lowerName = filename.toLowerCase();
  
  if (lowerName.includes('streaminghistory') && lowerName.includes('music')) {
    return {
      name: filename,
      content,
      type: 'streaming-music',
      sensitive: false,
      selected: true,
      description: 'Music streaming history - Shows what songs you listened to and when',
    };
  }
  
  if (lowerName.includes('streaminghistory') && lowerName.includes('podcast')) {
    return {
      name: filename,
      content,
      type: 'streaming-podcast',
      sensitive: false,
      selected: true,
      description: 'Podcast streaming history - Shows podcast episodes you listened to',
    };
  }
  
  if (lowerName.includes('playlist')) {
    return {
      name: filename,
      content,
      type: 'playlist',
      sensitive: false,
      selected: true,
      description: 'Playlist data - Your saved playlists and their tracks',
    };
  }
  
  if (lowerName.includes('yourlibrary')) {
    return {
      name: filename,
      content,
      type: 'library',
      sensitive: false,
      selected: true,
      description: 'Your Library - Saved tracks, albums, shows, and artists',
    };
  }
  
  if (lowerName.includes('searchqueries') || lowerName.includes('search')) {
    return {
      name: filename,
      content,
      type: 'search',
      sensitive: true,
      selected: true,
      description: 'Search history - What you searched for (may reveal personal interests)',
    };
  }
  
  if (lowerName.includes('follow')) {
    return {
      name: filename,
      content,
      type: 'follow',
      sensitive: true,
      selected: true,
      description: 'Follow data - Who you follow and your follower count (may reveal identity)',
    };
  }
  
  if (lowerName.includes('payment')) {
    return {
      name: filename,
      content,
      type: 'payment',
      sensitive: true,
      selected: false, // Deselect payments by default
      description: 'Payment history - Subscription and purchase records (contains financial data)',
    };
  }
  
  if (lowerName.includes('wrapped')) {
    return {
      name: filename,
      content,
      type: 'wrapped',
      sensitive: false,
      selected: true,
      description: 'Spotify Wrapped data - Your year-end summaries',
    };
  }
  
  if (lowerName.includes('podcastinteractivity')) {
    return {
      name: filename,
      content,
      type: 'podcast-interactivity',
      sensitive: false,
      selected: true,
      description: 'Podcast interactions - Ratings and reactions you gave to podcast episodes',
    };
  }
  
  return {
    name: filename,
    content,
    type: 'unknown',
    sensitive: false,
    selected: true,
    description: 'Unknown file type - Will be processed as generic JSON',
  };
}

// Extract files from ZIP
export async function extractZipFiles(zipFile: File): Promise<UploadedFile[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(zipFile);
  const files: UploadedFile[] = [];
  
  const jsonFiles = Object.keys(loaded.files).filter(
    filename => filename.endsWith('.json') && !loaded.files[filename].dir
  );
  
  for (const filename of jsonFiles) {
    try {
      const fileData = await loaded.files[filename].async('string');
      const content = JSON.parse(fileData);
      const uploadedFile = detectFileType(filename, content);
      files.push(uploadedFile);
    } catch (error) {
      console.error(`Failed to parse ${filename}:`, error);
    }
  }
  
  return files;
}

// Process individual JSON files
export async function processJsonFiles(fileList: FileList): Promise<UploadedFile[]> {
  const files: UploadedFile[] = [];
  
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      try {
        const text = await file.text();
        const content = JSON.parse(text);
        const uploadedFile = detectFileType(file.name, content);
        files.push(uploadedFile);
      } catch (error) {
        console.error(`Failed to parse ${file.name}:`, error);
      }
    }
  }
  
  return files;
}

// Parse selected files into structured data
export function parseSpotifyData(files: UploadedFile[]): ProcessedData {
  const data: ProcessedData = {
    streamingMusic: [],
    streamingPodcast: [],
    playlists: [],
    library: null,
    searchQueries: [],
    follows: null,
    payments: [],
    wrapped: [],
    podcastInteractivity: [],
  };
  
  for (const file of files) {
    if (!file.selected) continue;
    
    try {
      switch (file.type) {
        case 'streaming-music':
          if (Array.isArray(file.content)) {
            data.streamingMusic.push(...file.content);
          }
          break;
          
        case 'streaming-podcast':
          if (Array.isArray(file.content)) {
            data.streamingPodcast.push(...file.content);
          }
          break;
          
        case 'playlist':
          if (file.content.name) {
            data.playlists.push(file.content);
          } else if (Array.isArray(file.content)) {
            data.playlists.push(...file.content);
          }
          break;
          
        case 'library':
          data.library = file.content;
          break;
          
        case 'search':
          if (Array.isArray(file.content)) {
            data.searchQueries.push(...file.content);
          }
          break;
          
        case 'follow':
          data.follows = file.content;
          break;
          
        case 'payment':
          if (Array.isArray(file.content)) {
            data.payments.push(...file.content);
          }
          break;
          
        case 'wrapped':
          if (Array.isArray(file.content)) {
            data.wrapped.push(...file.content);
          } else {
            data.wrapped.push(file.content);
          }
          break;
          
        case 'podcast-interactivity':
          if (Array.isArray(file.content)) {
            data.podcastInteractivity.push(...file.content);
          }
          break;
      }
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error);
    }
  }
  
  return data;
}
