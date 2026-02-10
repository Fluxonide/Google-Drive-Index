// Modern React UI Template for Google Drive Index Worker
// This file contains the HTML template that loads the React frontend from CDN

// CDN Base URL for built assets (using raw GitHub URL for immediate availability)
const CDN_BASE = 'https://raw.githubusercontent.com/Fluxonide/Google-Drive-Index/main/public/build';

// React HTML template that replaces the old Bootstrap UI
const react_html = (siteName, favicon, driveNames = ['My Drive'], currentDriveOrder = 0) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="${favicon || '/favicon.ico'}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${siteName || 'Google Drive Index'}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="${CDN_BASE}/index-C91SuP-D.css" />
  </head>
  <body class="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
    <div id="root"></div>
    <script>
      // Injected by worker — used by the React frontend for multi-drive support
      window.drive_names = ${JSON.stringify(driveNames)};
      window.current_drive_order = ${currentDriveOrder};
      window.SITE_NAME = "${siteName || 'Google Drive Index'}";
      window.UI = {};
      window.DRIVE_CONFIG = {
        siteName: "${siteName || 'Google Drive Index'}",
        driveNames: window.drive_names,
        currentDrive: window.current_drive_order
      };
    </script>
    <script type="module" src="${CDN_BASE}/index-B_u2MQcR.js"></script>
  </body>
</html>`;

// Export for use in worker.js
// Replace the `homepage` template in worker.js with this:
// 
// 1. Add this import at the top of worker.js:
//    const { react_html, CDN_BASE } = await import('./react-ui.js');
//
// 2. Or copy the react_html function above into worker.js
//
// 3. Replace `return new Response(homepage, ...)` with:
//    return new Response(react_html(authConfig.siteName, uiConfig.favicon), {
//      headers: { 'Content-Type': 'text/html; charset=utf-8' }
//    });
//
// The React app makes POST requests to:
// - /{drive}:/path/ for folder listing
// - /{drive}:search for search
// - These are already handled by the existing worker.js code

module.exports = { react_html, CDN_BASE };
