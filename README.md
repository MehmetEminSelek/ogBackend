# 🍯 OG Sipariş Yönetim Sistemi - Backend API

## 📋 Proje Açıklaması
Antep tatlıları için sipariş yönetim sistemi backend API'si. Next.js API Routes ve Prisma ORM kullanılarak geliştirilmiştir.

## 🛠 Teknolojiler
- **Framework:** Next.js 13+ (API Routes)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT
- **File Upload:** Formidable
- **Process Manager:** PM2

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- PM2 (production için)

### Development
```bash
# Dependencies yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Database migration
npx prisma generate
npx prisma db push

# Seed data (opsiyonel)
npx prisma db seed

# Development server başlat
npm run dev
```

### Production Deployment

#### CyberPanel/Hostinger
```bash
# Environment dosyasını hazırla
cp .env.production .env

# Dependencies ve build
npm install --production
npm run build

# Database setup
npx prisma generate
npx prisma db push
npx prisma db seed

# PM2 ile başlat
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı

### Products (Ürünler)
- `GET /api/urunler` - Ürün listesi
- `POST /api/urunler` - Yeni ürün
- `PUT /api/urunler/[id]` - Ürün güncelle
- `DELETE /api/urunler/[id]` - Ürün sil
- `GET /api/urunler/[id]/recete-maliyet` - Reçete maliyeti

### Orders (Siparişler)
- `GET /api/siparisler` - Sipariş listesi
- `POST /api/siparisler` - Yeni sipariş
- `PUT /api/siparisler/[id]` - Sipariş güncelle
- `DELETE /api/siparisler/[id]` - Sipariş sil

### Customers (Cariler)
- `GET /api/cariler` - Cari listesi
- `POST /api/cariler` - Yeni cari
- `PUT /api/cariler/[id]` - Cari güncelle

### Dropdown Data
- `GET /api/dropdown` - Tüm dropdown verileri

## 🗄 Database Schema

### Ana Tablolar
- `Urun` - Ürünler
- `Siparis` - Siparişler
- `SiparisKalem` - Sipariş kalemleri
- `Cari` - Müşteriler
- `Recipe` - Reçeteler
- `RecipeIngredient` - Reçete malzemeleri

## 🧪 Test

### Recipe Cost Test
```bash
# Peynirli Su Böreği maliyeti (1KG)
curl "http://localhost:3000/api/urunler/1/recete-maliyet?miktar=1000"
# Beklenen: {"toplamMaliyet": 15.01, ...}
```

## 📊 Production Features

### Recipe Cost Calculation
- ✅ Hammadde maliyeti hesaplama
- ✅ Yarı mamul maliyeti hesaplama  
- ✅ KG bazında maliyet analizi
- ✅ Kar marjı hesaplama

### Order Management
- ✅ Sipariş oluşturma/düzenleme
- ✅ Ödeme durumu takibi
- ✅ Hazırlama durumu
- ✅ PDF export

### Stock Management
- ✅ Hammadde stok takibi
- ✅ Yarı mamul stok takibi
- ✅ Operasyon birimi bazında stok

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"

# JWT
JWT_SECRET="your-super-secret-key"

# Domain
NEXT_PUBLIC_API_URL=https://api.ogsiparis.com/api
CORS_ORIGIN=https://ogsiparis.com

# Production
NODE_ENV=production
PORT=8080
```

## 📝 Deployment Notes

### CyberPanel Specific
- Port: 8080 (otomatik atanır)
- PM2 ecosystem.config.js kullanılır
- Logs: `./logs/` klasöründe
- Uploads: `./uploads/` klasöründe

### Database Migration
```bash
# Production'da ilk kez
npx prisma db push

# Schema değişikliklerinde
npx prisma db push --accept-data-loss
```

## 🚨 Troubleshooting

### Common Issues
1. **Database Connection:** PostgreSQL service kontrol edin
2. **Port Conflict:** PORT environment variable kontrol edin
3. **CORS Errors:** CORS_ORIGIN doğru domain'e set edin
4. **Recipe Costs:** Seed data yüklendiğinden emin olun

### Logs
```bash
# PM2 logs
pm2 logs og-backend

# Application logs
tail -f logs/combined.log
```

## 📞 Support
- Recipe cost calculation: 15.01₺/KG (Peynirli Su Böreği)
- Database: 13 reçete, 38 ürün, 20 dummy sipariş
- API Response time: <100ms average 