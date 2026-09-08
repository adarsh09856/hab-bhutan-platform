#!/usr/bin/env bash
# ==============================================================================
# Handicrafts Association of Bhutan (HAB) — Production VPS aaPanel Deploy Script
# Usage on VPS: bash scripts/deploy-aapanel.sh
# ==============================================================================
set -e

echo "===================================================="
echo "🇧🇹 HAB Platform — aaPanel Production Deployment"
echo "===================================================="

echo "🚀 [1/6] Validating Node.js and Environment..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18 or 20 in aaPanel Node Version Manager."
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

echo "📦 [2/6] Installing production dependencies on Linux..."
# Remove any cached Windows native binaries if uploaded from local machine
rm -rf .next
npm install --legacy-peer-deps

echo "🗄️ [3/6] Running PostgreSQL Database Migrations..."
npx prisma generate
npx prisma migrate deploy

echo "🌱 [4/6] Verifying Seed & Master Catalog Data..."
npm run prisma:seed

echo "🏗️ [5/6] Compiling Next.js Production Build on Linux..."
npm run build

echo "🔄 [6/6] Reloading Application in PM2..."
if command -v pm2 &> /dev/null; then
    pm2 reload ecosystem.config.js || pm2 start ecosystem.config.js
    pm2 save
    echo "✅ PM2 process reloaded and state saved."
elif [ -f /www/server/nodejs/v20*/bin/pm2 ]; then
    /www/server/nodejs/v20*/bin/pm2 reload ecosystem.config.js || /www/server/nodejs/v20*/bin/pm2 start ecosystem.config.js
    /www/server/nodejs/v20*/bin/pm2 save
    echo "✅ aaPanel PM2 process reloaded."
else
    echo "ℹ️ PM2 not found in global path. If using aaPanel Node.js Project Manager, restart the project from the aaPanel GUI."
fi

echo "===================================================="
echo "🎉 Deployment Complete! Local server on port 3000."
echo "   Check health: curl http://127.0.0.1:3000/api/admin/health"
echo "===================================================="
