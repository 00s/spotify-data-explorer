import { useMemo } from 'react';
import { NormalizedStreamingItem, ListeningSession } from '../types/spotify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DailyActivityViewProps {
  items: NormalizedStreamingItem[];
  sessions: ListeningSession[];
  date: Date;
}

export function DailyActivityView({ items, sessions, date }: DailyActivityViewProps) {
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, '0')}:00`,
      musicMinutes: 0,
      podcastMinutes: 0,
      totalItems: 0,
    }));

    items.forEach((item) => {
      const itemDate = new Date(item.ts || item.endTime || '');
      const hour = itemDate.getHours();
      const minutes = (item.ms_played || item.msPlayed || 0) / 60000;

      if (item.type === 'music') {
        hours[hour].musicMinutes += minutes;
      } else {
        hours[hour].podcastMinutes += minutes;
      }
      hours[hour].totalItems++;
    });

    return hours.filter((h) => h.totalItems > 0);
  }, [items]);

  const sessionsByHour = useMemo(() => {
    const byHour = new Map<number, ListeningSession[]>();
    sessions.forEach((session) => {
      const hour = session.hourOfDay;
      if (!byHour.has(hour)) {
        byHour.set(hour, []);
      }
      byHour.get(hour)!.push(session);
    });
    return byHour;
  }, [sessions]);

  const stats = useMemo(() => {
    const totalMinutes = items.reduce((sum, item) => sum + (item.ms_played || item.msPlayed || 0) / 60000, 0);
    const musicItems = items.filter((i) => i.type === 'music');
    const podcastItems = items.filter((i) => i.type === 'podcast');

    return {
      totalMinutes,
      totalItems: items.length,
      musicCount: musicItems.length,
      podcastCount: podcastItems.length,
      sessionCount: sessions.length,
    };
  }, [items, sessions]);

  if (items.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <p className="text-muted-foreground">No listening activity on this date</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Total Time</div>
          <div className="text-2xl font-semibold mt-1">
            {Math.floor(stats.totalMinutes / 60)}h {Math.floor(stats.totalMinutes % 60)}m
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Items Played</div>
          <div className="text-2xl font-semibold mt-1">{stats.totalItems}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Music Tracks</div>
          <div className="text-2xl font-semibold mt-1 text-green-500">{stats.musicCount}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Podcast Episodes</div>
          <div className="text-2xl font-semibold mt-1 text-purple-500">{stats.podcastCount}</div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="text-sm text-muted-foreground">Sessions</div>
          <div className="text-2xl font-semibold mt-1">{stats.sessionCount}</div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Activity by Hour</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="label" stroke="#888" />
            <YAxis stroke="#888" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Bar dataKey="musicMinutes" fill="#22c55e" name="Music" stackId="a" />
            <Bar dataKey="podcastMinutes" fill="#a855f7" name="Podcasts" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions List */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold mb-4">Listening Sessions</h3>
        <div className="space-y-3">
          {sessions.map((session) => {
            const startTime = new Date(session.startTimestamp * 1000);
            const endTime = new Date(session.endTimestamp * 1000);
            const duration = session.durationSeconds / 60;

            return (
              <div key={session.sessionId} className="bg-accent/50 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">{session.timeOfDay}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{Math.floor(duration)} min</div>
                    <div className="text-sm text-muted-foreground">{session.itemCount} items</div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-500">{session.musicCount} music</span>
                  <span className="text-purple-500">{session.podcastCount} podcasts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
