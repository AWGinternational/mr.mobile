// src/controllers/salesController.js

const Sales = require('../models/salesModel');

exports.fetchCategoryNames = async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const categories = await Sales.fetchCategoryNames(userId);
        
        if (!categories || categories.length === 0) {
            return res.json([]);
        }

        console.log('Found categories:', categories); // Debug log
        res.json(categories);
    } catch (error) {
        console.error('Error in fetchCategoryNames controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.fetchProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const userId = req.session?.user?.id;

        if (!categoryName || !userId) {
            return res.status(400).json({ 
                error: 'Category name and user authentication required' 
            });
        }

        const products = await Sales.fetchProductsByCategory(categoryName, userId);
        
        if (!products || products.length === 0) {
            return res.json([]);
        }

        console.log('Found products:', products); // Debug log
        res.json(products);
    } catch (error) {
        console.error('Error in fetchProductsByCategory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.saveSalesToDatabase = async (req, res) => {
    try {
        const data = req.body[0];
        const userId = req.session?.user?.id;

        if (!data || !userId) {
            return res.status(400).json({ error: 'Invalid data format or user not authenticated' });
        }

        const result = await Sales.saveSalesToDatabase(data, userId);
        
        // Send back both success message and updated inventory data
        res.status(200).json({
            message: 'Sale completed successfully',
            inventoryUpdate: {
                productName: result.updatedInventory.productName,
                quantity: result.updatedInventory.newQuantity
            }
        });
    } catch (error) {
        console.error('Error in saveSalesToDatabase:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

exports.fetchSalesData = async (req, res) => {
    try {
        const userId = req.session?.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        
        const salesData = await Sales.fetchSalesData(userId);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching Sales data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.deleteSalesItem = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.session?.user?.id;
        
        if (!id || !userId) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        const result = await Sales.deleteSalesData(id, userId);
        
        // Trigger inventory update
        const event = {
            type: 'inventoryUpdate',
            data: {
                productName: result.updatedInventory.productName,
                quantity: result.updatedInventory.quantity
            }
        };

        res.status(200).json({
            message: 'Item deleted successfully',
            inventoryUpdate: result.updatedInventory
        });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.updateSalesItem = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body[0];
        const userId = req.session?.user?.id;

        if (!id || !data || !userId) {
            return res.status(400).json({ error: 'Missing required data' });
        }

        const result = await Sales.updateSalesItem(id, data, userId);

        res.status(200).json({
            message: 'Sales item updated successfully',
            inventoryUpdate: result.updatedInventory
        });
    } catch (error) {
        console.error('Error updating sales item:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
};

exports.createSale = async (req, res) => {
    try {
        const saleData = req.body[0]; // Assuming data is sent as an array with one object
        
        if (!saleData) {
            return res.status(400).json({ error: 'Invalid sale data' });
        }

        const result = await Sales.createSaleWithInventoryCheck(saleData);
        res.status(200).json({ message: 'Sale created successfully' });
    } catch (error) {
        console.error('Error creating sale:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
};

exports.checkInventory = async (req, res) => {
    try {
        const { productName } = req.params;
        if (!productName) {
            return res.status(400).json({ error: 'Product name is required' });
        }
        const inventory = await Sales.checkInventory(productName);
        res.json(inventory);
    } catch (error) {
        console.error('Error checking inventory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};