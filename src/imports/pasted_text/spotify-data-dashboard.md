You are an experienced front-end engineer and data-visualization designer.

I want you to build a **100% client-side** web app that turns a user’s downloaded Spotify data into an interactive dashboard, using only the JSON files from Spotify’s “Download your data” export.

This prompt is being run inside Figma / Figma’s code environment; use whatever stack and tooling Figma provides for building interactive, code-backed prototypes, but keep all data processing in the client (no external servers or APIs).

### Goal

Create a simple, privacy-preserving web app where a user can:

- Read a clear privacy notice before uploading anything.
- Optionally **deselect or remove files that contain sensitive personal data** before parsing.
- Upload their Spotify data ZIP (or the unzipped folder of JSON files).
- Have the app parse and combine the JSON files (e.g. Follow.json, Marquee.json, MessageData.json, Payments.json, Playlist1.json, PodcastInteractivityRatedShow.json, PodcastInteractivityReactions.json, SearchQueries.json, StreamingHistory_music_0.json, StreamingHistory_music_1.json, StreamingHistory_podcast_0.json, Wrapped2025.json, YourLibrary.json, YourSoundCapsule.json, and similar files).
- Explore their data in a clear, Spotify‑styled dashboard that reveals detail progressively instead of overwhelming them upfront.

### Privacy‑first behavior

Design the experience to be **explicitly privacy‑first**:

- Before any upload or file selection:
  - Show a prominent privacy message explaining:
    - That all processing happens locally in the browser.
    - That **no data is ever uploaded to any server**.
    - That the user can choose to exclude sensitive files (e.g. Payments.json, MessageData.json, possibly Follow.json and other identity-related files) and still use the app.
- After the user selects a ZIP or multiple JSON files:
  - Show a file list with detected categories (e.g. “Streaming history”, “Playlists”, “Payments”, “Messages”).
  - Allow the user to **uncheck or delete files** they don’t want to include before parsing.
  - Clearly label which files are more sensitive (e.g. payments, contact details) and what they are used for in the dashboard.
- Provide a clear way to:
  - “Wipe session data” or “Start over”, which clears all in-memory data and UI state.
  - Indicate that closing or refreshing the page removes the data (since nothing is stored remotely).

Make sure privacy messaging is visible but calm and matter‑of‑fact, not alarmist.

### Constraints and architecture

- Everything must run **client-side**, inside the browser / Figma prototype. No backend, no network calls for processing.
- Assume the JSON structure follows Spotify’s official “Understanding your data” documentation (StreamingHistory, YourLibrary, SearchQueries, Payments, Follow, Wrapped, Podcast Interactivity, etc.).
- Handle large, heavy files gracefully (many years of listening history):
  - Use efficient parsing (chunked or streaming approaches where possible).
  - Aggregate data down to daily or monthly granularity before drawing charts.
  - Avoid rendering massive tables at once; use pagination, virtualization, or summary-first views.

### Spotify‑style visuals

Follow Spotify’s visual language as closely as possible, without copying proprietary assets:

- Dark theme as the default.
- Use a Spotify‑like green for primary actions and key highlights.
- Use a clean, circular‑style sans‑serif font (or the closest web-safe / available font).
- Maintain consistent spacing, rounded corners, and subtle shadows where appropriate.
- Avoid flashy gradients or gimmicky effects; keep it simple and long‑lasting.

### Progressive disclosure

Use **progressive disclosure** throughout so users start with simple summaries and can drill down only when they want:

- Global structure:
  - A main navigation (sidebar or top nav) with a small set of primary sections.
  - Within each section, show a high‑level summary first (a few key numbers or charts).
  - Provide “Show details”, “View more”, or drill‑down interactions to reveal tables, advanced filters, and raw data.

- Examples:
  - In “Overview”, show total listening time, top artists, top tracks, and one simple time chart. Clicking a card jumps to deeper sections like “Listening history” or “Artists”.
  - For playlists, show a compact list with core metrics; clicking a playlist opens a detailed view with full track lists and stats.
  - For search, start with aggregated stats (most common queries, most searched artists), then allow expansion into raw search logs.

### Sections / dashboard layout

Design the UI as a set of sections navigable via a left sidebar or top navigation:

1. Overview
   - Total listening time (all time, and latest year).
   - Top artists, tracks, genres, and podcasts.
   - A simple line or area chart of listening over time (e.g. by month).
   - Cards that link to deeper sections.

2. Listening history (music)
   - Charts of listening time by day/week/month, with simple range selection or zoom.
   - Top artists and tracks for the selected time range.
   - Filters for year, device/platform, country (from Extended Streaming History).
   - Start with one compact chart and top lists; put advanced filters behind a collapsible “Advanced filters” panel.

3. Podcasts
   - Total podcast listening time.
   - Top shows and episodes.
   - Interactivity (comments, reactions) from PodcastInteractivity* JSON files.
   - Summaries first; detailed logs available via expansion.

4. Playlists & Library
   - Summary list of playlists:
     - Name, creation / last modified date.
     - Number of tracks, approximate total duration, follower count if available.
   - Library summary: number of saved albums, artists, episodes, and shows.
   - Clicking a playlist opens a detailed view with full track lists and basic metrics (e.g. oldest track, average track length).

5. Search behavior
   - Aggregated stats:
     - Most frequent search queries.
     - Most searched artists.
     - Search volume over time.
   - Optional expanded view with raw SearchQueries data (query, timestamp, device), with filters for time and device.

6. Wrapped‑style highlights
   - Using Wrapped JSON and streaming history, recreate simple Wrapped‑style stats:
     - Top artists, tracks, genres for a chosen year.
     - Total minutes listened.
     - “Day with the most listening”.
   - Keep the visuals consistent with the rest of the dashboard (no need to copy the exact Spotify stories).

### File handling and performance

- Support:
  - Uploading a .zip file and unzipping it in the browser.
  - Uploading multiple JSON files via drag & drop or file picker.
- After selection, show:
  - Detected file names.
  - Their inferred role (e.g. “Streaming history (music)”, “Payments”, “Library”).
  - Checkboxes to include/exclude each file before parsing.
- For heavy data:
  - Aggregate or downsample when plotting (by day/month instead of per‑play points).
  - Use cached/computed aggregates for repeated interactions.
  - Use pagination or virtualized lists for large tables.

### Implementation details

- Keep the code modular and well commented:
  - One layer for data loading and parsing.
  - One layer for aggregations and derived metrics.
  - One layer for UI components and navigation.
- Time handling:
  - Use UTC timestamps from Spotify, convert to the user’s local timezone for display.
  - Label ranges clearly and use unambiguous date formats.
- Privacy:
  - Never send data over the network.
  - Do not use any analytics or tracking that could capture user data.
  - Provide a clear “Clear data” action that wipes all in-memory state.

### Deliverables

Provide:

1. The complete, runnable code suitable for the Figma / browser environment, including:
   - UI components.
   - File upload and selection UI (with privacy messaging and file exclusion controls).
   - JSON parsing and data aggregation.
   - Charts and navigation.
2. A short README that explains:
   - How to run this prototype.
   - How a user should export their Spotify data and upload it.
   - Which JSON files are supported and which features may be limited when specific files are excluded for privacy.