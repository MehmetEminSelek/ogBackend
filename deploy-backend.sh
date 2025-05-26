#!/bin/bash

# Backend Deployment Script
echo "🚀 Starting Backend deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Build backend
echo "🔨 Building backend..."
npm run build

# 3. Database migration
echo "🗄️ Running database migrations..."
npx prisma generate
npx prisma db push

# 4. Create logs directory
echo "📝 Creating logs directory..."
mkdir -p logs

# 5. Create production .env
echo "📝 Creating production .env..."
cp .env.production .env

# 6. Create admin user
echo "👤 Creating admin user..."
node scripts/create-admin.js

# 7. Seed example data
echo "🌱 Seeding example data..."
node scripts/seed-data.js

# 8. Start with PM2
echo "🚀 Starting application with PM2..."
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Backend deployment complete!"
echo ""
echo "📌 Next steps:"
echo "1. Check PM2 status: pm2 status"
echo "2. Check logs: pm2 logs"
echo "3. Monitor: pm2 monit" 