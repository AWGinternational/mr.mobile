// src/routes/adminRoutes08.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const UserModel = require('../models/userModel');
const path = require('path');

const isAdmin = async (req, res, next) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        if (!req.session.user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Error in admin middleware:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Admin check endpoint
router.get('/check-admin/:userId', async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const isUserAdmin = await UserModel.isAdmin(req.params.userId);
        if (isUserAdmin) {
            res.json({ isAdmin: true });
        } else {
            res.status(403).json({ error: 'Not an admin' });
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin routes - all protected by isAdmin middleware
router.get('/users', isAdmin, UserController.getAllUsers);
router.post('/users', isAdmin, UserController.createUser);
router.get('/users/:id', isAdmin, UserController.getUser);
router.put('/users/:id', isAdmin, UserController.updateUser);
router.delete('/users/:id', isAdmin, UserController.deleteUser);

// Admin dashboard route
router.get('/dashboard', isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/AdminDashboard08.html'));
});

module.exports = router;