import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const { hedefSubeId, kargoNotu, kargoDurumu } = req.body;
        if (!hedefSubeId) {
            return res.status(400).json({ message: 'hedefSubeId zorunlu.' });
        }

        // Kargo durumu dönüşümü
        let mappedKargoDurumu = 'SUBEYE_GONDERILECEK'; // Varsayılan
        if (kargoDurumu) {
            const kargoDurumuMapping = {
                'Şubeye Gönderilecek': 'SUBEYE_GONDERILECEK',
                'Şubede Teslim': 'SUBEDE_TESLIM',
                'Kargoya Verilecek': 'KARGOYA_VERILECEK',
                'Kargoda': 'KARGODA',
                'Teslim Edildi': 'TESLIM_EDILDI',
                'İptal': 'IPTAL'
            };
            mappedKargoDurumu = kargoDurumuMapping[kargoDurumu] || 'SUBEYE_GONDERILECEK';
        }

        const updated = await prisma.siparis.update({
            where: { id: Number(id) },
            data: {
                hedefSubeId: Number(hedefSubeId),
                kargoNotu: kargoNotu || undefined,
                kargoDurumu: mappedKargoDurumu,
            },
        });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Transfer işlemi başarısız', error: err.message });
    }
} 