import { ParsedData, AggregatedStats } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataAggregator';
import { Sparkles, Music, Headphones, Calendar, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface WrappedProps {
  data: ParsedData;
  stats: AggregatedStats;
}

export function Wrapped({ data, stats }: WrappedProps) {
  const currentYear = new Date().getFullYear();

  // Normalize and filter data for current year
  const currentYearHistory = data.streamingHistoryMusic
    .map((item) => ({
      ts: item.ts || item.endTime || '',
      ms_played: item.ms_played || item.msPlayed || 0,
    }))
    .filter((item) => {
      try {
        const year = new Date(item.ts).getFullYear();
        return year === currentYear;
      } catch {
        return false;
      }
    });

  const totalMinutes = Math.round(
    currentYearHistory.reduce((sum, item) => sum + item.ms_played, 0) / (1000 * 60)
  );

  // Find day with most listening
  const dayMap = new Map<string, number>();
  currentYearHistory.forEach((item) => {
    try {
      const day = format(parseISO(item.ts), 'yyyy-MM-dd');
      dayMap.set(day, (dayMap.get(day) || 0) + item.ms_played);
    } catch {
      // Skip invalid dates
    }
  });

  const topDay = Array.from(dayMap.entries())
    .sort((a, b) => b[1] - a[1])[0];

  // Top genres (if available from wrapped data)
  const topGenres = data.wrapped?.topGenres || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-primary" />
          <h1>Wrapped Highlights</h1>
        </div>
        <p className="text-muted-foreground">
          Your year in music, Spotify-style
        </p>
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <WrappedCard
          icon={Music}
          label={`${currentYear} Minutes Listened`}
          value={formatNumber(totalMinutes)}
          subtitle="Keep jamming!"
        />
        <WrappedCard
          icon={Headphones}
          label="Top Artist"
          value={stats.topArtists[0]?.name || 'N/A'}
          subtitle={stats.topArtists[0] ? `${formatNumber(stats.topArtists[0].playCount)} plays` : ''}
        />
        <WrappedCard
          icon={TrendingUp}
          label="Top Track"
          value={stats.topTracks[0]?.name || 'N/A'}
          subtitle={stats.topTracks[0]?.artist || ''}
        />
        <WrappedCard
          icon={Calendar}
          label="Biggest Listening Day"
          value={topDay ? format(parseISO(topDay[0]), 'MMM d') : 'N/A'}
          subtitle={topDay ? formatDuration(topDay[1]) : ''}
        />
      </div>

      {/* Top Artists */}
      <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-lg border border-border p-6 mb-6">
        <h2 className="mb-4">Your Top Artists of {currentYear}</h2>
        <div className="grid md:grid-cols-5 gap-4">
          {stats.topArtists.slice(0, 5).map((artist, idx) => (
            <div key={idx} className="text-center">
              <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-primary/30 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">{idx + 1}</span>
              </div>
              <p className="font-semibold mb-1">{artist.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(artist.playCount)} plays
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Top Tracks */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="mb-4">Your Top Tracks of {currentYear}</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {stats.topTracks.slice(0, 10).map((track, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-semibold">{track.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {track.artist} • {formatNumber(track.playCount)} plays
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Genres */}
      {topGenres.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-4">Your Top Genres</h3>
          <div className="flex flex-wrap gap-2">
            {topGenres.map((genre, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full bg-primary/20 text-primary font-semibold"
              >
                {genre}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wrapped Data from File */}
      {data.wrapped && (
        <div className="mt-6 bg-secondary/50 rounded-lg border border-border p-6">
          <h3 className="mb-2">Wrapped Data Available</h3>
          <p className="text-sm text-muted-foreground">
            Additional insights from your Spotify Wrapped data file
          </p>
        </div>
      )}
    </div>
  );
}

interface WrappedCardProps {
  icon: any;
  label: string;
  value: string;
  subtitle: string;
}

function WrappedCard({ icon: Icon, label, value, subtitle }: WrappedCardProps) {
  return (
    <div className="bg-card rounded-lg border border-primary/50 p-6 hover:border-primary transition-colors">
      <Icon className="w-8 h-8 text-primary mb-3" />
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold mb-1 truncate">{value}</p>
      <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
    </div>
  );
}