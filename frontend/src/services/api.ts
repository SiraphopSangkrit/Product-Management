import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

// Types for our data models
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export const productApi = {
  async getAllProducts(params?: { 
    search?: string; 
    categoryId?: string; 
    page?: number; 
    limit?: number 
  }): Promise<any> {
    try {
      let url = '/products'
      
      if (params && (params.search || params.categoryId || params.page || params.limit)) {
        const searchParams = new URLSearchParams()
        
        if (params.search && params.search.trim()) {
          searchParams.append('search', params.search.trim())
        }
        if (params.categoryId && params.categoryId.trim()) {
          searchParams.append('categoryId', params.categoryId.trim())
        }
        if (params.page) {
          searchParams.append('page', params.page.toString())
        }
        if (params.limit) {
          searchParams.append('limit', params.limit.toString())
        }

        url += `?${searchParams.toString()}`
      }
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  },

  async getProduct(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/product/${id}`)
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  async createProduct(product: Omit<Product, 'id'>): Promise<any> {
    try {
      // Validate and clean data before sending
      const productData = {
        name: String(product.name || '').trim(),
        description: String(product.description || '').trim(),
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 0,
        categoryId: String(product.categoryId || '').trim()
      };

      // Validate required fields
      if (!productData.name) {
        throw new Error('Product name is required');
      }
      if (!productData.categoryId) {
        throw new Error('Category is required');
      }
      if (productData.price < 0) {
        throw new Error('Price must be a positive number');
      }
      if (productData.quantity < 0) {
        throw new Error('Quantity must be a positive number');
      }

      console.log('Creating product with data:', productData);
      
      const response = await apiClient.post('/product', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<any> {
    try {
      // Validate and clean data before sending
      const productData: any = {};
      
      if (product.name !== undefined) {
        productData.name = String(product.name).trim();
        if (!productData.name) {
          throw new Error('Product name cannot be empty');
        }
      }
      
      if (product.description !== undefined) {
        productData.description = String(product.description || '').trim();
      }
      
      if (product.price !== undefined) {
        productData.price = Number(product.price);
        if (isNaN(productData.price) || productData.price < 0) {
          throw new Error('Price must be a valid positive number');
        }
      }
      
      if (product.quantity !== undefined) {
        productData.quantity = Number(product.quantity);
        if (isNaN(productData.quantity) || productData.quantity < 0) {
          throw new Error('Quantity must be a valid positive number');
        }
      }
      
      if (product.categoryId !== undefined) {
        // Handle different categoryId formats
        let categoryId = '';
        
        if (typeof product.categoryId === 'string') {
          categoryId = product.categoryId.trim();
        } else if (typeof product.categoryId === 'object' && product.categoryId !== null) {
          // If categoryId is an object (populated category), extract the ID
          categoryId = String((product.categoryId as any)._id || (product.categoryId as any).id || '').trim();
        }
        
        if (!categoryId) {
          throw new Error('Category ID is required');
        }
        
        productData.categoryId = categoryId;
      }

      console.log('Updating product with data:', productData);
      console.log('Product ID:', id);
      
      const response = await apiClient.put(`/product/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(`/product/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  }
};

export const categoryApi = {
  async getAllCategories(params?: { search?: string; page?: number; limit?: number }): Promise<any> {
    try {
      let url = '/categories'
      
      if (params && (params.search || params.page || params.limit)) {
        const searchParams = new URLSearchParams()
        
        if (params.search && params.search.trim()) {
          searchParams.append('search', params.search.trim())
        }
        if (params.page) {
          searchParams.append('page', params.page.toString())
        }
        if (params.limit) {
          searchParams.append('limit', params.limit.toString())
        }

        url += `?${searchParams.toString()}`
      }
      
      const response = await apiClient.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  async getCategory(id: string): Promise<any> {
    try {
      const response = await apiClient.get(`/category/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<any> {
    try {
      const categoryData = {
        name: String(category.name || '').trim()
      };
      
      if (!categoryData.name) {
        throw new Error('Category name is required');
      }
      
      const response = await apiClient.post('/category', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<any> {
    try {
      const categoryData: any = {};
      
      if (category.name !== undefined) {
        categoryData.name = String(category.name).trim();
        if (!categoryData.name) {
          throw new Error('Category name cannot be empty');
        }
      }
      
      const response = await apiClient.put(`/category/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/category/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};

// Convenience export for commonly used functions
export const api = {
  products: productApi,
  categories: categoryApi,
};

// Default export
export default api;