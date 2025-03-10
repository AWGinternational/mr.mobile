// src/routes/salesRoutes.js

const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authenticateUser, checkOwnership } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateUser);

// Protected routes
router.get('/categories', salesController.fetchCategoryNames);  // Changed from /fetchCategoryNames
router.get('/products/category/:categoryName', salesController.fetchProductsByCategory);
router.post('/saveSalesToDatabase', salesController.saveSalesToDatabase);
router.get('/fetchSalesData', salesController.fetchSalesData);
router.delete('/deleteSalesItem/:id', checkOwnership('sales'), salesController.deleteSalesItem);
router.put('/updateSalesItem/:id', checkOwnership('sales'), salesController.updateSalesItem);
router.post('/createSale', salesController.createSale);
router.get('/check/:productName', salesController.checkInventory);

module.exports = router;
