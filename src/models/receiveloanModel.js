const db = require('./db');

const receiveloanModel = {
    async saveReceivedLoan(loanData, userId) {
        const pool = db.getPool();
        try {
            const query = `
                INSERT INTO receiveloan (
                    date, transaction_id, name, amount, loan_type, 
                    installment_amount, total_installment, 
                    installment_number, remaining_amount, user_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                loanData.date,
                loanData.transaction_id,
                loanData.name,
                loanData.amount,
                loanData.loan_type,
                loanData.installment_amount,
                loanData.total_installment,
                loanData.installment_number,
                loanData.remaining_amount,
                userId
            ];

            const [result] = await pool.query(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error in saveReceivedLoan:', error);
            throw error;
        }
    },

    async searchTransactionByTransactionId(transaction_id, table, userId) {
        const pool = db.getPool();
        try {
            const query = `SELECT name, amount, remaining_amount FROM ${table} WHERE transaction_id = ? AND user_id = ?`;
            const [result] = await pool.query(query, [transaction_id, userId]);
            return result;
        } catch (error) {
            console.error('Error in searchTransaction:', error);
            throw error;
        }
    },

    async fetchAllData(userId) {
        const pool = db.getPool();
        try {
            const query = 'SELECT * FROM receiveloan WHERE user_id = ? ORDER BY date DESC';
            const [result] = await pool.query(query, [userId]);
            return result;
        } catch (error) {
            console.error('Error in fetchAllData:', error);
            throw error;
        }
    },

    getMonthlyInstallmentAmount: async (transaction_id) => {
        const query = 'SELECT installment, monthly_installment FROM giveloan WHERE transaction_id = ?';
        const [result] = await db.query(query, [transaction_id]);
        return result;
    },

    getReceiveLoanReport: async (dateRange) => {
        try {
            const query = 'SELECT * FROM receiveloan WHERE date BETWEEN ? AND ?';
            const [receiveLoan] = await db.query(query, [dateRange.fromDate, dateRange.toDate]);
            return receiveLoan;
        } catch (error) {
            throw error;
        }
    },

    async deleteLoan(transactionId, userId) {
        const pool = db.getPool();
        try {
            const query = `
                DELETE FROM receiveloan 
                WHERE transaction_id = ? AND user_id = ?
            `;
            const [result] = await pool.query(query, [transactionId, userId]);
            
            if (result.affectedRows === 0) {
                throw new Error('Loan not found or unauthorized');
            }
            return result;
        } catch (error) {
            console.error('Error in deleteLoan:', error);
            throw error;
        }
    },

    async updateLoan(transactionId, loanData, userId) {
        const pool = db.getPool();
        try {
            const query = `
                UPDATE receiveloan 
                SET name = ?, amount = ?, loan_type = ?, 
                    installment_amount = ?, total_installment = ?,
                    installment_number = ?, remaining_amount = ?, date = ?
                WHERE transaction_id = ? AND user_id = ?
            `;
            const values = [
                loanData.name,
                loanData.amount,
                loanData.loan_type,
                loanData.installment_amount,
                loanData.total_installment,
                loanData.installment_number,
                loanData.remaining_amount,
                loanData.date,
                transactionId,
                userId
            ];

            const [result] = await pool.query(query, values);
            if (result.affectedRows === 0) {
                throw new Error('Loan not found or unauthorized');
            }
            return result;
        } catch (error) {
            console.error('Error in updateLoan:', error);
            throw error;
        }
    }
};

// Export only the model
module.exports = receiveloanModel;



