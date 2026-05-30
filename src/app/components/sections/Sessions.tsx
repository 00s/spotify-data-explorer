import { AggregatedStats } from '../../types/spotify';
import { formatDuration, formatNumber } from '../../utils/dataAggregator';
import {
  getHourlyListeningPattern,
  getSessionLengthDistribution,
  getTimeOfDayBreakdown,
} from '../../utils/sessionProcessor';
import { Activity, Clock, BarChart3, TrendingUp } from 'lucide-react';
import { useTimeFilter } from '../../context/TimeFilterContext';
import { useFilteredSessions } from '../../hooks/useTimeFilteredData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface SessionsProps {
  stats: AggregatedStats;
}

export function Sessions({ stats }: SessionsProps) {
  const { filter } = useTimeFilter();
  const filteredSessions = useFilteredSessions(stats, filter);

  if (!stats.sessionCatalog || filteredSessions.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="mb-2">Listening Sessions</h1>
          <p className="text-muted-foreground">
            {!stats.sessionCatalog
              ? 'Session analysis is not available for this dataset'
              : 'No sessions in the selected time range'}
          </p>
        </div>
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No session data available</p>
        </div>
      </div>
    );
  }

  const { historyBoundaries } = stats;

  // Build sessionsByHour map so getHourlyListeningPattern has real data
  const sessionsByHour = new Map<number, typeof filteredSessions>();
  filteredSessions.forEach((s) => {
    const hour = new Date(s.startTimestamp * 1000).getHours();
    const bucket = sessionsByHour.get(hour) ?? [];
    bucket.push(s);
    sessionsByHour.set(hour, bucket);
  });

  // Create filtered session catalog
  const filteredCatalog = {
    sessions: filteredSessions,
    totalSessions: filteredSessions.length,
    averageSessionDuration:
      filteredSessions.reduce((sum, s) => sum + s.durationSeconds, 0) /
      (filteredSessions.length || 1),
    longestSession: filteredSessions.reduce(
      (max, s) => (s.durationSeconds > (max?.durationSeconds || 0) ? s : max),
      filteredSessions[0]
    ),
    sessionsByDate: new Map(),
    sessionsByDayOfWeek: new Map(),
    sessionsByHour,
    sessionsByTimeOfDay: new Map(),
  };

  const hourlyPattern = getHourlyListeningPattern(filteredCatalog);
  const lengthDistribution = getSessionLengthDistribution(filteredCatalog);
  const timeOfDayBreakdown = getTimeOfDayBreakdown(filteredCatalog);

  // Prepare data for charts
  const hourlyChartData = hourlyPattern.map((item) => ({
    hour: `${item.hour}:00`,
    'Music (min)': Math.round(item.musicTime / 60),
    'Podcasts (min)': Math.round(item.podcastTime / 60),
  }));

  const lengthChartData = [
    { name: 'Short (<30m)', value: lengthDistribution.short, fill: '#1db954' },
    { name: 'Medium (30-60m)', value: lengthDistribution.medium, fill: '#1ed760' },
    { name: 'Long (60-120m)', value: lengthDistribution.long, fill: '#1fdf64' },
    { name: 'Very Long (>120m)', value: lengthDistribution.veryLong, fill: '#4ade80' },
  ];

  const timeOfDayChartData = timeOfDayBreakdown.map((item) => ({
    name: item.timeOfDay.charAt(0).toUpperCase() + item.timeOfDay.slice(1),
    'Music (hours)': Math.round(item.musicTime / 3600),
    'Podcasts (hours)': Math.round(item.podcastTime / 3600),
  }));

  const avgSessionMinutes = Math.round(filteredCatalog.averageSessionDuration / 60);
  const longestSessionMinutes = filteredCatalog.longestSession
    ? Math.round(filteredCatalog.longestSession.durationSeconds / 60)
    : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Listening Sessions</h1>
        <p className="text-muted-foreground">
          Deep dive into your listening patterns and session analytics
        </p>
        {historyBoundaries && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing: {historyBoundaries.shortFormattedStart} - {historyBoundaries.shortFormattedEnd} ({historyBoundaries.spanDescription})
          </p>
        )}
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <Activity className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
          <p className="text-2xl font-bold">{formatNumber(filteredCatalog.totalSessions)}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <Clock className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Average Session</p>
          <p className="text-2xl font-bold">{avgSessionMinutes} min</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <TrendingUp className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Longest Session</p>
          <p className="text-2xl font-bold">{longestSessionMinutes} min</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <BarChart3 className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Items per Session</p>
          <p className="text-2xl font-bold">
            {filteredCatalog.totalSessions > 0
              ? Math.round(
                  filteredCatalog.sessions.reduce((sum, s) => sum + s.itemCount, 0) /
                    filteredCatalog.totalSessions
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Hourly Listening Pattern */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h3 className="mb-6">Listening Activity by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="hour" stroke="#b3b3b3" fontSize={12} />
            <YAxis stroke="#b3b3b3" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#282828',
                border: '1px solid #404040',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="Music (min)" stackId="a" fill="#1db954" />
            <Bar dataKey="Podcasts (min)" stackId="a" fill="#9333ea" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Peak listening hours: Most active sessions occur during{' '}
          {hourlyPattern.reduce((max, item) =>
            item.totalTime > max.totalTime ? item : max
          ).hour}
          :00 -{' '}
          {hourlyPattern.reduce((max, item) =>
            item.totalTime > max.totalTime ? item : max
          ).hour + 1}
          :00
        </p>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Session Length Distribution */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-6">Session Length Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={lengthChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {lengthChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Time of Day Breakdown */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-6">Listening by Time of Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeOfDayChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#b3b3b3" fontSize={12} />
              <YAxis stroke="#b3b3b3" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#282828',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="Music (hours)" fill="#1db954" />
              <Bar dataKey="Podcasts (hours)" fill="#9333ea" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Sessions */}
      {filteredCatalog.sessions.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="mb-4">Recent Sessions</h3>
          <div className="space-y-3">
            {filteredCatalog.sessions
              .sort((a, b) => b.startTimestamp - a.startTimestamp)
              .slice(0, 10)
              .map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">
                        {new Date(session.startTimestamp * 1000).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground capitalize">
                        {session.timeOfDay}
                      </p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTimestamp * 1000).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{Math.round(session.durationSeconds / 60)} minutes</span>
                      <span>•</span>
                      <span>{session.itemCount} items</span>
                      <span>•</span>
                      <span>
                        {session.musicCount} music, {session.podcastCount} podcasts
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
