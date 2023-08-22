const Category = require('../models/category_model');

module.exports = class CategoryController {
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const newCategory = new Category({ name, description });
            await newCategory.save();
            res.status(201).json({ message: 'Category created successfully', category: newCategory });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async getCategoryById(req, res) {
        try {
            const categoryId = req.query.id;
            const category = await Category.findById(categoryId);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async updateCategory(req, res) {
        try {
            const categoryId = req.query.id;
            const { name, description } = req.body;

            const updatedCategory = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true });
            if (!updatedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async deleteCategory(req, res) {
        try {
            const categoryId = req.query.id;
            const deletedCategory = await Category.findByIdAndDelete(categoryId);
            if (!deletedCategory) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
};
