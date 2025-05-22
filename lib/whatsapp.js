import axios from 'axios';

const WHATSAPP_CONFIG = {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    apiVersion: 'v17.0',
    baseUrl: 'https://graph.facebook.com',
};

export async function sendWhatsApp({ to, message }) {
    try {
        // Telefon numarasını formatlama (WhatsApp formatı: countrycode+number)
        const formattedPhone = formatPhoneNumber(to);

        const url = `${WHATSAPP_CONFIG.baseUrl}/${WHATSAPP_CONFIG.apiVersion}/${WHATSAPP_CONFIG.phoneNumberId}/messages`;

        const data = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: {
                body: message
            }
        };

        const headers = {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
            'Content-Type': 'application/json'
        };

        // Geliştirme modunda sadece log
        if (process.env.NODE_ENV === 'development') {
            console.log('[WhatsApp Mock]', {
                to: formattedPhone,
                message: message
            });
            return { success: true, mock: true };
        }

        // Canlı ortamda gerçek API çağrısı
        const response = await axios.post(url, data, { headers });

        return {
            success: true,
            messageId: response.data.messages?.[0]?.id,
        };
    } catch (error) {
        console.error('[WhatsApp Error]:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
}

function formatPhoneNumber(phone) {
    // Türkiye numarası formatı: 905xxxxxxxxx
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
        phone = phone.substring(1);
    }
    if (!phone.startsWith('90')) {
        phone = '90' + phone;
    }
    return phone;
} 