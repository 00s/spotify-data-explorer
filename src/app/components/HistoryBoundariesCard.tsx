import { HistoryBoundaries } from '../types/spotify';
import { Calendar, Clock, TrendingUp, AlertCircle } from 'lucide-react';

interface HistoryBoundariesCardProps {
  boundaries: HistoryBoundaries;
}

export function HistoryBoundariesCard({ boundaries }: HistoryBoundariesCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Listening History</h3>
          <p className="text-sm text-muted-foreground">
            Your data spans {boundaries.spanDescription}
          </p>
        </div>
        <Calendar className="w-8 h-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Start Date */}
        <div className="p-4 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Listening since</p>
          <p className="text-lg font-bold">{boundaries.formattedStart}</p>
        </div>

        {/* End Date */}
        <div className="p-4 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Last data up to</p>
          <p className="text-lg font-bold">{boundaries.formattedEnd}</p>
        </div>
      </div>

      {/* Data Quality */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Data Coverage</span>
          </div>
          <span className="font-semibold">
            {boundaries.dataQuality.coveragePercent}% ({boundaries.dataQuality.coverageDays}/
            {boundaries.totalDays + 1} days)
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Total Items</span>
          </div>
          <span className="font-semibold">
            {boundaries.dataQuality.totalItems.toLocaleString()}
          </span>
        </div>

        {boundaries.dataQuality.totalSessions > 0 && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Listening Sessions</span>
            </div>
            <span className="font-semibold">
              {boundaries.dataQuality.totalSessions.toLocaleString()}
            </span>
          </div>
        )}

        {boundaries.dataQuality.longestGap && (
          <div className="flex items-start justify-between text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <span className="text-muted-foreground">Longest Gap</span>
            </div>
            <div className="text-right">
              <span className="font-semibold block">
                {boundaries.dataQuality.longestGap.durationDays} days
              </span>
              <span className="text-xs text-muted-foreground">
                {boundaries.dataQuality.longestGap.start.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
                {' - '}
                {boundaries.dataQuality.longestGap.end.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
