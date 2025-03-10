const db = require('./db');
const bcrypt = require('bcrypt');

const UserModel = {
    save: async (user) => {
        const pool = db.getPool();
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO users (name, email, phone, username, password) VALUES (?, ?, ?, ?, ?)',
            [user.name, user.email, user.phone, user.username, hashedPassword]
        );
        return result.insertId;
    },

    getByUsername: async (username) => {
        try {
            if (typeof username !== 'string') {
                throw new Error('Username is not a valid string');
            }

            const pool = db.getPool();
            const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error getting user by username:', error);
            throw error;
        }
    },

    getByEmail: async (email) => {
        const pool = db.getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },
   
    saveSessionData: async (userId, sessionId, expirationDate) => {
        try {
            if (userId === undefined || sessionId === undefined || expirationDate === undefined) {
                throw new Error('One or more required parameters are undefined');
            }

            const pool = db.getPool();
            
            try {
                await pool.query(
                    'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
                    [userId, sessionId, expirationDate]
                );
            } catch (insertError) {
                if (insertError.code === 'ER_DUP_ENTRY') {
                    await pool.query(
                        'UPDATE sessions SET expires_at = ? WHERE user_id = ? AND token = ?',
                        [expirationDate, userId, sessionId]
                    );
                } else {
                    throw insertError;
                }
            }
        } catch (error) {
            console.error('Error saving session data:', error);
            throw error;
        }
    },

    updatePassword: async (userId, newPassword) => {
        const pool = db.getPool();
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        try {
            await pool.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, userId]
            );
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    },

    saveResetToken: async (email, resetToken, expirationDate) => {
        const pool = db.getPool();
    
        try {
            // Ensure that parameters are not undefined
            const token = resetToken || null;
            const expires = expirationDate || null;
    
            await pool.query(
                'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
                [token, expires, email]
            );
        } catch (error) {
            console.error('Error saving reset token:', error);
            throw error;
        }
    },
    
    validateResetToken: async (emailFromRequest, resetToken) => {
        const pool = db.getPool();
    
        try {
            if (!emailFromRequest || typeof emailFromRequest !== 'string') {
                console.log('Invalid email:', emailFromRequest);
                return false;
            }
    
            const [userRows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailFromRequest]);
    
            if (userRows.length === 0) {
                console.log('User not found for email:', emailFromRequest);
                return false;
            }
    
            const user = userRows[0];
    
            if (user.reset_token && user.reset_token === resetToken && user.reset_token_expires && user.reset_token_expires > new Date()) {
                console.log('Reset token is valid for email:', emailFromRequest);
                return true;
            }
    
            console.log('Reset token is invalid for email:', emailFromRequest);
            return false;
        } catch (error) {
            console.error('Error validating reset token:', error);
            throw error;
        }
    },
    
    
    invalidateResetToken: async (email) => {
        const pool = db.getPool();
    
        try {
            await pool.query('UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE email = ?', [email]);
        } catch (error) {
            console.error('Error invalidating reset token:', error);
            throw error;
        }
    },
    getAllNonAdminUsers: async () => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT id, shop_name, name, email, phone, username FROM users WHERE is_admin = FALSE'
            );
            return rows;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    },

    getById: async (userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT id, shop_name, name, email, phone, username FROM users WHERE id = ?',
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw error;
        }
    },

    update: async (userId, userData) => {
        const pool = db.getPool();
        const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 10) : null;
        try {
            const { shopName, name, email, phone, username } = userData;
            
            // Build update query dynamically based on whether password is included
            let query = `UPDATE users SET 
                shop_name = ?, 
                name = ?, 
                email = ?, 
                phone = ?, 
                username = ?`;
            
            let params = [shopName, name, email, phone, username];
            
            if (hashedPassword) {
                query += `, password = ?`;
                params.push(hashedPassword);
            }
            
            query += ` WHERE id = ?`;
            params.push(userId);
            
            await pool.query(query, params);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    delete: async (userId) => {
        const pool = db.getPool();
        try {
            // First, delete related records in other tables
            await pool.query('DELETE FROM sessions WHERE user_id = ?', [userId]);
            
            // Then delete the user
            await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Method to check if a user is an admin
    isAdmin: async (userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT is_admin FROM users WHERE id = ?',
                [userId]
            );
            return rows[0]?.is_admin || false;
        } catch (error) {
            console.error('Error checking admin status:', error);
            throw error;
        }
    }
};
    


module.exports = UserModel;
