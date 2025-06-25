import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // GET - Personel listesi
    if (req.method === 'GET') {
        try {
            // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK DEVRE DIŞI
            // let user;
            // try {
            //     user = verifyAuth(req);
            //     if (!['ADMIN', 'MANAGER'].includes(user.role)) {
            //         return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
            //     }
            // } catch (e) {
            //     return res.status(401).json({ message: 'Yetkisiz erişim.' });
            // }

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    email: true,
                    username: true,
                    role: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
                    sube: {
                        select: { ad: true, kod: true }
                    },
                    bolum: true,
                    unvan: true,
                    iseBaslamaTarihi: true,
                    gunlukUcret: true,
                    sgkDurumu: true,
                    girisYili: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { createdAt: 'desc' }
            });

            return res.status(200).json(users);
        } catch (error) {
            console.error('Personel GET hatası:', error);
            return res.status(500).json({
                message: 'Personel verileri alınırken hata oluştu.',
                error: error.message
            });
        }
    }

    // POST - Yeni personel ekle
    if (req.method === 'POST') {
        try {
            // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI
            // let currentUser;
            // try {
            //     currentUser = verifyAuth(req);
            //     if (!['ADMIN', 'MANAGER'].includes(currentUser.role)) {
            //         return res.status(403).json({ message: 'Personel ekleme yetkiniz yok.' });
            //     }
            // } catch (e) {
            //     return res.status(401).json({ message: 'Yetkisiz erişim.' });
            // }

            const {
                ad,
                soyad,
                email,
                username,
                password,
                role,
                telefon,
                subeId,
                bolum,
                unvan,
                iseBaslamaTarihi,
                gunlukUcret,
                sgkDurumu,
                aktif
            } = req.body;

            // Zorunlu alanlar kontrolü
            if (!ad || !email || !username || !password || !role) {
                return res.status(400).json({
                    message: 'Ad, email, kullanıcı adı, şifre ve rol zorunludur.'
                });
            }

            // Email uniqueness kontrolü
            const existingEmail = await prisma.user.findUnique({
                where: { email }
            });
            if (existingEmail) {
                return res.status(400).json({
                    message: 'Bu email adresi zaten kullanımda.'
                });
            }

            // Username uniqueness kontrolü
            const existingUsername = await prisma.user.findUnique({
                where: { username }
            });
            if (existingUsername) {
                return res.status(400).json({
                    message: 'Bu kullanıcı adı zaten kullanımda.'
                });
            }

            // Şifreyi hash'le
            const hashedPassword = await bcrypt.hash(password, 12);

            // Giriş yılını hesapla
            const girisYili = iseBaslamaTarihi ? new Date(iseBaslamaTarihi).getFullYear() : new Date().getFullYear();

            // Personeli oluştur
            const newUser = await prisma.user.create({
                data: {
                    ad,
                    soyad,
                    email,
                    username,
                    passwordHash: hashedPassword,
                    role,
                    telefon,
                    subeId: subeId ? parseInt(subeId) : null,
                    bolum,
                    unvan,
                    iseBaslamaTarihi: iseBaslamaTarihi ? new Date(iseBaslamaTarihi) : null,
                    gunlukUcret: gunlukUcret ? parseFloat(gunlukUcret) : 0,
                    sgkDurumu: sgkDurumu || 'VAR',
                    girisYili,
                    aktif: aktif !== undefined ? aktif : true,
                    createdBy: 1 // Geçici olarak admin user ID
                },
                select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    email: true,
                    username: true,
                    role: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
                    sube: {
                        select: { ad: true, kod: true }
                    },
                    bolum: true,
                    unvan: true,
                    iseBaslamaTarihi: true,
                    gunlukUcret: true,
                    sgkDurumu: true,
                    girisYili: true,
                    createdAt: true
                }
            });

            return res.status(201).json(newUser);
        } catch (error) {
            console.error('Personel POST hatası:', error);
            return res.status(500).json({
                message: 'Personel eklenirken hata oluştu.',
                error: error.message
            });
        }
    }

    // PUT - Personel güncelle
    if (req.method === 'PUT') {
        try {
            // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI
            // let currentUser;
            // try {
            //     currentUser = verifyAuth(req);
            //     if (!['ADMIN', 'MANAGER'].includes(currentUser.role)) {
            //         return res.status(403).json({ message: 'Personel güncelleme yetkiniz yok.' });
            //     }
            // } catch (e) {
            //     return res.status(401).json({ message: 'Yetkisiz erişim.' });
            // }

            const {
                id,
                ad,
                soyad,
                email,
                username,
                password,
                role,
                telefon,
                subeId,
                bolum,
                unvan,
                iseBaslamaTarihi,
                gunlukUcret,
                sgkDurumu,
                aktif
            } = req.body;

            if (!id) {
                return res.status(400).json({ message: 'Personel ID zorunludur.' });
            }

            // Güncellenecek veriyi hazırla
            const updateData = {
                ad,
                soyad,
                email,
                username,
                role,
                telefon,
                subeId: subeId ? parseInt(subeId) : null,
                bolum,
                unvan,
                iseBaslamaTarihi: iseBaslamaTarihi ? new Date(iseBaslamaTarihi) : null,
                gunlukUcret: gunlukUcret ? parseFloat(gunlukUcret) : 0,
                sgkDurumu: sgkDurumu || 'VAR',
                aktif: aktif !== undefined ? aktif : true,
                updatedBy: 1 // Geçici olarak admin user ID
            };

            // Giriş yılını güncelle
            if (iseBaslamaTarihi) {
                updateData.girisYili = new Date(iseBaslamaTarihi).getFullYear();
            }

            // Eğer şifre verilmişse hash'le
            if (password && password.trim() !== '') {
                updateData.passwordHash = await bcrypt.hash(password, 12);
            }

            // Email uniqueness kontrolü (kendi kaydı hariç)
            if (email) {
                const existingEmail = await prisma.user.findFirst({
                    where: {
                        email,
                        id: { not: parseInt(id) }
                    }
                });
                if (existingEmail) {
                    return res.status(400).json({
                        message: 'Bu email adresi zaten kullanımda.'
                    });
                }
            }

            // Username uniqueness kontrolü (kendi kaydı hariç)
            if (username) {
                const existingUsername = await prisma.user.findFirst({
                    where: {
                        username,
                        id: { not: parseInt(id) }
                    }
                });
                if (existingUsername) {
                    return res.status(400).json({
                        message: 'Bu kullanıcı adı zaten kullanımda.'
                    });
                }
            }

            const updatedUser = await prisma.user.update({
                where: { id: parseInt(id) },
                data: updateData,
                select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    email: true,
                    username: true,
                    role: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
                    sube: {
                        select: { ad: true, kod: true }
                    },
                    bolum: true,
                    unvan: true,
                    iseBaslamaTarihi: true,
                    gunlukUcret: true,
                    sgkDurumu: true,
                    girisYili: true,
                    updatedAt: true
                }
            });

            return res.status(200).json(updatedUser);
        } catch (error) {
            console.error('Personel PUT hatası:', error);
            return res.status(500).json({
                message: 'Personel güncellenirken hata oluştu.',
                error: error.message
            });
        }
    }

    // DELETE - Personel sil
    if (req.method === 'DELETE') {
        try {
            // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI
            // let currentUser;
            // try {
            //     currentUser = verifyAuth(req);
            //     if (!['ADMIN'].includes(currentUser.role)) {
            //         return res.status(403).json({ message: 'Personel silme yetkiniz yok.' });
            //     }
            // } catch (e) {
            //     return res.status(401).json({ message: 'Yetkisiz erişim.' });
            // }

            const { id } = req.query;

            if (!id) {
                return res.status(400).json({ message: 'Personel ID zorunludur.' });
            }

            // Personeli sil
            await prisma.user.delete({
                where: { id: parseInt(id) }
            });

            return res.status(200).json({ message: 'Personel başarıyla silindi.' });
        } catch (error) {
            console.error('Personel DELETE hatası:', error);
            return res.status(500).json({
                message: 'Personel silinirken hata oluştu.',
                error: error.message
            });
        }
    }

    return res.status(405).json({ message: 'İzin verilmeyen HTTP metodu.' });
}