import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Siparişin var olup olmadığını kontrol et
        const existingSiparis = await prisma.siparis.findUnique({
            where: { id: Number(id) },
            include: { teslimatTuru: true }
        });

        if (!existingSiparis) {
            return res.status(404).json({ message: 'Sipariş bulunamadı.' });
        }

        const updateData = {};
        const allowedFields = [
            'kargoDurumu',
            'kargoSirketi',
            'kargoTakipNo',
            'kargoNotu',
            'kargoTarihi',
            'teslimTarihi',
            'hedefSubeId',
        ];

        // Gelen verileri kontrol et ve güncelle
        for (const field of allowedFields) {
            if (field in req.body) {
                if (field === 'kargoTarihi' || field === 'teslimTarihi') {
                    updateData[field] = req.body[field] ? new Date(req.body[field]) : null;
                } else {
                    updateData[field] = req.body[field];
                }
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Güncellenecek alan yok.' });
        }

        // Kargo durumu validasyonu ve dönüşümü
        if (updateData.kargoDurumu) {
            // Frontend'den gelen string değerleri enum değerlerine dönüştür
            const kargoDurumuMapping = {
                'Kargoya Verilecek': 'KARGOYA_VERILECEK',
                'Kargoda': 'KARGODA',
                'Teslim Edildi': 'TESLIM_EDILDI',
                'Şubeye Gönderilecek': 'SUBEYE_GONDERILECEK',
                'Şubede Teslim': 'SUBEDE_TESLIM',
                'İptal': 'IPTAL',
                'Adrese Teslimat': 'ADRESE_TESLIMAT',
                'Şubeden Şubeye': 'SUBEDEN_SUBEYE'
            };

            const mappedDurum = kargoDurumuMapping[updateData.kargoDurumu];
            if (mappedDurum) {
                updateData.kargoDurumu = mappedDurum;
            } else {
                // Eğer zaten enum değeri ise direkt kullan
                const validKargoDurumlari = [
                    'KARGOYA_VERILECEK',
                    'KARGODA',
                    'TESLIM_EDILDI',
                    'SUBEYE_GONDERILECEK',
                    'SUBEDE_TESLIM',
                    'ADRESE_TESLIMAT',
                    'SUBEDEN_SUBEYE',
                    'IPTAL'
                ];

                if (!validKargoDurumlari.includes(updateData.kargoDurumu)) {
                    return res.status(400).json({
                        message: 'Geçersiz kargo durumu.',
                        validDurumlar: Object.keys(kargoDurumuMapping)
                    });
                }
            }
        }

        console.log(`🚚 Kargo güncelleme: Sipariş ID ${id}, Güncelleme:`, updateData);

        const updated = await prisma.siparis.update({
            where: { id: Number(id) },
            data: updateData,
            include: {
                teslimatTuru: { select: { ad: true, kodu: true } },
                sube: { select: { ad: true } },
                kalemler: { include: { urun: { select: { ad: true } } } }
            }
        });

        console.log(`✅ Kargo güncelleme başarılı: Sipariş ID ${id}`);
        res.status(200).json(updated);

    } catch (err) {
        console.error(`❌ Kargo güncelleme hatası (Sipariş ID ${id}):`, err);
        res.status(500).json({ message: 'Kargo bilgisi güncellenemedi', error: err.message });
    }
} 