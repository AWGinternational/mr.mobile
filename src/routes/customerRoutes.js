// src/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Auth middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

// Apply auth check to all routes
router.use(checkAuth);

// Customer routes
router.post('/add', customerController.createCustomer);
router.get('/all', customerController.getAllCustomers);
router.put('/update/:id', customerController.updateCustomer);
router.delete('/delete/:id', customerController.deleteCustomer);

module.exports = router;