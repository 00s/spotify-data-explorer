import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Music, Radio, ListMusic, Search, Sparkles, Trash2 } from 'lucide-react';
import { useData } from '../context/DataContext';

export const Sidebar = () => {
  const location = useLocation();
  const { clearData } = useData();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/dashboard/listening', icon: Music, label: 'Listening History' },
    { path: '/dashboard/podcasts', icon: Radio, label: 'Podcasts' },
    { path: '/dashboard/playlists', icon: ListMusic, label: 'Playlists & Library' },
    { path: '/dashboard/search', icon: Search, label: 'Search Behavior' },
    { path: '/dashboard/wrapped', icon: Sparkles, label: 'Wrapped Highlights' },
  ];

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      clearData();
      window.location.href = '/';
    }
  };

  return (
    <div className="w-64 bg-black h-screen flex flex-col border-r border-[#282828] flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#1db954] rounded-full flex items-center justify-center">
            <Music className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl text-white">Spotify Data</h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${isActive ? 'bg-[#282828] text-white' : 'text-[#b3b3b3] hover:text-white'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-[#282828]">
        <button
          onClick={handleClearData}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#b3b3b3] hover:text-white hover:bg-[#282828] transition-colors w-full"
        >
          <Trash2 className="w-5 h-5" />
          <span className="text-sm">Clear All Data</span>
        </button>
        <div className="mt-4 text-xs text-[#535353]">
          All data is processed locally. Nothing is sent to any server.
        </div>
      </div>
    </div>
  );
};
