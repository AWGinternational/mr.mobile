// closingRoutes.js
const express = require('express');
const closingController = require('../controllers/closingController');

const router = express.Router();

router.post('/saveClosing', closingController.saveClosing);
router.get('/getAllClosing', closingController.getAllClosing);
router.get('/getTotalLoan', closingController.getTotalLoan);
router.put('/updateClosing/:id', closingController.updateClosing);

module.exports = router;
