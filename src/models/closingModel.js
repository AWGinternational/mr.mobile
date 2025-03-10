// closingModel.js
const db = require('./db');

const ClosingModel = {
    async saveClosing(closingData, userId) {
        const pool = db.getPool();
        try {
            const { date, telenorLoad, zongLoad, jazzLoad, ufoneLoad, easypaisa, jazzCash, loan, cash, bank, credit, total } = closingData;

            const query = `
                INSERT INTO closing 
                (date, telenorLoad, zongLoad, jazzLoad, ufoneLoad, easypaisa, jazzCash, 
                loan, cash, bank, credit, total, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                date, telenorLoad, zongLoad, jazzLoad, ufoneLoad, 
                easypaisa, jazzCash, loan, cash, bank, credit, total, userId
            ];

            const [result] = await pool.execute(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error in saveClosing:', error);
            throw error;
        }
    },

    async getAllClosing(userId) {
        const pool = db.getPool();
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM closing WHERE user_id = ? ORDER BY date DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error in getAllClosing:', error);
            throw error;
        }
    },

    async getTotalLoan() {
        const pool = db.getPool();
        try {
            const [rows] = await pool.execute(
                'SELECT total_loan FROM giveloan ORDER BY loan_id DESC LIMIT 1'
            );
            return rows.length > 0 ? rows[0].total_loan : 0;
        } catch (error) {
            console.error('Error in getTotalLoan:', error);
            throw error;
        }
    },

    async updateClosing(id, closingData, userId) {
        const pool = db.getPool();
        try {
            const { date, telenorLoad, zongLoad, jazzLoad, ufoneLoad, easypaisa, jazzCash, 
                    loan, cash, bank, credit, total } = closingData;

            const query = `
                UPDATE closing 
                SET date = ?, telenorLoad = ?, zongLoad = ?, jazzLoad = ?, 
                    ufoneLoad = ?, easypaisa = ?, jazzCash = ?, loan = ?, 
                    cash = ?, bank = ?, credit = ?, total = ?, updated = true
                WHERE id = ? AND user_id = ?
            `;

            const values = [
                date, telenorLoad, zongLoad, jazzLoad, ufoneLoad, easypaisa, jazzCash,
                loan, cash, bank, credit, total, id, userId
            ];

            const [result] = await pool.execute(query, values);
            return result;
        } catch (error) {
            console.error('Error in updateClosing:', error);
            throw error;
        }
    }
};

module.exports = ClosingModel;