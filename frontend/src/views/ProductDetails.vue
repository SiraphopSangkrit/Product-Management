<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi, categoryApi, type Product, type Category } from '../services/api'

const route = useRoute()
const router = useRouter()

// Reactive data
const product = ref<Product | null>(null)
const category = ref<Category | null>(null)
const loading = ref(false)
const error = ref('')
const notFound = ref(false)
const showEditModal = ref(false)
const productForm = ref({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: ''
})
const categories = ref<Category[]>([])
const closeModals = () => {
  showEditModal.value = false
}

// Computed properties
const productId = computed(() => route.params.id as string)
const formattedPrice = computed(() => {
  if (!product.value) return '0.00'
  return product.value.price.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
})

const formattedDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const stockStatus = computed(() => {
  if (!product.value) return { text: 'Unknown', class: 'text-gray-500' }
  
  if (product.value.quantity === 0) {
    return { text: 'Out of Stock', class: 'text-red-600' }
  } else if (product.value.quantity <= 10) {
    return { text: 'Low Stock', class: 'text-orange-600' }
  } else {
    return { text: 'In Stock', class: 'text-green-600' }
  }
})

const fetchCategories = async () => {
  try {
    const response = await categoryApi.getAllCategories()
    if (response && response.data && Array.isArray(response.data.categories)) {
      categories.value = response.data.categories.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}
const fetchProduct = async () => {
  try {
    loading.value = true
    error.value = ''
    notFound.value = false
    
    const response = await productApi.getProduct(productId.value)
    
    if (response && response.success && response.data) {
      const productData = response.data
      
      // Handle categoryId properly - could be string or populated object
      let productCategoryId = ''
      if (productData.categoryId) {
        if (typeof productData.categoryId === 'string') {
          productCategoryId = productData.categoryId
        } else if (typeof productData.categoryId === 'object' && productData.categoryId !== null) {
          productCategoryId = productData.categoryId._id || productData.categoryId.id || ''
          // If category is populated, use it directly
          if (productData.categoryId.name) {
            category.value = {
              id: productCategoryId,
              name: productData.categoryId.name,
              createdAt: productData.categoryId.createdAt,
              updatedAt: productData.categoryId.updatedAt
            }
          }
        }
      }
      
      product.value = {
        id: productData._id || productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price || 0,
        quantity: productData.quantity || 0,
        categoryId: productCategoryId,
        createdAt: productData.createdAt,
        updatedAt: productData.updatedAt
      }
      
      
      if (!category.value && productCategoryId) {
        await fetchCategory(productCategoryId)
      }
    } else {
      notFound.value = true
    }
  } catch (err: any) {
    console.error('Error fetching product:', err)
    if (err.response?.status === 404) {
      notFound.value = true
    } else {
      error.value = err.message || 'Failed to fetch product details'
    }
  } finally {
    loading.value = false
  }
}

const fetchCategory = async (categoryId: string) => {
  try {
    const response = await categoryApi.getAllCategories()
    
    if (response && response.data && Array.isArray(response.data.categories)) {
      const foundCategory = response.data.categories.find((cat: any) => 
        (cat._id === categoryId || cat.id === categoryId)
      )
      
      if (foundCategory) {
        category.value = {
          id: foundCategory._id || foundCategory.id,
          name: foundCategory.name,
          createdAt: foundCategory.createdAt,
          updatedAt: foundCategory.updatedAt
        }
      }
    }
  } catch (err) {
    console.error('Error fetching category:', err)
  }
}

const goBack = () => {
  router.push('/products')
}

const editProduct = () => {
fetchCategories()  
  if (product.value) {
    productForm.value = {
      name: product.value.name,
      description: product.value.description || '',
      price: product.value.price,
      quantity: product.value.quantity,
      categoryId: product.value.categoryId || ''
    }
    showEditModal.value = true
  } 
}

const saveProduct = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await productApi.updateProduct(productId.value, {
      name: productForm.value.name,
      description: productForm.value.description,
      price: productForm.value.price,
      quantity: productForm.value.quantity,
      categoryId: productForm.value.categoryId
    })
    
    if (response && response.success) {
      await fetchProduct()
      closeModals()
    } else {
      error.value = 'Failed to update product'
    }
  } catch (err: any) {
    console.error('Error updating product:', err)
    error.value = err.message || 'Failed to update product'
  } finally {
    loading.value = false
  }
}
// Lifecycle
onMounted(() => {
  if (productId.value) {
    fetchProduct()
  } else {
    notFound.value = true
  }
})
</script>

