// pages/api/siparis/[id]/odemeler.js
// Belirli bir siparişe yeni ödeme ekler

import prisma from '../../../../lib/prisma'; // <<< YOLU KONTROL ET! (Ana dizinden 4 seviye yukarı)
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Sadece POST
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { return res.status(200).end(); }

    // Sipariş ID'sini al ve doğrula
    const siparisIdQueryParam = req.query.id;
    const siparisId = parseInt(siparisIdQueryParam);
    if (isNaN(siparisId)) { return res.status(400).json({ message: 'Geçersiz Sipariş ID.' }); }

    // Sadece POST isteklerini işle
    if (req.method === 'POST') {
        console.log(`POST /api/siparis/${siparisId}/odemeler isteği alındı. Body:`, req.body);
        const { tutar, odemeTarihi, odemeYontemi, aciklama } = req.body;

        // Gerekli alan kontrolü
        if (tutar === undefined || tutar === null || typeof tutar !== 'number' || tutar <= 0) {
            return res.status(400).json({ message: 'Geçerli bir ödeme tutarı girilmelidir.' });
        }

        try {
            // Ödeme tarihini işle (gelmezse şimdiki zaman)
            let odemeTarihiDate = new Date();
            if (odemeTarihi) {
                odemeTarihiDate = new Date(odemeTarihi);
                if (isNaN(odemeTarihiDate.getTime())) {
                    throw new Error('Geçersiz ödeme tarihi formatı.');
                }
            } else {
                //Eğer frontend tarih göndermiyorsa ve şimdi olmasını istemiyorsan,
                //siparişin kendi tarihini kullanabilirsin (önce siparişi çekerek)
                //const siparis = await prisma.siparis.findUnique({ where: { id: siparisId }, select: { tarih: true } });
                //if (siparis) odemeTarihiDate = siparis.tarih;
            }


            // Yeni ödemeyi veritabanına ekle
            const yeniOdeme = await prisma.odeme.create({
                data: {
                    siparisId: siparisId,
                    tutar: tutar,
                    odemeTarihi: odemeTarihiDate,
                    odemeYontemi: odemeYontemi || null,
                    aciklama: aciklama || null,
                }
            });

            console.log(`Sipariş ${siparisId} için yeni ödeme kaydedildi: ID ${yeniOdeme.id}`);
            // Başarılı yanıtı gönder (201 Created)
            return res.status(201).json(yeniOdeme);

        } catch (error) {
            console.error(`❌ POST /api/siparis/${siparisId}/odemeler HATA:`, error);
            let statusCode = 500;
            let message = 'Ödeme kaydedilirken bir hata oluştu.';
            if (error.message.includes('Geçersiz ödeme tarihi')) { statusCode = 400; message = error.message; }
            else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2003') { // Foreign key constraint (siparisId bulunamadı?)
                    statusCode = 404; message = 'Ödeme eklenecek sipariş bulunamadı.';
                } else { message = `Veritabanı hatası: ${error.code}.`; }
            }
            return res.status(statusCode).json({ message: message, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }

    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis/${siparisId}/odemeler`);
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
