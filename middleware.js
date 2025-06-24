// middleware.js - Edge Runtime Compatible
import { NextResponse } from 'next/server';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';

// Main middleware function for Next.js (Edge Runtime)
export function middleware(request) {
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
}

export const config = {
    matcher: '/api/:path*'
};

// Rate limiting - API isteklerini sınırla
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum 100 istek
    message: {
        error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: '15 dakika'
    },
    standardHeaders: true, // Rate limit bilgilerini header'larda döndür
    legacyHeaders: false, // Eski header formatını kullanma
});

// Özel rate limiter - Login için daha sıkı
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // IP başına maksimum 5 login denemesi
    message: {
        error: 'Çok fazla login denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
        retryAfter: '15 dakika'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// CORS ayarları
export const corsOptions = {
    origin: function (origin, callback) {
        // Development ortamında tüm origin'lere izin ver
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }

        // Production'da sadece ogsiparis.com domain'ine izin ver
        const allowedOrigins = [
            'https://ogsiparis.com',
            'https://www.ogsiparis.com',
            'http://localhost:5173', // Development için
            'http://localhost:3000'  // Development için
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy violation'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Güvenlik middleware'i
export const securityMiddleware = [
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"]
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        noSniff: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }),
    compression({
        level: 6,
        threshold: 1024,
        filter: (req, res) => {
            if (req.headers['x-no-compression']) {
                return false;
            }
            return compression.filter(req, res);
        }
    }),
    cors(corsOptions)
];

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;

        if (res.statusCode >= 400) {
            console.error(`❌ ${logMessage}`);
        } else {
            console.log(`✅ ${logMessage}`);
        }
    });

    next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Global Error Handler:', err);

    // CORS hatası
    if (err.message === 'CORS policy violation') {
        return res.status(403).json({
            error: 'CORS policy violation',
            message: 'Bu origin\'den istek gönderilmesine izin verilmiyor.'
        });
    }

    // Rate limit hatası
    if (err.status === 429) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: err.message,
            retryAfter: err.headers?.['retry-after']
        });
    }

    // Prisma hatası
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Duplicate entry',
            message: 'Bu kayıt zaten mevcut.'
        });
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Record not found',
            message: 'Kayıt bulunamadı.'
        });
    }

    // Genel hata
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Sunucu hatası oluştu';

    res.status(statusCode).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? message : 'Sunucu hatası oluştu',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

// Response cache middleware (basit cache)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export const responseCache = (duration = CACHE_DURATION) => {
    return (req, res, next) => {
        // Sadece GET istekleri için cache
        if (req.method !== 'GET') {
            return next();
        }

        const key = `${req.originalUrl}-${JSON.stringify(req.query)}`;
        const cached = cache.get(key);

        if (cached && Date.now() - cached.timestamp < duration) {
            return res.json(cached.data);
        }

        // Orijinal send metodunu sakla
        const originalSend = res.json;

        // Send metodunu override et
        res.json = function (data) {
            // Cache'e kaydet
            cache.set(key, {
                data,
                timestamp: Date.now()
            });

            // Orijinal send metodunu çağır
            return originalSend.call(this, data);
        };

        next();
    };
};

// Cache temizleme (her 10 dakikada bir)
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            cache.delete(key);
        }
    }
}, 10 * 60 * 1000);

export default {
    apiLimiter,
    loginLimiter,
    corsOptions,
    securityMiddleware,
    requestLogger,
    errorHandler,
    responseCache
};