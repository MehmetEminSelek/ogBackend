import { verifyAuth } from './auth.js';

// Role hierarchy - higher number = higher privileges
export const ROLES = {
    PERSONEL: 1,
    SUBE_MUDURU: 2,
    GENEL_MUDUR: 3  // En üst rol
};

// Permission definitions
export const PERMISSIONS = {
    // User management
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    UPDATE_USERS: 'update_users',
    DELETE_USERS: 'delete_users',

    // Product management
    VIEW_PRODUCTS: 'view_products',
    CREATE_PRODUCTS: 'create_products',
    UPDATE_PRODUCTS: 'update_products',
    DELETE_PRODUCTS: 'delete_products',

    // Order management
    VIEW_ORDERS: 'view_orders',
    CREATE_ORDERS: 'create_orders',
    UPDATE_ORDERS: 'update_orders',
    DELETE_ORDERS: 'delete_orders',

    // Stock management
    VIEW_STOCK: 'view_stock',
    UPDATE_STOCK: 'update_stock',
    TRANSFER_STOCK: 'transfer_stock',

    // Financial operations
    VIEW_FINANCIAL: 'view_financial',
    UPDATE_PRICES: 'update_prices',
    VIEW_REPORTS: 'view_reports',

    // Customer management
    VIEW_CUSTOMERS: 'view_customers',
    CREATE_CUSTOMERS: 'create_customers',
    UPDATE_CUSTOMERS: 'update_customers',
    DELETE_CUSTOMERS: 'delete_customers',

    // Material management
    VIEW_MATERIALS: 'view_materials',
    CREATE_MATERIALS: 'create_materials',
    UPDATE_MATERIALS: 'update_materials',
    DELETE_MATERIALS: 'delete_materials',

    // Recipe management
    VIEW_RECIPES: 'view_recipes',
    CREATE_RECIPES: 'create_recipes',
    UPDATE_RECIPES: 'update_recipes',
    DELETE_RECIPES: 'delete_recipes',

    // Admin operations
    ADMIN_DASHBOARD: 'admin_dashboard',
    SYSTEM_CONFIG: 'system_config',
    EXCEL_OPERATIONS: 'excel_operations'
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
    [ROLES.PERSONEL]: [
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.CREATE_ORDERS,
        PERMISSIONS.UPDATE_ORDERS,
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.VIEW_STOCK
    ],

    [ROLES.SUBE_MUDURU]: [
        // All PERSONEL permissions plus:
        ...ROLE_PERMISSIONS?.[ROLES.PERSONEL] || [],
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.CREATE_USERS,
        PERMISSIONS.UPDATE_USERS,
        PERMISSIONS.DELETE_ORDERS,
        PERMISSIONS.UPDATE_STOCK,
        PERMISSIONS.TRANSFER_STOCK,
        PERMISSIONS.VIEW_FINANCIAL,
        PERMISSIONS.UPDATE_PRICES,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.CREATE_CUSTOMERS,
        PERMISSIONS.UPDATE_CUSTOMERS,
        PERMISSIONS.VIEW_MATERIALS,
        PERMISSIONS.UPDATE_MATERIALS,
        PERMISSIONS.VIEW_RECIPES,
        PERMISSIONS.UPDATE_RECIPES
    ],

    [ROLES.GENEL_MUDUR]: [
        // All permissions - top level role
        ...Object.values(PERMISSIONS)
    ]
};

// Fix the recursive reference issue
ROLE_PERMISSIONS[ROLES.SUBE_MUDURU] = [
    ...ROLE_PERMISSIONS[ROLES.PERSONEL],
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USERS,
    PERMISSIONS.UPDATE_USERS,
    PERMISSIONS.DELETE_ORDERS,
    PERMISSIONS.UPDATE_STOCK,
    PERMISSIONS.TRANSFER_STOCK,
    PERMISSIONS.VIEW_FINANCIAL,
    PERMISSIONS.UPDATE_PRICES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_CUSTOMERS,
    PERMISSIONS.UPDATE_CUSTOMERS,
    PERMISSIONS.VIEW_MATERIALS,
    PERMISSIONS.UPDATE_MATERIALS,
    PERMISSIONS.VIEW_RECIPES,
    PERMISSIONS.UPDATE_RECIPES
];

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role) {
    return ROLES[role] || 0;
}

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole, permission) {
    const roleLevel = getRoleLevel(userRole);
    const rolePermissions = ROLE_PERMISSIONS[roleLevel] || [];
    return rolePermissions.includes(permission);
}

/**
 * Check if user role is higher than or equal to required role
 */
export function hasRoleOrHigher(userRole, requiredRole) {
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = getRoleLevel(requiredRole);
    return userLevel >= requiredLevel;
}

/**
 * Main RBAC middleware function
 */
export function requireAuth(options = {}) {
    return function (req, res, next) {
        try {
            // Verify JWT token
            const user = verifyAuth(req);

            // Attach user to request
            req.user = user;

            // Check if specific role is required
            if (options.role) {
                if (!hasRoleOrHigher(user.rol, options.role)) {
                    return res.status(403).json({
                        message: 'Bu işlem için yetkiniz yok.',
                        required: options.role,
                        current: user.rol
                    });
                }
            }

            // Check if specific permission is required
            if (options.permission) {
                if (!hasPermission(user.rol, options.permission)) {
                    return res.status(403).json({
                        message: 'Bu işlem için gerekli izniniz yok.',
                        required: options.permission,
                        role: user.rol
                    });
                }
            }

            // Check if multiple permissions are required (all must be satisfied)
            if (options.permissions && Array.isArray(options.permissions)) {
                const missingPermissions = options.permissions.filter(
                    permission => !hasPermission(user.rol, permission)
                );

                if (missingPermissions.length > 0) {
                    return res.status(403).json({
                        message: 'Bu işlem için gerekli izinleriniz yok.',
                        missing: missingPermissions,
                        role: user.rol
                    });
                }
            }

            next();

        } catch (error) {
            return res.status(401).json({
                message: 'Geçersiz veya eksik yetkilendirme.',
                error: error.message
            });
        }
    };
}

