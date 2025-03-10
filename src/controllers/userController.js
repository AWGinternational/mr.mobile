const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');
const uuid = require('uuid');
const nodemailer = require('nodemailer');
const path = require('path');
const { pool } = require('../models/db');


function generateUniqueToken() {
    return uuid.v4();
}

function sendPasswordResetEmail(email, resetToken) {
    // Create a nodemailer transporter using your email configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abdulwahab0156@gmail.com',
            pass: 'wqwv dcvb qtfa rlul',
        },
    });

    // Define the email options
    const mailOptions = {
        from: 'AWG International',
        to: email,
        subject: 'Password Reset',
        text: `Click the following link to reset your password: http://localhost:3000/api/users/reset-password?token=${resetToken}`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending password reset email:', error);
            throw error;
        } else {
            console.log('Password reset email sent:', info.response);
        }
    });
}


const UserController = {
    signup : async (req, res) => {
        try {
            const { name, email, phone, username, password, isAdmin } = req.body;
    
            // Check if the username is already taken
            const existingUser = await UserModel.getByUsername(username);
            if (existingUser) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Save the user with admin status if specified
            await UserModel.save({ 
                name, 
                email, 
                phone, 
                username, 
                password: hashedPassword,
                isAdmin: isAdmin || false,  // Default to false if not specified
                shopName: null,  // For admin users, shop_name can be null
                createdBy: null  // For self-registration
            });
    
            return res.status(200).json({ message: 'User registered successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    // userController.js - login function
    login: async (req, res) => {
        try {
            const { emailOrUsername, password } = req.body;
            
            const isEmail = emailOrUsername.includes('@');
            const user = isEmail 
                ? await UserModel.getByEmail(emailOrUsername)
                : await UserModel.getByUsername(emailOrUsername);
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
    
            const passwordMatch = await bcrypt.compare(password, user.password);
            
            if (passwordMatch) {
                // Store complete user data in session
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    email: user.email,
                    isAdmin: Boolean(user.is_admin)
                };
    
                // Store in session storage via response
                return res.status(200).json({
                    success: true,
                    user: {
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        isAdmin: Boolean(user.is_admin)
                    },
                    redirectTo: user.is_admin ? '/AdminDashboard08.html' : '/dashboard.html'
                });
            }
            
            return res.status(401).json({ error: 'Invalid credentials' });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.status(200).json({ message: 'Logout successful' });
            }
        });
    },

    changePassword: async (req, res) => {
        try {
            const { oldPassword, newPassword } = req.body;

            // Check if the user is authenticated
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Retrieve user data from the session
            const { id, password: storedPassword } = req.session.user;

            // Check if the old password matches the stored password
            const passwordMatch = await bcrypt.compare(oldPassword, storedPassword);

            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid old password' });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update the user's password in the database
            await UserModel.updatePassword(id, hashedNewPassword);

            // Return success message
            return res.status(200).json({ message: 'Password changed successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            // Check if the email is valid
            // Perform any additional validation if needed

            // Generate a unique token (you can use libraries like crypto or uuid)
            const resetToken = generateUniqueToken();

            // Store the token and email in the database (create a new table or add columns to the existing one)
            await UserModel.saveResetToken(email, resetToken);

            // Send a password reset link to the user's email
            sendPasswordResetEmail(email, resetToken);

            return res.status(200).json({ message: 'Password reset link sent successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    resetPassword: async (req, res) => {
        try {
            const { email, newPassword, confirmPassword } = req.body;
            const resetToken = req.query.token;
    
            // Validate the reset token
            const isValidToken = await UserModel.validateResetToken(email, resetToken);
            if (!isValidToken) {
                return res.status(400).json({ error: 'Invalid or expired reset token' });
            }
    
            // Check if passwords match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }
    
            // Update the user's password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);
            await UserModel.updatePasswordByEmail(email, hashedNewPassword);
    
            // Invalidate the reset token
            await UserModel.invalidateResetToken(email);
    
            return res.status(200).json({ message: 'Password reset successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    
    renderResetPasswordPage: (req, res) => {
        const filePath = path.join(__dirname, '../../public/reset-password.html');
        res.sendFile(filePath);
    },
    
    getCurrentUser: async (req, res) => {
        try {
            // Access user information from session
            if (!req.session.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Not authenticated'
                });
            }
    
            const connection = await pool.getConnection();
            try {
                const [rows] = await connection.query(
                    'SELECT id, name, email, phone FROM users WHERE id = ?',
                    [req.session.userId]
                );
    
                if (!rows || rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                }
    
                res.json({
                    success: true,
                    user: rows[0]
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};

// Add to your existing UserController
const adminMethods = {
    getAllUsers: async (req, res) => {
        try {
            const users = await UserModel.getAllNonAdminUsers();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    createUser: async (req, res) => {
        try {
            const { shopName, name, email, phone, username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await UserModel.save({
                name,
                email,
                phone,
                username,
                password: hashedPassword,
                shopName,
                isAdmin: false,
                createdBy: req.session.user.id // Current admin's ID
            });
            
            res.status(200).json({ message: 'User created successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getUser: async (req, res) => {
        try {
            const user = await UserModel.getById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateUser: async (req, res) => {
        try {
            const { shopName, name, email, phone, username, password } = req.body;
            let hashedPassword = undefined;
            
            if (password) {
                hashedPassword = await bcrypt.hash(password, 10);
            }
            
            await UserModel.update(req.params.id, {
                shopName,
                name,
                email,
                phone,
                username,
                password: hashedPassword
            });
            
            res.json({ message: 'User updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteUser: async (req, res) => {
        try {
            await UserModel.delete(req.params.id);
            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

// Merge with existing UserController
Object.assign(UserController, adminMethods);

module.exports = UserController;
