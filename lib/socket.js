// lib/socket.js - Real-time Socket.IO Server
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],
            methods: ["GET", "POST", "PUT", "DELETE"],
            credentials: true
        }
    });

    // Socket authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.rol;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

        // Join user to their role-based room
        socket.join(`role_${socket.userRole}`);
        socket.join(`user_${socket.userId}`);

        // Real-time sipariş takibi
        socket.on('join_order_room', (orderId) => {
            socket.join(`order_${orderId}`);
            console.log(`User ${socket.userId} joined order room: ${orderId}`);
        });

        // Real-time stok takibi
        socket.on('join_stock_room', () => {
            socket.join('stock_updates');
            console.log(`User ${socket.userId} joined stock updates room`);
        });

        // Kargo durumu takibi
        socket.on('join_cargo_room', () => {
            socket.join('cargo_updates');
            console.log(`User ${socket.userId} joined cargo updates room`);
        });

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Real-time notification helpers
export const notifyOrderUpdate = (orderId, data) => {
    if (io) {
        io.to(`order_${orderId}`).emit('order_updated', {
            orderId,
            timestamp: new Date(),
            ...data
        });
        // Admin'lere de bildir
        io.to('role_GENEL_MUDUR').emit('order_notification', {
            type: 'order_update',
            orderId,
            data
        });
    }
};

export const notifyStockUpdate = (stockData) => {
    if (io) {
        io.to('stock_updates').emit('stock_updated', {
            timestamp: new Date(),
            ...stockData
        });
        // Low stock alerts
        if (stockData.isLowStock) {
            io.to('role_GENEL_MUDUR').emit('low_stock_alert', stockData);
        }
    }
};

export const notifyCargoUpdate = (cargoData) => {
    if (io) {
        io.to('cargo_updates').emit('cargo_updated', {
            timestamp: new Date(),
            ...cargoData
        });
    }
};

export const notifyNewOrder = (orderData) => {
    if (io) {
        io.to('role_GENEL_MUDUR').emit('new_order', {
            timestamp: new Date(),
            ...orderData
        });
    }
}; 