import { useState } from 'react';
import { ParsedData, AggregatedStats } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataAggregator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTimeFilter } from '../../context/TimeFilterContext';
import { useFilteredItems, useFilteredSessions, useFilteredStats } from '../../hooks/useTimeFilteredData';

interface ListeningHistoryProps {
  data: ParsedData;
  stats: AggregatedStats;
}

export function ListeningHistory({ data, stats }: ListeningHistoryProps) {
  const { filter } = useTimeFilter();
  const filteredItems = useFilteredItems(data, filter);
  const filteredSessions = useFilteredSessions(stats, filter);
  const filteredStats = useFilteredStats(filteredItems, filteredSessions);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'month'>('month');

  const chartData = filteredStats.listeningByDay.map((item) => ({
    label: format(parseISO(item.day), filter.granularity === 'day' ? 'MMM d' : 'MMM yy'),
    hours: Math.round((item.musicTime / (1000 * 60 * 60)) * 10) / 10,
  }));

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Listening History</h1>
        <p className="text-muted-foreground">
          Explore your music listening patterns over time
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-card rounded-lg border border-border p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm">View by:</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'day'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Listening Chart */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h3 className="mb-4">Listening Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="label"
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
              <Bar dataKey="hours" fill="#1db954" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Advanced Filters (Collapsible) */}
      <button
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        className="w-full bg-card rounded-lg border border-border p-4 mb-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
      >
        <span>Advanced Filters</span>
        {showAdvancedFilters ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {showAdvancedFilters && (
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <p className="text-sm text-muted-foreground">
            Advanced filtering by year, device, platform, and country will be available when you
            have extended streaming history data.
          </p>
        </div>
      )}

      {/* Top Artists & Tracks */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Artists */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-4">Top Artists</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStats.topArtists.slice(0, 20).map((artist, idx) => (
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
          <h3 className="mb-4">Top Tracks</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredStats.topTracks.slice(0, 20).map((track, idx) => (
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
