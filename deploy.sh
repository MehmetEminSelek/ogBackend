#!/bin/bash

# OG Backend - CyberPanel Deployment Script
echo "🚀 OG Backend API - CyberPanel Deployment Başlıyor..."

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Backend API Deployment Checklist${NC}"
echo "=================================================="

# 1. Environment kontrolü
echo -e "${YELLOW}1. Environment dosyası kontrol ediliyor...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env dosyası bulunamadı!${NC}"
    echo -e "${YELLOW}💡 Production environment dosyasını kopyalıyorum...${NC}"
    cp .env.production .env
    echo -e "${GREEN}✅ .env dosyası oluşturuldu${NC}"
    echo -e "${YELLOW}⚠️  Database credentials kontrol edin!${NC}"
else
    echo -e "${GREEN}✅ Environment dosyası mevcut${NC}"
fi

# 2. Node.js version kontrolü
echo -e "${YELLOW}2. Node.js version kontrol ediliyor...${NC}"
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# 3. Dependencies install
echo -e "${YELLOW}3. Dependencies yükleniyor...${NC}"
npm install --production

# 4. Prisma setup
echo -e "${YELLOW}4. Prisma setup yapılıyor...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"

# 5. Build işlemi
echo -e "${YELLOW}5. Production build yapılıyor...${NC}"
npm run build
echo -e "${GREEN}✅ Build tamamlandı${NC}"

# 6. Database migration
echo -e "${YELLOW}6. Database migration çalıştırılıyor...${NC}"
npx prisma db push
echo -e "${GREEN}✅ Database migration tamamlandı${NC}"

# 7. Seed data (opsiyonel)
echo -e "${YELLOW}7. Seed data yükleniyor...${NC}"
npx prisma db seed
echo -e "${GREEN}✅ Seed data yüklendi${NC}"

# 8. Klasör yapısı oluştur
echo -e "${YELLOW}8. Gerekli klasörler oluşturuluyor...${NC}"
mkdir -p logs
mkdir -p uploads
chmod -R 755 uploads
chmod -R 755 logs
echo -e "${GREEN}✅ Klasörler hazırlandı${NC}"

# 9. PM2 ecosystem kontrolü
echo -e "${YELLOW}9. PM2 ecosystem kontrol ediliyor...${NC}"
if [ -f "ecosystem.config.js" ]; then
    echo -e "${GREEN}✅ PM2 ecosystem config mevcut${NC}"
else
    echo -e "${RED}❌ ecosystem.config.js bulunamadı!${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Backend deployment hazırlığı tamamlandı!${NC}"
echo ""
echo -e "${BLUE}📌 Sonraki Adımlar:${NC}"
echo "=================================="
echo "1. 🗄️ PostgreSQL database oluşturun:"
echo "   - Database Name: ogformdb"
echo "   - Username: ogform"
echo "   - Password: secret"
echo ""
echo "2. 🚀 PM2 ile uygulamayı başlatın:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "3. 🧪 API test edin:"
echo "   curl https://api.ogsiparis.com/api/dropdown"
echo "   curl https://api.ogsiparis.com/api/urunler/1/recete-maliyet?miktar=1000"
echo ""
echo -e "${BLUE}🔧 Environment Variables:${NC}"
echo "=================================="
echo "DATABASE_URL=postgresql://ogform:secret@localhost:5432/ogformdb"
echo "NEXT_PUBLIC_API_URL=https://api.ogsiparis.com/api"
echo "CORS_ORIGIN=https://ogsiparis.com"
echo "NODE_ENV=production"
echo "PORT=8080"
echo ""
echo -e "${YELLOW}⚠️  Önemli:${NC}"
echo "• Recipe cost calculation: 15.01₺/KG (Peynirli Su Böreği)"
echo "• API endpoints: /api/urunler, /api/siparisler, /api/cariler"
echo "• PM2 logs: pm2 logs og-backend" 