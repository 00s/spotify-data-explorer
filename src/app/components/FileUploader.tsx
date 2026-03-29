import React, { useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle, X } from 'lucide-react';
import { processZipFile, processJsonFiles } from '../utils/fileParser';
import { SpotifyFile } from '../context/DataContext';

interface FileUploaderProps {
  onFilesProcessed: (files: SpotifyFile[]) => void;
}

export const FileUploader = ({ onFilesProcessed }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);

    const files = e.dataTransfer.files;
    await processFiles(files);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files) {
      await processFiles(files);
    }
  };

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    try {
      let spotifyFiles: SpotifyFile[] = [];

      // Check if it's a ZIP file
      const zipFile = Array.from(files).find((f) => f.name.endsWith('.zip'));
      if (zipFile) {
        spotifyFiles = await processZipFile(zipFile);
      } else {
        spotifyFiles = await processJsonFiles(files);
      }

      if (spotifyFiles.length === 0) {
        setError('No valid Spotify JSON files found. Please upload your Spotify data export.');
      } else {
        onFilesProcessed(spotifyFiles);
      }
    } catch (err) {
      setError('Error processing files. Please ensure you uploaded valid Spotify data files.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${isDragging ? 'border-[#1db954] bg-[#1db954]/5' : 'border-[#535353] hover:border-[#b3b3b3]'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          accept=".zip,.json"
          multiple
          disabled={isProcessing}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[#282828] rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-[#1db954]" />
            </div>
            
            <div>
              <div className="text-lg text-white mb-2">
                {isProcessing ? 'Processing files...' : 'Upload Your Spotify Data'}
              </div>
              <div className="text-sm text-[#b3b3b3]">
                Drag and drop your Spotify data ZIP file or JSON files here, or click to browse
              </div>
            </div>

            <div className="text-xs text-[#b3b3b3] mt-2">
              Supported: .zip, .json files
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 bg-[#e22134]/10 border border-[#e22134] rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#e22134] flex-shrink-0 mt-0.5" />
          <div className="text-sm text-[#e22134]">{error}</div>
        </div>
      )}

      <div className="mt-6 bg-[#1a1a1a] border border-[#282828] rounded-lg p-4">
        <div className="text-sm text-white mb-2">How to get your Spotify data:</div>
        <ol className="text-xs text-[#b3b3b3] space-y-1 list-decimal list-inside">
          <li>Go to your Spotify account privacy settings</li>
          <li>Request "Download your data" (Account data or Extended streaming history)</li>
          <li>Wait for Spotify to email you the download link (usually within a few days)</li>
          <li>Download and upload the ZIP file or extract and upload the JSON files here</li>
        </ol>
      </div>
    </div>
  );
};
