const ProductService = require('../services/ProductService');

class ProductController {

    async getAllProducts(req, res){
        try{
            const options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                search: req.query.search || '',
                categoryId: req.query.categoryId || '',
                sortBy: req.query.sortBy || 'name',
                order: req.query.order || 'asc',
            };
            const products = await ProductService.getAllProducts(options);
            res.status(200).json({
                success: true,
                data: products,
                pagination: products.pagination
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async createProduct(req, res){
        try{
            const product = await ProductService.createProduct(req.body);
            res.status(201).json({
                success: true,
                data: product
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }

    async updateProduct(req, res){
        try{
            const product = await ProductService.updateProduct(req.params.id, req.body);
            res.status(200).json({
                success: true,
                data: product,
                message: 'Product updated successfully'
            });
        }catch(error){
            res.status(500).json({ message: error.message });
        }
    }
                                                                                                                            
    async deleteProduct(req, res){       
        try{
            await ProductService.deleteProduct(req.params.id);
            res.status(204).json({
                success: true,
                message: 'Product deleted successfully'
            }).end();
        }catch(error){
            res.status(500).json({ message: error.message });
        }           

    }

}

module.exports = new ProductController();