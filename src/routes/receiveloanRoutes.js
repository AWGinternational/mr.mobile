// src/routes/receiveloanRoutes.js
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const receiveloanController = require('../controllers/receiveloanController');

const searchLimiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 5, // limit each IP to 5 requests per windowMs
    message: { error: 'Too many search requests, please wait a moment' }
});

// Receive loan route
router.post('/submit_loan', receiveloanController.receiveLoan);
router.post('/search', receiveloanController.searchTransaction);
router.post('/monthly_installment_amount', receiveloanController.getMonthlyInstallmentAmountHandler); // Add this route
router.get('/fetch_all', receiveloanController.fetchAllData);
router.delete('/delete_loan/:transactionId', receiveloanController.deleteLoan);

// Add this new route for name search
router.post('/search-name', searchLimiter, receiveloanController.searchByName);

// Loan summary and reminders routes
router.get('/loan-summary', receiveloanController.getLoanSummary);
router.get('/payment-history/:transactionId', receiveloanController.getPaymentHistory);
router.get('/payment-reminders', receiveloanController.getPaymentReminders);
router.post('/toggle-reminders/:transactionId', receiveloanController.toggleReminders);

module.exports = router;
