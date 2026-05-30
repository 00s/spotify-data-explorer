import { ParsedData, AggregatedStats } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataAggregator';
import { Mic2, MessageSquare, ThumbsUp } from 'lucide-react';
import { useTimeFilter } from '../../context/TimeFilterContext';
import { useFilteredItems, useFilteredStats } from '../../hooks/useTimeFilteredData';

interface PodcastsProps {
  data: ParsedData;
  stats: AggregatedStats;
}

export function Podcasts({ data, stats }: PodcastsProps) {
  const { filter } = useTimeFilter();
  const filteredItems = useFilteredItems(data, filter);
  const filteredStats = useFilteredStats(filteredItems, []);

  const podcastItems = filteredItems.filter((item) => item.type === 'podcast');
  const totalPodcastTime = podcastItems.reduce(
    (sum, item) => sum + (item.ms_played || item.msPlayed || 0),
    0
  );
  const totalEpisodes = podcastItems.length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Podcasts</h1>
        <p className="text-muted-foreground">
          Your podcast listening activity and interactions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <Mic2 className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Total Listening Time</p>
          <p className="text-2xl font-bold">{formatDuration(totalPodcastTime)}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <MessageSquare className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Episodes Played</p>
          <p className="text-2xl font-bold">{formatNumber(totalEpisodes)}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <ThumbsUp className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Shows Followed</p>
          <p className="text-2xl font-bold">{filteredStats.topPodcasts.length}</p>
        </div>
      </div>

      {/* Top Shows */}
      {filteredStats.topPodcasts.length > 0 ? (
        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h3 className="mb-4">Top Shows</h3>
          <div className="space-y-3">
            {filteredStats.topPodcasts.map((podcast, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center font-bold text-primary flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{podcast.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(podcast.playTime)} • {formatNumber(podcast.episodeCount)} episodes
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Mic2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No podcast listening history found</p>
        </div>
      )}

      {/* Interactivity */}
      {data.podcastInteractivity.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-4">Podcast Interactions</h3>
          <div className="space-y-3">
            {data.podcastInteractivity.slice(0, 10).map((interaction, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-secondary/30">
                <p className="font-semibold">{interaction.showName}</p>
                <p className="text-sm text-muted-foreground">
                  {interaction.episodeName} • {interaction.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
