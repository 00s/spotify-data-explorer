import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTimeFilter } from '../context/TimeFilterContext';
import type { DisplayMode } from '../utils/timeFilterUtils';

const MODES: { key: DisplayMode; label: string }[] = [
  { key: 'all', label: 'All Time' },
  { key: 'year', label: 'Year' },
  { key: 'season', label: 'Season' },
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
];

export function TimeFilterBar() {
  const { filter, setMode, navigateNext, navigatePrev } = useTimeFilter();

  const currentMode = (filter.mode === 'all' ? 'all' : filter.mode) as DisplayMode;
  const isAllTime = currentMode === 'all';

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col items-center gap-3">
        {/* Segmented pill control */}
        <div
          className="flex gap-1.5 p-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          {MODES.map(({ key, label }) => {
            const isSelected = currentMode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className="relative px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DB954]"
                style={
                  isSelected
                    ? {
                        background: '#1DB954',
                        color: '#000',
                        boxShadow: '0 0 0 1px #1DB954',
                      }
                    : {
                        background: 'transparent',
                        color: '#b3b3b3',
                      }
                }
                onMouseEnter={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) (e.currentTarget as HTMLButtonElement).style.color = '#b3b3b3';
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Navigation row */}
        <div className="flex items-center gap-3">
          <button
            onClick={navigatePrev}
            disabled={isAllTime || !filter.canNavigateBack}
            className="p-1 rounded-full transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ color: isAllTime ? '#555' : '#b3b3b3' }}
            onMouseEnter={(e) => {
              if (!isAllTime && filter.canNavigateBack)
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                isAllTime ? '#555' : '#b3b3b3';
            }}
            aria-label="Previous period"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span
            className="text-sm font-semibold min-w-[200px] text-center tracking-wide"
            style={{ color: '#e0e0e0' }}
          >
            {filter.label}
          </span>

          <button
            onClick={navigateNext}
            disabled={isAllTime || !filter.canNavigateForward}
            className="p-1 rounded-full transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ color: isAllTime ? '#555' : '#b3b3b3' }}
            onMouseEnter={(e) => {
              if (!isAllTime && filter.canNavigateForward)
                (e.currentTarget as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color =
                isAllTime ? '#555' : '#b3b3b3';
            }}
            aria-label="Next period"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
