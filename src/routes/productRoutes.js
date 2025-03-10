const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/categories', productController.getCategories);
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.put('/:sku', productController.updateProduct);
router.delete('/:sku', productController.deleteProduct);

module.exports = router;