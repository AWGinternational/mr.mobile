const Inventory = require('../models/inventory');
const NodeCache = require('node-cache');
const db = require('../models/db'); // Add this line

// Configure cache with 5 minute TTL
const cache = new NodeCache({ 
    stdTTL: 300,  // 5 minutes
    checkperiod: 320 // Check for expired keys every 320 seconds
});

exports.saveToDatabase = async (req, res) => {
    const data = req.body;
    const userId = req.session.user.id;

    try {
        // Calculate total based on cost and quantity
        data.forEach(item => {
            item.total = (parseFloat(item.cost) * parseInt(item.quantity)).toFixed(2);
        });

        await Inventory.saveToDatabase(data, userId);
        // Clear cache for this user
        cache.del(`inventory_${userId}`);
        res.status(200).send('Data saved to database');
    } catch (error) {
        console.error('Error saving to database:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.fetchCategoryNames = async (req, res) => {
    try {
        const categoryNames = await Inventory.fetchCategoryNames();  // Changed to use Inventory model
        res.json(categoryNames);
    } catch (error) {
        console.error('Error in fetchCategoryNames controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.fetchProductsByCategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        const userId = req.session.user.id;

        if (!categoryName) {
            return res.status(400).json({ 
                error: 'Category name is required',
                success: false
            });
        }

        console.log('Fetching products for category:', categoryName, 'userId:', userId);
        
        const products = await Inventory.fetchProductsByCategory(categoryName, userId);
        
        console.log('Products found:', products);

        if (!products || products.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: 'No products found for this category'
            });
        }

        res.json({
            success: true,
            data: products
        });

    } catch (error) {
        console.error('Error in fetchProductsByCategory controller:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            success: false,
            message: error.message
        });
    }
};

exports.fetchSupplierNames = async (req, res) => {
    try {
        const supplierNames = await Inventory.fetchSupplierNames();
        res.json(supplierNames);
    } catch (error) {
        console.error('Error fetching supplier names:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.fetchInventoryData = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const cacheKey = `inventory_${userId}`;
        
        // Always get fresh data for updates
        const inventoryData = await Inventory.fetchInventoryData(userId);
        // Update cache
        cache.set(cacheKey, inventoryData);

        res.json(inventoryData);
    } catch (error) {
        console.error('Error fetching inventory data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.makeSale = async (req, res) => {
    const saleData = req.body;

    try {
        const inventoryData = await Inventory.fetchInventoryData();
        const inventoryItem = inventoryData.find(item => item.productName === saleData.productName);

        if (!inventoryItem) {
            console.log('Product not found in inventory:', saleData.productName);
            return res.status(400).send('Product not found in inventory');
        }

        const availableQuantity = inventoryItem.quantity;
        
        if (saleData.quantity > availableQuantity) {
            console.log('Insufficient quantity in inventory for the sale');
            return res.status(400).send('Insufficient quantity in inventory for the sale');
        }

        console.log('Sale data before update:', saleData);
        await Inventory.updateInventoryQuantity(saleData.productName, saleData.quantity);
        await sales.saveToDatabase(saleData);  // Changed to lowercase 'sales'
        console.log('Sale data after update:', saleData);
        console.log('Sale successful');
        res.status(200).send('Sale successful');
    } catch (error) {
        console.error('Error making sale:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.deleteInventoryItem = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.session?.user?.id;

        if (!id || !userId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid request' 
            });
        }

        const result = await Inventory.deleteInventoryItem(id, userId);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        // Clear cache for this user
        cache.del(`inventory_${userId}`);
        
        res.json({ 
            success: true, 
            message: 'Item deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting inventory item:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

exports.updateInventoryItem = async (req, res) => {
    const id = req.params.id;
    const data = req.body[0];
    const userId = req.session.user.id;

    if (!id || id === 'undefined') {
        return res.status(400).json({ error: 'Invalid ID provided' });
    }

    try {
        console.log('Received update data:', data);

        if (!data.sku) {
            return res.status(400).json({ error: 'SKU cannot be null or empty' });
        }

        const result = await Inventory.updateInventoryItem(id, data);
        
        // Clear cache for this user
        cache.del(`inventory_${userId}`);

        // Fetch fresh data after update
        const updatedData = await Inventory.fetchInventoryData(userId);
        
        res.status(200).json({ 
            message: 'Item updated successfully',
            updatedData: updatedData
        });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message 
        });
    }
};

exports.checkInventoryQuantity = async (req, res) => {
    try {
        const { productName } = req.params;
        const userId = req.session.user.id;
        const pool = db.getPool(); // Get pool from db module

        if (!productName || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        console.log('Checking inventory for:', { productName, userId });

        const [rows] = await pool.query(
            'SELECT quantity FROM inventory WHERE product_name = ? AND user_id = ? LIMIT 1',
            [productName, userId]
        );

        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Product not found in inventory'
            });
        }

        console.log('Found inventory:', rows[0]);

        return res.json({
            success: true,
            quantity: rows[0].quantity // Changed from availableQuantity to quantity
        });
    } catch (error) {
        console.error('Error checking inventory:', error);
        return res.status(500).json({
            success: false,
            error: 'Error checking inventory'
        });
    }
};

exports.updateInventoryQuantity = async (req, res) => {
    try {
        const { productName, quantity } = req.body;
        
        // First check if we have enough inventory
        const inventoryData = await Inventory.fetchInventoryData();
        const inventoryItem = inventoryData.find(item => item.productName === productName);
        
        if (!inventoryItem) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found in inventory' 
            });
        }
        
        if (inventoryItem.quantity < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient inventory' 
            });
        }
        
        // Update the inventory quantity
        await Inventory.updateInventoryQuantity(productName, quantity);
        
        res.json({ 
            success: true, 
            message: 'Inventory updated successfully' 
        });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error' 
        });
    }
};

exports.checkSkuExists = async (req, res) => {
    try {
        const { sku } = req.params;
        const userId = req.session?.user?.id;

        const [existing] = await db.getPool().query(
            'SELECT id FROM inventory WHERE sku = ? AND user_id = ?',
            [sku, userId]
        );

        res.json({
            exists: existing.length > 0
        });
    } catch (error) {
        console.error('Error checking SKU:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};