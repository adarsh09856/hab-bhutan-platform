const path = require('path');
const fs = require('fs');

let port = 3001;
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const portMatch = envContent.match(/^PORT\s*=\s*(\d+)/m);
    if (portMatch && portMatch[1]) {
      port = parseInt(portMatch[1], 10);
    }
  } else if (process.env.PORT) {
    port = parseInt(process.env.PORT, 10);
  }
} catch {
  port = 3001;
}

module.exports = {
  apps: [
    {
      name: 'habbhutanplatform',
      cwd: __dirname,
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      min_uptime: '10s',
      max_restarts: 10,
      listen_timeout: 30000,
      env: {
        NODE_ENV: 'production',
        PORT: port,
      },
    },
  ],
};
