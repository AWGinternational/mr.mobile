// src/models/suppliermodel.js

const db = require('./db');

async function addSupplier(supplierName, supplierAddress, contactNumber, userId) {
    const pool = db.getPool();
    const [result] = await pool.query(
        'INSERT INTO suppliers (supplier_name, supplier_address, contact_number, user_id) VALUES (?, ?, ?, ?)',
        [supplierName, supplierAddress, contactNumber, userId]
    );
    return { id: result.insertId, supplierName, supplierAddress, contactNumber, userId };
}

async function getSupplierById(supplierId, userId) {
    const pool = db.getPool();
    const [result] = await pool.query(
        'SELECT * FROM suppliers WHERE id = ? AND user_id = ?',
        [supplierId, userId]
    );
    return result[0] || null;
}

async function find(userId) {
    try {
        const pool = db.getPool();
        const [result] = await pool.query(
            'SELECT * FROM suppliers WHERE user_id = ?',
            [userId]
        );
        return result;
    } catch (error) {
        console.error('Error executing SQL query (find):', error);
        throw error;
    }
}

async function updateSupplier(supplierId, supplierName, supplierAddress, contactNumber, userId) {
    const pool = db.getPool();
    const [result] = await pool.query(
        'UPDATE suppliers SET supplier_name = ?, supplier_address = ?, contact_number = ? WHERE id = ? AND user_id = ?',
        [supplierName, supplierAddress, contactNumber, supplierId, userId]
    );
    return result.affectedRows > 0 ? { id: supplierId, supplierName, supplierAddress, contactNumber, userId } : null;
}

async function deleteSupplier(supplierId, userId) {
    const pool = db.getPool();
    const [result] = await pool.query(
        'DELETE FROM suppliers WHERE id = ? AND user_id = ?',
        [supplierId, userId]
    );
    return result.affectedRows > 0 ? { id: supplierId } : null;
}

module.exports = {
    addSupplier,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    find, // Add the find method to the exports
};