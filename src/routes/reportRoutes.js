// reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.post('/generateReport', reportController.generateReport);

module.exports = router;
