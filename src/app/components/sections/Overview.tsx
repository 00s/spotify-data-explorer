import { ParsedData, AggregatedStats } from '../../types/spotify';
import { formatDuration, msToHours, formatNumber } from '../../utils/dataAggregator';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Music, Headphones, Mic2, TrendingUp, Activity } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { HistoryBoundariesCard } from '../HistoryBoundariesCard';
import { useTimeFilter } from '../../context/TimeFilterContext';
import { useFilteredItems, useFilteredSessions, useFilteredStats } from '../../hooks/useTimeFilteredData';

interface OverviewProps {
  data: ParsedData;
  stats: AggregatedStats;
  onNavigate: (section: string) => void;
}

export function Overview({ data, stats, onNavigate }: OverviewProps) {
  const { filter } = useTimeFilter();
  const filteredItems = useFilteredItems(data, filter);
  const filteredSessions = useFilteredSessions(stats, filter);
  const filteredStats = useFilteredStats(filteredItems, filteredSessions);

  const totalPodcastTime = filteredItems
    .filter((item) => item.type === 'podcast')
    .reduce((sum, item) => sum + (item.ms_played || item.msPlayed || 0), 0);

  // Prepare chart data based on granularity
  const chartData = filteredStats.listeningByDay.map((item) => {
    const date = parseISO(item.day);
    return {
      month: format(date, filter.granularity === 'hour' ? 'HH:mm' : filter.granularity === 'day' ? 'MMM dd' : 'MMM yyyy'),
      hours: Math.round(msToHours(item.musicTime + item.podcastTime)),
    };
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Your Listening Overview</h1>
        <p className="text-muted-foreground">
          A high-level summary of your Spotify activity
        </p>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Music}
          label="Total Listening Time"
          value={formatDuration(filteredStats.totalListeningTime)}
          subtitle={filter.label}
        />
        <StatCard
          icon={Activity}
          label="Listening Sessions"
          value={filteredSessions.length.toString()}
          subtitle={`${filteredItems.length} items played`}
        />
        <StatCard
          icon={Headphones}
          label="Top Artist"
          value={filteredStats.topArtists[0]?.name || 'N/A'}
          subtitle={
            filteredStats.topArtists[0]
              ? `${formatNumber(filteredStats.topArtists[0].playCount)} plays`
              : ''
          }
        />
        <StatCard
          icon={Mic2}
          label="Podcast Time"
          value={formatDuration(totalPodcastTime)}
          subtitle={`${filteredStats.topPodcasts.length} shows`}
        />
      </div>

      {/* Listening Over Time Chart */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h3 className="mb-4">Listening Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1db954" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1db954" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="month"
                stroke="#b3b3b3"
                tick={{ fill: '#b3b3b3', fontSize: 12 }}
              />
              <YAxis
                stroke="#b3b3b3"
                tick={{ fill: '#b3b3b3', fontSize: 12 }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#b3b3b3' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#1db954"
                strokeWidth={2}
                fill="url(#colorHours)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Boundaries and Session Insights Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* History Boundaries */}
        {stats.historyBoundaries && <HistoryBoundariesCard boundaries={stats.historyBoundaries} />}

        {/* Session Insights */}
        {filteredSessions.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="mb-1">Session Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Your listening behavior analyzed by sessions
                </p>
              </div>
              <button
                onClick={() => onNavigate('sessions')}
                className="text-sm text-primary hover:underline"
              >
                View details
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatNumber(filteredSessions.length)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Sessions</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {Math.round(
                    filteredSessions.reduce((sum, s) => sum + s.durationSeconds, 0) /
                      filteredSessions.length /
                      60
                  )}{' '}
                  min
                </p>
                <p className="text-xs text-muted-foreground mt-1">Avg. Session</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <Music className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {Math.round(
                    Math.max(...filteredSessions.map((s) => s.durationSeconds)) / 60
                  )}{' '}
                  min
                </p>
                <p className="text-xs text-muted-foreground mt-1">Longest Session</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-lg">
                <Headphones className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold capitalize">
                  {(() => {
                    const byTime = filteredSessions.reduce(
                      (acc, s) => {
                        acc[s.timeOfDay] = (acc[s.timeOfDay] || 0) + 1;
                        return acc;
                      },
                      {} as Record<string, number>
                    );
                    return (
                      Object.entries(byTime).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                    );
                  })()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Peak Time</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Artists */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Top Artists</h3>
            <button
              onClick={() => onNavigate('listening')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {filteredStats.topArtists.slice(0, 5).map((artist, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(artist.playTime)} • {formatNumber(artist.playCount)} plays
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Top Tracks</h3>
            <button
              onClick={() => onNavigate('listening')}
              className="text-sm text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {filteredStats.topTracks.slice(0, 5).map((track, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{track.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artist} • {formatNumber(track.playCount)} plays
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: string;
  subtitle: string;
}

function StatCard({ icon: Icon, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 hover:border-primary/50 transition-colors">
      <Icon className="w-8 h-8 text-primary mb-3" />
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
