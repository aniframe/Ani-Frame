const Category = require('../models/category_model');
const update_path = require('../utilities/response_image_url');
const fs = require('fs');
const path = require('path');

module.exports = class CategoryController {
    async createCategory(req, res) {
        try {
            const { name, description } = req.body;
            const newCategory = new Category({ name, description, image: req.file.filename });
            await newCategory.save();
            res.status(201).json({ message: 'Category created successfully', category: newCategory });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async getAllCategories(req, res) {
        try {
            const categories = await Category.find();
            for (let i = 0; i < categories.length; i++) {
                categories[i].image = await update_path("category", categories[i].image);
            }
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }

    async getCategoryById(req, res) {
        try {
            const categoryId = req.query.id;
            const category = await Category.findById(categoryId);
            category.image = await update_path("category", category.image);
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

            // Determine whether an image is provided or not
            let updateData = { name, description };
            if (req.file) {
                updateData.image = req.file.filename;
            }

            const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });

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

            if (deletedCategory.image && deletedCategory.image.length > 0) {
                const imageDir = path.join(__dirname, '..', '..', 'src', 'public', 'uploads', 'images', 'category');

                const imagePath = path.join(imageDir, deletedCategory.image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`Deleted image: ${imagePath}`);
                }
            }
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred' });
        }
    }
};
