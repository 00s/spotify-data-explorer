import { useState } from 'react';
import { PrivacyNotice } from './components/PrivacyNotice';
import { FileUpload } from './components/FileUpload';
import { FileSelector } from './components/FileSelector';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/sections/Overview';
import { ListeningHistory } from './components/sections/ListeningHistory';
import { Podcasts } from './components/sections/Podcasts';
import { Sessions } from './components/sections/Sessions';
import { Playlists } from './components/sections/Playlists';
import { SearchBehavior } from './components/sections/SearchBehavior';
import { Wrapped } from './components/sections/Wrapped';
import { SpotifyFile, ParsedData, AggregatedStats } from './types/spotify';
import { combineSpotifyFiles } from './utils/fileParser';
import { aggregateData } from './utils/dataAggregator';

type AppState = 'privacy' | 'upload' | 'select' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('privacy');
  const [files, setFiles] = useState<SpotifyFile[]>([]);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [stats, setStats] = useState<AggregatedStats | null>(null);
  const [activeSection, setActiveSection] = useState('overview');

  const handleFilesLoaded = (loadedFiles: SpotifyFile[]) => {
    setFiles(loadedFiles);
    setAppState('select');
  };

  const handleFilesConfirmed = (confirmedFiles: SpotifyFile[]) => {
    const data = combineSpotifyFiles(confirmedFiles);
    const aggregated = aggregateData(data);
    setParsedData(data);
    setStats(aggregated);
    setAppState('dashboard');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data and start over?')) {
      setFiles([]);
      setParsedData(null);
      setStats(null);
      setAppState('privacy');
      setActiveSection('overview');
    }
  };

  const handleCancelFileSelection = () => {
    setFiles([]);
    setAppState('upload');
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {appState === 'privacy' && (
        <div>
          <PrivacyNotice />
          <div className="text-center pb-12">
            <button
              onClick={() => setAppState('upload')}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {appState === 'upload' && <FileUpload onFilesLoaded={handleFilesLoaded} />}

      {appState === 'select' && (
        <FileSelector
          files={files}
          onConfirm={handleFilesConfirmed}
          onCancel={handleCancelFileSelection}
        />
      )}

      {appState === 'dashboard' && parsedData && stats && (
        <DashboardLayout
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onClearData={handleClearData}
        >
          {activeSection === 'overview' && (
            <Overview data={parsedData} stats={stats} onNavigate={setActiveSection} />
          )}
          {activeSection === 'listening' && (
            <ListeningHistory data={parsedData} stats={stats} />
          )}
          {activeSection === 'podcasts' && <Podcasts data={parsedData} stats={stats} />}
          {activeSection === 'sessions' && <Sessions stats={stats} />}
          {activeSection === 'playlists' && <Playlists data={parsedData} />}
          {activeSection === 'search' && <SearchBehavior data={parsedData} />}
          {activeSection === 'wrapped' && <Wrapped data={parsedData} stats={stats} />}
        </DashboardLayout>
      )}
    </div>
  );
}
