/**
 * Avicenna's Karate Dojo - Static File Server
 * Node.js HTTP server with MIME types, cache headers, and health endpoint
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

// Cache control headers
const CACHE_HTML = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
const CACHE_STATIC = { 'Cache-Control': 'public, max-age=86400' };

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Determine cache headers based on file type
 */
function getCacheHeaders(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.html' ? CACHE_HTML : CACHE_STATIC;
}

/**
 * Serve a static file
 */
function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const mimeType = getMimeType(filePath);
    const cacheHeaders = getCacheHeaders(filePath);

    res.writeHead(200, {
      'Content-Type': mimeType,
      ...cacheHeaders
    });
    res.end(data);
  });
}

/**
 * Serve directory index
 */
function serveIndex(dirPath, res) {
  const indexPath = path.join(dirPath, 'index.html');
  serveFile(indexPath, res);
}

/**
 * Create HTTP server
 */
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0]; // Remove query string
  const filePath = path.join(ROOT, url);

  // Health check endpoint
  if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Root path - serve index.html
  if (url === '/' || url === '') {
    serveIndex(ROOT, res);
    return;
  }

  // Check if path exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // Try serving index.html for SPA routing
      serveIndex(ROOT, res);
      return;
    }

    if (stats.isDirectory()) {
      serveIndex(filePath, res);
    } else {
      serveFile(filePath, res);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🥋 Karate Dojo server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${ROOT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

module.exports = server;
