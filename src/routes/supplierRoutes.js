// Example routes in supplierRoutes.js

const express = require('express');
const supplierController = require('../controllers/supplierController');
const { authenticateUser, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateUser);

// Add checkOwnership middleware to protected routes
router.get('/:id', checkOwnership('suppliers'), supplierController.getSupplierById);
router.put('/:id', checkOwnership('suppliers'), supplierController.updateSupplier);
router.delete('/:id', checkOwnership('suppliers'), supplierController.deleteSupplier);

// Routes that don't need ownership check
router.get('/', supplierController.getAllSuppliers);
router.post('/', supplierController.addSupplier);

module.exports = router;
