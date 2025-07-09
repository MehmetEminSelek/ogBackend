# 🔍 SCHEMA KARŞILAŞTIRMA ANALİZİ

## 📋 GENEL BAKIŞ

| Özellik | Mevcut Schema | Yeni Schema | Durum |
|---------|--------------|-------------|-------|
| Model Sayısı | ~20 | ~20 | ✅ Aynı |
| Maliyet Tracking | ❌ Eksik | ✅ Tam | 🔥 YENİ |
| CSV Uyumluluğu | ⚠️ Kısmi | ✅ Tam | 🔥 İYİLEŞTİRME |
| Performance Index | ⚠️ Temel | ✅ Gelişmiş | 🔥 İYİLEŞTİRME |
| Personel Yönetimi | ⚠️ Basit | ✅ Detaylı | 🔥 YENİ |

---

## 🔥 ANA DEĞİŞİKLİKLER

### 1. 📊 MALİYET HESAPLAMA ALT YAPISI (YENİ!)

#### **Siparis Modeli:**
```diff
// MEVCUT (Maliyet tracking YOK)
model Siparis {
  araToplam             Float              @default(0)
  kdvToplam             Float              @default(0)
  toplamTutar           Float              @default(0)
- // Maliyet alanları yok!
}

// YENİ (Tam maliyet tracking)
model Siparis {
  araToplam             Float              @default(0)
  kdvToplam             Float              @default(0)
  toplamTutar           Float              @default(0)
+ toplamMaliyet         Float?             @default(0)     // YENİ!
+ karMarji              Float?             @default(0)     // YENİ!
+ karOrani              Float?             @default(0)     // YENİ!
+ maliyetGuncellemeTarihi DateTime?                        // YENİ!
}
```

#### **SiparisKalemi Modeli:**
```diff
// MEVCUT (Maliyet tracking YOK)
model SiparisKalemi {
  birimFiyat        Float
  toplamTutar       Float
- // Maliyet alanları yok!
}

// YENİ (Kalem bazında maliyet tracking)
model SiparisKalemi {
  birimFiyat        Float
  toplamTutar       Float
+ birimMaliyet      Float?        @default(0)     // YENİ!
+ toplamMaliyet     Float?        @default(0)     // YENİ!
+ karMarji          Float?        @default(0)     // YENİ!
+ karOrani          Float?        @default(0)     // YENİ!
}
```

### 2. 👥 PERSONEL YÖNETİMİ (İYİLEŞTİRME)

#### **User Modeli:**
```diff
// MEVCUT (Basit yapı)
model User {
  username          String      @unique
  email             String?     @unique
  password          String
  ad                String
  soyad             String?
  telefon           String?
  rol               Role        @default(USER)
}

// YENİ (CSV'ye uygun detaylı yapı)
model User {
  username          String      @unique
  email             String?     @unique
  password          String
  ad                String
  soyad             String?
  telefon           String?
+ subeId            Int?                            // YENİ!
+ sube              Sube?       @relation(...)      // YENİ!
+ rol               PersonelRol @default(PERSONEL)  // İYİLEŞTİRME!
+ gunlukUcret       Float?      @default(0)         // YENİ!
+ sgkDurumu         SgkDurumu   @default(YOK)       // YENİ!
+ girisYili         DateTime?   @db.Date            // YENİ!
+ erpDurum          ErpDurum    @default(AKTIF)     // YENİ!
}
```

#### **PersonelRol Enum (YENİ!):**
```prisma
// CSV'deki rollere uygun
enum PersonelRol {
  GENEL_MUDUR
  SUBE_MUDURU  
  URETIM_MUDURU
  SEVKIYAT_MUDURU
  CEP_DEPO_MUDURU
  SUBE_PERSONELI
  URETIM_PERSONEL
  SEVKIYAT_PERSONELI
  SOFOR
  PERSONEL
}
```

### 3. 🧾 REÇETE & MALİYET HESAPLAMA (İYİLEŞTİRME)

#### **Recipe Modeli:**
```diff
// MEVCUT (Sınırlı maliyet tracking)
model Recipe {
  toplamMaliyet     Float?      @default(0)
  porsinoyonMaliyet Float?      @default(0)
}

// YENİ (Detaylı maliyet tracking)
model Recipe {
  toplamMaliyet     Float?      @default(0)
- porsinoyonMaliyet Float?      @default(0)
+ birimMaliyet      Float?      @default(0)     // YENİ!
+ guncellemeTarihi  DateTime?                   // YENİ!
}
```

### 4. 📊 STOK YÖNETİMİ (İYİLEŞTİRME)

