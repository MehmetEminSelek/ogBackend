// middleware.js - Edge Runtime Compatible
import { NextResponse } from 'next/server';

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