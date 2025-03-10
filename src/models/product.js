const db = require('./db');

async function createProduct({ sku, category, productName, description, price, cost }, userId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.execute(
            'INSERT INTO products (sku, categoryName, productName, description, price, cost, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [sku, category, productName, description, price, cost, userId]
        );
        await connection.commit();
        return { id: result.insertId, sku, category, productName, description, price, cost };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getAllProducts(userId, isAdmin) {
    const connection = await db.getConnection();
    try {
        const query = isAdmin ? 
            'SELECT * FROM products' : 
            'SELECT * FROM products WHERE user_id = ?';
        const params = isAdmin ? [] : [userId];
        const [rows] = await connection.execute(query, params);
        return rows;
    } finally {
        connection.release();
    }
}

async function updateProduct({ sku, category, productName, description, price, cost }, userId, isAdmin) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const query = isAdmin ?
            'UPDATE products SET categoryName=?, productName=?, description=?, price=?, cost=? WHERE sku=?' :
            'UPDATE products SET categoryName=?, productName=?, description=?, price=?, cost=? WHERE sku=? AND user_id=?';
        const params = isAdmin ?
            [category, productName, description, price, cost, sku] :
            [category, productName, description, price, cost, sku, userId];
        const [result] = await connection.execute(query, params);
        await connection.commit();
        return { sku, category, productName, description, price, cost };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function deleteProduct(sku, userId, isAdmin) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const query = isAdmin ?
            'DELETE FROM products WHERE sku=?' :
            'DELETE FROM products WHERE sku=? AND user_id=?';
        const params = isAdmin ? [sku] : [sku, userId];
        await connection.execute(query, params);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function getCategories() {
    const connection = await db.getConnection();
    try {
        const [rows] = await connection.execute('SELECT name FROM categories');
        return rows;
    } finally {
        connection.release();
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getCategories,
};
