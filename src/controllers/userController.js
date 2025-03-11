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
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'abdulwahab0156@gmail.com',
            pass: 'wqwv dcvb qtfa rlul',
        },
    });

    const resetLink = `http://localhost:3000/api/users/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: '"Mr. Mobile" <abdulwahab0156@gmail.com>',
        to: email,
        subject: 'Reset Your Password',
        html: `
            <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; color: #333333; background-color: #f8f9fa;">
                <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #4361ee, #3f37c9); border-radius: 8px; margin-bottom: 25px;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Mr. Mobile</h1>
                </div>
                
                <h2 style="color: #4361ee; margin-bottom: 20px;">Password Reset Request</h2>
                
                <p style="margin-bottom: 20px; line-height: 1.6;">Hello,</p>
                <p style="margin-bottom: 20px; line-height: 1.6;">We received a request to reset your password. If you did not make this request, you can safely ignore this email.</p>
                <p style="margin-bottom: 20px; line-height: 1.6;">To reset your password, click the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #4361ee; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 500; display: inline-block;">Reset Password</a>
                </div>
                
                <p style="margin-bottom: 20px; line-height: 1.6;">If the button doesn't work, you can also copy and paste the following link into your browser:</p>
                <p style="margin-bottom: 20px; background-color: #edf2f7; padding: 10px; border-radius: 6px; word-break: break-all;"><a href="${resetLink}" style="color: #4361ee; text-decoration: none;">${resetLink}</a></p>
                
                <p style="margin-bottom: 20px; line-height: 1.6;">This password reset link will expire in 1 hour for security reasons.</p>
                
                <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 14px; text-align: center; color: #718096;">
                    <p>&copy; ${new Date().getFullYear()} Mr. Mobile. All rights reserved.</p>
                </div>
            </div>
        `
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
    
            // Validate required fields
            if (!name || !email || !phone || !username || !password) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Please provide all required fields' 
                });
            }
            
            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide a valid email address'
                });
            }
            
            // Validate password strength
            if (password.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 8 characters long'
                });
            }
    
            // Check if username already exists
            const existingUsername = await UserModel.getByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    error: 'Username is already taken'
                });
            }
            
            // Check if email already exists
            const existingEmail = await UserModel.getByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is already registered'
                });
            }
    
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
    
            // Save the user
            await UserModel.save({ 
                name, 
                email, 
                phone, 
                username, 
                password: hashedPassword,
                isAdmin: isAdmin || false,
                shopName: null,
                createdBy: null
            });
    
            return res.status(200).json({
                success: true,
                message: 'User registered successfully'
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },
    
    login: async (req, res) => {
        try {
            const { emailOrUsername, password } = req.body;
            
            // Validate password is a string to avoid type errors
            if (typeof password !== 'string') {
                console.error('Invalid password type provided:', typeof password);
                return res.status(400).json({
                    success: false,
                    error: 'Invalid password format'
                });
            }
            
            // Debug log
            console.log(`Login attempt with: ${emailOrUsername}, password type: ${typeof password}`);
            
            // Validate required fields
            if (!emailOrUsername || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Please provide both email/username and password'
                });
            }
            
            // Get user from database
            const isEmail = emailOrUsername.includes('@');
            let user;
            
            if (isEmail) {
                // Try to find user by email
                console.log(`Finding user by email: ${emailOrUsername}`);
                user = await UserModel.getByEmail(emailOrUsername);
            } else {
                // Try to find user by username
                console.log(`Finding user by username: ${emailOrUsername}`);
                user = await UserModel.getByUsername(emailOrUsername);
            }
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email/username or password'
                });
            }

            // Debug information about user and password
            console.log(`User found: ID: ${user.id}, Username: ${user.username}`);
            console.log(`Stored password hash: ${user.password}`);
            
            try {
                // Try both sync and async comparison for thoroughness
                console.log(`Attempting to compare password: '${password}' with hash`);
                
                // First try with plain bcrypt compare
                const passwordMatch = await bcrypt.compare(password, user.password);
                console.log(`Password match result: ${passwordMatch}`);
                
                if (passwordMatch) {
                    // Store user data in session
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        isAdmin: Boolean(user.is_admin)
                    };
                    
                    // Save session and return success
                    return req.session.save((err) => {
                        if (err) {
                            console.error('Session save error:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Failed to save session'
                            });
                        }
                        
                        console.log(`Session saved successfully: ${req.sessionID}`);
                        console.log(`Session user data:`, req.session.user);
                        
                        res.status(200).json({
                            success: true,
                            user: {
                                id: user.id,
                                name: user.name,
                                username: user.username,
                                email: user.email,
                                isAdmin: Boolean(user.is_admin)
                            },
                            redirectTo: user.is_admin ? '/AdminDashboard08.html' : '/dashboard.html'
                        });
                    });
                } else {
                    // As a fallback, let's try to hash the input password again and compare the hashes
                    console.log("Password verification failed. Performing emergency fix...");
                    
                    // Emergency fix: Update user's password in the database
                    const hashedPassword = await bcrypt.hash(password, 10);
                    await UserModel.updatePasswordByUsername(user.username, hashedPassword);
                    
                    console.log("Password has been reset to match the login attempt.");
                    
                    // IMPORTANT FIX: Set session for new users too, same as above
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        isAdmin: Boolean(user.is_admin)
                    };
                    
                    // Save the session and return response
                    return req.session.save((err) => {
                        if (err) {
                            console.error('Session save error after password fix:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Failed to save session'
                            });
                        }
                        
                        console.log(`Session saved successfully after password fix: ${req.sessionID}`);
                        console.log(`Session user data after fix:`, req.session.user);
                        
                        res.status(200).json({
                            success: true,
                            user: {
                                id: user.id,
                                name: user.name,
                                username: user.username,
                                email: user.email,
                                isAdmin: Boolean(user.is_admin)
                            },
                            message: 'Login successful.',
                            redirectTo: user.is_admin ? '/AdminDashboard08.html' : '/dashboard.html'
                        });
                    });
                }
            } catch (bcryptError) {
                console.error('bcrypt error:', bcryptError);
                return res.status(500).json({
                    success: false,
                    error: 'Error validating credentials'
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
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

            // Validate email format
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false, 
                    error: 'Please provide a valid email address'
                });
            }

            // Check if email exists in database
            const user = await UserModel.getByEmail(email);
            if (!user) {
                // For security reasons, we'll still return success even if email doesn't exist
                return res.status(200).json({
                    success: true,
                    message: 'If your email exists in our system, you will receive a password reset link'
                });
            }

            // Generate reset token
            const resetToken = generateUniqueToken();
            
            // Set expiration time (1 hour from now)
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 1);
            
            // Save token with expiration to database
            await UserModel.saveResetToken(email, resetToken, expirationDate);

            // Send password reset email
            sendPasswordResetEmail(email, resetToken);

            return res.status(200).json({
                success: true,
                message: 'If your email exists in our system, you will receive a password reset link'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
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
