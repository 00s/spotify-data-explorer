import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatDuration } from '../utils/dataAggregator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ListeningHistory() {
  const { aggregatedStats } = useData();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month'>('all');
  const [showAllArtists, setShowAllArtists] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);
  
  if (!aggregatedStats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }
  
  const chartData = useMemo(() => {
    let data = aggregatedStats.listeningByDay;
    
    if (timeRange === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      data = data.filter(item => new Date(item.date) >= oneYearAgo);
    } else if (timeRange === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      data = data.filter(item => new Date(item.date) >= oneMonthAgo);
    }
    
    // Sample data if too many points
    if (data.length > 90) {
      const step = Math.ceil(data.length / 90);
      data = data.filter((_, index) => index % step === 0);
    }
    
    return data.map(item => ({
      date: item.date,
      hours: Number((item.totalMs / 3600000).toFixed(1)),
    }));
  }, [aggregatedStats, timeRange]);
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl mb-2">Listening History</h2>
        <p className="text-gray-400">Dive into your music streaming patterns</p>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex gap-2">
        <Button
          onClick={() => setTimeRange('all')}
          variant={timeRange === 'all' ? 'default' : 'outline'}
          className={timeRange === 'all' ? 'bg-[#1DB954] text-black hover:bg-[#1ed760]' : ''}
        >
          All Time
        </Button>
        <Button
          onClick={() => setTimeRange('year')}
          variant={timeRange === 'year' ? 'default' : 'outline'}
          className={timeRange === 'year' ? 'bg-[#1DB954] text-black hover:bg-[#1ed760]' : ''}
        >
          Past Year
        </Button>
        <Button
          onClick={() => setTimeRange('month')}
          variant={timeRange === 'month' ? 'default' : 'outline'}
          className={timeRange === 'month' ? 'bg-[#1DB954] text-black hover:bg-[#1ed760]' : ''}
        >
          Past Month
        </Button>
      </div>
      
      {/* Listening Chart */}
      <div className="bg-[#181818] rounded-lg p-6">
        <h3 className="text-xl mb-4">Daily Listening</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#888"
                tick={{ fill: '#888', fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#888"
                tick={{ fill: '#888' }}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#888' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#282828', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="hours" fill="#1DB954" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Top Artists */}
      <div className="bg-[#181818] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl">Top Artists</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllArtists(!showAllArtists)}
            className="text-[#1DB954]"
          >
            {showAllArtists ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-3">
          {aggregatedStats.topArtists
            .slice(0, showAllArtists ? undefined : 10)
            .map((artist, index) => (
              <div key={index} className="flex items-center gap-4 hover:bg-[#282828] p-3 rounded-lg transition-colors">
                <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-lg">{artist.name}</div>
                  <div className="text-sm text-gray-400">
                    {artist.playCount.toLocaleString()} plays · {formatDuration(artist.totalMs)}
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {Math.round(artist.totalMs / artist.playCount / 1000)}s avg
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Top Tracks */}
      <div className="bg-[#181818] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl">Top Tracks</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllTracks(!showAllTracks)}
            className="text-[#1DB954]"
          >
            {showAllTracks ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show All
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-3">
          {aggregatedStats.topTracks
            .slice(0, showAllTracks ? undefined : 10)
            .map((track, index) => (
              <div key={index} className="flex items-center gap-4 hover:bg-[#282828] p-3 rounded-lg transition-colors">
                <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-lg">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artist} · {track.playCount.toLocaleString()} plays
                  </div>
                </div>
                <div className="text-right text-sm">
                  {formatDuration(track.totalMs)}
                </div>
              </div>
            ))}
        </div>
      </div>
      
      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-[#181818] rounded-lg p-6">
          <h3 className="text-xl mb-4">Advanced Filters</h3>
          <p className="text-gray-400 text-sm">
            Advanced filtering options (by device, country, etc.) would be available here
            if your data export includes Extended Streaming History.
          </p>
        </div>
      )}
    </div>
  );
}