/**
 * Helper function for API routes - no middleware support
 */
export function checkAuth(req, options = {}) {
    const user = verifyAuth(req);

    // Check role requirement
    if (options.role && !hasRoleOrHigher(user.rol, options.role)) {
        throw new Error(`Bu işlem için ${options.role} yetkisi gerekli. Mevcut yetki: ${user.rol}`);
    }

    // Check permission requirement
    if (options.permission && !hasPermission(user.rol, options.permission)) {
        throw new Error(`Bu işlem için ${options.permission} izni gerekli.`);
    }

    // Check multiple permissions
    if (options.permissions && Array.isArray(options.permissions)) {
        const missingPermissions = options.permissions.filter(
            permission => !hasPermission(user.rol, permission)
        );

        if (missingPermissions.length > 0) {
            throw new Error(`Bu işlem için şu izinler gerekli: ${missingPermissions.join(', ')}`);
        }
    }

    return user;
}

/**
 * API route wrapper with RBAC - TEST ORTAMI İÇİN DEVRE DIŞI
 */
export function withRBAC(handler, options = {}) {
    return async function (req, res) {
        // Set CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        // TEST ORTAMI: Authentication bypass - varsayılan kullanıcı ata
        req.user = {
            id: 1,
            personelId: 'P001',
            ad: 'Test',
            soyad: 'User',
            rol: 'GENEL_MUDUR', // En yüksek yetki ver
            email: 'test@test.com'
        };

        console.log('🔧 TEST MODE: Authentication bypassed for', req.url);

        try {
            // Call the actual handler
            return await handler(req, res);

        } catch (error) {
            console.error('Handler Error:', error.message);
            return res.status(500).json({
                message: 'Server error occurred.',
                error: error.message
            });
        }
    };
}

/**
 * Page-level permissions mapping
 */
export const PAGE_PERMISSIONS = {
    // Auth pages
    '/api/auth/users': {
        GET: { permission: PERMISSIONS.VIEW_USERS },
        POST: { permission: PERMISSIONS.CREATE_USERS },
        PUT: { permission: PERMISSIONS.UPDATE_USERS },
        DELETE: { permission: PERMISSIONS.DELETE_USERS }
    },

    // Product pages
    '/api/urunler': {
        GET: { permission: PERMISSIONS.VIEW_PRODUCTS },
        POST: { permission: PERMISSIONS.CREATE_PRODUCTS },
        PUT: { permission: PERMISSIONS.UPDATE_PRODUCTS },
        DELETE: { permission: PERMISSIONS.DELETE_PRODUCTS }
    },

    // Order pages
    '/api/siparis': {
        GET: { permission: PERMISSIONS.VIEW_ORDERS },
        POST: { permission: PERMISSIONS.CREATE_ORDERS },
        PUT: { permission: PERMISSIONS.UPDATE_ORDERS },
        DELETE: { permission: PERMISSIONS.DELETE_ORDERS }
    },

    // Stock pages
    '/api/stok': {
        GET: { permission: PERMISSIONS.VIEW_STOCK },
        POST: { permission: PERMISSIONS.UPDATE_STOCK },
        PUT: { permission: PERMISSIONS.UPDATE_STOCK }
    },

    // Material pages
    '/api/materials': {
        GET: { permission: PERMISSIONS.VIEW_MATERIALS },
        POST: { permission: PERMISSIONS.CREATE_MATERIALS },
        PUT: { permission: PERMISSIONS.UPDATE_MATERIALS },
        DELETE: { permission: PERMISSIONS.DELETE_MATERIALS }
    },

    // Customer pages
    '/api/cari': {
        GET: { permission: PERMISSIONS.VIEW_CUSTOMERS },
        POST: { permission: PERMISSIONS.CREATE_CUSTOMERS },
        PUT: { permission: PERMISSIONS.UPDATE_CUSTOMERS },
        DELETE: { permission: PERMISSIONS.DELETE_CUSTOMERS }
    },

    // Recipe pages
    '/api/receteler': {
        GET: { permission: PERMISSIONS.VIEW_RECIPES },
        POST: { permission: PERMISSIONS.CREATE_RECIPES },
        PUT: { permission: PERMISSIONS.UPDATE_RECIPES },
        DELETE: { permission: PERMISSIONS.DELETE_RECIPES }
    },

    // Financial pages
    '/api/fiyatlar': {
        GET: { permission: PERMISSIONS.VIEW_FINANCIAL },
        POST: { permission: PERMISSIONS.UPDATE_PRICES },
        PUT: { permission: PERMISSIONS.UPDATE_PRICES },
        DELETE: { permission: PERMISSIONS.UPDATE_PRICES }
    },

    // Report pages
    '/api/satis-raporu': {
        GET: { permission: PERMISSIONS.VIEW_REPORTS }
    },

    '/api/crm-raporlama': {
        GET: { permission: PERMISSIONS.VIEW_REPORTS }
    },

    // Admin pages
    '/api/excel': {
        GET: { permission: PERMISSIONS.EXCEL_OPERATIONS },
        POST: { permission: PERMISSIONS.EXCEL_OPERATIONS }
    }
};

export default {
    ROLES,
    PERMISSIONS,
    ROLE_PERMISSIONS,
    requireAuth,
    checkAuth,
    withRBAC,
    hasPermission,
    hasRoleOrHigher,
    getRoleLevel,
    PAGE_PERMISSIONS
}; 