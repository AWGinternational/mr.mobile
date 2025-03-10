// routes/inventoryRoutes.js

const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authenticateUser, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateUser);

// Move this route to the top
router.get('/check/:productName', inventoryController.checkInventoryQuantity);

// Apply ownership check to specific routes
router.get('/categories', inventoryController.fetchCategoryNames);
router.post('/saveToDatabase', inventoryController.saveToDatabase);
router.get('/products/category/:categoryName', inventoryController.fetchProductsByCategory);
router.get('/fetchSupplierNames', inventoryController.fetchSupplierNames);
router.get('/fetchInventoryData', inventoryController.fetchInventoryData);
router.post('/makeSale', inventoryController.makeSale);
router.delete('/deleteInventory/:id', inventoryController.deleteInventoryItem);
router.put('/updateInventory/:id', checkOwnership('inventory'), inventoryController.updateInventoryItem);
router.post('/updateQuantity', inventoryController.updateInventoryQuantity);
router.get('/check-sku/:sku', authenticateUser, inventoryController.checkSkuExists);

module.exports = router;
