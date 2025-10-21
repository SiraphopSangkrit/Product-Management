const Category = require("../models/categories");

class CategoryService {
  async getAllCategories(options) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        sortBy = "name",
        order = "asc",
      } = options;

      const skip = (page - 1) * limit;

      let query = {};
       if (search) {
        query.name = { $regex: search, $options: 'i' };
      }

      const sortOptions = {};
      sortOptions[sortBy] = order === "asc" ? 1 : -1;

      const categories = await Category.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

        const total = await Category.countDocuments(query);

    return {
        categories,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      };
    } catch (error) {
        
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  async createCategory(categoryData) {
    try {
    
      const category = new Category(categoryData);

      await category.save();
      return category;
    } catch (error) {
      throw new Error("Error creating category");
    }
  }
  async updateCategory(categoryId, categoryData) {
    try {
      const category = await Category.findByIdAndUpdate(
        categoryId,
        categoryData,
        { new: true }
      );
      return category;
    } catch (error) {
      throw new Error("Error updating category");
    }
  }
  async deleteCategory(categoryId) {
    try {
      await Category.findByIdAndDelete(categoryId);
      
    } catch (error) {
      throw new Error("Error deleting category");
    }
  }
}
module.exports = new CategoryService();
