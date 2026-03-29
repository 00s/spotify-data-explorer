import React from 'react';
import { useData } from '../context/DataContext';
import { Clock, Music, User, TrendingUp } from 'lucide-react';
import { formatDuration, formatMinutes } from '../utils/dataAggregator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router';

export function Overview() {
  const { aggregatedStats, processedData } = useData();
  
  if (!aggregatedStats || !processedData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }
  
  const chartData = aggregatedStats.listeningByMonth.map(item => ({
    month: item.month,
    minutes: Math.floor(item.totalMs / 60000),
  }));
  
  const stats = [
    {
      label: 'Total Listening Time',
      value: formatDuration(aggregatedStats.totalListeningTime),
      subValue: `${formatMinutes(aggregatedStats.totalListeningTime)} minutes`,
      icon: Clock,
      color: 'text-[#1DB954]',
      link: '/listening',
    },
    {
      label: 'Unique Tracks',
      value: aggregatedStats.totalTracks.toLocaleString(),
      subValue: 'Different songs played',
      icon: Music,
      color: 'text-purple-500',
      link: '/listening',
    },
    {
      label: 'Unique Artists',
      value: aggregatedStats.totalArtists.toLocaleString(),
      subValue: 'Different artists',
      icon: User,
      color: 'text-blue-500',
      link: '/listening',
    },
    {
      label: 'Podcast Time',
      value: formatDuration(aggregatedStats.podcastStats.totalTime),
      subValue: `${formatMinutes(aggregatedStats.podcastStats.totalTime)} minutes`,
      icon: TrendingUp,
      color: 'text-orange-500',
      link: '/podcasts',
    },
  ];
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl mb-2">Overview</h2>
        <p className="text-gray-400">Your listening at a glance</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-[#181818] rounded-lg p-6 hover:bg-[#282828] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="text-3xl mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.subValue}</div>
            </Link>
          );
        })}
      </div>
      
      {/* Listening Over Time Chart */}
      <div className="bg-[#181818] rounded-lg p-6">
        <h3 className="text-xl mb-4">Listening Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="month" 
                stroke="#888"
                tick={{ fill: '#888' }}
              />
              <YAxis 
                stroke="#888"
                tick={{ fill: '#888' }}
                label={{ value: 'Minutes', angle: -90, position: 'insideLeft', fill: '#888' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#282828', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#1DB954" 
                strokeWidth={2}
                dot={{ fill: '#1DB954' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Top Artists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#181818] rounded-lg p-6">
          <h3 className="text-xl mb-4">Top Artists</h3>
          <div className="space-y-3">
            {aggregatedStats.topArtists.slice(0, 5).map((artist, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{artist.name}</div>
                  <div className="text-sm text-gray-400">
                    {artist.playCount} plays · {formatDuration(artist.totalMs)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/listening" className="text-[#1DB954] hover:underline text-sm mt-4 inline-block">
            View all →
          </Link>
        </div>
        
        {/* Top Tracks */}
        <div className="bg-[#181818] rounded-lg p-6">
          <h3 className="text-xl mb-4">Top Tracks</h3>
          <div className="space-y-3">
            {aggregatedStats.topTracks.slice(0, 5).map((track, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{track.name}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {track.artist} · {track.playCount} plays
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="/listening" className="text-[#1DB954] hover:underline text-sm mt-4 inline-block">
            View all →
          </Link>
        </div>
      </div>
    </div>
  );
}
