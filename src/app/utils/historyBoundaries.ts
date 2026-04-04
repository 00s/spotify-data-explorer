import {
  format,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  startOfDay,
} from 'date-fns';
import {
  NormalizedStreamingItem,
  SessionCatalog,
  HistoryBoundaries,
  TimeFilter,
} from '../types/spotify';

/**
 * Compute history boundaries from normalized streaming items
 */
export function computeHistoryBoundaries(
  items: NormalizedStreamingItem[]
): HistoryBoundaries {
  if (items.length === 0) {
    const now = new Date();
    return {
      startDate: now,
      endDate: now,
      formattedStart: 'No data',
      formattedEnd: 'No data',
      shortFormattedStart: 'N/A',
      shortFormattedEnd: 'N/A',
      totalDays: 0,
      totalWeeks: 0,
      totalMonths: 0,
      spanDescription: 'No listening history',
      dataQuality: {
        totalItems: 0,
        totalSessions: 0,
        coverageDays: 0,
        coveragePercent: 0,
        longestGap: null,
      },
    };
  }

  // Find min and max timestamps
  let minTimestamp = Infinity;
  let maxTimestamp = -Infinity;

  items.forEach((item) => {
    if (item.startTimestampSeconds < minTimestamp) {
      minTimestamp = item.startTimestampSeconds;
    }
    if (item.endTimestampSeconds > maxTimestamp) {
      maxTimestamp = item.endTimestampSeconds;
    }
  });

  // Convert to dates
  const startDate = new Date(minTimestamp * 1000);
  const endDate = new Date(maxTimestamp * 1000);

  // Calculate time spans
  const totalDays = differenceInDays(endDate, startDate);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = differenceInMonths(endDate, startDate);

  // Format dates
  const formattedStart = format(startDate, 'dd MMMM yyyy');
  const formattedEnd = format(endDate, 'dd MMMM yyyy');
  const shortFormattedStart = format(startDate, 'MMM yyyy');
  const shortFormattedEnd = format(endDate, 'MMM yyyy');

  // Generate span description
  const spanDescription = generateSpanDescription(startDate, endDate);

  // Calculate data quality metrics
  const dataQuality = calculateDataQuality(items, startDate, endDate);

  return {
    startDate,
    endDate,
    formattedStart,
    formattedEnd,
    shortFormattedStart,
    shortFormattedEnd,
    totalDays,
    totalWeeks,
    totalMonths,
    spanDescription,
    dataQuality,
  };
}

/**
 * Generate human-readable span description
 */
function generateSpanDescription(startDate: Date, endDate: Date): string {
  const months = differenceInMonths(endDate, startDate);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0 && remainingMonths === 0) {
    const days = differenceInDays(endDate, startDate);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  if (years === 0) {
    return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  if (remainingMonths === 0) {
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  return `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${
    remainingMonths !== 1 ? 's' : ''
  }`;
}

/**
 * Calculate data quality metrics
 */
function calculateDataQuality(
  items: NormalizedStreamingItem[],
  startDate: Date,
  endDate: Date
) {
  // Count unique days with listening activity
  const daysWithData = new Set<string>();
  items.forEach((item) => {
    const dayKey = format(
      startOfDay(new Date(item.startTimestampSeconds * 1000)),
      'yyyy-MM-dd'
    );
    daysWithData.add(dayKey);
  });

  const coverageDays = daysWithData.size;
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const coveragePercent = Math.round((coverageDays / totalDays) * 100);

  // Find longest gap
  const longestGap = findLongestGap(items);

  return {
    totalItems: items.length,
    totalSessions: 0, // Will be filled by session catalog
    coverageDays,
    coveragePercent,
    longestGap,
  };
}

/**
 * Find the longest gap between listening sessions
 */
function findLongestGap(items: NormalizedStreamingItem[]) {
  if (items.length < 2) return null;

  let maxGapDuration = 0;
  let maxGapStart = items[0].endTimestampSeconds;
  let maxGapEnd = items[1].startTimestampSeconds;

  for (let i = 1; i < items.length; i++) {
    const prevEnd = items[i - 1].endTimestampSeconds;
    const currStart = items[i].startTimestampSeconds;
    const gap = currStart - prevEnd;

    if (gap > maxGapDuration) {
      maxGapDuration = gap;
      maxGapStart = prevEnd;
      maxGapEnd = currStart;
    }
  }

  const gapDays = Math.floor(maxGapDuration / 86400);

  // Only return if gap is significant (>1 day)
  if (gapDays > 1) {
    return {
      start: new Date(maxGapStart * 1000),
      end: new Date(maxGapEnd * 1000),
      durationDays: gapDays,
    };
  }

  return null;
}

/**
 * Compute boundaries from session catalog
 */
export function computeBoundariesFromCatalog(
  catalog: SessionCatalog
): HistoryBoundaries | null {
  if (catalog.sessions.length === 0) return null;

  // Flatten all items from all sessions
  const allItems: NormalizedStreamingItem[] = [];
  catalog.sessions.forEach((session) => {
    allItems.push(...session.items);
  });

  const boundaries = computeHistoryBoundaries(allItems);

  // Add session count to data quality
  boundaries.dataQuality.totalSessions = catalog.totalSessions;

  return boundaries;
}

/**
 * Create time filter presets based on boundaries
 */
export function createTimeFilterPresets(boundaries: HistoryBoundaries): TimeFilter[] {
  const now = new Date();
  const filters: TimeFilter[] = [];

  // All time
  filters.push({
    mode: 'all',
    startDate: boundaries.startDate,
    endDate: boundaries.endDate,
    label: 'All Time',
  });

  // Current year
  const yearStart = new Date(now.getFullYear(), 0, 1);
  filters.push({
    mode: 'year',
    startDate: yearStart,
    endDate: now,
    label: now.getFullYear().toString(),
  });

  // Current month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  filters.push({
    mode: 'month',
    startDate: monthStart,
    endDate: now,
    label: format(now, 'MMMM yyyy'),
  });

  // Last 7 days
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  filters.push({
    mode: 'week',
    startDate: weekStart,
    endDate: now,
    label: 'Last 7 Days',
  });

  // Last 30 days
  const monthAgo = new Date(now);
  monthAgo.setDate(monthAgo.getDate() - 30);
  filters.push({
    mode: 'month',
    startDate: monthAgo,
    endDate: now,
    label: 'Last 30 Days',
  });

  return filters;
}

/**
 * Filter items by date range
 */
export function filterItemsByDateRange(
  items: NormalizedStreamingItem[],
  startDate: Date,
  endDate: Date
): NormalizedStreamingItem[] {
  const startSeconds = Math.floor(startDate.getTime() / 1000);
  const endSeconds = Math.floor(endDate.getTime() / 1000);

  return items.filter(
    (item) =>
      item.startTimestampSeconds >= startSeconds && item.endTimestampSeconds <= endSeconds
  );
}
