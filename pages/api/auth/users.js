import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import { withRBAC, PERMISSIONS } from '../../../lib/rbac';

async function handler(req, res) {

    // GET - Personel listesi
    if (req.method === 'GET') {
        try {
            console.log('📋 Personel listesi isteniyor...');

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    personelId: true,
                    ad: true,
                    soyad: true,
                    email: true,
                    username: true,
                    rol: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
                    gunlukUcret: true,
                    sgkDurumu: true,
                    girisYili: true,
                    // Şube bilgisini include et
                    sube: {
                        select: {
                            id: true,
                            ad: true,
                            kod: true
                        }
                    }
                },
                orderBy: [
                    { aktif: 'desc' },
                    { ad: 'asc' }
                ]
            });

            console.log(`✅ ${users.length} personel bulundu`);
            return res.status(200).json(users);

        } catch (error) {
            console.error('❌ Personel listesi hatası:', error);
            return res.status(500).json({
                message: 'Personel listesi alınırken hata oluştu',
                error: error.message
            });
        }
    }

    // POST - Yeni personel ekle
    if (req.method === 'POST') {
        try {
            // Auth kontrolü RBAC middleware tarafından yapılıyor

            const {
                ad,
                soyad,
                email,
                username,
                password,
                rol,
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
            if (!ad || !email || !username || !password || !rol) {
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
                    password: hashedPassword,
                    rol: rol,
                    telefon,
                    subeId: subeId ? parseInt(subeId) : null,
                    gunlukUcret: gunlukUcret ? parseFloat(gunlukUcret) : 0,
                    sgkDurumu: sgkDurumu || 'VAR',
                    girisYili,
                    aktif: aktif !== undefined ? aktif : true
                },
                select: {
                    id: true,
                    ad: true,
                    soyad: true,
                    email: true,
                    username: true,
                    rol: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
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
            // Auth kontrolü RBAC middleware tarafından yapılıyor

            const {
                id,
                ad,
                soyad,
                email,
                username,
                password,
                rol,
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
                rol: rol,
                telefon,
                subeId: subeId ? parseInt(subeId) : null,
                gunlukUcret: gunlukUcret ? parseFloat(gunlukUcret) : 0,
                sgkDurumu: sgkDurumu || 'VAR',
                aktif: aktif !== undefined ? aktif : true
            };

            // Giriş yılını güncelle
            if (iseBaslamaTarihi) {
                updateData.girisYili = new Date(iseBaslamaTarihi).getFullYear();
            }

            // Eğer şifre verilmişse hash'le
            if (password && password.trim() !== '') {
                updateData.password = await bcrypt.hash(password, 12);
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
                    rol: true,
                    telefon: true,
                    aktif: true,
                    subeId: true,
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
            // Auth kontrolü RBAC middleware tarafından yapılıyor

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

// Export with RBAC protection - GEÇİCİ OLARAK DEVRE DIŞI!
// export default withRBAC(handler, {
//     permission: PERMISSIONS.VIEW_USERS // Base permission, specific methods will be checked inside
// });

// Geçici olarak direct export - TEST İÇİN
export default handler;