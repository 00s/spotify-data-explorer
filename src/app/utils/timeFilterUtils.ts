import { TimeFilterState, TimeFilterPreset, HistoryBoundaries } from '../types/spotify';

// Season definitions (Northern Hemisphere by default)
export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export function getSeason(date: Date): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
}

export function getSeasonDateRange(year: number, season: Season): { start: Date; end: Date } {
  const ranges = {
    spring: { start: new Date(year, 2, 1), end: new Date(year, 4, 31, 23, 59, 59, 999) },
    summer: { start: new Date(year, 5, 1), end: new Date(year, 7, 31, 23, 59, 59, 999) },
    fall: { start: new Date(year, 8, 1), end: new Date(year, 10, 30, 23, 59, 59, 999) },
    winter: { start: new Date(year, 11, 1), end: new Date(year + 1, 1, 28, 23, 59, 59, 999) },
  };
  return ranges[season];
}

export function getSeasonLabel(season: Season, year: number): string {
  const seasonNames = {
    spring: 'Spring',
    summer: 'Summer',
    fall: 'Fall',
    winter: 'Winter',
  };
  // Winter crosses the year boundary (Dec–Feb)
  if (season === 'winter') {
    const shortNext = String(year + 1).slice(-2);
    return `Winter ${year}/${shortNext}`;
  }
  return `${seasonNames[season]} ${year}`;
}

