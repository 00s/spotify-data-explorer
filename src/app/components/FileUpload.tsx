import { useState, useRef } from 'react';
import { Upload, FileJson, Loader2 } from 'lucide-react';
import { parseZipFile, parseJSONFiles } from '../utils/fileParser';
import { SpotifyFile } from '../types/spotify';

interface FileUploadProps {
  onFilesLoaded: (files: SpotifyFile[]) => void;
}

export function FileUpload({ onFilesLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: FileList) => {
    setIsLoading(true);
    try {
      let spotifyFiles: SpotifyFile[] = [];

      // Check if there's a ZIP file
      const zipFile = Array.from(files).find((f) => f.name.endsWith('.zip'));
      
      if (zipFile) {
        spotifyFiles = await parseZipFile(zipFile);
      } else {
        spotifyFiles = await parseJSONFiles(files);
      }

      onFilesLoaded(spotifyFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files. Please make sure you uploaded valid Spotify data files.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border'}
          ${isLoading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="mb-2">Processing files...</h2>
            <p className="text-sm text-muted-foreground">This may take a moment</p>
          </>
        ) : (
          <>
            <Upload className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="mb-2">Upload your Spotify data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop your ZIP file or JSON files here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileJson className="w-4 h-4" />
                <span>.zip files</span>
              </div>
              <div className="flex items-center gap-1">
                <FileJson className="w-4 h-4" />
                <span>.json files</span>
              </div>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".json,.zip"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-4">
        Remember: All files are processed locally in your browser
      </p>
    </div>
  );
}
