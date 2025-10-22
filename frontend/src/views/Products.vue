<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { productApi, categoryApi } from '../services/api'
import type { Product, Category } from '../services/api'

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(false)
const error = ref('')


const searchQuery = ref('')
const selectedCategoryId = ref('')
const showCreateModal = ref(false)
const showEditModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = ref(1)
const totalItems = ref(0)

const productForm = ref({
  id: '',
  name: '',
  description: '',
  price: 0,
  quantity: 0,
  categoryId: ''
})

// Validation states
const productFormErrors = ref({
  name: '',
  description: '',
  price: '',
  quantity: '',
  categoryId: ''
})

// Validation functions
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

const validateProductCategory = (categoryId: string): string => {
  if (!categoryId || !categoryId.trim()) {
    return 'Please select a category'
  }
  return ''
}

const validateProductForm = (): boolean => {
  productFormErrors.value.name = validateProductName(productForm.value.name)
  productFormErrors.value.description = validateProductDescription(productForm.value.description)
  productFormErrors.value.price = validateProductPrice(productForm.value.price)
  productFormErrors.value.quantity = validateProductQuantity(productForm.value.quantity)
  productFormErrors.value.categoryId = validateProductCategory(productForm.value.categoryId)
  
  return !productFormErrors.value.name && 
         !productFormErrors.value.description && 
         !productFormErrors.value.price && 
         !productFormErrors.value.quantity &&
         !productFormErrors.value.categoryId
}

const clearValidationErrors = () => {
  productFormErrors.value = { name: '', description: '', price: '', quantity: '', categoryId: '' }
}

// Computed properties
const isFormDisabled = computed(() => {
  return !productForm.value.name.trim() || 
         !!productFormErrors.value.name || 
         !!productFormErrors.value.description || 
         !!productFormErrors.value.price || 
         !!productFormErrors.value.quantity ||
         !!productFormErrors.value.categoryId ||
         !productForm.value.categoryId.trim()
})

const fetchProducts = async (search: string = '', categoryId: string = '', page: number = 1) => {
  try {
    loading.value = true
    error.value = ''
    
   
    
    const params = {
      search: search.trim(),
      categoryId: categoryId.trim(),
      page: page,
      limit: itemsPerPage.value
    }

    const response = await productApi.getAllProducts(params)
    console.log('API Response:', response)


    if (response && response.success && response.data) {
      
      if (Array.isArray(response.data.products)) {
        products.value = response.data.products.map((product: any) => {
          // Handle categoryId properly - could be string or populated object
          let productCategoryId = ''
          if (product.categoryId) {
            if (typeof product.categoryId === 'string') {
              productCategoryId = product.categoryId
            } else if (typeof product.categoryId === 'object' && product.categoryId !== null) {
              productCategoryId = product.categoryId._id || product.categoryId.id || ''
            }
          }
          
          return {
            id: product._id || product.id,
            name: product.name,
            description: product.description,
            price: product.price || 0,
            quantity: product.quantity || 0,
            categoryId: productCategoryId,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          }
        })
        
        
        if (response.data.pagination) {
          totalPages.value = response.data.pagination.pages || 1
          totalItems.value = response.data.pagination.total || 0
          currentPage.value = response.data.pagination.current || page
        }
      } else {
        console.warn("Products not found in response.data.products")
        products.value = []
      }
    } else if (Array.isArray(response.data)) {
   
      products.value = response.data.map((product: any) => ({
        id: product._id || product.id,
        name: product.name,
        description: product.description,
        price: product.price || 0,
        quantity: product.quantity || 0,
        categoryId: product.categoryId ? product.categoryId.toString() : "",
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
      totalPages.value = 1
      totalItems.value = response.data.length
    } else if (Array.isArray(response)) {
     
      products.value = response.map((product: any) => ({
        id: product._id || product.id,
        name: product.name,
        description: product.description,
        price: product.price || 0,
        quantity: product.quantity || 0,
        categoryId: product.categoryId ? product.categoryId.toString() : "",
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }))
      totalPages.value = 1
      totalItems.value = response.length
    } else {
      console.warn('Unexpected products API response:', response)
      products.value = []
      totalPages.value = 1
      totalItems.value = 0
    }
    
    console.log('Processed products:', products.value)
  } catch (err) {
    console.error('Error fetching products:', err)
    error.value = 'Failed to load products'
    products.value = []
    totalPages.value = 1
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

// Watch for search query changes and debounce API calls
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newQuery) => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchProducts(newQuery, selectedCategoryId.value, 1)
  }, 500) // 500ms delay
})

// Watch for category filter changes
watch(selectedCategoryId, (newCategoryId) => {
  currentPage.value = 1
  fetchProducts(searchQuery.value, newCategoryId, 1)
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
    } else if (Array.isArray(response)) {
      categories.value = response.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt
      }))
    } else {
      console.warn('Unexpected categories API response:', response)
    }
  } catch (err) {
    console.error('Error fetching categories:', err)
  }
}

