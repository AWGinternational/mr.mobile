// ./src/models/Category.js (MySQL version)
const db = require('./db');  // Correct

class Category {
  static async getAllCategories(userId) {
    const pool = db.getPool();
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE user_id = ?',
      [userId]
    );
    return rows;
  }

  static async createCategory(name, userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const pool = db.getPool();
    const [result] = await pool.query(
      'INSERT INTO categories (name, user_id) VALUES (?, ?)',
      [name, userId]
    );
    return result.insertId;
  }

  static async updateCategory(categoryId, name, userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const pool = db.getPool();
    const [result] = await pool.query(
      'UPDATE categories SET name = ? WHERE id = ? AND user_id = ?',
      [name, categoryId, userId]
    );
    return result.affectedRows > 0;
  }

  static async deleteCategory(categoryId, userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }
    const pool = db.getPool();
    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [categoryId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = Category;
