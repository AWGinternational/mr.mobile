const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const compression = require('compression'); // For response compression
const rateLimit = require('express-rate-limit');

// Import routes
const productRoutes = require('./src/routes/productRoutes');
const salesRoutes = require('./src/routes/salesRoutes');
const supplierRoutes = require('./src/routes/supplierRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const userRoutes = require('./src/routes/userRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const giveloanRoutes = require('./src/routes/giveloanRoutes');
const receiveloanRoutes = require('./src/routes/receiveloanRoutes');
const commissionRoutes = require('./src/routes/commissionRoutes');
const closingRoutes = require('./src/routes/closingRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const settingRoutes = require('./src/routes/settingRoutes');
const adminRoutes = require('./src/routes/adminRoutes08');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware Configuration
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "fonts.gstatic.com", "cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "cdnjs.cloudflare.com"],
            connectSrc: ["'self'"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'c9e1f0ae837b4a29268b4d0f1261f7f8e93b2ce6aae94827f8947e4a59c894a6',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 60 * 60 * 1000, // 1 hour
    },
}));

// Response compression
app.use(compression());

// CORS
app.use(cors());

// JSON and URL-encoded body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true,
}));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path} - Body:`, req.body);
        next();
    });
}

// Route Grouping
const apiRoutes = express.Router();
apiRoutes.use('/products', productRoutes);
apiRoutes.use('/sales', salesRoutes);
apiRoutes.use('/inventory', inventoryRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/commissions', commissionRoutes);
apiRoutes.use('/closings', closingRoutes);
apiRoutes.use('/reports', reportRoutes);
apiRoutes.use('/settings', settingRoutes);
apiRoutes.use('/admin', adminRoutes);

app.use('/api', apiRoutes);

// Other routes
app.use('/suppliers', supplierRoutes);
app.use('/categories', categoryRoutes);
app.use('/customers', customerRoutes);
app.use('/giveloans', giveloanRoutes);
app.use('/receiveloans', receiveloanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Endpoints: /api/products, /api/sales, /suppliers, /categories, /api/users, /customers, /giveloans, /inventory`);
});