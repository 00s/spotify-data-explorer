# Session Detection Engine Documentation

## Overview

The Session Detection Engine analyzes Spotify streaming history to identify listening sessions and provide temporal insights into user behavior.

## Architecture

### 1. Data Flow

```
Raw Streaming History (Music + Podcast)
    ↓
Unification (StreamingHistoryItem[])
    ↓
Time Normalization (compute start/end timestamps)
    ↓
Timeline Sorting (chronological order)
    ↓
Session Detection (60-minute gap threshold)
    ↓
Session Catalog (aggregated metadata)
```

### 2. Key Concepts

#### Session Definition
A **session** is a continuous sequence of listening activity where:
- The gap between consecutive items ≤ 60 minutes (3600 seconds)
- Gap is measured from end of previous item to start of current item
- Gaps > 60 minutes create a new session

#### Time Normalization
Each streaming item is enriched with:
- `endTimestampSeconds`: Unix timestamp when playback ended
- `startTimestampSeconds`: Unix timestamp when playback started (end - duration)
- `durationSeconds`: Playback duration in seconds

### 3. Data Structures

#### NormalizedStreamingItem
```typescript
{
  // Original fields...
  endTimestampSeconds: number,      // Unix timestamp (seconds)
  startTimestampSeconds: number,    // Unix timestamp (seconds)
  durationSeconds: number,          // Duration in seconds
  sessionId: string,                // e.g., "session_2025-03-06_1045_0"
  sessionIndex: number,             // Position within session (0-based)
  globalIndex: number               // Position in global timeline
}
```

#### ListeningSession
```typescript
{
  sessionId: string,
  startTimestamp: number,           // First item's start time
  endTimestamp: number,             // Last item's end time
  durationSeconds: number,          // Total session duration
  itemCount: number,                // Number of items

  // Content breakdown
  musicCount: number,
  podcastCount: number,
  musicDuration: number,
  podcastDuration: number,

  // Temporal context
  date: string,                     // "2025-03-06"
  dayOfWeek: number,               // 0-6 (Sunday-Saturday)
  hourOfDay: number,               // 0-23
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night',

  items: NormalizedStreamingItem[]
}
```

#### SessionCatalog
```typescript
{
  sessions: ListeningSession[],
  totalSessions: number,
  averageSessionDuration: number,
  longestSession: ListeningSession | null,

  // Lookup maps for efficient querying
  sessionsByDate: Map<string, ListeningSession[]>,
  sessionsByDayOfWeek: Map<number, ListeningSession[]>,
  sessionsByHour: Map<number, ListeningSession[]>,
  sessionsByTimeOfDay: Map<string, ListeningSession[]>
}
```

## Implementation

### Core Functions

#### `processStreamingHistoryWithSessions(data: ParsedData)`
Main entry point that orchestrates the entire pipeline:
1. Unifies music and podcast history
2. Computes timestamps for each item
3. Sorts items chronologically
4. Detects sessions based on gaps
5. Builds session catalog with aggregates

**Returns:** `{ items: NormalizedStreamingItem[], catalog: SessionCatalog }`

#### `unifyStreamingHistory(data: ParsedData)`
Merges music and podcast arrays into a single `StreamingHistoryItem[]`

#### `detectSessions(items: NormalizedStreamingItem[])`
Walks through sorted items and assigns session IDs based on 60-minute gap threshold

#### `buildSessionCatalog(items: NormalizedStreamingItem[])`
Groups items by session and computes aggregates and lookup maps

### Helper Functions

#### `getDailySessionStats(catalog, date)`
Returns session statistics for a specific date

#### `getHourlyListeningPattern(catalog)`
Returns listening activity breakdown by hour (0-23)

#### `getSessionLengthDistribution(catalog)`
Returns session count distribution:
- Short: < 30 minutes
- Medium: 30-60 minutes
- Long: 60-120 minutes
- Very Long: > 120 minutes

#### `getTimeOfDayBreakdown(catalog)`
Returns listening breakdown by time period:
- Morning: 5:00-11:59
- Afternoon: 12:00-16:59
- Evening: 17:00-20:59
- Night: 21:00-4:59

## Usage Examples

### Basic Session Processing
```typescript
import { processStreamingHistoryWithSessions } from './utils/sessionProcessor';

const { items, catalog } = processStreamingHistoryWithSessions(parsedData);

console.log(`Total sessions: ${catalog.totalSessions}`);
console.log(`Average session: ${catalog.averageSessionDuration / 60} minutes`);
```

