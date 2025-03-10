const db = require('./db');

const Inventory = {
    fetchCategoryNames: async () => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT DISTINCT categoryName FROM products WHERE categoryName IS NOT NULL ORDER BY categoryName'
            );
            return rows.map(row => ({
                name: row.categoryName
            }));
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
                    p.productName,
                    p.sku,
                    p.price,
                    p.cost
                FROM products p
                WHERE p.categoryName = ? 
                AND p.user_id = ?
                ORDER BY p.productName`,
                [categoryName, userId]
            );
            
            console.log('Database query results from products table:', rows);
            
            return rows.map(row => ({
                productName: row.productName,
                sku: row.sku,
                price: row.price,
                cost: row.cost,
                // Quantity is not included since it comes from inventory
                quantity: 0 // Default to 0 since we're fetching from products table
            }));
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    },

    saveToDatabase: async (data, userId) => {
        const pool = db.getPool();
        try {
            await pool.query('START TRANSACTION');
            
            for (const row of data) {
                // First check if SKU exists in products table
                const [productExists] = await pool.query(
                    'SELECT productName, price, cost FROM products WHERE sku = ? AND user_id = ?',
                    [row.sku, userId]
                );

                if (!productExists.length) {
                    // If product doesn't exist, insert it into products table first
                    await pool.query(
                        `INSERT INTO products 
                         (productName, categoryName, sku, price, cost, user_id) 
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            row.productName,
                            row.categoryName,
                            row.sku,
                            row.price || 0,
                            row.cost || 0,
                            userId
                        ]
                    );
                }

                // Then handle inventory
                const [existingProduct] = await pool.query(
                    'SELECT id FROM inventory WHERE sku = ? AND user_id = ?',
                    [row.sku, userId]
                );

                if (existingProduct.length > 0) {
                    // Update existing inventory
                    await pool.query(
                        `UPDATE inventory 
                         SET quantity = quantity + ?,
                             price = ?,
                             cost = ?,
                             total = total + ?,
                             date = ?,
                             supplier_name = ? 
                         WHERE sku = ? AND user_id = ?`,
                        [
                            row.quantity,
                            row.price || 0,
                            row.cost || 0,
                            row.total,
                            row.date,
                            row.supplierName,
                            row.sku,
                            userId
                        ]
                    );
                } else {
                    // Insert new inventory entry with all required fields
                    await pool.query(
                        `INSERT INTO inventory 
                         (date, category_name, product_name, supplier_name, sku, 
                          price, cost, quantity, total, user_id) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            row.date,
                            row.categoryName,
                            row.productName,
                            row.supplierName,
                            row.sku,
                            row.price || 0,
                            row.cost || 0,
                            row.quantity,
                            row.total,
                            userId
                        ]
                    );
                }
            }
            
            await pool.query('COMMIT');
        } catch (error) {
            await pool.query('ROLLBACK');
            console.error('Error saving data to the database:', error);
            throw error;
        }
    },

    fetchSupplierNames: async () => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query('SELECT supplier_name FROM suppliers');
            return rows.map(row => row.supplier_name);
        } catch (error) {
            console.error('Error fetching supplier names:', error);
            throw error;
        }
    },

    fetchInventoryData: async (userId) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(`
                SELECT 
                    id,
                    DATE_FORMAT(date, '%Y-%m-%d') as date,
                    category_name,
                    product_name,
                    supplier_name,
                    price,
                    cost,
                    quantity,
                    total
                FROM inventory
                WHERE user_id = ?
                ORDER BY date DESC
            `, [userId]);
            
            return rows.map(row => ({
                id: row.id,
                date: row.date,
                categoryName: row.category_name,
                productName: row.product_name,    
                supplierName: row.supplier_name,  
                price: row.price,
                cost: row.cost,
                quantity: row.quantity,
                total: row.total
            }));
        } catch (error) {
            console.error('Error fetching inventory data:', error);
            throw error;
        }
    },

    getStockReport: async (dateRange) => {
        const pool = db.getPool();
        try {
            const [stock] = await pool.query(
                'SELECT * FROM inventory WHERE date BETWEEN ? AND ?',
                [dateRange.fromDate, dateRange.toDate]
            );
            return stock;
        } catch (error) {
            throw error;
        }
    },

    updateInventoryQuantity: async (productName, soldQuantity) => {
        const pool = db.getPool();
        try {
            await pool.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?',
                [soldQuantity, productName]
            );
            const [updatedRows] = await pool.query(
                'SELECT * FROM inventory WHERE product_name = ?',
                [productName]
            );
            return updatedRows[0];
        } catch (error) {
            console.error('Error updating inventory quantity:', error);
            throw error;
        }
    },

    deleteInventoryItem: async (id, userId) => {
        const pool = db.getPool();
        try {
            await pool.query('START TRANSACTION');

            // First check if the item exists and belongs to the user
            const [item] = await pool.query(
                'SELECT * FROM inventory WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!item.length) {
                throw new Error('Item not found or unauthorized');
            }

            // Delete the item
            const [result] = await pool.query(
                'DELETE FROM inventory WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            await pool.query('COMMIT');
            return result;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    },

    updateInventoryItem: async (id, data) => {
        if (!id || isNaN(Number(id))) {
            throw new Error('Invalid ID provided');
        }

        const pool = db.getPool();
        try {
            const [result] = await pool.query(
                `UPDATE inventory 
                SET date = ?,
                    category_name = ?,
                    product_name = ?,
                    supplier_name = ?,
                    sku = ?,
                    price = ?,
                    cost = ?,
                    quantity = ?,
                    total = ?
                WHERE id = ?`,
                [
                    data.date,
                    data.categoryName,
                    data.productName,
                    data.supplierName,
                    data.sku,
                    data.price,
                    data.cost,
                    data.quantity,
                    data.total,
                    Number(id)
                ]
            );
            return result;
        } catch (error) {
            console.error('SQL Error:', error);
            throw error;
        }
    },

    checkInventoryQuantity: async (productName) => {
        const pool = db.getPool();
        try {
            const [rows] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? ORDER BY date DESC LIMIT 1',
                [productName]
            );
            return rows.length === 0 
                ? { success: false, message: 'Product not found' }
                : { success: true, availableQuantity: rows[0].quantity };
        } catch (error) {
            console.error('Error checking inventory quantity:', error);
            throw error;
        }
    },

    updateInventoryQuantityAfterSale: async (productName, soldQuantity) => {
        const pool = db.getPool();
        try {
            const [currentInventory] = await pool.query(
                'SELECT quantity FROM inventory WHERE product_name = ? ORDER BY date DESC LIMIT 1',
                [productName]
            );

            if (currentInventory.length === 0) {
                throw new Error('Product not found in inventory');
            }

            if (currentInventory[0].quantity < soldQuantity) {
                throw new Error('Insufficient inventory');
            }

            await pool.query(
                'UPDATE inventory SET quantity = quantity - ? WHERE product_name = ?',
                [soldQuantity, productName]
            );

            return { success: true };
        } catch (error) {
            console.error('Error updating inventory quantity:', error);
            throw error;
        }
    }
};

module.exports = Inventory;