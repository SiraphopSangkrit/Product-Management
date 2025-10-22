<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryApi, productApi, type Category, type Product } from '../services/api'

const route = useRoute()
const router = useRouter()

// Reactive data
const category = ref<Category | null>(null)
const products = ref<Product[]>([])
const loading = ref(false)
const productsLoading = ref(false)
const error = ref('')
const notFound = ref(false)
const showEditModal = ref(false)
const showAddProductModal = ref(false)

// Form data
const categoryForm = ref({
  id: '',
  name: ''
})

const productForm = ref({
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: ''
})

// Validation states
const categoryFormErrors = ref({
  name: ''
})

const productFormErrors = ref({
  name: '',
  description: '',
  price: '',
  quantity: ''
})

const isFormValid = ref(false)

// Computed properties
const categoryId = computed(() => route.params.id as string)

const isFormDisabled = computed(() => {
  if (showEditModal.value) {
    return !categoryForm.value.name.trim() || !!categoryFormErrors.value.name
  } else if (showAddProductModal.value) {
    return !productForm.value.name.trim() || 
           !!productFormErrors.value.name || 
           !!productFormErrors.value.description || 
           !!productFormErrors.value.price || 
           !!productFormErrors.value.quantity
  }
  return true
})

const productCount = computed(() => products.value.length)

const totalProductValue = computed(() => {
  return products.value.reduce((total, product) => {
    return total + (product.price * product.quantity)
  }, 0)
})

const averageProductPrice = computed(() => {
  if (products.value.length === 0) return 0
  const totalPrice = products.value.reduce((total, product) => total + product.price, 0)
  return totalPrice / products.value.length
})

const lowStockProducts = computed(() => {
  return products.value.filter(product => product.quantity <= 10).length
})

const outOfStockProducts = computed(() => {
  return products.value.filter(product => product.quantity === 0).length
})

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStockStatus = (quantity: number) => {
  if (quantity === 0) {
    return { text: 'Out of Stock', class: 'text-red-600 bg-red-100' }
  } else if (quantity <= 10) {
    return { text: 'Low Stock', class: 'text-orange-600 bg-orange-100' }
  } else {
    return { text: 'In Stock', class: 'text-green-600 bg-green-100' }
  }
}


const validateCategoryName = (name: string): string => {
  if (!name || !name.trim()) {
    return 'Category name is required'
  }
  if (name.trim().length < 2) {
    return 'Category name must be at least 2 characters long'
  }
  if (name.trim().length > 50) {
    return 'Category name must be less than 50 characters'
  }
  if (!/^[a-zA-Z]+$/.test(name.trim())) {
    return 'Category name can only contain letters and no spaces or special characters'
  }
  return ''
}

const validateProductName = (name: string): string => {
  if (!name || !name.trim()) {
    return 'Product name is required'
  }
  if (name.trim().length < 2) {
    return 'Product name must be at least 2 characters long'
  }
  if (name.trim().length > 100) {
    return 'Product name must be less than 100 characters'
  }
  if (!/^[a-zA-Z]+$/.test(name.trim())) {
    return 'Product name can only contain letters and no spaces or special characters'
  }
  return ''
}

const validateProductDescription = (description: string): string => {
  if (description && description.length > 500) {
    return 'Description must be less than 500 characters'
  }
  return ''
}

const validateProductPrice = (price: number): string => {
  if (price < 0) {
    return 'Price cannot be negative'
  }
  if (price > 999999.99) {
    return 'Price cannot exceed $999,999.99'
  }
  if (!/^\d+(\.\d{1,2})?$/.test(price.toString()) && price > 0) {
    return 'Price can have at most 2 decimal places'
  }
  return ''
}

const validateProductQuantity = (quantity: number): string => {
  if (quantity < 0) {
    return 'Quantity cannot be negative'
  }
  if (!Number.isInteger(quantity)) {
    return 'Quantity must be a whole number'
  }
  if (quantity > 999999) {
    return 'Quantity cannot exceed 999,999'
  }
  return ''
}

