const Product = require('../models/products');

class ProductService {

    async getAllProducts(options = {}) {
        try {
            const  {
                page = 1,
                limit = 10,
                search = '',
                categoryId = '',
                sortBy = 'name',
                order = 'asc',
              } = options;

              const skip = (page - 1) * limit;

              let query = {};
               if (search) {
                query.$text = { $search: search, $options: 'i' };
              }

              if (categoryId) {
        query.category = categoryId;
      }

              const sortOptions = {};
              sortOptions[sortBy] = order === "asc" ? 1 : -1;

              const products = await Product.find(query)
                .populate('categoryId')
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit));

                const total = await Product.countDocuments(query);

            return {
                products,
                pagination: {
                  current: parseInt(page),
                  pages: Math.ceil(total / limit),
                  total,
                  limit: parseInt(limit)
                }
            }

        } catch (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async createProduct(productData) {
        try {
            const product = new Product(productData);
            await product.save();
            return product;
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    }

    async updateProduct(productId, productData) {
        try {
            const product = await Product.findByIdAndUpdate(
                productId,
                productData,
                { new: true }
            );
            return product;
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    }

    async deleteProduct(productId) {
        try {
            await Product.findByIdAndDelete(productId);
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    }
}

module.exports = new ProductService();
