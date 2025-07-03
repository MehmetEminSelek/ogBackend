# 🔧 API Düzenlemeleri ve Model Uyumluluğu

## 📋 Yapılan Değişiklikler

### 1. **Kargo Durumu Enum Genişletildi**

**Önceki Durum:**
```prisma
enum KargoDurumu {
  ADRESE_TESLIMAT    // Adrese teslimat
  SUBEDEN_SUBEYE     // Şubeden şubeye teslimat
}
```

**Yeni Durum:**
```prisma
enum KargoDurumu {
  KARGOYA_VERILECEK  // Kargoya verilecek durumda
  KARGODA            // Kargoda sevkiyatta
  TESLIM_EDILDI      // Teslim edildi
  SUBEYE_GONDERILECEK // Şubeye gönderilecek
  SUBEDE_TESLIM      // Şubede teslim edildi
  ADRESE_TESLIMAT    // Adrese teslimat (varsayılan)
  SUBEDEN_SUBEYE     // Şubeden şubeye teslimat
  IPTAL              // İptal edildi
}
```

### 2. **Stok Düşümü API'si Düzeltildi**

**Sorun:** `consume-order.js` eski model yapısını kullanıyordu (`hammadde`, `yariMamul` tabloları)

**Çözüm:** 
- Yeni `Material` modelini kullanacak şekilde güncellendi
- Reçete malzemelerini doğru şekilde çözüyor
- Stok hareketleri kaydediliyor
- Hata kontrolü eklendi

### 3. **API'lerde Kargo Durumu Mapping'i**

**Eklenen Mapping:**
```javascript
const kargoDurumuMapping = {
  'Kargoya Verilecek': 'KARGOYA_VERILECEK',
  'Kargoda': 'KARGODA',
  'Teslim Edildi': 'TESLIM_EDILDI',
  'Şubeye Gönderilecek': 'SUBEYE_GONDERILECEK',
  'Şubede Teslim': 'SUBEDE_TESLIM',
  'İptal': 'IPTAL'
};
```

### 4. **Düzeltilen API'ler**

#### ✅ `pages/api/siparis/[id]/kargo.js`
- Kargo durumu mapping'i eklendi
- Enum değerlerine dönüştürme yapılıyor

#### ✅ `pages/api/siparis/[id]/transfer.js`
- Transfer işlemlerinde doğru enum değerleri kullanılıyor

#### ✅ `pages/api/siparis/[id]/teslim.js`
- Teslim işlemlerinde `TESLIM_EDILDI` enum değeri kullanılıyor

#### ✅ `pages/api/siparis/index.js`
- Sipariş oluştururken doğru kargo durumu atanıyor
- Teslimat türüne göre kargo durumu belirleniyor

#### ✅ `pages/api/orders.js`
- Kargo durumu filtresi eklendi
- Mapping ile doğru enum değerleri kullanılıyor

#### ✅ `pages/api/stok/consume-order.js`
- Tamamen yeniden yazıldı
- Yeni Material modelini kullanıyor
- Reçete malzemelerini doğru hesaplıyor
- Stok hareketleri kaydediyor

### 5. **Yeni API Eklendi**

#### ✅ `pages/api/kargo-durumlari.js`
- Kargo durumlarını ve istatistiklerini döndürüyor
- Frontend'de kullanım için hazır

## 🚀 Migration Gereksinimleri

### 1. **Veritabanı Migration'ı Çalıştırın:**
```bash
cd backend
npx prisma migrate dev --name update_kargo_durumu_enum
```

### 2. **Prisma Client'ı Güncelleyin:**
```bash
npx prisma generate
```

## 🔍 Test Edilmesi Gerekenler

### 1. **Sipariş Oluşturma**
- [ ] Yeni sipariş oluşturulduğunda doğru kargo durumu atanıyor
- [ ] Teslimat türüne göre kargo durumu belirleniyor

### 2. **Kargo İşlemleri**
- [ ] Kargo durumu güncellemeleri çalışıyor
- [ ] Transfer işlemleri doğru enum değerleri kullanıyor
- [ ] Teslim işlemleri çalışıyor

### 3. **Stok Düşümü**
- [ ] HAZIRLANDI durumundaki siparişler için stok düşümü çalışıyor
- [ ] Reçete malzemeleri doğru hesaplanıyor
- [ ] Stok hareketleri kaydediliyor
- [ ] Yetersiz stok durumunda hata veriyor

### 4. **Filtreleme**
- [ ] Orders API'sinde kargo durumu filtresi çalışıyor
- [ ] Frontend'de doğru durumlar gösteriliyor

## 🐛 Bilinen Sorunlar

1. **Frontend Uyumluluğu:** Frontend'de eski string değerler kullanılıyor olabilir
2. **Mevcut Veriler:** Eski kargo durumu değerleri migration ile güncellenmeli

## 📞 Sonraki Adımlar

1. **Frontend Güncellemeleri:** Kargo durumu mapping'lerini frontend'e ekleyin
2. **Test:** Tüm API'leri test edin
3. **Monitoring:** Stok düşümü işlemlerini izleyin
4. **Documentation:** Frontend geliştiricileri için API dokümantasyonu güncelleyin

## 🔗 İlgili Dosyalar

- `prisma/schema.prisma` - Ana model tanımları
- `pages/api/siparis/` - Sipariş API'leri
- `pages/api/stok/consume-order.js` - Stok düşümü
- `pages/api/kargo-durumlari.js` - Kargo durumları
- `prisma/migrations/` - Veritabanı migration'ları 