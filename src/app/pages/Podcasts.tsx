import React from 'react';
import { useData } from '../context/DataContext';
import { formatDuration } from '../utils/dataAggregator';
import { Headphones } from 'lucide-react';

export function Podcasts() {
  const { aggregatedStats, processedData } = useData();
  
  if (!aggregatedStats || !processedData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }
  
  const { podcastStats } = aggregatedStats;
  const hasInteractivity = processedData.podcastInteractivity.length > 0;
  
  if (podcastStats.totalTime === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl mb-2">Podcasts</h2>
          <p className="text-gray-400">Your podcast listening history</p>
        </div>
        
        <div className="bg-[#181818] rounded-lg p-12 text-center">
          <Headphones className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl mb-2">No Podcast Data</h3>
          <p className="text-gray-400">
            No podcast listening history found in your data export.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl mb-2">Podcasts</h2>
        <p className="text-gray-400">Your podcast listening history</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#181818] rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Total Podcast Time</div>
          <div className="text-3xl text-[#1DB954]">
            {formatDuration(podcastStats.totalTime)}
          </div>
        </div>
        
        <div className="bg-[#181818] rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Unique Shows</div>
          <div className="text-3xl">{podcastStats.topShows.length}</div>
        </div>
        
        <div className="bg-[#181818] rounded-lg p-6">
          <div className="text-sm text-gray-400 mb-2">Episodes Listened</div>
          <div className="text-3xl">{podcastStats.topEpisodes.length}</div>
        </div>
      </div>
      
      {/* Top Shows */}
      <div className="bg-[#181818] rounded-lg p-6">
        <h3 className="text-xl mb-4">Top Shows</h3>
        <div className="space-y-3">
          {podcastStats.topShows.slice(0, 20).map((show, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 hover:bg-[#282828] p-3 rounded-lg transition-colors"
            >
              <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-lg">{show.name}</div>
                <div className="text-sm text-gray-400">
                  {show.playCount} episode{show.playCount !== 1 ? 's' : ''} · {formatDuration(show.totalMs)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Episodes */}
      <div className="bg-[#181818] rounded-lg p-6">
        <h3 className="text-xl mb-4">Top Episodes</h3>
        <div className="space-y-3">
          {podcastStats.topEpisodes.slice(0, 20).map((episode, index) => (
            <div 
              key={index} 
              className="flex items-center gap-4 hover:bg-[#282828] p-3 rounded-lg transition-colors"
            >
              <div className="text-2xl text-gray-500 w-8">{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-lg">{episode.name}</div>
                <div className="text-sm text-gray-400 truncate">
                  {episode.show} · {episode.playCount} play{episode.playCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-right text-sm">
                {formatDuration(episode.totalMs)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Interactivity */}
      {hasInteractivity && (
        <div className="bg-[#181818] rounded-lg p-6">
          <h3 className="text-xl mb-4">Your Interactions</h3>
          <p className="text-gray-400">
            {processedData.podcastInteractivity.length} podcast interaction
            {processedData.podcastInteractivity.length !== 1 ? 's' : ''} (ratings, reactions)
          </p>
        </div>
      )}
    </div>
  );
}
