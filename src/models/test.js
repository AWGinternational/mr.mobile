// src/models/salesModel.js

const pool = require('./db');

async function fetchCategoryNames() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT DISTINCT category_name FROM inventory WHERE category_name IS NOT NULL ORDER BY category_name'
        );
        connection.release();
        
        return rows.map(row => ({
            name: row.category_name
        }));
    } catch (error) {
        console.error('Error fetching category names from inventory:', error);
        throw error;
    }
}

async function fetchProductsByCategory(categoryName) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(
            'SELECT product_name, sku, price, cost FROM inventory WHERE category_name = ? ORDER BY product_name',
            [categoryName]
        );
        connection.release();
        
        return rows.map(row => ({
            productName: row.product_name,
            sku: row.sku,
            price: row.price,
            cost: row.cost
        }));
    } catch (error) {
        console.error('Error fetching products by category from inventory:', error);
        throw error;
    }
}


async function saveSalesToDatabase(data) {
    try {
        const connection = await pool.getConnection();

        // Extract data from the request body
        const { date, categoryName, productName, quantity, price, cost, profit, total } = data;

        // Insert sales data into the 'sales' table
        await connection.query(
            'INSERT INTO sales (date, categoryName, productName, quantity, price, cost, profit, total) VALUES (?, ?, ?, ?, ?, ?,?, ?)',
            [date, categoryName, productName, quantity, price, cost, profit, total]
        );

        connection.release();
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}
async function fetchSalesData() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM sales');
        connection.release();

        const salesData = rows;

        return salesData;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        throw error;
    }
}
async function getSalesReport(dateRange) {
    try {
      
  
      const query = 'SELECT * FROM sales WHERE date BETWEEN ? AND ?'; // Replace ... with your conditions
      const [sales] = await pool.execute(query, [dateRange.fromDate, dateRange.toDate]);
      return sales;
    } catch (error) {
      throw error;
    }
  }



  async function deleteSalesData(id) {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Execute delete operation based on `id`
        const [result] = await connection.execute('DELETE FROM sales WHERE id = ?', [id]);
        
        // Ensure that a record was deleted
        if (result.affectedRows === 0) {
            throw new Error('No matching record found');
        }

        return result;  // Return result if deletion is successful
    } catch (error) {
        console.error('Database Error:', error.message);  // Log the error message
        throw error;  // Re-throw error for further handling in the controller
    } finally {
        if (connection) {
            connection.release();  // Release the connection
        }
    }
}



module.exports = {
    fetchCategoryNames,
    fetchProductsByCategory,
    saveSalesToDatabase,
    fetchSalesData,
    getSalesReport,
    deleteSalesData
  
};