<template>
  <div class="bg-gray-300 mx-auto px-4 py-8">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Loading product details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-md mx-auto text-center">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="text-red-600 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Product</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchProduct"
          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="max-w-md mx-auto text-center">
      <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div class="text-gray-400 mb-4">
          <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-5v3"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Product Not Found</h3>
        <p class="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <button 
          @click="goBack"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Product Details -->
    <div v-else-if="product" class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-start mb-8">
        <div>
          <button 
            @click="goBack"
            class="flex items-center text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Products
          </button>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
          <p class="text-gray-600">Product ID: {{ product.id }}</p>
        </div>
        <button 
          @click="editProduct"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit Product
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Product Information -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info Card -->
          <div class="bg-white rounded-lg shadow-xl border border-gray-400 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p class="text-gray-900 text-lg">{{ product.name }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p class="text-gray-700 leading-relaxed">
                  {{ product.description || 'No description provided' }}
                </p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p class="text-gray-900">
                 <router-link 
                    v-if="category" 
                    :to="`/categories/${category.id}`" 
                    class="text-blue-600 hover:underline"
                  >
                    {{ category.name }}
                  </router-link>
                  <span v-else class="text-gray-600">Uncategorized</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Inventory Details -->
          <div class="bg-white rounded-lg shadow-xl border border-gray-400 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Inventory Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Price</label>
                <p class="text-2xl font-bold text-green-600">${{ formattedPrice }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <div class="flex items-center">
                  <p class="text-2xl font-bold text-gray-900 mr-3">{{ product.quantity }}</p>
                  <span :class="stockStatus.class + ' text-sm font-medium px-2 py-1 rounded-full bg-gray-100'">
                    {{ stockStatus.text }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="bg-white rounded-lg shadow-xl border border-gray-400 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center py-2 border-b border-gray-100">
                <span class="text-sm font-medium text-gray-700">Created</span>
                <span class="text-sm text-gray-600">{{ formattedDate(product.createdAt) }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-sm font-medium text-gray-700">Last Updated</span>
                <span class="text-sm text-gray-600">{{ formattedDate(product.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Quick Stats -->
          <div class="bg-white rounded-lg shadow-xl border border-gray-400 p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Stock Status</span>
                <span :class="stockStatus.class + ' text-sm font-medium'">
                  {{ stockStatus.text }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Value</span>
                <span class="text-sm font-medium text-gray-900">
                  ${{ (product.price * product.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Unit Price</span>
                <span class="text-sm font-medium text-gray-900">${{ formattedPrice }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div class="space-y-3">
              <button 
                @click="editProduct"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Product
              </button>
              
              <button 
                @click="goBack"
                class="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Products
              </button>

            
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showEditModal" class="modal modal-open text-gray-900">
        <div class="modal-box w-11/12 max-w-lg">
          <h3 class="font-bold text-lg mb-4" >
           Edit Product
          </h3>
          
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div class="form-control ">
              <label class="label ">
                <span class="label-text">Product Name</span>
              </label>
              <input
                v-model="productForm.name"
                type="text"
                required
                class="input input-bordered w-full"
                placeholder="Enter product name"
              />
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                v-model="productForm.description"
                rows="4"
                class="textarea textarea-bordered w-full"
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Price</span>
                </label>
                <input
                  v-model.number="productForm.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="input input-bordered w-full"
                  placeholder="0.00"
                />
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Quantity</span>
                </label>
                <input
                  v-model.number="productForm.quantity"
                  type="number"
                  min="0"
                  required
                  class="input input-bordered w-full"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Category</span>
              </label>
              <select
                v-model="productForm.categoryId"
                required
                class="select select-bordered w-full"
              >
                <option value="">Select a category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>
          </form>
          
          <div class="modal-action">
            <button 
              @click="saveProduct"
              class="btn btn-primary"
            >
             Update
            </button>
            <button 
              @click="closeModals"
              class="btn btn-ghost"
            >
              Cancel
            </button>
          </div>
        </div>
        <div class="modal-backdrop" @click="closeModals"></div>
      </div>
  </div>
</template>