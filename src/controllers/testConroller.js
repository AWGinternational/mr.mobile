// src/controllers/salesController.js

const Sales = require('../models/salesModel');


exports.fetchCategoryNames = async (req, res) => {
    try {
        const categoryNames = await Sales.fetchCategoryNames();  // Changed to use Inventory model
        res.json(categoryNames);
    } catch (error) {
        console.error('Error in fetchCategoryNames controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.fetchProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        if (!categoryName) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const products = await Sales.fetchProductsByCategory(categoryName);  // Changed to use Inventory model
        res.json(products);
    } catch (error) {
        console.error('Error in fetchProductsByCategory controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



exports.saveSalesToDatabase = async (req, res) => {
    console.log('Received a request to save sales data.'); 
    const data = req.body;

    try {
        await Sales.saveSalesToDatabase(data);
        res.status(200).send('Data saved to the database');
    } catch (error) {
        console.error('Error saving to database:', error);
        res.status(500).send('Internal Server Error');
    }
};
exports.fetchSalesData = async (req, res) => {
    try {
        const salesData = await Sales.fetchSalesData();
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).send('Internal Server Error');
    }
};



exports.deleteSalesDataById = async (req, res) => {
    const { id } = req.params;

    try {
        console.log('Attempting to delete sale with ID:', id);

        const result = await Sales.deleteSalesData(id);  // Call the model method to delete

        // Check the result and send appropriate response
        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: 'Sales entry deleted successfully' });
        } else {
            return res.status(404).json({ success: false, message: 'No matching record found' });
        }
    } catch (error) {
        console.error('Error during delete operation:', error.message);  // Log the error message
        return res.status(500).json({ success: false, message: 'Database error occurred', error: error.message });
    }
};