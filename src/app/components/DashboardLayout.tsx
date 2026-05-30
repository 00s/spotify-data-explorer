import { ReactNode } from 'react';
import {
  LayoutDashboard,
  Music,
  Mic2,
  ListMusic,
  Search,
  Sparkles,
  RefreshCw,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { TimeFilterBar } from './TimeFilterBar';

interface DashboardLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClearData: () => void;
}

const sections = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listening', label: 'Listening History', icon: Music },
  { id: 'podcasts', label: 'Podcasts', icon: Mic2 },
  { id: 'sessions', label: 'Sessions', icon: Activity },
  { id: 'playlists', label: 'Playlists & Library', icon: ListMusic },
  { id: 'search', label: 'Search Behavior', icon: Search },
  { id: 'wrapped', label: 'Wrapped Highlights', icon: Sparkles },
];

export function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
  onClearData,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary flex items-center gap-2">
            <Music className="w-6 h-6" />
            Spotify Insights
          </h2>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                  ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={onClearData}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Clear Data
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-sidebar border-b border-sidebar-border">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Music className="w-5 h-5" />
            Spotify Insights
          </h2>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-sidebar-foreground"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="border-t border-sidebar-border p-3 space-y-1 bg-sidebar">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    onSectionChange(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{section.label}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onClearData();
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Clear Data
            </button>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <TimeFilterBar />
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