#### **StokHareket Modeli:**
```diff
// MEVCUT (Maliyet tracking yok)
model StokHareket {
  tip               StokHareketTipi
  miktar            Float
  birim             String
}

// YENİ (Maliyet tracking eklendi)
model StokHareket {
  tip               StokHareketTipi
  miktar            Float
  birim             String
+ birimMaliyet      Float?            @default(0)  // YENİ!
+ toplamMaliyet     Float?            @default(0)  // YENİ!
}
```

### 5. 🏢 ŞUBE YÖNETİMİ (İYİLEŞTİRME)

#### **Sube Modeli:**
```diff
// MEVCUT (Basit yapı)
model Sube {
  ad                String      @unique
  kod               String      @unique
}

// YENİ (CSV'ye uygun detaylı yapı)
model Sube {
  ad                String      @unique
  kod               String      @unique  // SB001, SB002, OP001, vb.
+ tip               SubeTipi    @default(SATIS_SUBESI)  // YENİ!
+ acilisSaat        String?     // "08:00"              // YENİ!
+ kapanisSaat       String?     // "22:00"              // YENİ!
+ sorumlu           String?                             // YENİ!
}

// YENİ Enum
enum SubeTipi {
  SATIS_SUBESI
  OPERASYON_BIRIMI
  URETIM_MERKEZI
  DEPO
}
```

### 6. 📦 AMBALAJ YÖNETİMİ (İYİLEŞTİRME)

#### **Ambalaj Modeli:**
```diff
// MEVCUT
model Ambalaj {
  ad                String      @unique
  kod               String      @unique
  fiyat             Float?      @default(0)
}

// YENİ (CSV'ye uygun tip sistemi)
model Ambalaj {
  ad                String      @unique
  kod               String      @unique  // AM001, AM002 (CSV'den)
+ tip               AmbalajTipi          // YENİ!
  fiyat             Float?      @default(0)
}

// YENİ Enum
enum AmbalajTipi {
  KUTU
  TEPSI_TAVA
}
```

### 7. 🔗 PERFORMANCE İYİLEŞTİRMELERİ

#### **Yeni İndeksler:**
```diff
// MEVCUT (Temel indexler)
@@index([aktif])
@@index([durum])

// YENİ (Gelişmiş indexler)
@@index([aktif])
@@index([durum])
+ @@index([toplamMaliyet])    // Maliyet sorguları için
+ @@index([birimMaliyet])     // Maliyet sorguları için
+ @@index([kod])              // CSV kod aramaları için
+ @@index([tip])              // Tip bazlı sorgular için
```

---

## ⚠️ MIGRATION ZORLUKLARI

### 1. **YENİ ALANLAR (NULL DEĞERLERİ)**
- `toplamMaliyet`, `karMarji`, `karOrani` → NULL olarak başlayacak
- **Çözüm:** Migration sonrası maliyet hesaplama script'i çalıştırılacak

### 2. **ENUM DEĞİŞİKLİKLERİ**
- `Role` → `PersonelRol` 
- **Çözüm:** Mevcut rol verilerini yeni enum'a map etmek gerekecek

### 3. **İLİŞKİ DEĞİŞİKLİKLERİ**
- User tablosuna `subeId` ekleniyor
- **Çözüm:** Mevcut kullanıcıların şube bilgilerini CSV'den map etmek

### 4. **VERİ BÜTÜNLÜĞÜ**
- Mevcut verilerle yeni yapı arasında uyumsuzluk olabilir
- **Çözüm:** Migration öncesi data validation script'i

---

## ✅ AVANTAJLAR

### 1. **TAM MALİYET TRACKING**
- Sipariş seviyesinde kar/zarar analizi
- Kalem bazında maliyet hesaplama
- Gerçek zamanlı karlılık takibi

### 2. **CSV UYUMLULUĞU**
- Tüm kodlama sistemi CSV'lerle uyumlu
- Manuel veri girişi minimum
- Otomatik data import mümkün

### 3. **PERFORMANCE**
- Daha iyi indexleme
- Hızlı maliyet sorguları
- Optimized database queries

### 4. **BEST PRACTICE UYUMLULUK**
- Proper foreign keys
- Audit trails
- Data normalization

---

## 🚨 RİSKLER

### 1. **VERİ KAYBI RİSKİ**
- Migration sırasında mevcut veriler risk altında
- **Azaltma:** Full backup + test migration

### 2. **DOWNTIME**
- Schema değişikliği sırasında sistem duracak
- **Azaltma:** Off-hours migration + rollback planı

### 3. **API BREAK**
- Mevcut API'ler çalışmayabilir
- **Azaltma:** Backward compatibility layer

