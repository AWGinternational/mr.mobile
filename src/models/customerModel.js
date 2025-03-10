// models/customerModel.js

const db = require('./db');

const CustomerModel = {
    async createCustomer(customerData, userId) {
        const pool = db.getPool();
        try {
            // Check for duplicate CNIC
            const [existing] = await pool.query(
                'SELECT id FROM Customer WHERE cnic = ? AND user_id = ?',
                [customerData.cnic, userId]
            );

            if (existing.length > 0) {
                throw new Error('CNIC already exists');
            }

            const [result] = await pool.query(
                'INSERT INTO Customer (name, address, cnic, phone_number, user_id) VALUES (?, ?, ?, ?, ?)',
                [customerData.name, customerData.address, customerData.cnic, customerData.phone, userId]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    async updateCustomer(id, customerData, userId) {
        const pool = db.getPool();
        try {
            const [result] = await pool.query(
                'UPDATE Customer SET name = ?, address = ?, phone_number = ? WHERE id = ? AND user_id = ?',
                [customerData.name, customerData.address, customerData.phone, id, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async deleteCustomer(id, userId) {
        const pool = db.getPool();
        try {
            const [result] = await pool.query(
                'DELETE FROM Customer WHERE id = ? AND user_id = ?',
                [id, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async getCustomers(userId) {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT * FROM Customer WHERE user_id = ? ORDER BY name ASC',
                [userId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async updateCustomerProfile(customerId, data) {
        const pool = db.getPool();
        try {
            await pool.query('START TRANSACTION');

            // Update main customer info
            const updateQuery = `
                UPDATE customers 
                SET 
                    credit_score = ?,
                    total_loans = ?,
                    active_loans = ?,
                    last_loan_date = ?,
                    loan_limit = ?,
                    notes = ?
                WHERE id = ?
            `;

            await pool.query(updateQuery, [
                data.creditScore,
                data.totalLoans,
                data.activeLoans,
                data.lastLoanDate,
                data.loanLimit,
                data.notes,
                customerId
            ]);

            // Add to customer history
            const historyQuery = `
                INSERT INTO customer_history (
                    customer_id, action_type, previous_value, 
                    new_value, action_date, user_id
                ) VALUES (?, ?, ?, ?, NOW(), ?)
            `;

            await pool.query(historyQuery, [
                customerId,
                'PROFILE_UPDATE',
                JSON.stringify(data.previousValues),
                JSON.stringify(data.newValues),
                data.userId
            ]);

            await pool.query('COMMIT');
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }
};

module.exports = CustomerModel;
