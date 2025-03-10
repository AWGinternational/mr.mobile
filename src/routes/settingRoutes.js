// settingRoutes.js

const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Routes related to user settings
router.get('/settings', settingController.getUserSettings);
router.put('/settings', settingController.updateUserSettings);

module.exports = router;
