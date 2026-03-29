import { Shield, Lock, HardDrive, RefreshCw } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="mb-4">Your Privacy is Protected</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This dashboard is completely private and runs entirely in your browser. Your data never
          leaves your device.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-card rounded-lg p-6 border border-border">
          <HardDrive className="w-8 h-8 text-primary mb-3" />
          <h3 className="mb-2">Local Processing</h3>
          <p className="text-sm text-muted-foreground">
            All data processing happens locally in your browser. Nothing is uploaded to any server.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <Lock className="w-8 h-8 text-primary mb-3" />
          <h3 className="mb-2">Full Control</h3>
          <p className="text-sm text-muted-foreground">
            Choose which files to include. Exclude sensitive data like payments or messages if
            preferred.
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <RefreshCw className="w-8 h-8 text-primary mb-3" />
          <h3 className="mb-2">No Persistence</h3>
          <p className="text-sm text-muted-foreground">
            Data is only stored in memory. Refreshing or closing the page removes everything.
          </p>
        </div>
      </div>

      <div className="bg-secondary rounded-lg p-6 border border-border">
        <h3 className="mb-3">How to get your Spotify data</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>
              Go to{' '}
              <a
                href="https://www.spotify.com/account/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Spotify Privacy Settings
              </a>
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Scroll down and request your "Account data" or "Extended streaming history"</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>Wait for Spotify to email you (usually takes a few days)</span>
          </li>
          <li className="flex gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span>Download the ZIP file and upload it here</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
