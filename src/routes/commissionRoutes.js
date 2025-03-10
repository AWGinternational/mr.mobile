const express = require('express');
const router = express.Router();
const CommissionController = require('../controllers/commissionController');

// Auth middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: 'Please log in to continue'
        });
    }
    next();
};

// Apply auth middleware to all routes
router.use(checkAuth);

router.use((req, res, next) => {
    console.log('Commission Route:', {
        userId: req.session.user?.id,
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query
    });
    next();
});

// Save commission route
router.post('/saveCommission', async (req, res) => {
    try {
        await CommissionController.saveCommission(req, res);
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get commissions route
router.get('/getCommissions', async (req, res) => {
    console.log('Received get commissions request');
    try {
        await CommissionController.getCommissions(req, res);
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Add update route
router.put('/updateCommission/:id', async (req, res) => {
    try {
        console.log('Update request received:', {
            id: req.params.id,
            body: req.body,
            user: req.session.user
        });
        
        await CommissionController.updateCommission(req, res);
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router;
