const path = require('path');
const fs = require('fs');

let port = 3000;
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
  port = 3000;
}

module.exports = {
  apps: [
    {
      name: 'habbhutanplatform',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: `start -p ${port}`,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: port,
      },
    },
  ],
};
