// middleware.js (veya middleware.ts eğer TypeScript kullanıyorsanız)
import { NextResponse } from 'next/server';

export function middleware(req) {
    const origin = req.headers.get('origin') || '*';

    // 1. Sadece OPTIONS (preflight) isteklerini özel olarak ele al
    if (req.method === 'OPTIONS') {
        console.log('Middleware: OPTIONS isteği geldi, CORS yanıtı dönülüyor.');
        return new Response(null, {
            status: 204, // veya 200
            headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Max-Age': '86400', // Preflight yanıtını 1 gün cache'le
            },
        });
    }

    // 2. Diğer tüm isteklerin (GET, POST vb.) hedefine gitmesine izin ver
    // İsteğe bağlı olarak burada gelen yanıta CORS başlıkları eklenebilir ama
    // genellikle API route'ların kendi başlıklarını eklemesi daha iyidir.
    // Şimdilik sadece devam etmesine izin veriyoruz:
    console.log(`Middleware: ${req.method} isteği ${req.nextUrl.pathname} hedefine yönlendiriliyor.`);
    return NextResponse.next(); // <<<--- Bu satır çok önemli! İsteğin devam etmesini sağlar.
}

// 3. Middleware'in hangi yollarda (path) çalışacağını belirtmek önemlidir.
// Bu, gereksiz yere tüm sayfa isteklerini yakalamasını önler.
export const config = {
    // Sadece /api/ ile başlayan yollarda bu middleware çalışsın:
    matcher: '/api/:path*',
};