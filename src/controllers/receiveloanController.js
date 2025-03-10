const receiveloanModel = require('../models/receiveloanModel');

const receiveloanController = {
    async receiveLoan(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const savedLoanId = await receiveloanModel.saveReceivedLoan(req.body, req.session.user.id);
            res.json({ success: true, id: savedLoanId, ...req.body });
        } catch (error) {
            console.error('Error in receiveLoan:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    async searchTransaction(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { transaction_id } = req.body;
            const userId = req.session.user.id;

            const giveloanResult = await receiveloanModel.searchTransactionByTransactionId(
                transaction_id, 'giveloan', userId
            );
            const receiveloanResult = await receiveloanModel.searchTransactionByTransactionId(
                transaction_id, 'receiveloan', userId
            );

            console.log('giveloanResult:', giveloanResult);
            console.log('receiveloanResult:', receiveloanResult);

            if (giveloanResult.length > 0 && receiveloanResult.length > 0) {
                // Transaction ID exists in both giveloan and receiveloan tables, fetch data from receiveloan table
                const data = {
                    table: 'receiveloan',
                    name: receiveloanResult[0].name,
                    amount: receiveloanResult[0].remaining_amount || 0,
                };
                res.status(200).json(data);
            } else if (giveloanResult.length > 0) {
                // Transaction ID exists in giveloan table, fetch data from giveloan table
                const data = {
                    table: 'giveloan',
                    name: giveloanResult[0].name,
                    amount: giveloanResult[0].amount,
                };
                res.status(200).json(data);
            } else {
                // Transaction not found in either table
                res.status(404).json({ error: 'Transaction not found' });
            }
        } catch (error) {
            console.error('Error in searchTransaction:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    },

    async getMonthlyInstallmentAmountHandler(req, res) {
        try {
            const { transaction_id } = req.body;

            const result = await receiveloanModel.getMonthlyInstallmentAmount(transaction_id);

            if (result.length > 0) {
                const data = {
                    monthly_installment_amount: result[0].monthly_installment,
                    installment: result[0].installment,
                };
                res.status(200).json(data);
            } else {
                res.status(404).json({ error: 'Transaction not found' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async fetchAllData(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const data = await receiveloanModel.fetchAllData(req.session.user.id);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error in fetchAllData:', error);
            res.status(500).json({ error: 'Internal Server Error' });
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

            await receiveloanModel.deleteLoan(transactionId, req.session.user.id);
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

            await receiveloanModel.updateLoan(transactionId, loanData, req.session.user.id);
            res.status(200).json({
                success: true,
                message: 'Loan updated successfully'
            });
        } catch (error) {
            console.error('Error in updateLoan:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Internal Server Error'
            });
        }
    },

    async searchByName(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { searchName } = req.body;
            const results = await receiveloanModel.searchByName(searchName, req.session.user.id);
            res.json(results);
        } catch (error) {
            console.error('Search by name error:', error);
            res.status(500).json({ error: 'Failed to search by name' });
        }
    },

    async getLoanSummary(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const summary = await receiveloanModel.getLoanSummary(req.session.user.id);
            res.json(summary);
        } catch (error) {
            console.error('Error getting loan summary:', error);
            res.status(500).json({ error: 'Failed to get loan summary' });
        }
    },

    async getPaymentHistory(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { transactionId } = req.params;
            const history = await receiveloanModel.getPaymentHistory(transactionId, req.session.user.id);
            res.json(history);
        } catch (error) {
            console.error('Error getting payment history:', error);
            res.status(500).json({ error: 'Failed to get payment history' });
        }
    },

    async getPaymentReminders(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const reminders = await receiveloanModel.getOverdueLoans(req.session.user.id);
            res.json(reminders);
        } catch (error) {
            console.error('Error getting payment reminders:', error);
            res.status(500).json({ error: 'Failed to get payment reminders' });
        }
    },

    async toggleReminders(req, res) {
        try {
            if (!req.session.user) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { transactionId } = req.params;
            await receiveloanModel.togglePaymentReminders(transactionId, req.session.user.id);
            res.json({ success: true });
        } catch (error) {
            console.error('Error toggling reminders:', error);
            res.status(500).json({ error: 'Failed to toggle reminders' });
        }
    }
};

module.exports = receiveloanController;
