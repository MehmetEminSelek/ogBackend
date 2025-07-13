import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { kullaniciAdi, sifre } = req.body;
        if (!kullaniciAdi || !sifre) return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur.' });

        // Email veya username ile arama
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: kullaniciAdi },
                    { username: kullaniciAdi }
                ]
            }
        });

        if (!user) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const valid = await bcrypt.compare(sifre, user.password);
        if (!valid) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const token = jwt.sign({
            id: user.id,
            ad: user.ad,
            email: user.email,
            rol: user.rol
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

        // 🔔 Giriş yapan kullanıcı için stok uyarılarını kontrol et
        let stokUyarilari = null;
        try {
            console.log(`📊 ${user.ad} için stok uyarıları kontrol ediliyor...`);
            
            // Kritik stokları bul
            const kritikStoklar = await prisma.material.findMany({
                where: {
                    aktif: true,
                    OR: [
                        { mevcutStok: { lte: 0 } }, // Negatif veya sıfır stok
                        { 
                            AND: [
                                { kritikSeviye: { not: null } },
                                { mevcutStok: { lte: 10 } } // Basit kritik seviye kontrolü
                            ]
                        }
                    ]
                },
                select: {
                    id: true,
                    kod: true,
                    ad: true,
                    mevcutStok: true,
                    kritikSeviye: true,
                    birim: true
                },
                orderBy: {
                    mevcutStok: 'asc'
                },
                take: 10 // İlk 10 kritik stok
            });

            if (kritikStoklar.length > 0) {
                const negatifCount = kritikStoklar.filter(m => m.mevcutStok <= 0).length;
                const dusukCount = kritikStoklar.filter(m => m.mevcutStok > 0).length;
                
                stokUyarilari = {
                    count: kritikStoklar.length,
                    negatifCount,
                    dusukCount,
                    message: negatifCount > 0 
                        ? `${negatifCount} malzemede negatif stok!`
                        : `${dusukCount} malzemede düşük stok!`,
                    samples: kritikStoklar.slice(0, 5), // İlk 5 örnek
                    severity: negatifCount > 0 ? 'critical' : 'warning'
                };
                
                console.log(`⚠️ ${user.ad} için ${kritikStoklar.length} stok uyarısı bulundu`);
            }
        } catch (stokError) {
            console.error('Stok uyarıları kontrol edilemedi:', stokError);
            // Stok uyarısı hatası login'i engellemez
        }

        return res.status(200).json({
            success: true,
            user: { id: user.id, ad: user.ad, email: user.email, rol: user.rol },
            token,
            stokUyarilari // 🔔 Stok uyarıları eklendi
        });
    }

    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 