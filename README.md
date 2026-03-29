# Spotify Data Dashboard

A privacy-first, client-side web application that transforms your Spotify data export into an interactive dashboard.

## Features

- **100% Privacy-Preserving**: All data processing happens locally in your browser. Nothing is uploaded to any server.
- **Comprehensive Insights**: Explore your listening history, top artists, tracks, podcasts, playlists, search behavior, and Wrapped-style highlights.
- **Granular Privacy Controls**: Choose exactly which files to include, with sensitive files (payments, messages, identifiers, userdata) excluded by default.
- **Progressive Disclosure**: Start with high-level summaries and drill down into details as needed.
- **Spotify-Inspired Design**: Dark theme with Spotify's signature green accent and clean, modern interface.

## How to Get Your Spotify Data

1. Visit [Spotify Privacy Settings](https://www.spotify.com/account/privacy/)
2. Scroll down to "Download your data"
3. Request either:
   - **Account data** (basic, faster to receive)
   - **Extended streaming history** (more detailed, takes longer)
4. Wait for Spotify to email you (usually 5-30 days)
5. Download the ZIP file from the email

## Supported Data Files

### Non-Sensitive Files (Included by Default)
- **StreamingHistory*.json** - Your listening history with timestamps, tracks, and artists
- **Playlist*.json** - Your playlists with track lists
- **YourLibrary.json** - Saved tracks, albums, artists, and shows
- **SearchQueries.json** - Your search history
- **Follow.json** - Follower information
- **Wrapped*.json** - Annual Wrapped statistics
- **PodcastInteractivity*.json** - Podcast ratings and reactions
- **Inferences.json** - Spotify-generated insights

### Sensitive Files (Excluded by Default)
- **Identifiers.json** - Personal identifiers and account information
- **Userdata.json** - Personal profile data
- **Payments.json** - Payment and subscription history
- **MessageData.json** - Chat and message data

You can exclude any file before parsing, and the dashboard will work with whatever data you choose to include.

## Dashboard Sections

### 1. Overview
High-level summary with total listening time, top artists/tracks, and listening trends over time.

### 2. Listening History
Detailed charts showing your music listening patterns by day or month, with top artists and tracks for the selected time range.

### 3. Podcasts
Podcast listening statistics, top shows, and interactivity data (ratings, reactions).

### 4. Playlists & Library
Browse your playlists with detailed track listings and view your library summary (saved tracks, albums, artists, shows).

### 5. Search Behavior
Analyze your search patterns with top queries, search volume charts, and raw search history.

### 6. Wrapped Highlights
Year-in-review statistics including top artists, tracks, listening minutes, and your biggest listening day.

## Data Formats Supported

The dashboard supports both:
- **Basic streaming history** format (`endTime`, `artistName`, `trackName`, `msPlayed`)
- **Extended streaming history** format (`ts`, `master_metadata_track_name`, `ms_played`, etc.)

## Privacy & Security

- ✅ All processing happens in-browser using JavaScript
- ✅ No data is sent to any server
- ✅ No tracking or analytics
- ✅ Data exists only in memory while the page is open
- ✅ Refreshing or closing the page removes all data
- ✅ Clear data button available at any time

## Technical Details

Built with:
- React + TypeScript
- Recharts for data visualization
- JSZip for client-side ZIP parsing
- date-fns for date handling
- Tailwind CSS for styling
- Lucide React for icons

## Limitations

- **No persistence**: Data is not saved between sessions (by design for privacy)
- **No export**: Currently no feature to export processed insights (can be added if needed)
- **Browser memory**: Very large datasets may slow down older devices
- **Limited filtering**: Advanced filters (by device, platform, country) shown as placeholders and work when extended streaming history is available

## Tips for Best Results

1. Use **Extended Streaming History** for more detailed insights
2. Include all **non-sensitive** files for the most complete picture
3. For better performance with years of data, the app aggregates by day/month
4. The dashboard works fine even if you exclude sensitive files

## Starting Fresh

Click the "Clear Data" button in the sidebar to wipe all data and start over. This returns you to the privacy notice screen.

---

**Note**: This application is not affiliated with Spotify. It's a third-party tool for visualizing your own exported data.
