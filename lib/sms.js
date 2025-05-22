// Basit SMS gönderim mock fonksiyonu
export async function sendSMS({ to, message }) {
    // Burada gerçek SMS API entegrasyonu yapılabilir
    console.log(`[SMS] Gönderiliyor: ${to} -> ${message}`);
    // Simülasyon için başarılı yanıt dön
    return { success: true };
} 