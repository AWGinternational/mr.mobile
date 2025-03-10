const { pool } = require('../models/db');

async function generateReport(req, res) {
    try {
        const { reportType, fromDate, toDate } = req.body;
        let query = '';
        
        switch(reportType) {
            case 'sales':
                query = `
                    SELECT * FROM sales 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            case 'stock':
                query = `
                    SELECT * FROM inventory 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            case 'commission':
                query = `
                    SELECT * FROM commissions 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            case 'closing':
                query = `
                    SELECT * FROM closing 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            case 'giveloan':
                query = `
                    SELECT * FROM giveloan 
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            case 'receiveloan':
                query = `
                    SELECT * FROM receiveloan  
                    WHERE date BETWEEN ? AND ?
                    ORDER BY date DESC
                `;
                break;
            default:
                return res.status(400).json({ 
                    success: false, 
                    error: 'Invalid report type' 
                });
        }

        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(query, [fromDate, toDate]);
            
            if (!rows || rows.length === 0) {
                return res.json({ 
                    success: true, 
                    reportData: [] 
                });
            }

            res.json({ 
                success: true, 
                reportData: rows 
            });
        } finally {
            connection.release(); // Always release the connection
        }

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
}

module.exports = {
    generateReport
};
