import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ListMusic, Music, Disc, User, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

export function Playlists() {
  const { processedData } = useData();
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  
  if (!processedData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }
  
  const { playlists, library } = processedData;
  
  const hasPlaylists = playlists.length > 0;
  const hasLibrary = library && (
    library.tracks?.length || 
    library.albums?.length || 
    library.artists?.length || 
    library.shows?.length
  );
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl mb-2">Playlists & Library</h2>
        <p className="text-gray-400">Your saved music and playlists</p>
      </div>
      
      {/* Library Summary */}
      {hasLibrary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {library?.tracks && library.tracks.length > 0 && (
            <div className="bg-[#181818] rounded-lg p-6">
              <Music className="w-8 h-8 text-[#1DB954] mb-2" />
              <div className="text-3xl mb-1">{library.tracks.length}</div>
              <div className="text-sm text-gray-400">Saved Tracks</div>
            </div>
          )}
          
          {library?.albums && library.albums.length > 0 && (
            <div className="bg-[#181818] rounded-lg p-6">
              <Disc className="w-8 h-8 text-purple-500 mb-2" />
              <div className="text-3xl mb-1">{library.albums.length}</div>
              <div className="text-sm text-gray-400">Saved Albums</div>
            </div>
          )}
          
          {library?.artists && library.artists.length > 0 && (
            <div className="bg-[#181818] rounded-lg p-6">
              <User className="w-8 h-8 text-blue-500 mb-2" />
              <div className="text-3xl mb-1">{library.artists.length}</div>
              <div className="text-sm text-gray-400">Followed Artists</div>
            </div>
          )}
          
          {library?.shows && library.shows.length > 0 && (
            <div className="bg-[#181818] rounded-lg p-6">
              <ListMusic className="w-8 h-8 text-orange-500 mb-2" />
              <div className="text-3xl mb-1">{library.shows.length}</div>
              <div className="text-sm text-gray-400">Saved Shows</div>
            </div>
          )}
        </div>
      )}
      
      {/* Playlists */}
      {hasPlaylists ? (
        <div className="bg-[#181818] rounded-lg p-6">
          <h3 className="text-xl mb-4">Your Playlists</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map((playlist, index) => (
              <div
                key={index}
                onClick={() => setSelectedPlaylist(playlist)}
                className="bg-[#282828] rounded-lg p-4 hover:bg-[#3e3e3e] transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-[#1DB954] rounded flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate mb-1">{playlist.name || 'Untitled Playlist'}</div>
                    <div className="text-sm text-gray-400">
                      {playlist.items?.length || 0} track{playlist.items?.length !== 1 ? 's' : ''}
                    </div>
                    {playlist.numberOfFollowers !== undefined && (
                      <div className="text-xs text-gray-500">
                        {playlist.numberOfFollowers} follower{playlist.numberOfFollowers !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-[#181818] rounded-lg p-12 text-center">
          <ListMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl mb-2">No Playlists Found</h3>
          <p className="text-gray-400">
            No playlist data found in your export.
          </p>
        </div>
      )}
      
      {/* Playlist Detail Dialog */}
      <Dialog open={!!selectedPlaylist} onOpenChange={() => setSelectedPlaylist(null)}>
        <DialogContent className="bg-[#282828] text-white border-gray-700 max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedPlaylist?.name || 'Untitled Playlist'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedPlaylist?.description && (
              <p className="text-gray-400">{selectedPlaylist.description}</p>
            )}
            
            <div className="flex gap-6 text-sm text-gray-400">
              {selectedPlaylist?.items && (
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  {selectedPlaylist.items.length} tracks
                </div>
              )}
              {selectedPlaylist?.lastModifiedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Modified {new Date(selectedPlaylist.lastModifiedDate).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {selectedPlaylist?.items && selectedPlaylist.items.length > 0 && (
              <div>
                <h4 className="text-lg mb-3">Tracks</h4>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {selectedPlaylist.items.map((item: any, index: number) => (
                    <div 
                      key={index}
                      className="flex items-center gap-3 p-2 hover:bg-[#3e3e3e] rounded"
                    >
                      <div className="text-gray-500 w-6">{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        {item.track && (
                          <>
                            <div className="truncate">{item.track.trackName}</div>
                            <div className="text-sm text-gray-400 truncate">
                              {item.track.artistName}
                            </div>
                          </>
                        )}
                        {item.episode && (
                          <>
                            <div className="truncate">{item.episode.episodeName}</div>
                            <div className="text-sm text-gray-400 truncate">
                              {item.episode.showName}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
