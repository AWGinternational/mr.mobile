const db = require('./db');

const { v4: uuidv4 } = require('uuid');

const Giveloan = {
  generateNumericUUID: () => {
    const hexUUID = uuidv4().replace(/-/g, ''); // Remove dashes from the hexadecimal UUID
    const numericUUID = BigInt(`0x${hexUUID}`).toString(); // Convert hexadecimal to decimal
    const sixDigitNumericUUID = numericUUID.slice(0, 6).padStart(6, '0'); // Ensure 6 digits

    return sixDigitNumericUUID;
  },

  async saveLoan(loanData, userId) {
    const pool = db.getPool();
    try {
      const transaction_id = Giveloan.generateNumericUUID();
      const query = `
        INSERT INTO giveloan (
          date, transaction_id, name, amount, 
          installment, monthly_installment, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const [result] = await pool.query(query, [
        loanData.date,
        transaction_id,
        loanData.name,
        loanData.amount,
        loanData.installment,
        loanData.monthly_installment,
        userId
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error in saveLoan:', error);
      throw error;
    }
  },

  async getLoans(userId) {
    const pool = db.getPool();
    try {
      const [rows] = await pool.query(
        `SELECT * FROM giveloan WHERE user_id = ? ORDER BY date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getLoans:', error);
      throw error;
    }
  },

  async getCustomerNames(userId) {
    const pool = db.getPool();
    try {
      const [rows] = await pool.query(
        'SELECT DISTINCT name FROM Customer WHERE user_id = ? ORDER BY name ASC',
        [userId]
      );
      
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map(row => row.name);
    } catch (error) {
      console.error('Error in getCustomerNames:', error);
      throw error;
    }
  },
  
  giveLoanReport: async (dateRange) => {
    try {
      const query = 'SELECT * FROM giveloan WHERE date BETWEEN ? AND ?'; 
      const values = [dateRange.fromDate, dateRange.toDate];
      const [giveloan] = await db.query(query, values);
      return giveloan;
    } catch (error) {
      throw error;
    }
  },

  async deleteLoan(transactionId, userId) {
    const pool = db.getPool();
    try {
      const query = `
        DELETE FROM giveloan 
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
        UPDATE giveloan 
        SET name = ?, amount = ?, installment = ?, 
            monthly_installment = ?, date = ?
        WHERE transaction_id = ? AND user_id = ?
      `;
      const values = [
        loanData.name,
        loanData.amount,
        loanData.installment,
        loanData.monthly_installment,
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
  },

  async getRecentPayments(name, userId) {
    const pool = db.getPool();
    try {
      const query = `
        SELECT 
          r.payment_date,
          r.amount,
          r.transaction_id,
          r.remaining_amount
        FROM receiveloan r
        JOIN giveloan g ON g.transaction_id = r.transaction_id
        WHERE g.name = ? AND g.user_id = ?
        ORDER BY r.payment_date DESC
        LIMIT 5
      `;
      const [result] = await pool.query(query, [name, userId]);
      return result;
    } catch (error) {
      console.error('Error in getRecentPayments:', error);
      throw error;
    }
  },

  async getLoanPaymentHistory(transactionId, userId) {
    const pool = db.getPool();
    try {
      const query = `
        SELECT * FROM loan_payment_history
        WHERE transaction_id = ? AND user_id = ?
        ORDER BY payment_date DESC
      `;
      const [result] = await pool.query(query, [transactionId, userId]);
      return result;
    } catch (error) {
      console.error('Error in getLoanPaymentHistory:', error);
      throw error;
    }
  },

  async getCustomerLoanHistory(name, userId) {
    const pool = db.getPool();
    try {
      const query = `
        SELECT 
          COUNT(*) as total_loans,
          SUM(amount) as total_amount_borrowed,
          SUM(CASE WHEN payment_status = 'Completed' THEN 1 ELSE 0 END) as completed_loans,
          SUM(remaining_amount) as total_remaining,
          MAX(date) as last_loan_date,
          COUNT(CASE WHEN DATEDIFF(CURRENT_DATE, last_payment_date) > 30 
                   AND payment_status != 'Completed'
              THEN 1 END) as overdue_loans,
          SUM(CASE WHEN payment_status = 'Completed' THEN amount ELSE 0 END) as total_paid
        FROM giveloan 
        WHERE name = ? AND user_id = ?
        GROUP BY name
      `;
      const [result] = await pool.query(query, [name, userId]);
      return result[0] || {
        total_loans: 0,
        total_amount_borrowed: 0,
        completed_loans: 0,
        total_remaining: 0,
        overdue_loans: 0,
        total_paid: 0
      };
    } catch (error) {
      console.error('Error in getCustomerLoanHistory:', error);
      throw error;
    }
  },

  async calculateCreditScore(name, userId) {
    const pool = db.getPool();
    try {
      const query = `
        SELECT 
          COUNT(*) as total_loans,
          SUM(CASE WHEN payment_status = 'Completed' THEN 1 ELSE 0 END) as completed_loans,
          AVG(CASE 
              WHEN payment_status = 'Completed' THEN 100
              WHEN DATEDIFF(CURRENT_DATE, last_payment_date) > 30 THEN 50
              ELSE 75
          END) as credit_score,
          SUM(amount) as total_borrowed,
          SUM(remaining_amount) as total_remaining
        FROM giveloan 
        WHERE name = ? AND user_id = ?
      `;
      const [result] = await pool.query(query, [name, userId]);
      return result[0];
    } catch (error) {
      console.error('Error calculating credit score:', error);
      throw error;
    }
  }
};

module.exports = Giveloan;