const createProduct = async (productData: Omit<Product, 'id'>) => {
  try {
    const response = await productApi.createProduct(productData)
 
    if (response && (response.data || response._id)) {
      // Refresh the list from API to get updated data
      await fetchProducts(searchQuery.value, selectedCategoryId.value, currentPage.value)
      return response.data || response
    }
  } catch (err) {
    console.error('Error creating product:', err)
    error.value = 'Failed to create product'
    throw err
  }
}

const updateProduct = async (id: string, productData: Partial<Product>) => {
  try {
    const response = await productApi.updateProduct(id, productData)
  
    if (response) {

      await fetchProducts(searchQuery.value, selectedCategoryId.value, currentPage.value)
      return response.data || response
    }
  } catch (err) {
    console.error('Error updating product:', err)
    error.value = 'Failed to update product'
    throw err
  }
}

const deleteProductFromAPI = async (id: string) => {
  try {
    await productApi.deleteProduct(id)
   
    await fetchProducts(searchQuery.value, selectedCategoryId.value, currentPage.value)
  } catch (err) {
    console.error('Error deleting product:', err)
    error.value = 'Failed to delete product'
    throw err
  }
}


const displayedProducts = computed(() => products.value)

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(cat => cat.id === categoryId)
  return category ? category.name : 'Unknown'
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategoryId.value = ''
}

const editProduct = (product: any) => {



  let categoryId = ''
  
  if (product.categoryId) {
    if (typeof product.categoryId === 'string') {
    
      categoryId = product.categoryId
    } else if (typeof product.categoryId === 'object' && product.categoryId !== null) {

      categoryId = product.categoryId._id || product.categoryId.id || ''
   
    }
  }
  

  productForm.value = { 
    id: product.id || '',
    name: product.name || '',
    description: product.description || '',
    price: Number(product.price) || 0,
    quantity: Number(product.quantity) || 0,
    categoryId: categoryId
  }


  showEditModal.value = true
}

const deleteProduct = async (product: any) => {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    try {
      await deleteProductFromAPI(product.id)
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }
}


const saveProduct = async () => {
  try {
    error.value = ''

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
      categoryId: productForm.value.categoryId.trim()
    }

    if (showCreateModal.value) {
      await createProduct(productData)
    } else {
      await updateProduct(productForm.value.id, productData)
    }
    
    closeModals()
  } catch (err) {
    console.error('Error saving product:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save product'
  }
}

const closeModals = () => {
  showCreateModal.value = false
  showEditModal.value = false
  productForm.value = {
    id: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: ''
  }
  clearValidationErrors()
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchProducts(searchQuery.value, selectedCategoryId.value, page)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1
    currentPage.value = newPage
    fetchProducts(searchQuery.value, selectedCategoryId.value, newPage)
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    const newPage = currentPage.value + 1
    currentPage.value = newPage
    fetchProducts(searchQuery.value, selectedCategoryId.value, newPage)
  }
}

