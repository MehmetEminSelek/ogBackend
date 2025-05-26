import prisma from '../../../lib/prisma';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const { operasyonBirimiKod } = req.query;
            let where = {};
            if (operasyonBirimiKod) {
                const op = await prisma.operasyonBirimi.findUnique({ where: { kod: operasyonBirimiKod } });
                if (!op) return res.status(400).json({ message: 'Operasyon birimi bulunamadı.' });
                where.operasyonBirimiId = op.id;
            }
            const stoklar = await prisma.stok.findMany({
                where,
                include: {
                    hammadde: true,
                    yariMamul: true,
                    operasyonBirimi: true
                },
                orderBy: { updatedAt: 'desc' }
            });
            const result = stoklar.map(s => ({
                id: s.id,
                hammadde: s.hammadde ? { ad: s.hammadde.ad, kod: s.hammadde.kod } : null,
                yariMamul: s.yariMamul ? { ad: s.yariMamul.ad, kod: s.yariMamul.kod } : null,
                operasyonBirimi: s.operasyonBirimi ? { ad: s.operasyonBirimi.ad, kod: s.operasyonBirimi.kod } : null,
                miktarGram: s.miktarGram,
                updatedAt: s.updatedAt,
                minimumMiktarGram: s.minimumMiktarGram ?? 0
            }));
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Stoklar listelenirken hata oluştu.', error: error.message });
        }
    }

    if (req.method === 'POST') {
        let user;
        try {
            user = verifyAuth(req);
        } catch (e) {
            return res.status(401).json({ message: 'Yetkisiz.' });
        }
        try {
            const { stokId, miktar, tip } = req.body;
            if (!stokId || !miktar || !['giris', 'cikis'].includes(tip)) {
                return res.status(400).json({ message: 'stokId, miktar ve tip (giris/cikis) zorunludur.' });
            }
            const stok = await prisma.stok.findUnique({ where: { id: stokId } });
            if (!stok) return res.status(404).json({ message: 'Stok kaydı bulunamadı.' });
            let yeniMiktar = tip === 'giris' ? stok.miktarGram + Number(miktar) : stok.miktarGram - Number(miktar);
            if (yeniMiktar < 0) return res.status(400).json({ message: 'Stok miktarı sıfırın altına inemez.' });
            const updated = await prisma.stok.update({ where: { id: stokId }, data: { miktarGram: yeniMiktar } });
            await prisma.stokHareket.create({
                data: {
                    stokId,
                    tip,
                    miktarGram: Number(miktar),
                    aciklama: tip === 'giris' ? 'Manuel giriş' : 'Manuel çıkış',
                    userId: user.id
                }
            });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ message: 'Stok güncellenirken hata oluştu.', error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        let user;
        try {
            user = verifyAuth(req);
        } catch (e) {
            return res.status(401).json({ message: 'Yetkisiz.' });
        }
        try {
            const { stokId, minimumMiktarGram } = req.body;
            if (!stokId || typeof minimumMiktarGram !== 'number') {
                return res.status(400).json({ message: 'stokId ve minimumMiktarGram zorunludur.' });
            }
            const updated = await prisma.stok.update({
                where: { id: stokId },
                data: { minimumMiktarGram }
            });
            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ message: 'Minimum stok güncellenirken hata oluştu.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 