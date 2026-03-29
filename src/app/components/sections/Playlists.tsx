import { useState } from 'react';
import { ParsedData } from '../../types/spotify';
import { ListMusic, Music, User, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface PlaylistsProps {
  data: ParsedData;
}

export function Playlists({ data }: PlaylistsProps) {
  const [selectedPlaylist, setSelectedPlaylist] = useState<number | null>(null);

  const library = data.library || {
    tracks: [],
    albums: [],
    artists: [],
    shows: [],
    episodes: [],
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Playlists & Library</h1>
        <p className="text-muted-foreground">
          Your created playlists and saved content
        </p>
      </div>

      {/* Library Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <LibraryCard
          icon={Music}
          label="Saved Tracks"
          count={library.tracks?.length || 0}
        />
        <LibraryCard
          icon={ListMusic}
          label="Saved Albums"
          count={library.albums?.length || 0}
        />
        <LibraryCard
          icon={User}
          label="Followed Artists"
          count={library.artists?.length || 0}
        />
        <LibraryCard
          icon={ListMusic}
          label="Saved Shows"
          count={library.shows?.length || 0}
        />
      </div>

      {/* Playlists */}
      {data.playlists.length > 0 ? (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-4">Your Playlists ({data.playlists.length})</h3>

          {selectedPlaylist === null ? (
            <div className="space-y-2">
              {data.playlists.map((playlist, idx) => {
                const trackCount = playlist.items?.length || 0;
                const lastModified = playlist.lastModifiedDate
                  ? format(new Date(playlist.lastModifiedDate), 'MMM d, yyyy')
                  : 'Unknown';

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedPlaylist(idx)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <ListMusic className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{playlist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {trackCount} tracks • Updated {lastModified}
                      </p>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : (
            <PlaylistDetails
              playlist={data.playlists[selectedPlaylist]}
              onBack={() => setSelectedPlaylist(null)}
            />
          )}
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <ListMusic className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No playlist data found</p>
        </div>
      )}
    </div>
  );
}

interface LibraryCardProps {
  icon: any;
  label: string;
  count: number;
}

function LibraryCard({ icon: Icon, label, count }: LibraryCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <Icon className="w-6 h-6 text-primary mb-2" />
      <p className="text-2xl font-bold">{count.toLocaleString()}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

interface PlaylistDetailsProps {
  playlist: any;
  onBack: () => void;
}

function PlaylistDetails({ playlist, onBack }: PlaylistDetailsProps) {
  const tracks = playlist.items || [];

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 text-sm text-primary hover:underline"
      >
        ← Back to playlists
      </button>

      <div className="mb-6">
        <h2 className="mb-2">{playlist.name}</h2>
        {playlist.description && (
          <p className="text-muted-foreground mb-2">{playlist.description}</p>
        )}
        <div className="flex gap-4 text-sm text-muted-foreground">
          {playlist.lastModifiedDate && (
            <span>Updated {format(new Date(playlist.lastModifiedDate), 'MMM d, yyyy')}</span>
          )}
          <span>{tracks.length} tracks</span>
          {playlist.numberOfFollowers !== undefined && (
            <span>{playlist.numberOfFollowers} followers</span>
          )}
        </div>
      </div>

      {tracks.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tracks.map((item: any, idx: number) => {
            const track = item.track;
            const episode = item.episode;

            if (track) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-6 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{track.trackName || 'Unknown Track'}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artistName || 'Unknown Artist'}
                    </p>
                  </div>
                </div>
              );
            }

            if (episode) {
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <span className="text-sm text-muted-foreground w-6 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{episode.episodeName || 'Unknown Episode'}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {episode.showName || 'Unknown Show'}
                    </p>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">No tracks in this playlist</p>
      )}
    </div>
  );
}
