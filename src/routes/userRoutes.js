// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

// Signup route
router.post('/signup', UserController.signup);

// Login route
router.post('/login', UserController.login);
router.post('/change-password', UserController.changePassword);
router.post('/forgot-password', UserController.forgotPassword);
router.get('/reset-password', UserController.renderResetPasswordPage);
router.post('/reset-password', UserController.resetPassword);

// Update the current user route to properly check session
router.get('/current', (req, res) => {
    console.log('Session check in /current route:', req.session);
    console.log('User in session:', req.session?.user);
    
    if (req.session && req.session.user) {
        res.status(200).json({ 
            success: true, 
            user: {
                id: req.session.user.id,
                name: req.session.user.name,
                username: req.session.user.username,
                email: req.session.user.email,
                isAdmin: req.session.user.isAdmin
            }
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'User not authenticated' 
        });
    }
});

router.post('/logout', UserController.logout);

// Test route to check session
router.get('/test-session', (req, res) => {
    if (req.session.views) {
        req.session.views++;
        res.json({ 
            views: req.session.views,
            sessionID: req.sessionID
        });
    } else {
        req.session.views = 1;
        res.json({ 
            message: 'First visit!',
            sessionID: req.sessionID
        });
    }
});

module.exports = router;
