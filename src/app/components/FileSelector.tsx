import { useState } from 'react';
import { Check, X, AlertTriangle, FileJson, ChevronDown, ChevronUp } from 'lucide-react';
import { SpotifyFile } from '../types/spotify';

interface FileSelectorProps {
  files: SpotifyFile[];
  onConfirm: (files: SpotifyFile[]) => void;
  onCancel: () => void;
}

export function FileSelector({ files, onConfirm, onCancel }: FileSelectorProps) {
  const [selectedFiles, setSelectedFiles] = useState(files);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleFile = (index: number) => {
    const updated = [...selectedFiles];
    updated[index] = { ...updated[index], included: !updated[index].included };
    setSelectedFiles(updated);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group files by category
  const filesByCategory = selectedFiles.reduce((acc, file) => {
    if (!acc[file.category]) {
      acc[file.category] = [];
    }
    acc[file.category].push(file);
    return acc;
  }, {} as Record<string, SpotifyFile[]>);

  const handleConfirm = () => {
    onConfirm(selectedFiles);
  };

  const includedCount = selectedFiles.filter((f) => f.included).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="mb-2">Review your files</h1>
        <p className="text-muted-foreground">
          Choose which files to include in your dashboard. Sensitive files are unchecked by default.
        </p>
      </div>

      <div className="bg-secondary rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">Files marked as SENSITIVE contain personal information</p>
          <p className="text-muted-foreground">
            You can safely exclude these files and still get meaningful insights from your listening
            history.
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        {Object.entries(filesByCategory).map(([category, categoryFiles]) => {
          const isExpanded = expandedCategories.has(category);
          const isSensitive = categoryFiles.some((f) => f.isSensitive);
          const includedInCategory = categoryFiles.filter((f) => f.included).length;

          return (
            <div key={category} className="bg-card rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileJson className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{category}</span>
                      {isSensitive && (
                        <span className="text-xs px-2 py-0.5 rounded bg-destructive/20 text-destructive-foreground">
                          SENSITIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {includedInCategory} of {categoryFiles.length} files included
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {categoryFiles.map((file, idx) => {
                    const fileIndex = selectedFiles.indexOf(file);
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-4 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                      >
                        <button
                          onClick={() => toggleFile(fileIndex)}
                          className={`
                            flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                            ${
                              file.included
                                ? 'bg-primary border-primary'
                                : 'border-muted-foreground/50'
                            }
                          `}
                        >
                          {file.included && <Check className="w-3 h-3 text-primary-foreground" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-sm truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{file.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-full border border-border hover:bg-secondary transition-colors"
        >
          Cancel
        </button>

        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {includedCount} file{includedCount !== 1 ? 's' : ''} selected
          </p>
          <button
            onClick={handleConfirm}
            disabled={includedCount === 0}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
