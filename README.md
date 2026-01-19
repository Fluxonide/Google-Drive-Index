# Google Drive Index - Modern React UI

A beautiful, modern React-based frontend for Google Drive Index, inspired by onedrive-vercel-index.

## Features

- ✨ Glass-morphism navbar with search
- 📁 List and grid view layouts
- 🔍 Real-time search with debounce
- 📱 Fully responsive design
- 🌙 Dark mode support
- 🖼️ File previews (video, audio, image, PDF)
- ⌨️ Keyboard shortcuts (⌘K for search)

## Quick Deploy - Bundle into Worker

### Step 1: Update Your worker.js

Add this React HTML template to your existing `worker.js`:

```javascript
// CDN Base URL for React frontend assets
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/Fluxonide/Google-Drive-Index@main/public/build';

// Modern React UI HTML template
const react_html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="${uiConfig.favicon || '/favicon.ico'}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${authConfig.siteName || 'Google Drive Index'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${CDN_BASE}/index-C91SuP-D.css" />
  </head>
  <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div id="root"></div>
    <script type="module" src="${CDN_BASE}/index-B_u2MQcR.js"></script>
  </body>
</html>`;
```

### Step 2: Replace Homepage Response

Find the line in your `worker.js` where the homepage is returned (usually `return new Response(homepage, ...)`) and replace it with:

```javascript
return new Response(react_html, {
  headers: { 'Content-Type': 'text/html; charset=utf-8' }
});
```

### Step 3: Deploy to Cloudflare Workers

Deploy your modified `worker.js` to Cloudflare Workers as usual.

## API Endpoints (Already Working)

The React frontend uses these endpoints that your worker.js already provides:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/{drive}:/path/` | POST | List folder contents |
| `/{drive}:search` | POST | Search files |
| `/{drive}:/path/file.ext` | GET | Download file |
| `/{drive}:/path/file.ext?a=view` | GET | View file |

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## CDN URLs

After pushing to GitHub, assets are available at:

- **JS**: `https://cdn.jsdelivr.net/gh/Fluxonide/Google-Drive-Index@main/public/build/index.js`
- **CSS**: `https://cdn.jsdelivr.net/gh/Fluxonide/Google-Drive-Index@main/public/build/index.css`

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS 3
- React Router 6
- FontAwesome 6
- Headless UI

## License

MIT
