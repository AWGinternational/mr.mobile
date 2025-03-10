// commissionModel.js
const db = require('./db');

const CommissionModel = {
    async saveCommission(commissionData, userId) {
        const pool = db.getPool();
        try {
            console.log('Saving commission data:', commissionData); // Debug log

            const query = `
                INSERT INTO commissions 
                (date, phone, amount, service, company, discount, profit, discountAmount, user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Handle company field for Easy Load service
            const company = commissionData.service === 'Easy Load' ? commissionData.company : null;

            const values = [
                commissionData.date,
                commissionData.phone || '0',
                parseFloat(commissionData.amount),
                commissionData.service,
                company, // Add company value
                parseFloat(commissionData.discount || 0),
                parseFloat(commissionData.profit || 0),
                parseFloat(commissionData.discountAmount || 0),
                userId
            ];

            console.log('Query values:', values); // Debug log

            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error in saveCommission:', error);
            throw error;
        }
    },

    async getCommissions(userId) {
        const pool = db.getPool();
        try {
            // Remove the 2-day limit, get all records
            const [rows] = await pool.execute(
                `SELECT * FROM commissions 
                WHERE user_id = ? 
                ORDER BY date DESC`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error in getCommissions:', error);
            throw error;
        }
    },

    async getCommissionsByDate(date) {
        try {
            const [rows] = await db.pool.execute(
                'SELECT * FROM commissions WHERE DATE(date) = ?', 
                [date]
            );
            return rows;
        } catch (error) {
            console.error('Error in getCommissionsByDate:', error);
            throw error;
        }
    },

    async updateCommission(commissionId, commissionData, userId) {
        const pool = db.getPool();
        try {
            const query = `
                UPDATE commissions 
                SET date = ?, phone = ?, amount = ?, service = ?, 
                    company = ?, discount = ?, profit = ?, 
                    discountAmount = ?, updated = true
                WHERE id = ? AND user_id = ?
            `;

            const company = commissionData.service === 'Easy Load' ? commissionData.company : null;

            const values = [
                commissionData.date,
                commissionData.phone || '0',
                parseFloat(commissionData.amount),
                commissionData.service,
                company,
                parseFloat(commissionData.discount || 0),
                parseFloat(commissionData.profit || 0),
                parseFloat(commissionData.discountAmount || 0),
                commissionId,
                userId
            ];

            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error in updateCommission:', error);
            throw error;
        }
    }
};

module.exports = CommissionModel;
