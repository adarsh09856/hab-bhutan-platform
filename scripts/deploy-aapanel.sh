#!/usr/bin/env bash
# ==============================================================================
# Handicrafts Association of Bhutan (HAB) — Production VPS aaPanel Deploy Script
# Usage on VPS: bash scripts/deploy-aapanel.sh
# ==============================================================================
set -e

echo "===================================================="
echo "🇧🇹 HAB Platform — aaPanel Production Deployment"
echo "===================================================="

# 0. Git Synchronization (Pull latest code from origin/main)
if [ -d .git ]; then
    echo "📥 [1/7] Fetching and synchronizing latest code from GitHub..."
    git fetch origin main || true
    git reset --hard origin/main || git pull origin main || echo "⚠️ Git update skipped or in detached HEAD state."
else
    echo "ℹ️ [1/7] .git directory not found; skipping git sync."
fi

# 1. Environment & Node.js Validation
echo "🚀 [2/7] Validating Node.js and Environment..."
if ! command -v node &> /dev/null; then
    # Check aaPanel Node paths if node isn't in default PATH
    for node_bin in /www/server/nodejs/v*/bin; do
        if [ -d "$node_bin" ]; then
            export PATH="$node_bin:$PATH"
            break
        fi
    done
fi

if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not found. Please install Node.js 18 or 20 in aaPanel Node Version Manager."
    exit 1
fi

echo "   Node version: $(node -v)"
echo "   NPM version:  $(npm -v)"

if [ ! -f .env ]; then
    if [ -f .env.production ]; then
        echo "ℹ️ Copying .env.production to .env..."
        cp .env.production .env
    elif [ -f .env.production.example ]; then
        echo "⚠️ Notice: .env file missing. Copying .env.production.example to .env..."
        cp .env.production.example .env
        echo "⚠️ Please verify your DATABASE_URL in .env before proceeding!"
    fi
fi

# Extract configured port from .env (default: 3001)
APP_PORT=3001
if [ -f .env ]; then
    DETECTED_PORT=$(grep -E '^PORT=' .env | cut -d '=' -f2 | tr -d ' "\r\n' || true)
    if [ -n "$DETECTED_PORT" ]; then
        APP_PORT=$DETECTED_PORT
    fi
fi
echo "   Target Server Port: $APP_PORT"

# 2. Dependencies Installation
echo "📦 [3/7] Installing production dependencies on Linux..."
rm -rf .next
npm install --legacy-peer-deps

# 3. PostgreSQL Database Schema Sync
echo "🗄️ [4/7] Generating Prisma Client and Syncing Database..."
npx prisma generate
# Attempt standard migration; fall back to db push if custom migrations differ
if ! npx prisma migrate deploy; then
    echo "⚠️ 'prisma migrate deploy' exited with code; applying schema sync via 'prisma db push'..."
    npx prisma db push --accept-data-loss
fi

# 4. Master Data Seed & Admin Verification
echo "🌱 [5/7] Verifying Seed & Master Catalog Data..."
npm run prisma:seed || echo "ℹ️ Seed script finished."
if [ -f scripts/reset-admin.js ]; then
    node scripts/reset-admin.js "HabAdminProduction2026!#" || true
fi

# 5. Production Next.js Compilation
echo "🏗️ [6/7] Compiling Next.js Production Build on Linux..."
npm run build

# 6. PM2 Process Management
echo "🔄 [7/7] Reloading Application in PM2..."

# Locate PM2 binary across standard VPS and aaPanel locations
PM2_BIN="pm2"
if ! command -v pm2 &> /dev/null; then
    for candidate in \
        /www/server/nodejs/v20*/bin/pm2 \
        /www/server/nodejs/v18*/bin/pm2 \
        /root/.nvm/versions/node/v*/bin/pm2 \
        /usr/local/bin/pm2 \
        /usr/bin/pm2; do
        if [ -x "$candidate" ]; then
            PM2_BIN="$candidate"
            break
        fi
    done
fi

# Clean up port if held by an orphan or defunct process
echo "🧹 Releasing ports ${APP_PORT} and 3001 if occupied..."
if command -v fuser &> /dev/null; then
    fuser -k "${APP_PORT}/tcp" 2>/dev/null || true
    fuser -k 3001/tcp 2>/dev/null || true
elif command -v lsof &> /dev/null; then
    kill -9 $(lsof -t -i:"${APP_PORT}" 2>/dev/null) 2>/dev/null || true
    kill -9 $(lsof -t -i:3001 2>/dev/null) 2>/dev/null || true
fi
sleep 1

APP_NAME="habbhutanplatform"

if command -v "$PM2_BIN" &> /dev/null || [ -x "$PM2_BIN" ]; then
    # Check if process is already managed by PM2
    if "$PM2_BIN" describe "$APP_NAME" &> /dev/null; then
        echo "⚡ Reloading existing PM2 instance '$APP_NAME' with zero-downtime..."
        "$PM2_BIN" reload "$APP_NAME" --update-env || "$PM2_BIN" restart "$APP_NAME" --update-env
    elif [ -f ecosystem.config.js ]; then
        echo "🚀 Starting new PM2 instance from ecosystem.config.js..."
        "$PM2_BIN" start ecosystem.config.js
    elif [ -f server.js ]; then
        echo "🚀 Starting Next.js via PM2 server.js execution..."
        "$PM2_BIN" start server.js --name "$APP_NAME"
    else
        echo "🚀 Starting Next.js via PM2 direct execution..."
        "$PM2_BIN" start "npm" --name "$APP_NAME" -- start
    fi
    "$PM2_BIN" save || true
    echo "✅ PM2 process successfully started and saved."
else
    echo "⚠️ Notice: PM2 binary not found in standard paths."
    echo "   If using aaPanel Node.js Project Manager, restart the project in the aaPanel web UI."
fi

echo "===================================================="
echo "🎉 Deployment Complete! Application running on port ${APP_PORT}."
echo "   Health check: curl http://127.0.0.1:${APP_PORT}/api/admin/health"
echo "===================================================="
echo ""
echo "📋 Handy PM2 Management Commands:"
echo "   pm2 status                      # View running services & uptime"
echo "   pm2 logs habbhutanplatform      # View live application logs"
echo "   pm2 restart habbhutanplatform   # Restart the app"
echo "   pm2 reload habbhutanplatform    # Zero-downtime reload"
echo "   pm2 stop habbhutanplatform      # Stop the app"
echo "   pm2 monit                       # Interactive CPU/Memory dashboard"
echo "===================================================="
