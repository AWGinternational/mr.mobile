// commissionController.js
const CommissionModel = require('../models/commissionModel');

const CommissionController = {
    async saveCommission(req, res) {
        try {
            console.log('Received commission request:', req.body); // Debug log

            // Validate required fields
            const requiredFields = ['date', 'amount', 'service'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields: ${missingFields.join(', ')}`
                });
            }

            // Validate company field for Easy Load
            if (req.body.service === 'Easy Load' && !req.body.company) {
                return res.status(400).json({
                    success: false,
                    message: 'Company is required for Easy Load service'
                });
            }

            const result = await CommissionModel.saveCommission(req.body, req.session?.user?.id);
            
            res.json({
                success: true,
                message: 'Commission saved successfully',
                data: result
            });
        } catch (error) {
            console.error('Error saving commission:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving commission',
                error: error.message
            });
        }
    },

    async getCommissions(req, res) {
        try {
            // Check if user is logged in
            if (!req.session.user || !req.session.user.id) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
            }

            const commissions = await CommissionModel.getCommissions(req.session.user.id);
            
            res.json({
                success: true,
                commissions: commissions || []
            });
        } catch (error) {
            console.error('Error fetching commissions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching commissions',
                error: error.message
            });
        }
    },

    async updateCommission(req, res) {
        try {
            const { id } = req.params;
            const userId = req.session?.user?.id;

            if (!id || !userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing commission ID or user not authenticated'
                });
            }

            const result = await CommissionModel.updateCommission(id, req.body, userId);
            
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Commission not found or unauthorized'
                });
            }

            res.json({
                success: true,
                message: 'Commission updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Error updating commission:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating commission',
                error: error.message
            });
        }
    }
};

module.exports = CommissionController;
