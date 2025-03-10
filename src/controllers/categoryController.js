// ./src/controllers/categoryController.js
const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const categories = await Category.getAllCategories(userId);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const categoryId = await Category.createCategory(name, userId);
    res.status(201).json({ message: 'Category added successfully', categoryId });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const categoryId = req.params.id;
    const { name } = req.body;
    const updated = await Category.updateCategory(categoryId, name, userId);
    
    if (!updated) {
      return res.status(404).json({ message: 'Category not found or not authorized' });
    }
    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const categoryId = req.params.id;
    const deleted = await Category.deleteCategory(categoryId, userId);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Category not found or not authorized' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
