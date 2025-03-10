const validateCommission = (req, res, next) => {
    const { date, phone, amount, service } = req.body;

    if (!date || !phone || !amount || !service) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields',
            required: ['date', 'phone', 'amount', 'service']
        });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid amount value'
        });
    }

    // Phone number validation
    if (!/^\d{11}$/.test(phone)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number format - must be 11 digits'
        });
    }

    next();
};

module.exports = validateCommission;