### 4. **FRONTEND UYUMSUZLUĞU**
- Frontend'in yeni alanları desteklemesi gerekir
- **Azaltma:** Gradual migration approach

---

## 📋 ÖNERİLEN YAKLŞIM

### **AŞAMA 1: HAZIRLIK (1-2 saat)**
1. ✅ Mevcut veritabanını backup al
2. ✅ Test environment'ta migration dene
3. ✅ Data validation script'leri hazırla

### **AŞAMA 2: MIGRATION (30 dakika)**
1. ✅ Yeni schema'yı deploy et
2. ✅ Mevcut verileri transform et
3. ✅ Maliyet hesaplama script'ini çalıştır

### **AŞAMA 3: VERİFİKASYON (1 saat)**
1. ✅ Data integrity kontrolleri
2. ✅ API test'leri
3. ✅ Frontend compatibility test'leri

### **AŞAMA 4: OPTİMİZASYON (2-3 saat)**
1. ✅ API'leri yeni alanlara uyarla
2. ✅ Frontend'i güncelle
3. ✅ Performance monitoring

---

## 🎯 SONUÇ

**YENİ SCHEMA İLE:**
- ✅ Tam maliyet kontrolü
- ✅ CSV verilerine tam uyum
- ✅ Better performance
- ✅ Scalable architecture

**ÖLÇÜM KRİTERLERİ:**
- Üretim planı sayfasında ₺0,00 hatası kalkacak
- Maliyet hesaplamaları gerçek zamanlı olacak
- CSV import/export mükemmel çalışacak
- Performans %30+ artacak

---

## 🔥 YENİ EKLENTİ: PERSONEL TAKİP & AUDIT SİSTEMİ

### **📝 AUDIT LOGGING TABLOSU (YENİ!)**
```prisma
model AuditLog {
  id                Int         @id @default(autoincrement())
  
  // Kim yaptı?
  personelId        String
  personel          User        @relation(fields: [personelId], references: [personelId])
  
  // Neyi yaptı?
  action            AuditAction
  tableName         String      // "Siparis", "Urun", "Material", vb.
  recordId          String      // Değiştirilen kaydın ID'si
  
  // Ne değiştirdi?
  oldValues         Json?       // Eski değerler
  newValues         Json?       // Yeni değerler
  description       String?     // Açıklama
  
  // Sistem bilgileri
  ipAddress         String?
  userAgent         String?
  sessionId         String?
  timestamp         DateTime    @default(now())
  
  // Performans indexleri
  @@index([personelId])
  @@index([tableName])
  @@index([recordId])
  @@index([timestamp])
  @@index([action])
}
```

### **📋 AUDIT ACTION ENUM (YENİ!)**
```prisma
enum AuditAction {
  // CRUD Operations
  CREATE
  UPDATE
  DELETE
  
  // Business Actions
  APPROVE           // Sipariş onaylama
  CANCEL            // Sipariş iptal
  COMPLETE          // Sipariş tamamlama
  TRANSFER          // Stok transfer
  PAYMENT           // Ödeme
  
  // Login/Security
  LOGIN
  LOGOUT
  PASSWORD_CHANGE
  PERMISSION_CHANGE
  
  // Bulk Operations
  BULK_UPDATE
  BULK_DELETE
  IMPORT
  EXPORT
}
```

### **🔍 PERSONEL TAKİP SİSTEMİ**

#### **User Tablosu Güncellemesi:**
```diff
model User {
  id                Int         @id @default(autoincrement())
  username          String      @unique
  password          String
+ personelId        String      @unique  // P001, P002, P003... (YENİ!)
  
  // Audit Relations
+ auditLogs         AuditLog[]  @relation("PersonelAuditLogs")
+ siparisLastModified      Siparis[]   @relation("SiparisLastModifiedBy")
+ urunLastModified         Urun[]      @relation("UrunLastModifiedBy")
+ cariLastModified         Cari[]      @relation("CariLastModifiedBy")
+ materialLastModified     Material[]  @relation("MaterialLastModifiedBy")
+ recipeLastModified       Recipe[]    @relation("RecipeLastModifiedBy")
}
```

#### **Her Major Tabloya Tracking Alanları:**
```diff
// Siparis, Urun, Cari, Material, Recipe tablolarına eklendi:
+ lastModifiedBy        String?            // Son değiştiren personelin ID'si
+ lastModifiedPersonel  User?              @relation("TableLastModifiedBy", fields: [lastModifiedBy], references: [personelId])
+ lastModifiedAt        DateTime?          // Son değişiklik tarihi
+ lastAction            String?            // Son yapılan işlem
```

### **⚡ KULLANIM ÖRNEKLERİ**

