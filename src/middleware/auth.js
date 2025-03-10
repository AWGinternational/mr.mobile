// src/middleware/auth.js
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const config = require('../config/config');
const db = require('../models/db');

// Session store configuration
const sessionStoreConfig = {
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database,
    clearExpired: true,
    checkExpirationInterval: 900000, // Clean up expired sessions every 15 minutes
    expiration: 86400000, // Session expiration (24 hours)
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

// Create session store function
const createSessionStore = (pool) => {
    return new MySQLStore(sessionStoreConfig, pool);
};

// Create session middleware function
const createSessionMiddleware = (store) => {
    return session({
        store: store,
        secret: config.session.secret,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    });
};

// Authentication middleware
const authenticateUser = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ error: 'Please log in to continue' });
    }
    next();
};

// Resource ownership middleware
const checkOwnership = (resourceType) => async (req, res, next) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.session.user.id;
        const resourceId = req.params.id;

        if (!resourceId || !userId) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        // Get database connection
        const pool = db.getPool();

        // Query to check ownership based on resource type
        const queries = {
            sales: 'SELECT user_id FROM sales WHERE id = ?',
            inventory: 'SELECT user_id FROM inventory WHERE id = ?',
            products: 'SELECT user_id FROM products WHERE id = ?',
            suppliers: 'SELECT user_id FROM suppliers WHERE id = ?'  // Add this line
            // Add other resource types as needed
        };

        const query = queries[resourceType];
        if (!query) {
            return res.status(400).json({ error: 'Invalid resource type' });
        }

        const [rows] = await pool.query(query, [resourceId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        if (rows[0].user_id !== userId && !req.session.user.is_admin) {
            return res.status(403).json({ error: 'Unauthorized access to this resource' });
        }

        next();
    } catch (error) {
        console.error('Error checking resource ownership:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (!req.session?.user?.is_admin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = {
    createSessionStore,
    createSessionMiddleware,
    authenticateUser,
    checkOwnership,
    isAdmin
};