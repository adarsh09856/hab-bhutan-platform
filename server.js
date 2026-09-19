const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

// Load environment variables if .env exists
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
} catch (e) {
  // ignore
}

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use by another process.`);
      console.error(`Please run: fuser -k ${port}/tcp (or kill -9 $(lsof -t -i:${port})) before restarting.`);
    } else {
      console.error('Server startup error:', err);
    }
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`> HAB Bhutan Platform ready on http://${hostname}:${port} (env: ${process.env.NODE_ENV || 'production'})`);
    // Signal PM2 that the application is ready to accept connections
    if (typeof process.send === 'function') {
      process.send('ready');
    }
  });

  // Graceful shutdown handling for aaPanel and PM2
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Gracefully closing HTTP server on port ${port}...`);
    server.close(() => {
      console.log('HTTP server closed successfully.');
      process.exit(0);
    });
    // Force process termination after 5 seconds if lingering connections exist
    setTimeout(() => {
      console.error('Forced shutdown timeout reached. Exiting process.');
      process.exit(1);
    }, 5000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
});
