import { ParsedData, AggregatedStats } from '../../types/spotify';
import { formatDuration, msToHours, formatNumber } from '../../utils/dataAggregator';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Music, Headphones, Mic2, TrendingUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface OverviewProps {
  data: ParsedData;
  stats: AggregatedStats;
  onNavigate: (section: string) => void;
}

export function Overview({ data, stats, onNavigate }: OverviewProps) {
  const totalPodcastTime = data.streamingHistoryPodcast.reduce(
    (sum, item) => sum + item.ms_played,
    0
  );

  // Prepare chart data (by month, simplified)
  const chartData = stats.listeningByMonth.slice(-12).map((item) => ({
    month: format(parseISO(item.month + '-01'), 'MMM yyyy'),
    hours: Math.round(msToHours(item.musicTime + item.podcastTime)),
  }));

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
          value={formatDuration(stats.totalListeningTime)}
          subtitle="All time"
        />
        <StatCard
          icon={TrendingUp}
          label="This Year"
          value={formatDuration(stats.totalListeningTimeYear)}
          subtitle={new Date().getFullYear().toString()}
        />
        <StatCard
          icon={Headphones}
          label="Top Artist"
          value={stats.topArtists[0]?.name || 'N/A'}
          subtitle={
            stats.topArtists[0]
              ? `${formatNumber(stats.topArtists[0].playCount)} plays`
              : ''
          }
        />
        <StatCard
          icon={Mic2}
          label="Podcast Time"
          value={formatDuration(totalPodcastTime)}
          subtitle={`${stats.topPodcasts.length} shows`}
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
            {stats.topArtists.slice(0, 5).map((artist, idx) => (
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
            {stats.topTracks.slice(0, 5).map((track, idx) => (
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