const validateCategoryForm = (): boolean => {
  categoryFormErrors.value.name = validateCategoryName(categoryForm.value.name)
  return !categoryFormErrors.value.name
}

const validateProductForm = (): boolean => {
  productFormErrors.value.name = validateProductName(productForm.value.name)
  productFormErrors.value.description = validateProductDescription(productForm.value.description)
  productFormErrors.value.price = validateProductPrice(productForm.value.price)
  productFormErrors.value.quantity = validateProductQuantity(productForm.value.quantity)
  
  return !productFormErrors.value.name && 
         !productFormErrors.value.description && 
         !productFormErrors.value.price && 
         !productFormErrors.value.quantity
}

const clearValidationErrors = () => {
  categoryFormErrors.value = { name: '' }
  productFormErrors.value = { name: '', description: '', price: '', quantity: '' }
}

// Methods
const fetchCategory = async () => {
  try {
    loading.value = true
    error.value = ''
    notFound.value = false
    
    const response = await categoryApi.getCategory(categoryId.value)
    
    if (response && response.success && response.data) {
      const categoryData = response.data
      
      category.value = {
        id: categoryData._id || categoryData.id,
        name: categoryData.name,
        createdAt: categoryData.createdAt,
        updatedAt: categoryData.updatedAt
      }
    } else {
      notFound.value = true
    }
  } catch (err: any) {
    console.error('Error fetching category:', err)
    if (err.response?.status === 404) {
      notFound.value = true
    } else {
      error.value = err.message || 'Failed to fetch category details'
    }
  } finally {
    loading.value = false
  }
}

