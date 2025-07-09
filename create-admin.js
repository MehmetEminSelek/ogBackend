// create-admin.js
// Admin kullanıcı oluşturma script'i

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        console.log('🔐 Admin kullanıcısı oluşturuluyor...\n');

        // Mevcut admin kullanıcıları kontrol et
        const adminUsers = await prisma.user.findMany({
            where: {
                rol: 'GENEL_MUDUR'
            },
            select: {
                id: true,
                ad: true,
                email: true,
                rol: true,
                createdAt: true
            }
        });

        if (adminUsers.length > 0) {
            console.log('✅ Mevcut admin kullanıcıları:');
            adminUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.ad} (${user.email}) - ID: ${user.id}`);
            });
            console.log('\n💡 Admin kullanıcısı zaten mevcut.');
            return;
        }

        // Yeni admin kullanıcı oluştur
        const newPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const newAdmin = await prisma.user.create({
            data: {
                ad: 'Admin',
                soyad: 'Yönetici',
                email: 'admin@og.com',
                username: 'admin',
                password: hashedPassword,
                rol: 'GENEL_MUDUR',
                aktif: true,
                gunlukUcret: 0,
                sgkDurumu: 'VAR',
                girisYili: new Date().getFullYear()
            }
        });

        console.log('✅ Yeni admin kullanıcısı oluşturuldu:');
        console.log(`   ID: ${newAdmin.id}`);
        console.log(`   Ad: ${newAdmin.ad} ${newAdmin.soyad}`);
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Username: ${newAdmin.username}`);
        console.log(`   Şifre: ${newPassword}`);
        console.log(`   Rol: ${newAdmin.rol}\n`);

        console.log('🎉 İşlem tamamlandı!');
        console.log('💡 Giriş yaptıktan sonra şifrenizi değiştirmeyi unutmayın.');

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
createAdmin(); 