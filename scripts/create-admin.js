const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Admin kullanıcısı için varsayılan bilgiler
        const adminData = {
            email: 'admin@ogsiparis.com',
            password: await bcrypt.hash('Admin123!', 10),
            name: 'Admin',
            role: 'ADMIN',
            isActive: true
        };

        // Kullanıcı var mı kontrol et
        const existingUser = await prisma.user.findUnique({
            where: { email: adminData.email }
        });

        if (existingUser) {
            console.log('Admin kullanıcısı zaten mevcut.');
            return;
        }

        // Admin kullanıcısını oluştur
        const admin = await prisma.user.create({
            data: adminData
        });

        console.log('Admin kullanıcısı başarıyla oluşturuldu:');
        console.log('Email:', admin.email);
        console.log('Şifre: Admin123!');
        console.log('\n⚠️ Lütfen giriş yaptıktan sonra şifrenizi değiştirin!');

    } catch (error) {
        console.error('Admin kullanıcısı oluşturulurken hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser(); 