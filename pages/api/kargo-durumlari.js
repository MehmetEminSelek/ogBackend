import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            // Kargo durumu mapping'i
            const kargoDurumlari = [
                {
                    kod: 'KARGOYA_VERILECEK',
                    ad: 'Kargoya Verilecek',
                    renk: 'primary',
                    aciklama: 'Sipariş hazırlandı, kargoya verilmeyi bekliyor'
                },
                {
                    kod: 'KARGODA',
                    ad: 'Kargoda',
                    renk: 'info',
                    aciklama: 'Sipariş kargoda sevkiyatta'
                },
                {
                    kod: 'TESLIM_EDILDI',
                    ad: 'Teslim Edildi',
                    renk: 'success',
                    aciklama: 'Sipariş teslim edildi'
                },
                {
                    kod: 'SUBEYE_GONDERILECEK',
                    ad: 'Şubeye Gönderilecek',
                    renk: 'secondary',
                    aciklama: 'Sipariş şubeye gönderilecek'
                },
                {
                    kod: 'SUBEDE_TESLIM',
                    ad: 'Şubede Teslim',
                    renk: 'success',
                    aciklama: 'Sipariş şubede teslim edildi'
                },
                {
                    kod: 'ADRESE_TESLIMAT',
                    ad: 'Adrese Teslimat',
                    renk: 'warning',
                    aciklama: 'Adrese teslimat yapılacak'
                },
                {
                    kod: 'SUBEDEN_SUBEYE',
                    ad: 'Şubeden Şubeye',
                    renk: 'warning',
                    aciklama: 'Şubeden şubeye transfer'
                },
                {
                    kod: 'IPTAL',
                    ad: 'İptal',
                    renk: 'error',
                    aciklama: 'Sipariş iptal edildi'
                }
            ];

            // İstatistikler
            const kargoIstatistikleri = await prisma.siparis.groupBy({
                by: ['kargoDurumu'],
                _count: true
            });

            // İstatistikleri mapping ile birleştir
            const kargoDurumlariWithStats = kargoDurumlari.map(durum => {
                const stat = kargoIstatistikleri.find(s => s.kargoDurumu === durum.kod);
                return {
                    ...durum,
                    siparisSayisi: stat ? stat._count : 0
                };
            });

            return res.status(200).json({
                kargoDurumlari: kargoDurumlariWithStats,
                toplamSiparis: kargoIstatistikleri.reduce((sum, stat) => sum + stat._count, 0)
            });

        } catch (error) {
            console.error('❌ GET /api/kargo-durumlari HATA:', error);
            return res.status(500).json({
                message: 'Kargo durumları listelenirken hata oluştu.',
                error: error.message
            });
        }
    }

    console.log(`Desteklenmeyen metot: ${req.method} for /api/kargo-durumlari`);
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 