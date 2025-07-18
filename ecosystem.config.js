// ===================================================================
// 🚀 PM2 ECOSYSTEM CONFIG - OG Siparis Backend + Webhook
// Backend klasöründen çalışacak şekilde yapılandırıldı
// ===================================================================

module.exports = {
    apps: [
        {
            name: 'og-backend',
            script: './server.js',
            cwd: './',  // backend klasöründeyiz
            instances: 'max',
            exec_mode: 'cluster',
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
                DATABASE_URL: process.env.DATABASE_URL || 'postgresql://ogform:secret@localhost:5433/ogformdb?schema=public',
                JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey123'
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                DATABASE_URL: process.env.DATABASE_URL,
                JWT_SECRET: process.env.JWT_SECRET
            },
            // Performance & Monitoring
            max_memory_restart: '1G',
            autorestart: true,
            watch: false,
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/og-backend-error.log',
            out_file: './logs/og-backend-out.log',
            log_file: './logs/og-backend-combined.log',

            // Graceful shutdown
            kill_timeout: 5000,
            listen_timeout: 8000,

            // Auto-restart policies
            min_uptime: '10s',
            max_restarts: 10,

            // Cron restart (her gece 2'de restart)
            cron_restart: '0 2 * * *'
        },

        {
            name: 'og-webhook',
            script: './webhook-receiver.js',
            cwd: './',  // backend klasöründeyiz
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
                WEBHOOK_PORT: 3001,
                WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || 'your-webhook-secret-here',
                PROJECT_PATH: process.env.PROJECT_PATH || '/home/ogsiparis.com/public_html'
            },
            env_production: {
                NODE_ENV: 'production',
                WEBHOOK_PORT: 3001,
                WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
                PROJECT_PATH: process.env.PROJECT_PATH || '/home/ogsiparis.com/public_html'
            },
            // Performance & Monitoring
            max_memory_restart: '200M',
            autorestart: true,
            watch: false,
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            error_file: './logs/og-webhook-error.log',
            out_file: './logs/og-webhook-out.log',
            log_file: './logs/og-webhook-combined.log',

            // Graceful shutdown
            kill_timeout: 5000,
            listen_timeout: 3000,

            // Auto-restart policies
            min_uptime: '5s',
            max_restarts: 5
        }
    ],

    deploy: {
        production: {
            user: 'root',
            host: 'your-server-ip',
            ref: 'origin/master',
            repo: 'https://github.com/MehmetEminSelek/og.git',
            path: '/home/ogsiparis.com/public_html',
            'pre-deploy-local': '',
            'post-deploy': 'cd backend && npm install --production && cd ../frontend && npm install && npm run build && cd ../backend && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
            'ssh_options': 'StrictHostKeyChecking=no'
        }
    }
}; 