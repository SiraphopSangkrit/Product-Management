const CategoryService = require('../services/CategoryService');

class CategoryController {

    async getAllCategories(req, res){
        try{
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || '',
                sortBy: req.query.sortBy || 'name',
                order: req.query.order || 'asc',
            };
            const categories = await CategoryService.getAllCategories(options);
            res.status(200).json({
                success: true,
                data: categories,
                pagination: categories.pagination
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async getCategoryById(req, res){
        try{
            const category = await CategoryService.getCategoryById(req.params.id);
            if(!category){
                return res.status(404).json({ message: 'Category not found' });
            }
            res.status(200).json({
                success: true,
                data: category
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async createCategory(req, res){
        try{
            
            const category = await CategoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                data: category
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async updateCategory(req, res){
        try{
            const category = await CategoryService.updateCategory(req.params.id, req.body);
            res.status(200).json({
                success: true,
                data: category,
                message: 'Category updated successfully'
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async deleteCategory(req, res){
        try{
            await CategoryService.deleteCategory(req.params.id);
            res.status(204).json({
                success: true,
                message: 'Category deleted successfully'
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new CategoryController();  