onMounted(async () => {
  
  await fetchCategories()
  await fetchProducts()
})
</script>
<template>
  <div class="min-h-screen bg-gray-300 p-6">
    <div class="max-w-7xl mx-auto">
   
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Product Management</h1>
        <button 
          @click="showCreateModal = true" 
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Add New Product
        </button>
      </div>

  
      <div v-if="error" class="mb-6 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg">
        {{ error }}
        <button @click="error = ''" class="float-right text-red-700 hover:text-red-900">×</button>
      </div>

      <!-- Search and Filter Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search products..."
            />
          </div>
          <select 
            v-model="selectedCategoryId" 
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[200px]"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <button 
            @click="clearFilters" 
            type="button"
            class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span class="ml-3 text-gray-600">Loading products...</span>
      </div>

      <!-- Products Table -->
      <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Product name</th>
              <th scope="col" class="px-6 py-3">Description</th>
              <th scope="col" class="px-6 py-3">Price</th>
              <th scope="col" class="px-6 py-3">Quantity</th>
              <th scope="col" class="px-6 py-3">Category</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                No products found
              </td>
            </tr>
            <tr v-for="product in displayedProducts" :key="product.id" class="odd:bg-white even:bg-gray-50 border-b">
              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {{ product.name }}
              </th>
              <td class="px-6 py-4">{{ product.description }}</td>
              <td class="px-6 py-4 font-semibold text-gray-900">{{ product.price.toFixed(2) }} บาท</td>
              <td class="px-6 py-4">{{ product.quantity }}</td>
              <td class="px-6 py-4">{{ getCategoryName(product.categoryId) }}</td>
              <td class="px-6 py-4 space-x-2">
                <router-link
                  :to="`/products/${product.id}`"
                  class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 inline-block"
                >
                  View
                </router-link>
                <button
                  @click="editProduct(product)"
                  type="button"
                  class="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-2"
                >
                  Edit
                </button>
                <button
                  @click="deleteProduct(product)"
                  type="button"
                  class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-xs px-3 py-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

  
      <div class="flex justify-center mt-6">
        <nav aria-label="Page navigation">
          <ul class="inline-flex -space-x-px text-sm">
            <li>
              <button
                @click="previousPage"
                :disabled="currentPage === 1"
                class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </li>
            <li v-for="page in totalPages" :key="page">
              <button
                @click="goToPage(page)"
                :class="[
                  'flex items-center justify-center px-3 h-8 leading-tight border border-gray-300',
                  page === currentPage 
                    ? 'text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700' 
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                ]"
              >
                {{ page }}
              </button>
            </li>
            <li>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>




      <!-- Create/Edit Modal -->
      <div v-if="showCreateModal || showEditModal" class="modal modal-open text-gray-900">
        <div class="modal-box w-11/12 max-w-lg">
          <h3 class="font-bold text-lg mb-4" >
            {{ showCreateModal ? 'Add New Product' : 'Edit Product' }}
          </h3>
          
          <form @submit.prevent="saveProduct" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Product Name <span class="text-red-500">*</span></span>
              </label>
              <input
                v-model="productForm.name"
                @blur="productFormErrors.name = validateProductName(productForm.name)"
                @input="productFormErrors.name = validateProductName(productForm.name)"
                type="text"
                required
                :class="[
                  'input input-bordered w-full',
                  productFormErrors.name ? 'input-error' : ''
                ]"
                placeholder="Enter product name"
              />
              <p v-if="productFormErrors.name" class="text-red-500 text-sm mt-1">
                {{ productFormErrors.name }}
              </p>
              <p class="text-gray-500 text-xs mt-1">2-100 characters, letters only (no spaces or special characters)</p>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Description</span>
              </label>
              <textarea
                v-model="productForm.description"
                @blur="productFormErrors.description = validateProductDescription(productForm.description)"
                @input="productFormErrors.description = validateProductDescription(productForm.description)"
                rows="4"
                :class="[
                  'textarea textarea-bordered w-full',
                  productFormErrors.description ? 'textarea-error' : ''
                ]"
                placeholder="Enter product description (optional)"
              ></textarea>
              <p v-if="productFormErrors.description" class="text-red-500 text-sm mt-1">
                {{ productFormErrors.description }}
              </p>
              <p class="text-gray-500 text-xs mt-1">Maximum 500 characters</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Price <span class="text-red-500">*</span></span>
                </label>
                <input
                  v-model.number="productForm.price"
                  @blur="productFormErrors.price = validateProductPrice(productForm.price)"
                  @input="productFormErrors.price = validateProductPrice(productForm.price)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="999999.99"
                  required
                  :class="[
                    'input input-bordered w-full',
                    productFormErrors.price ? 'input-error' : ''
                  ]"
                  placeholder="0.00"
                />
                <p v-if="productFormErrors.price" class="text-red-500 text-sm mt-1">
                  {{ productFormErrors.price }}
                </p>
                <p class="text-gray-500 text-xs mt-1">$0.00 - $999,999.99</p>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Quantity <span class="text-red-500">*</span></span>
                </label>
                <input
                  v-model.number="productForm.quantity"
                  @blur="productFormErrors.quantity = validateProductQuantity(productForm.quantity)"
                  @input="productFormErrors.quantity = validateProductQuantity(productForm.quantity)"
                  type="number"
                  min="0"
                  max="999999"
                  step="1"
                  required
                  :class="[
                    'input input-bordered w-full',
                    productFormErrors.quantity ? 'input-error' : ''
                  ]"
                  placeholder="0"
                />
                <p v-if="productFormErrors.quantity" class="text-red-500 text-sm mt-1">
                  {{ productFormErrors.quantity }}
                </p>
                <p class="text-gray-500 text-xs mt-1">Whole numbers, 0 - 999,999</p>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Category <span class="text-red-500">*</span></span>
              </label>
              <select
                v-model="productForm.categoryId"
                @blur="productFormErrors.categoryId = validateProductCategory(productForm.categoryId)"
                @change="productFormErrors.categoryId = validateProductCategory(productForm.categoryId)"
                required
                :class="[
                  'select select-bordered w-full',
                  productFormErrors.categoryId ? 'select-error' : ''
                ]"
              >
                <option value="">Select a category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <p v-if="productFormErrors.categoryId" class="text-red-500 text-sm mt-1">
                {{ productFormErrors.categoryId }}
              </p>
              <p class="text-gray-500 text-xs mt-1">Please select a category for this product</p>
            </div>
          </form>
          
          <div class="modal-action">
            <button 
              @click="saveProduct"
              :disabled="isFormDisabled"
              :class="[
                'btn',
                isFormDisabled ? 'btn-disabled' : 'btn-primary'
              ]"
            >
              {{ showCreateModal ? 'Create' : 'Update' }}
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
  </div>
</template>

