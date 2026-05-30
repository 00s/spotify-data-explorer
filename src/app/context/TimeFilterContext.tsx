import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import {
  TimeFilterState,
  TimeFilterPreset,
  HistoryBoundaries,
  ParsedData,
  AggregatedStats,
} from '../types/spotify';
import {
  createFilterFromPreset,
  createFilterForMode,
  navigateDisplayMode,
  DisplayMode,
  MODE_SIZE,
} from '../utils/timeFilterUtils';

interface TimeFilterContextValue {
  filter: TimeFilterState;
  setMode: (mode: DisplayMode) => void;
  setPreset: (preset: TimeFilterPreset) => void;
  setCustomRange: (startDate: Date, endDate: Date) => void;
  navigateNext: () => void;
  navigatePrev: () => void;
  resetFilter: () => void;
  boundaries: HistoryBoundaries | null;
}

const TimeFilterContext = createContext<TimeFilterContextValue | undefined>(undefined);

interface TimeFilterProviderProps {
  children: ReactNode;
  data: ParsedData | null;
  stats: AggregatedStats | null;
}

export function TimeFilterProvider({ children, data, stats }: TimeFilterProviderProps) {
  const boundaries = stats?.historyBoundaries ?? null;

  // Initialize with "all-time" preset
  const [filter, setFilter] = useState<TimeFilterState>(() =>
    createFilterFromPreset('all-time', boundaries ?? undefined)
  );

  // Update filter when boundaries change (data loaded)
  useMemo(() => {
    if (boundaries && filter.preset === 'all-time') {
      setFilter(createFilterFromPreset('all-time', boundaries));
    }
  }, [boundaries]);

  const setMode = useCallback(
    (newMode: DisplayMode) => {
      const currentModeSize = MODE_SIZE[(filter.mode === 'all' ? 'all' : filter.mode) as DisplayMode] ?? 5;
      const newModeSize = MODE_SIZE[newMode];

      let refDate: Date;
      if (newMode === 'all') {
        refDate = boundaries?.endDate ?? new Date();
      } else if (newModeSize < currentModeSize && filter.mode !== 'all' && boundaries) {
        // Going to finer granularity: anchor to the last sub-period within the current view
        refDate = new Date(Math.min(filter.endDate.getTime(), boundaries.endDate.getTime()));
      } else {
        // Going to coarser or same: jump to latest period with data
        refDate = boundaries?.endDate ?? new Date();
      }

      setFilter(createFilterForMode(newMode, refDate, boundaries ?? undefined));
    },
    [filter, boundaries]
  );

  const setPreset = useCallback(
    (preset: TimeFilterPreset) => {
      setFilter(createFilterFromPreset(preset, boundaries ?? undefined));
    },
    [boundaries]
  );

  const setCustomRange = useCallback(
    (startDate: Date, endDate: Date) => {
      setFilter({
        preset: 'custom',
        mode: 'custom',
        startDate,
        endDate,
        label: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        granularity: 'day',
        canNavigateBack: boundaries ? startDate > boundaries.startDate : true,
        canNavigateForward: boundaries ? endDate < boundaries.endDate : true,
      });
    },
    [boundaries]
  );

  const navigateNext = useCallback(() => {
    if (filter.canNavigateForward && filter.mode !== 'all') {
      setFilter(navigateDisplayMode(filter, 'next', boundaries ?? undefined));
    }
  }, [filter, boundaries]);

  const navigatePrev = useCallback(() => {
    if (filter.canNavigateBack && filter.mode !== 'all') {
      setFilter(navigateDisplayMode(filter, 'prev', boundaries ?? undefined));
    }
  }, [filter, boundaries]);

  const resetFilter = useCallback(() => {
    setFilter(createFilterFromPreset('all-time', boundaries ?? undefined));
  }, [boundaries]);

  const value = useMemo(
    () => ({
      filter,
      setMode,
      setPreset,
      setCustomRange,
      navigateNext,
      navigatePrev,
      resetFilter,
      boundaries,
    }),
    [filter, setMode, setPreset, setCustomRange, navigateNext, navigatePrev, resetFilter, boundaries]
  );

  return <TimeFilterContext.Provider value={value}>{children}</TimeFilterContext.Provider>;
}

export function useTimeFilter() {
  const context = useContext(TimeFilterContext);
  if (context === undefined) {
    throw new Error('useTimeFilter must be used within a TimeFilterProvider');
  }
  return context;
}
