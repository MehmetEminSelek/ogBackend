// lib/logger.js - Professional Logging System
import winston from 'winston';
import path from 'path';

const { combine, timestamp, errors, json, colorize, simple, printf } = winston.format;

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        json()
    ),
    transports: [
        // File transports
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 10
        }),
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'audit.log'),
            level: 'info',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: combine(
            colorize(),
            timestamp({ format: 'HH:mm:ss' }),
            consoleFormat
        )
    }));
}

// Specific loggers for different purposes
export const auditLogger = {
    userLogin: (userId, email, ip) => {
        logger.info('User login', {
            event: 'USER_LOGIN',
            userId,
            email,
            ip,
            timestamp: new Date()
        });
    },

    orderCreated: (orderId, userId, amount) => {
        logger.info('Order created', {
            event: 'ORDER_CREATED',
            orderId,
            userId,
            amount,
            timestamp: new Date()
        });
    },

    orderStatusChanged: (orderId, oldStatus, newStatus, userId) => {
        logger.info('Order status changed', {
            event: 'ORDER_STATUS_CHANGED',
            orderId,
            oldStatus,
            newStatus,
            userId,
            timestamp: new Date()
        });
    },

    stockUpdated: (stockId, oldAmount, newAmount, userId) => {
        logger.info('Stock updated', {
            event: 'STOCK_UPDATED',
            stockId,
            oldAmount,
            newAmount,
            userId,
            timestamp: new Date()
        });
    },

    paymentReceived: (orderId, amount, method, userId) => {
        logger.info('Payment received', {
            event: 'PAYMENT_RECEIVED',
            orderId,
            amount,
            method,
            userId,
            timestamp: new Date()
        });
    }
};

export const securityLogger = {
    suspiciousActivity: (userId, activity, ip) => {
        logger.warn('Suspicious activity detected', {
            event: 'SUSPICIOUS_ACTIVITY',
            userId,
            activity,
            ip,
            timestamp: new Date()
        });
    },

    authFailure: (email, ip, reason) => {
        logger.warn('Authentication failure', {
            event: 'AUTH_FAILURE',
            email,
            ip,
            reason,
            timestamp: new Date()
        });
    },

    apiRateLimit: (ip, endpoint) => {
        logger.warn('Rate limit exceeded', {
            event: 'RATE_LIMIT_EXCEEDED',
            ip,
            endpoint,
            timestamp: new Date()
        });
    }
};

export const performanceLogger = {
    slowQuery: (query, duration) => {
        logger.warn('Slow database query', {
            event: 'SLOW_QUERY',
            query,
            duration,
            timestamp: new Date()
        });
    },

    apiResponse: (endpoint, method, duration, statusCode) => {
        logger.info('API response', {
            event: 'API_RESPONSE',
            endpoint,
            method,
            duration,
            statusCode,
            timestamp: new Date()
        });
    }
};

export default logger; 