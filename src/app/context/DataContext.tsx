import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { UploadedFile, ProcessedData, AggregatedStats } from '../types/spotify';
import { parseSpotifyData } from '../utils/dataParser';
import { aggregateData } from '../utils/dataAggregator';

interface DataContextType {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
  processedData: ProcessedData | null;
  aggregatedStats: AggregatedStats | null;
  processFiles: (files: UploadedFile[]) => void;
  clearData: () => void;
  isProcessing: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStats | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const processFiles = (files: UploadedFile[]) => {
    setIsProcessing(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const data = parseSpotifyData(files);
        const stats = aggregateData(data);
        
        setProcessedData(data);
        setAggregatedStats(stats);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };
  
  const clearData = () => {
    setUploadedFiles([]);
    setProcessedData(null);
    setAggregatedStats(null);
  };
  
  return (
    <DataContext.Provider
      value={{
        uploadedFiles,
        setUploadedFiles,
        processedData,
        aggregatedStats,
        processFiles,
        clearData,
        isProcessing,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