const fetchCategoryProducts = async () => {
  try {
    productsLoading.value = true
    
    const response = await productApi.getAllProducts({
      categoryId: categoryId.value,
      limit: 100 // Get all products for this category
    })
    
    if (response && response.success && response.data) {
      if (Array.isArray(response.data.products)) {
        products.value = response.data.products.map((product: any) => ({
          id: product._id || product.id,
          name: product.name,
          description: product.description,
          price: product.price || 0,
          quantity: product.quantity || 0,
          categoryId: product.categoryId || '',
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }))
      }
    } else if (Array.isArray(response.data)) {
      products.value = response.data.map((product: any) => ({
        id: product._id || product.id,
        name: product.name,
        description: product.description,
        price: product.price || 0,
        quantity: product.quantity || 0,
        categoryId: product.categoryId || '',
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
    }
  } catch (err) {
    console.error('Error fetching category products:', err)
  } finally {
    productsLoading.value = false
  }
}

const goBack = () => {
  router.push('/categories')
}

const openEditCategoryModal = () => {
  if (category.value) {
    categoryForm.value = {
      id: category.value.id,
      name: category.value.name
    }
    clearValidationErrors()
    showEditModal.value = true
  }
}

const openAddProductModal = () => {
  productForm.value = {
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: categoryId.value
  }
  clearValidationErrors()
  showAddProductModal.value = true
}

const closeModals = () => {
  showEditModal.value = false
  showAddProductModal.value = false
  categoryForm.value = { id: '', name: '' }
  productForm.value = { name: '', description: '', price: 0, quantity: 0, categoryId: '' }
  clearValidationErrors()
}

const saveCategory = async () => {
  try {
    // Validate form
    if (!validateCategoryForm()) {
      return
    }
    
    // Trim the name before saving
    const trimmedName = categoryForm.value.name.trim()
    
    const response = await categoryApi.updateCategory(categoryForm.value.id, {
      name: trimmedName
    })
    
    if (response && response.success) {
      // Refresh category data
      await fetchCategory()
      closeModals()
    }
  } catch (err) {
    console.error('Error updating category:', err)
    error.value = 'Failed to update category'
  }
}

const saveProduct = async () => {
  try {
    // Validate form
    if (!validateProductForm()) {
      return
    }
    
    // Prepare clean data
    const productData = {
      name: productForm.value.name.trim(),
      description: productForm.value.description.trim(),
      price: Number(productForm.value.price),
      quantity: Number(productForm.value.quantity),
      categoryId: productForm.value.categoryId
    }
    
    const response = await productApi.createProduct(productData)
    
    if (response && response.success) {
      // Refresh products data
      await fetchCategoryProducts()
      closeModals()
    }
  } catch (err) {
    console.error('Error creating product:', err)
    error.value = 'Failed to create product'
  }
}

const saveData = async () => {
  if (showEditModal.value) {
    await saveCategory()
  } else if (showAddProductModal.value) {
    await saveProduct()
  }
}

const viewProduct = (productId: string) => {
  router.push(`/products/${productId}`)
}


onMounted(async () => {
  if (categoryId.value) {
    await fetchCategory()
    if (category.value) {
      await fetchCategoryProducts()
    }
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
        <p class="text-gray-600">Loading category details...</p>
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
        <h3 class="text-lg font-semibold text-red-800 mb-2">Error Loading Category</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="fetchCategory"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Category Not Found</h3>
        <p class="text-gray-600 mb-4">The category you're looking for doesn't exist or has been removed.</p>
        <button 
          @click="goBack"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Category Details -->
    <div v-else-if="category" class="max-w-6xl mx-auto">
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
            Back to Categories
          </button>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ category.name }}</h1>
          <p class="text-gray-600">Category ID: {{ category.id }}</p>
        </div>
        <button 
          @click="openEditCategoryModal"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          Edit Category
        </button>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Category Information and Products -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Category Info Card -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Category Information</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p class="text-gray-900 text-lg">{{ category.name }}</p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Created</label>
                  <p class="text-gray-600 text-sm">{{ formatDate(category.createdAt) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                  <p class="text-gray-600 text-sm">{{ formatDate(category.updatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Products in Category -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-semibold text-gray-900">Products in Category</h2>
              <div v-if="productsLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
            
            <div v-if="products.length === 0 && !productsLoading" class="text-center py-8">
              <div class="text-gray-400 mb-4">
                <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-5v3"></path>
                </svg>
              </div>
              <p class="text-gray-600">No products found in this category</p>
            </div>

            <div v-else class="space-y-3">
              <div 
                v-for="product in products" 
                :key="product.id" 
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ product.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ product.description }}</p>
                  <div class="flex items-center mt-2 space-x-4">
                    <span class="text-sm font-medium text-green-600">${{ formatCurrency(product.price) }}</span>
                    <span class="text-sm text-gray-500">Qty: {{ product.quantity }}</span>
                    <span 
                      :class="getStockStatus(product.quantity).class + ' text-xs px-2 py-1 rounded-full'"
                    >
                      {{ getStockStatus(product.quantity).text }}
                    </span>
                  </div>
                </div>
                <button
                  @click="viewProduct(product.id)"
                  class="ml-4 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  View
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <!-- Category Stats -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Category Statistics</h3>
            
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Products</span>
                <span class="text-lg font-bold text-blue-600">{{ productCount }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Value</span>
                <span class="text-sm font-medium text-gray-900">
                  ${{ formatCurrency(totalProductValue) }}
                </span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Avg. Price</span>
                <span class="text-sm font-medium text-gray-900">
                  ${{ formatCurrency(averageProductPrice) }}
                </span>
              </div>
              
              <hr class="my-3">
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Low Stock</span>
                <span class="text-sm font-medium text-orange-600">{{ lowStockProducts }}</span>
              </div>
              
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Out of Stock</span>
                <span class="text-sm font-medium text-red-600">{{ outOfStockProducts }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div class="space-y-3">
              <button 
                @click="openEditCategoryModal"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit Category
              </button>
              
              <button
                @click="openAddProductModal"
                class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add Product
              </button>
              
            <router-link to="/categories"  class="w-full block text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                Back to Categories


            </router-link>
            
                <router-link 
                to="/products"
                class="w-full block text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Products
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showEditModal || showAddProductModal" class="modal modal-open text-gray-900">
        <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 modal-box">
          <h3 class="font-bold text-lg mb-4 text-gray-900">
            {{ showEditModal ? "Edit Category" : "Add Product" }}
          </h3>

          <form @submit.prevent="saveData" class="space-y-4">
            <!-- Edit Category Form -->
            <div v-if="showEditModal">
                <div class="form-control">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Category Name <span class="text-red-500">*</span>
                    </label>
                    <input
                    v-model="categoryForm.name"
                    @blur="categoryFormErrors.name = validateCategoryName(categoryForm.name)"
                    @input="categoryFormErrors.name = validateCategoryName(categoryForm.name)"
                    type="text"
                    required
                    :class="[
                      'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                      categoryFormErrors.name 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    ]"
                    placeholder="Enter category name"
                    />
                    <p v-if="categoryFormErrors.name" class="mt-1 text-sm text-red-600">
                      {{ categoryFormErrors.name }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500">
                      2-50 characters, letters only (no spaces or special characters)
                    </p>
                </div>
            </div>
            
            <!-- Add Product Form -->
            <div v-if="showAddProductModal">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Product Name <span class="text-red-500">*</span>
                        </label>
                        <input
                        v-model="productForm.name"
                        @blur="productFormErrors.name = validateProductName(productForm.name)"
                        @input="productFormErrors.name = validateProductName(productForm.name)"
                        type="text"
                        required
                        :class="[
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                          productFormErrors.name 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        ]"
                        placeholder="Enter product name"
                        />
                        <p v-if="productFormErrors.name" class="mt-1 text-sm text-red-600">
                          {{ productFormErrors.name }}
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                          2-100 characters, letters only (no spaces or special characters)
                        </p>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                        v-model="productForm.description"
                        @blur="productFormErrors.description = validateProductDescription(productForm.description)"
                        @input="productFormErrors.description = validateProductDescription(productForm.description)"
                        rows="3"
                        :class="[
                          'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                          productFormErrors.description 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        ]"
                        placeholder="Enter product description (optional)"
                        ></textarea>
                        <p v-if="productFormErrors.description" class="mt-1 text-sm text-red-600">
                          {{ productFormErrors.description }}
                        </p>
                        <p class="mt-1 text-xs text-gray-500">
                          Maximum 500 characters
                        </p>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Price <span class="text-red-500">*</span>
                            </label>
                            <input
                            v-model="productForm.price"
                            @blur="productFormErrors.price = validateProductPrice(productForm.price)"
                            @input="productFormErrors.price = validateProductPrice(productForm.price)"
                            type="number"
                            step="0.01"
                            min="0"
                            max="999999.99"
                            required
                            :class="[
                              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                              productFormErrors.price 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            ]"
                            placeholder="0.00"
                            />
                            <p v-if="productFormErrors.price" class="mt-1 text-sm text-red-600">
                              {{ productFormErrors.price }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">
                              $0.00 - $999,999.99
                            </p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Quantity <span class="text-red-500">*</span>
                            </label>
                            <input
                            v-model="productForm.quantity"
                            @blur="productFormErrors.quantity = validateProductQuantity(productForm.quantity)"
                            @input="productFormErrors.quantity = validateProductQuantity(productForm.quantity)"
                            type="number"
                            min="0"
                            max="999999"
                            step="1"
                            required
                            :class="[
                              'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors',
                              productFormErrors.quantity 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                            ]"
                            placeholder="0"
                            />
                            <p v-if="productFormErrors.quantity" class="mt-1 text-sm text-red-600">
                              {{ productFormErrors.quantity }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">
                              Whole numbers, 0 - 999,999
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </form>

          <div class="flex justify-end space-x-4 mt-6">
            <button
              @click="saveData"
              :disabled="isFormDisabled"
              :class="[
                'px-4 py-2 rounded-md transition-colors',
                isFormDisabled 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              ]"
            >
              {{ showEditModal ? "Update" : "Create" }}
            </button>
            <button @click="closeModals" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors">
                Cancel
            </button>
          </div>
        </div>
    </div>
  </div>
</template>