### Get Daily Statistics
```typescript
import { getDailySessionStats } from './utils/sessionProcessor';

const stats = getDailySessionStats(catalog, '2025-03-06');
console.log(`Sessions on March 6: ${stats.sessionCount}`);
console.log(`Total listening: ${stats.totalListeningTime / 3600} hours`);
```

### Hourly Pattern Analysis
```typescript
import { getHourlyListeningPattern } from './utils/sessionProcessor';

const pattern = getHourlyListeningPattern(catalog);
const peakHour = pattern.reduce((max, item) =>
  item.totalTime > max.totalTime ? item : max
);

console.log(`Peak listening hour: ${peakHour.hour}:00`);
```

## Visualization Use Cases

### 1. Session Timeline
Display sessions on a timeline showing:
- When sessions occurred throughout the day
- Session duration (visual length)
- Music vs podcast content ratio

### 2. Listening Intensity Heatmap
Hour × Day of Week grid showing:
- Session count or total listening time
- Color intensity based on activity level
- Interactive tooltips with session details

### 3. Session Length Distribution
Pie chart or histogram showing:
- Distribution across length categories
- Average session length trend over time
- Comparison to Spotify global averages

### 4. Time of Day Patterns
Bar chart showing:
- Total listening time per time period
- Music vs podcast preference by time
- Weekday vs weekend comparisons

### 5. Engagement Metrics
Track over time:
- Average session length trend
- Sessions per day/week/month
- Longest session records

## Performance Characteristics

### Complexity
- **Time**: O(n log n) - dominated by sorting
- **Space**: O(n) - linear storage for normalized items and sessions

### Typical Performance
- 50K items (1 year): ~300-500ms processing time
- 100K items (2 years): ~600-800ms processing time
- Memory: ~50-100MB for normalized data structures

### Optimization Notes
- All processing is synchronous and client-side
- Session catalog maps enable O(1) lookups by date/hour/timeOfDay
- No server-side processing or API calls required
- Results can be cached in component state

## Edge Cases Handled

1. **Empty Data**: Returns empty catalog with safe defaults
2. **Single Item**: Creates a session with 1 item
3. **Overlapping Times**: Sorted by start time, maintains order stability
4. **Invalid Dates**: Skipped during timestamp calculation
5. **Missing Fields**: Fallbacks to alternative field names (ts/endTime, ms_played/msPlayed)
6. **Zero Duration**: Treated as 0-second playback

## Future Enhancements

### Potential Improvements
1. **Configurable Gap Threshold**: Allow users to adjust the 60-minute threshold
2. **Session Naming**: Auto-generate descriptive names ("Morning Commute", "Evening Wind-down")
3. **Session Tagging**: ML-based categorization (workout, study, relaxation)
4. **Cross-Device Detection**: Identify device switches within sessions
5. **Social Features**: Compare sessions with friends' patterns
6. **Export**: Download session data as CSV/JSON

### Advanced Analytics
1. **Mood Detection**: Infer mood from track characteristics
2. **Context Prediction**: Predict activity based on session patterns
3. **Recommendation**: Suggest optimal listening times
4. **Habit Formation**: Track listening habit changes over time

## Integration

The session detection engine is integrated into:
- `/src/app/utils/sessionProcessor.ts` - Core logic
- `/src/app/utils/dataAggregator.ts` - Called during data aggregation
- `/src/app/components/sections/Sessions.tsx` - Dedicated visualization page
- `/src/app/components/sections/Overview.tsx` - Session insights card
- `/src/app/types/spotify.ts` - Type definitions

## Testing

### Manual Testing Scenarios
1. Upload streaming history with varied gaps
2. Verify session boundaries at 60-minute threshold
3. Check session stats accuracy (counts, durations)
4. Validate time of day classification
5. Confirm hourly pattern aggregation
6. Test with music-only, podcast-only, and mixed data

### Expected Behaviors
- Sessions split correctly at 60+ minute gaps
- Session duration = last item end - first item start
- All items assigned to exactly one session
- Session IDs unique and chronologically ordered
- Lookup maps contain all sessions

## License & Attribution

Part of the Spotify Data Dashboard - Privacy-First Analytics
Built with React, TypeScript, and Recharts