// Date manipulation utilities
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfWeek(date: Date): Date {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfYear(date: Date): Date {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfYear(date: Date): Date {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

// Format date for display
export function formatDateRange(start: Date, end: Date, mode: TimeFilterState['mode']): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const startStr = start.toLocaleDateString('en-US', opts);
  const endStr = end.toLocaleDateString('en-US', opts);

  if (mode === 'day') {
    return start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  if (mode === 'week') {
    return `${startStr} - ${endStr}`;
  }

  if (mode === 'month') {
    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  if (mode === 'year') {
    return start.getFullYear().toString();
  }

  if (mode === 'season') {
    const season = getSeason(start);
    return getSeasonLabel(season, start.getFullYear());
  }

  if (mode === 'all') {
    return 'All Time';
  }

  return `${startStr} - ${endStr}`;
}

// Create time filter state from preset
export function createFilterFromPreset(
  preset: TimeFilterPreset,
  boundaries?: HistoryBoundaries,
  referenceDate: Date = new Date()
): TimeFilterState {
  let startDate: Date;
  let endDate: Date;
  let mode: TimeFilterState['mode'];
  let granularity: TimeFilterState['granularity'];

  const today = startOfDay(referenceDate);
  const now = new Date();

  switch (preset) {
    case 'today':
      startDate = today;
      endDate = endOfDay(today);
      mode = 'day';
      granularity = 'hour';
      break;

    case 'yesterday':
      startDate = startOfDay(addDays(today, -1));
      endDate = endOfDay(addDays(today, -1));
      mode = 'day';
      granularity = 'hour';
      break;

    case 'this-week':
      startDate = startOfWeek(today);
      endDate = endOfWeek(today);
      mode = 'week';
      granularity = 'day';
      break;

    case 'last-week':
      const lastWeek = addWeeks(today, -1);
      startDate = startOfWeek(lastWeek);
      endDate = endOfWeek(lastWeek);
      mode = 'week';
      granularity = 'day';
      break;

    case 'this-month':
      startDate = startOfMonth(today);
      endDate = endOfMonth(today);
      mode = 'month';
      granularity = 'day';
      break;

    case 'last-month':
      const lastMonth = addMonths(today, -1);
      startDate = startOfMonth(lastMonth);
      endDate = endOfMonth(lastMonth);
      mode = 'month';
      granularity = 'day';
      break;

    case 'this-year':
      startDate = startOfYear(today);
      endDate = endOfYear(today);
      mode = 'year';
      granularity = 'month';
      break;

    case 'last-year':
      const lastYear = addYears(today, -1);
      startDate = startOfYear(lastYear);
      endDate = endOfYear(lastYear);
      mode = 'year';
      granularity = 'month';
      break;

    case 'this-season':
      const currentSeason = getSeason(today);
      const currentYear = today.getFullYear();
      const seasonRange = getSeasonDateRange(currentYear, currentSeason);
      startDate = seasonRange.start;
      endDate = seasonRange.end;
      mode = 'season';
      granularity = 'week';
      break;

    case 'last-season':
      const lastSeasonDate = addMonths(today, -3);
      const lastSeasonYear = lastSeasonDate.getFullYear();
      const lastSeasonName = getSeason(lastSeasonDate);
      const lastSeasonRange = getSeasonDateRange(lastSeasonYear, lastSeasonName);
      startDate = lastSeasonRange.start;
      endDate = lastSeasonRange.end;
      mode = 'season';
      granularity = 'week';
      break;

    case 'all-time':
      if (boundaries) {
        startDate = boundaries.startDate;
        endDate = boundaries.endDate;
      } else {
        startDate = new Date(2015, 0, 1);
        endDate = now;
      }
      mode = 'all';
      granularity = 'month';
      break;

    case 'custom':
    default:
      if (boundaries) {
        startDate = boundaries.startDate;
        endDate = boundaries.endDate;
      } else {
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
      }
      mode = 'custom';
      granularity = 'day';
      break;
  }

  const label = formatDateRange(startDate, endDate, mode);

  // Determine if we can navigate forward/backward
  const canNavigateForward = boundaries ? endDate < boundaries.endDate : endDate < now;
  const canNavigateBack = boundaries ? startDate > boundaries.startDate : true;

  return {
    preset,
    mode,
    startDate,
    endDate,
    label,
    granularity,
    canNavigateBack,
    canNavigateForward,
  };
}

// Navigate to next/previous period
export function navigateFilter(filter: TimeFilterState, direction: 'next' | 'prev'): TimeFilterState {
  const offset = direction === 'next' ? 1 : -1;
  let newDate: Date;

  switch (filter.mode) {
    case 'day':
      newDate = addDays(filter.startDate, offset);
      return createFilterFromPreset(direction === 'next' ? 'today' : 'yesterday', undefined, newDate);

    case 'week':
      newDate = addWeeks(filter.startDate, offset);
      return {
        ...filter,
        startDate: startOfWeek(newDate),
        endDate: endOfWeek(newDate),
        label: formatDateRange(startOfWeek(newDate), endOfWeek(newDate), 'week'),
        preset: 'custom',
      };

    case 'month':
      newDate = addMonths(filter.startDate, offset);
      return {
        ...filter,
        startDate: startOfMonth(newDate),
        endDate: endOfMonth(newDate),
        label: formatDateRange(startOfMonth(newDate), endOfMonth(newDate), 'month'),
        preset: 'custom',
      };

    case 'year':
      newDate = addYears(filter.startDate, offset);
      return {
        ...filter,
        startDate: startOfYear(newDate),
        endDate: endOfYear(newDate),
        label: formatDateRange(startOfYear(newDate), endOfYear(newDate), 'year'),
        preset: 'custom',
      };

    case 'season':
      newDate = addMonths(filter.startDate, offset * 3);
      const season = getSeason(newDate);
      const year = newDate.getFullYear();
      const range = getSeasonDateRange(year, season);
      return {
        ...filter,
        startDate: range.start,
        endDate: range.end,
        label: getSeasonLabel(season, year),
        preset: 'custom',
      };

    default:
      return filter;
  }
}

// Check if a date is within the filter range
export function isDateInRange(date: Date, filter: TimeFilterState): boolean {
  const timestamp = date.getTime();
  return timestamp >= filter.startDate.getTime() && timestamp <= filter.endDate.getTime();
}

// Get preset button configuration
export interface PresetButton {
  preset: TimeFilterPreset;
  label: string;
  group: 'relative' | 'fixed' | 'scope';
}

export type DisplayMode = 'all' | 'year' | 'season' | 'month' | 'week';

// Relative size of each mode (larger = broader span)
export const MODE_SIZE: Record<DisplayMode, number> = {
  all: 5,
  year: 4,
  season: 3,
  month: 2,
  week: 1,
};

// Build a compact week label like "Jan 13 – 19" or "Dec 30 – Jan 5"
function formatWeekLabel(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (sameMonth) {
    return `${startStr} – ${end.getDate()}`;
  }
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${startStr} – ${endStr}`;
}

// Create a TimeFilterState for a given display mode anchored at a reference date
export function createFilterForMode(
  mode: DisplayMode,
  referenceDate: Date,
  boundaries?: HistoryBoundaries
): TimeFilterState {
  let startDate: Date;
  let endDate: Date;
  let label: string;
  let granularity: TimeFilterState['granularity'];

  switch (mode) {
    case 'all': {
      startDate = boundaries?.startDate ?? new Date(2015, 0, 1);
      endDate = boundaries?.endDate ?? new Date();
      const since = startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      label = `Since ${since}`;
      granularity = 'month';
      break;
    }
    case 'year': {
      startDate = startOfYear(referenceDate);
      endDate = endOfYear(referenceDate);
      label = String(referenceDate.getFullYear());
      granularity = 'month';
      break;
    }
    case 'season': {
      const s = getSeason(referenceDate);
      const y = referenceDate.getFullYear();
      const range = getSeasonDateRange(y, s);
      startDate = range.start;
      endDate = range.end;
      label = getSeasonLabel(s, y);
      granularity = 'week';
      break;
    }
    case 'month': {
      startDate = startOfMonth(referenceDate);
      endDate = endOfMonth(referenceDate);
      label = referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      granularity = 'day';
      break;
    }
    case 'week': {
      startDate = startOfWeek(referenceDate);
      endDate = endOfWeek(referenceDate);
      label = formatWeekLabel(startDate, endDate);
      granularity = 'day';
      break;
    }
  }

  const now = new Date();
  const canNavigateForward = mode !== 'all' && (boundaries ? endDate < boundaries.endDate : endDate < now);
  const canNavigateBack = mode !== 'all' && (boundaries ? startDate > boundaries.startDate : true);

  return {
    preset: mode === 'all' ? 'all-time' : 'custom',
    mode: mode === 'all' ? 'all' : mode,
    startDate,
    endDate,
    label,
    granularity,
    canNavigateBack,
    canNavigateForward,
  };
}

// Navigate forward/backward within a display mode
export function navigateDisplayMode(
  filter: TimeFilterState,
  direction: 'next' | 'prev',
  boundaries?: HistoryBoundaries
): TimeFilterState {
  const offset = direction === 'next' ? 1 : -1;
  let refDate: Date;

  switch (filter.mode) {
    case 'week':
      refDate = addWeeks(filter.startDate, offset);
      break;
    case 'month':
      refDate = addMonths(filter.startDate, offset);
      break;
    case 'season':
      refDate = addMonths(filter.startDate, offset * 3);
      break;
    case 'year':
      refDate = addYears(filter.startDate, offset);
      break;
    default:
      return filter;
  }

  return createFilterForMode(filter.mode as DisplayMode, refDate, boundaries);
}

export const PRESET_BUTTONS: PresetButton[] = [
  { preset: 'today', label: 'Today', group: 'relative' },
  { preset: 'yesterday', label: 'Yesterday', group: 'relative' },
  { preset: 'this-week', label: 'This Week', group: 'relative' },
  { preset: 'last-week', label: 'Last Week', group: 'relative' },
  { preset: 'this-month', label: 'This Month', group: 'relative' },
  { preset: 'last-month', label: 'Last Month', group: 'relative' },
  { preset: 'this-season', label: 'This Season', group: 'relative' },
  { preset: 'this-year', label: 'This Year', group: 'fixed' },
  { preset: 'last-year', label: 'Last Year', group: 'fixed' },
  { preset: 'all-time', label: 'All Time', group: 'scope' },
  { preset: 'custom', label: 'Custom Range', group: 'scope' },
];
