// closingController.js
const closingModel = require('../models/closingModel');

async function saveClosing(req, res) {
    try {
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        console.log('Request received:', req.body);
        const closingData = req.body;

        const totalLoan = await closingModel.getTotalLoan();
        closingData.loan = totalLoan;

        const closingId = await closingModel.saveClosing(closingData, req.session.user.id);

        console.log('Closing data saved successfully');
        res.json({ success: true, closingId });
    } catch (error) {
        console.error('Error saving closing data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getAllClosing(req, res) {
    try {
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const allClosingData = await closingModel.getAllClosing(req.session.user.id);
        res.json(allClosingData);
    } catch (error) {
        console.error('Error fetching all closing data:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function getTotalLoan(req, res) {
    try {
        const totalLoan = await closingModel.getTotalLoan();
        res.json(totalLoan);
    } catch (error) {
        console.error('Error fetching total loan:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}

async function updateClosing(req, res) {
    try {
        if (!req.session.user?.id) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }

        const { id } = req.params;
        const result = await closingModel.updateClosing(id, req.body, req.session.user.id);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Closing entry not found or unauthorized'
            });
        }

        res.json({
            success: true,
            message: 'Closing updated successfully'
        });
    } catch (error) {
        console.error('Error updating closing:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    saveClosing,
    getAllClosing,
    getTotalLoan,
    updateClosing
};
