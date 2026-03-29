import { useState } from 'react';
import { ParsedData } from '../../types/spotify';
import { Search, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { formatNumber } from '../../utils/dataAggregator';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface SearchBehaviorProps {
  data: ParsedData;
}

export function SearchBehavior({ data }: SearchBehaviorProps) {
  const [showRawData, setShowRawData] = useState(false);

  // Aggregate search queries
  const queryMap = new Map<string, number>();
  data.searchQueries.forEach((search) => {
    const query = search.searchQuery?.toLowerCase() || '';
    if (query) {
      queryMap.set(query, (queryMap.get(query) || 0) + 1);
    }
  });

  const topQueries = Array.from(queryMap.entries())
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const chartData = topQueries.slice(0, 10);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">Search Behavior</h1>
        <p className="text-muted-foreground">
          Insights into what you search for on Spotify
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <Search className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Total Searches</p>
          <p className="text-2xl font-bold">{formatNumber(data.searchQueries.length)}</p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <TrendingUp className="w-8 h-8 text-primary mb-3" />
          <p className="text-sm text-muted-foreground mb-1">Unique Queries</p>
          <p className="text-2xl font-bold">{formatNumber(queryMap.size)}</p>
        </div>
      </div>

      {topQueries.length > 0 ? (
        <>
          {/* Top Queries Chart */}
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <h3 className="mb-4">Most Searched Queries</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    type="number"
                    stroke="#b3b3b3"
                    tick={{ fill: '#b3b3b3', fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="query"
                    stroke="#b3b3b3"
                    tick={{ fill: '#b3b3b3', fontSize: 12 }}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#282828',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="count" fill="#1db954" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Queries List */}
          <div className="bg-card rounded-lg border border-border p-6 mb-6">
            <h3 className="mb-4">All Top Queries</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {topQueries.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-mono">{item.query}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? 'search' : 'searches'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data (Expandable) */}
          <button
            onClick={() => setShowRawData(!showRawData)}
            className="w-full bg-card rounded-lg border border-border p-4 mb-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
          >
            <span>View Raw Search History</span>
            {showRawData ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {showRawData && (
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {data.searchQueries.slice(0, 100).map((search, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-secondary/30 text-sm"
                  >
                    <p className="font-mono">{search.searchQuery}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      {search.searchTime && <span>{search.searchTime}</span>}
                      {search.platform && <span>{search.platform}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-card rounded-lg border border-border p-12 text-center">
          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No search history found</p>
        </div>
      )}
    </div>
  );
}
