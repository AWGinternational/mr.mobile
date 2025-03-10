// src/routes/giveloanRoutes.js
const express = require('express');
const router = express.Router();
const GiveloanController = require('../controllers/giveloanController');

// Auth middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

// Apply auth check to all routes
router.use(checkAuth);

// Get customer names for dropdown
router.get('/customer_names', GiveloanController.getCustomerNames);

// Define the route for submitting a loan
router.post('/submit_loan', GiveloanController.submitLoan);
router.get('/loans', GiveloanController.getLoans);
router.post('/update_total_loan', GiveloanController.updateTotalLoan);

router.get('/customer-history/:name', GiveloanController.getCustomerHistory);
router.get('/payment-history/:transactionId', GiveloanController.getPaymentHistory);

router.delete('/delete_loan/:transactionId', async (req, res) => {
    try {
        await GiveloanController.deleteLoan(req, res);
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

router.put('/update_loan/:transactionId', async (req, res) => {
    try {
        await GiveloanController.updateLoan(req, res);
    } catch (error) {
        console.error('Route Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal Server Error'
        });
    }
});

module.exports = router;