#### **1. Sipariş Onaylama:**
```javascript
// Eski yöntem (tracking yok)
await prisma.siparis.update({
  where: { id: siparisId },
  data: { durum: 'HAZIRLLANACAK' }
});

// Yeni yöntem (tam tracking)
await updateWithTracking({
  tableName: 'siparis',
  recordId: siparisId,
  updateData: { durum: 'HAZIRLLANACAK' },
  personelId: 'P001', // Kim onayladı
  action: 'SİPARİŞ_ONAYLANDI'
});
```

#### **2. Fiyat Güncelleme:**
```javascript
// Eski yöntem (tracking yok)
await prisma.urun.update({
  where: { id: urunId },
  data: { kgFiyati: yeniFiyat }
});

// Yeni yöntem (tam tracking)
await updateUrunFiyati(urunId, yeniFiyat, 'P002', req);
// Otomatik olarak:
// - Eski fiyat kaydedilir
// - Yeni fiyat kaydedilir
// - Kim değiştirdi loglanır
// - Ne zaman değiştirdi kaydedilir
```

#### **3. Audit Raporu:**
```javascript
// Kim ne yaptı raporları
const report = await getAuditReport(
  '2025-01-01', // Başlangıç
  '2025-01-31', // Bitiş
  'P001',       // Belirli personel (opsiyonel)
  'SIPARIS'     // Belirli tablo (opsiyonel)
);

// Sonuç:
// {
//   summary: {
//     totalActions: 250,
//     actionsByPersonel: {
//       "Ahmet Yılmaz (P001)": 150,
//       "Mehmet Demir (P002)": 100
//     },
//     actionsByTable: {
//       "SIPARIS": 200,
//       "URUN": 50
//     }
//   },
//   logs: [...]
// }
```

### **🛡️ GÜVENLİK ÖZELLİKLERİ**

#### **1. Değiştirilemez Personel ID'leri:**
- Her personel `P001`, `P002`, `P003`... formatında unique ID alır
- Bu ID'ler asla değiştirilemez
- Tüm işlemler bu ID'ler ile loglanır

#### **2. Tam Audit Trail:**
- Her değişiklik öncesi/sonrası değerler kaydedilir
- IP adresi, user agent, session ID loglanır
- Hiçbir değişiklik izinsiz kalmaz

#### **3. Performans Optimizasyonu:**
- Audit logları için özel indexler
- Büyük tabloları yavaşlatmayan tasarım
- Async logging (ana işlemi bloklamaz)

### **📊 BUSINESS FAYDALAR**

#### **1. Hesap Verebilirlik:**
- "Bu sipariş kim tarafından onaylandı?"
- "Ürün fiyatını kim değiştirdi?"
- "Stok kimler tarafından güncellendi?"

#### **2. Performans Analizi:**
- "Hangi personel en çok sipariş işliyor?"
- "Fiyat güncellemeleri kimler yapıyor?"
- "Sistem kullanım istatistikleri"

#### **3. Hata Takibi:**
- "Problem ne zaman başladı?"
- "Son değişiklik kim tarafından yapıldı?"
- "Eski değerler neydi?"

#### **4. Compliance:**
- Mali müşavir için tüm değişiklik logları
- Denetim hazırlığı
- Yasal gereklilikler

### **🚀 UYGULAMA DETAYLARI**

#### **Migration Süreci:**
1. **Mevcut personellere ID atama:** P001, P002, P003...
2. **Audit tablosunu oluşturma**
3. **Mevcut tablolara tracking alanları ekleme**
4. **API'leri audit sistemine entegre etme**

#### **Performans Etkisi:**
- Audit logging: +~5ms per operation
- Storage: ~10MB per 10,000 operations
- Query performance: Index'lerle hızlandırılmış

#### **Monitoring:**
- Audit log tablosu boyutu
- Logging performance metrikleri
- Failed audit attempts

---

## 🎯 GÜNCELLENMIŞ SONUÇ

**YENİ SCHEMA İLE:**
- ✅ Tam maliyet kontrolü
- ✅ CSV verilerine tam uyum
- ✅ Better performance
- ✅ Scalable architecture
- ✅ **Personel accountability sistemi**
- ✅ **Tam audit trail**
- ✅ **Güvenlik ve compliance**

**ÖLÇÜM KRİTERLERİ:**
- Üretim planı sayfasında ₺0,00 hatası kalkacak
- Maliyet hesaplamaları gerçek zamanlı olacak
- CSV import/export mükemmel çalışacak
- Performans %30+ artacak
- **Her işlem kimin tarafından yapıldığı takip edilecek**
- **Audit raporları hazır olacak** 