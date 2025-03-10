const Giveloan = require('../models/giveloanModel');
const db = require('../models/db');
const GiveloanController = {
  async submitLoan(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const result = await Giveloan.saveLoan(req.body, req.session.user.id);
      res.status(201).json({ success: true, loanId: result });
    } catch (error) {
      console.error('Submit loan error:', error);
      res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  },

  async getLoans(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const loans = await Giveloan.getLoans(req.session.user.id);
      res.json(loans);
    } catch (error) {
      console.error('Get loans error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  async getCustomerNames(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const customerNames = await Giveloan.getCustomerNames(req.session.user.id);
      
      if (!customerNames) {
        return res.status(404).json({ error: 'No customers found' });
      }

      res.json(customerNames);
    } catch (error) {
      console.error('Get customer names error:', error);
      res.status(500).json({ error: 'Failed to fetch customer names' });
    }
  },

  updateTotalLoan: async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { totalLoan } = req.body;
        const pool = db.getPool();

        const query = `
            UPDATE giveloan
            SET total_loan = ?
            WHERE user_id = ?
        `;

        const [result] = await pool.query(query, [totalLoan, req.session.user.id]);
        
        res.status(200).json({ 
            success: true, 
            message: 'Total loan updated successfully.' 
        });
    } catch (error) {
        console.error('Error updating total loan:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error' 
        });
    }
  },

  async deleteLoan(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Transaction ID is required' 
            });
        }

        await Giveloan.deleteLoan(transactionId, req.session.user.id);
        
        res.status(200).json({ 
            success: true, 
            message: 'Loan deleted successfully' 
        });
    } catch (error) {
        console.error('Error in deleteLoan:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
  },

  async updateLoan(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { transactionId } = req.params;
        const loanData = req.body;

        if (!transactionId || !loanData) {
            return res.status(400).json({
                success: false,
                error: 'Missing required data'
            });
        }

        await Giveloan.updateLoan(transactionId, loanData, req.session.user.id);

        res.status(200).json({
            success: true,
            message: 'Loan updated successfully'
        });
    } catch (error) {
        console.error('Error in updateLoan:', error);
        res.status(error.message.includes('not found') ? 404 : 500).json({
            success: false,
            error: error.message || 'Internal Server Error'
        });
    }
  },

  async getCustomerHistory(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { name } = req.params;
        if (!name) {
            return res.status(400).json({ error: 'Customer name is required' });
        }

        // Get loan history
        const loanHistory = await Giveloan.getCustomerLoanHistory(name, req.session.user.id);
        
        // Calculate credit score
        const creditScore = await Giveloan.calculateCreditScore(name, req.session.user.id);

        // Get recent payments
        const recentPayments = await Giveloan.getRecentPayments(name, req.session.user.id);

        res.json({
            loanHistory,
            creditScore,
            recentPayments
        });
    } catch (error) {
        console.error('Error getting customer history:', error);
        res.status(500).json({ error: 'Failed to get customer history' });
    }
  },

  async getPaymentHistory(req, res) {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { transactionId } = req.params;
        if (!transactionId) {
            return res.status(400).json({ error: 'Transaction ID is required' });
        }

        const payments = await Giveloan.getLoanPaymentHistory(transactionId, req.session.user.id);
        res.json(payments);
    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({ error: 'Failed to get payment history' });
    }
  }
};

module.exports = GiveloanController;
