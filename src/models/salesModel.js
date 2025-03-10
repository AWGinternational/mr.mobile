const db = require('./db');

const salesModel = {
    fetchCategoryNames: async (userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                `SELECT DISTINCT 
                    category_name as name,
                    COUNT(id) as productCount
                FROM inventory 
                WHERE user_id = ? 
                    AND category_name IS NOT NULL 
                    AND category_name != ''
                    AND quantity > 0
                GROUP BY category_name
                ORDER BY category_name`,
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching category names:', error);
            throw error;
        }
    },

    fetchProductsByCategory: async (categoryName, userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                `SELECT 
                    i.product_name,
                    i.sku,
                    i.price,
                    i.cost,
                    i.quantity
                FROM inventory i
                WHERE i.category_name = ? 
                    AND i.user_id = ? 
                    AND i.quantity > 0
                    AND i.product_name IS NOT NULL
                    AND i.product_name != ''
                ORDER BY i.product_name`,
                [categoryName, userId]
            );
            
            return rows.map(row => ({
                productName: row.product_name,
                sku: row.sku,
                price: row.price,
                cost: row.cost,
                quantity: row.quantity
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    saveSalesToDatabase: async (data, userId) => {
        const pool = db.getPool();
        try {
            // Start transaction
            await pool.query('START TRANSACTION');

            // First check inventory with lock
            const [inventoryItem] = await pool.query(
                'SELECT id, quantity FROM inventory WHERE product_name = ? AND user_id = ? FOR UPDATE',
                [data.productName, userId]
            );

            if (!inventoryItem.length || inventoryItem[0].quantity < data.quantity) {
                await pool.query('ROLLBACK');
                throw new Error(`Insufficient inventory. Available: ${inventoryItem.length ? inventoryItem[0].quantity : 0}`);
            }

            // Update inventory
            const [updateResult] = await pool.query(
                `UPDATE inventory 
                 SET quantity = quantity - ? 
                 WHERE product_name = ? AND user_id = ?`,
                [data.quantity, data.productName, userId]
            );

            // Save the sale
            const [saleResult] = await pool.query(
                `INSERT INTO sales 
                (date, categoryName, productName, sku, quantity, price, discount, cost, profit, total, user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

                [data.date, data.categoryName, data.productName, data.sku, 
                 data.quantity, data.price, data.discount, data.cost, data.profit, data.total, userId]
            );

            // Get updated inventory quantity
            const [updatedInventory] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? AND user_id = ?',
                [data.productName, userId]
            );

            await pool.query('COMMIT');

            // Return both sale result and updated inventory data
            return {
                sale: saleResult,
                updatedInventory: {
                    productName: data.productName,
                    newQuantity: updatedInventory[0].quantity
                }
            };

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    },

    fetchSalesData: async (userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.execute(
                'SELECT * FROM sales WHERE user_id = ? ORDER BY date DESC',
                [userId]
            );
            return rows;
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw error;
        }
    },

    getSalesReport: async (dateRange) => {
        const pool = db.getPool();
        try {
            const [sales] = await pool.query(
                'SELECT * FROM sales WHERE date BETWEEN ? AND ?',
                [dateRange.fromDate, dateRange.toDate]
            );
            return sales;
        } catch (error) {
            throw error;
        }
    },

    deleteSalesData: async (id, userId) => {
        const pool = db.getPool();
        try {
            await pool.query('START TRANSACTION');

            // Get the sale record first
            const [saleRecord] = await pool.query(
                'SELECT quantity, productName FROM sales WHERE id = ?',
                [id]
            );

            if (!saleRecord.length) {
                throw new Error('Sale record not found');
            }

            // Restore the quantity to inventory
            await pool.query(
                'UPDATE inventory SET quantity = quantity + ? WHERE product_name = ? AND user_id = ?',
                [saleRecord[0].quantity, saleRecord[0].productName, userId]
            );

            // Delete the sale record
            const [result] = await pool.query('DELETE FROM sales WHERE id = ?', [id]);

            await pool.query('COMMIT');

            // Get updated inventory quantity
            const [updatedInventory] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? AND user_id = ?',
                [saleRecord[0].productName, userId]
            );

            return {
                success: true,
                message: 'Sale deleted and inventory restored',
                updatedInventory: updatedInventory[0]
            };

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    },

    checkInventory: async (productName) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ?',
                [productName]
            );
            if (rows.length === 0) {
                return { quantity: 0 };
            }
            return rows[0];
        } catch (error) {
            console.error('Error checking inventory:', error);
            throw error;
        }
    },

    updateSalesItem: async (id, data, userId) => {
        const pool = db.getPool();
        try {
            await pool.query('START TRANSACTION');

            // Get the original sale record
            const [originalSale] = await pool.query(
                'SELECT quantity, productName FROM sales WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!originalSale.length) {
                throw new Error('Sale record not found');
            }

            // Get current inventory
            const [currentInventory] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? AND user_id = ?',
                [data.productName, userId]
            );

            if (!currentInventory.length) {
                throw new Error('Product not found in inventory');
            }

            // First restore the original quantity
            await pool.query(
                'UPDATE inventory SET quantity = quantity + ? WHERE product_name = ? AND user_id = ?',
                [originalSale[0].quantity, originalSale[0].productName, userId]
            );

            // Then deduct the new quantity
            await pool.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE product_name = ? AND user_id = ?',
                [data.quantity, data.productName, userId]
            );

            // Update the sales record - Removed update_date from the query
            await pool.query(
                `UPDATE sales 
                 SET date = ?, 
                     categoryName = ?, 
                     productName = ?, 
                     sku = ?,
                     quantity = ?, 
                     price = ?, 
                     discount = ?,
                     cost = ?, 
                     profit = ?, 
                     total = ?
                 WHERE id = ? AND user_id = ?`,
                [
                    data.date,
                    data.categoryName,
                    data.productName,
                    data.sku,
                    data.quantity,
                    data.price,
                    data.discount,
                    data.cost,
                    data.profit,
                    data.total,
                    id,
                    userId
                ]
            );

            await pool.query('COMMIT');

            // Get updated sale record
            const [updatedSale] = await pool.query(
                'SELECT * FROM sales WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            // Get updated inventory data
            const [updatedInventory] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? AND user_id = ?',
                [data.productName, userId]
            );

            return {
                success: true,
                message: 'Sale updated successfully',
                updatedSale: updatedSale[0],
                inventoryUpdate: {
                    productName: data.productName,
                    quantity: updatedInventory[0]?.quantity || 0
                }
            };

        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }
};

module.exports = salesModel;
