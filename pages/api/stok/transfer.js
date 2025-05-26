import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        let user;
        try {
            user = verifyAuth(req);
        } catch (e) {
            return res.status(401).json({ message: 'Yetkisiz.' });
        }
        try {
            const { kaynakStokId, hedefStokId, miktarGram, aciklama } = req.body;
            if (!kaynakStokId || !hedefStokId || !miktarGram || miktarGram <= 0) {
                return res.status(400).json({ message: 'kaynakStokId, hedefStokId, miktarGram > 0 zorunludur.' });
            }
            if (kaynakStokId === hedefStokId) {
                return res.status(400).json({ message: 'Kaynak ve hedef stok aynı olamaz.' });
            }
            const [kaynak, hedef] = await Promise.all([
                prisma.stok.findUnique({ where: { id: kaynakStokId } }),
                prisma.stok.findUnique({ where: { id: hedefStokId } })
            ]);
            if (!kaynak || !hedef) return res.status(404).json({ message: 'Kaynak veya hedef stok bulunamadı.' });
            // Aynı hammadde veya aynı yarı mamul olmalı
            if (
                (kaynak.hammaddeId && kaynak.hammaddeId !== hedef.hammaddeId) ||
                (kaynak.yariMamulId && kaynak.yariMamulId !== hedef.yariMamulId)
            ) {
                return res.status(400).json({ message: 'Kaynak ve hedef stok aynı ürün olmalı.' });
            }
            if (kaynak.miktarGram < miktarGram) {
                return res.status(400).json({ message: 'Kaynak stokta yeterli miktar yok.' });
            }
            const result = await prisma.$transaction(async (tx) => {
                const updatedKaynak = await tx.stok.update({
                    where: { id: kaynakStokId },
                    data: { miktarGram: { decrement: miktarGram } }
                });
                const updatedHedef = await tx.stok.update({
                    where: { id: hedefStokId },
                    data: { miktarGram: { increment: miktarGram } }
                });
                const transfer = await tx.stokTransfer.create({
                    data: {
                        kaynakStokId,
                        hedefStokId,
                        miktarGram,
                        aciklama,
                        userId: user.id
                    }
                });
                await tx.stokHareket.createMany({
                    data: [
                        { stokId: kaynakStokId, tip: 'transfer', miktarGram, aciklama: aciklama || 'Transfer (Çıkış)', userId: user.id },
                        { stokId: hedefStokId, tip: 'transfer', miktarGram, aciklama: aciklama || 'Transfer (Giriş)', userId: user.id }
                    ]
                });
                return { transfer, updatedKaynak, updatedHedef };
            });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Transfer sırasında hata oluştu.', error: error.message });
        }
    }

    if (req.method === 'GET') {
        try {
            const transfers = await prisma.stokTransfer.findMany({
                orderBy: { createdAt: 'desc' },
                take: 100,
                include: {
                    kaynakStok: { include: { hammadde: true, yariMamul: true, operasyonBirimi: true } },
                    hedefStok: { include: { hammadde: true, yariMamul: true, operasyonBirimi: true } }
                }
            });
            return res.status(200).json(transfers);
        } catch (error) {
            return res.status(500).json({ message: 'Transfer geçmişi alınamadı.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 