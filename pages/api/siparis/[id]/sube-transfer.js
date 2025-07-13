// pages/api/siparis/[id]/sube-transfer.js
import prisma from '../../../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
    // CORS ve OPTIONS handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'PATCH' && req.method !== 'GET') {
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query;
    const siparisId = parseInt(id);

    if (isNaN(siparisId)) {
        return res.status(400).json({ message: 'Geçersiz sipariş ID' });
    }

    // GET isteği için sipariş bilgilerini döndür
    if (req.method === 'GET') {
        try {
            const siparis = await prisma.siparis.findUnique({
                where: { id: siparisId },
                include: {
                    subeNereden: true,
                    subeNereye: true,
                    teslimatTuru: true
                }
            });

            if (!siparis) {
                return res.status(404).json({ message: 'Sipariş bulunamadı' });
            }

            return res.status(200).json(siparis);
        } catch (error) {
            console.error('❌ Sipariş bilgisi alınırken hata:', error);
            return res.status(500).json({ message: 'Sipariş bilgisi alınırken hata oluştu' });
        }
    }

    // PATCH işlemi için gerekli validasyonlar
    console.log('🔍 Sube Transfer Request Body:', JSON.stringify(req.body, null, 2));
    console.log('🔍 Siparis ID:', siparisId);
    
    const { kargoDurumu, kargoNotu, subeNeredenId, subeNereyeId } = req.body;

    if (!kargoDurumu) {
        console.log('❌ Kargo durumu eksik:', { kargoDurumu });
        return res.status(400).json({ message: 'Kargo durumu zorunludur' });
    }

    try {
        // Önce siparişin şubeden şubeye transfer olup olmadığını kontrol et
        const siparis = await prisma.siparis.findUnique({
            where: { id: siparisId },
            include: {
                subeNereden: true,
                subeNereye: true,
                teslimatTuru: true
            }
        });

        console.log('🔍 Mevcut Sipariş:', JSON.stringify({
            id: siparis?.id,
            subeNeredenId: siparis?.subeNeredenId,
            subeNereyeId: siparis?.subeNereyeId,
            teslimatTuru: siparis?.teslimatTuru?.ad,
            kargoDurumu: siparis?.kargoDurumu
        }, null, 2));

        if (!siparis) {
            console.log('❌ Sipariş bulunamadı:', siparisId);
            return res.status(404).json({ message: 'Sipariş bulunamadı' });
        }

        // Şubeden şubeye transfer için şube kontrolü
        const hasValidSubeInfo = (siparis.subeNeredenId && siparis.subeNereyeId) || 
                                (subeNeredenId && subeNereyeId);
        
        if (!hasValidSubeInfo) {
            console.log('❌ Şube transfer bilgisi eksik:', {
                mevcutNereden: siparis.subeNeredenId,
                mevcutNereye: siparis.subeNereyeId,
                yeniNereden: subeNeredenId,
                yeniNereye: subeNereyeId
            });
            return res.status(400).json({
                message: 'Şubeden şubeye transfer için nereden ve nereye şube bilgileri gereklidir'
            });
        }

        // Güncelleme verisi oluştur
        const updateData = {
            kargoDurumu: kargoDurumu,
            kargoNotu: kargoNotu || null,
            updatedAt: new Date()
        };

        // Eğer yeni şube bilgileri gönderilmişse güncelle
        if (subeNeredenId) {
            updateData.subeNeredenId = parseInt(subeNeredenId);
        }
        if (subeNereyeId) {
            updateData.subeNereyeId = parseInt(subeNereyeId);
        }

        // Güncelleme
        const guncellenenSiparis = await prisma.siparis.update({
            where: { id: siparisId },
            data: updateData,
            include: {
                teslimatTuru: true,
                sube: true,
                subeNereden: true,
                subeNereye: true,
                hedefSube: true,
                kalemler: {
                    include: {
                        urun: true,
                        tepsiTava: true,
                        kutu: true
                    }
                }
            }
        });

        console.log(`✅ Şube transfer güncellendi: Sipariş ${siparisId}, Durum: ${kargoDurumu}`);

        return res.status(200).json(guncellenenSiparis);

    } catch (error) {
        console.error('❌ Şube transfer güncellenirken hata:', error);

        let statusCode = 500;
        let errorMessage = 'Şube transfer güncellenirken hata oluştu';

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                statusCode = 404;
                errorMessage = 'Sipariş bulunamadı';
            }
        }

        return res.status(statusCode).json({
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
} 