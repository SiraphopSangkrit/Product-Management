<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { categoryApi } from "../services/api";

interface Category {
  id: string;
  name: string;
  createdAt?: string;
}

const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const showCreateModal = ref(false);
const showEditModal = ref(false);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalPages = ref(1);
const totalItems = ref(0);

const categoryForm = ref({
  id: "",
  name: "",
});

// Validation states
const categoryFormErrors = ref({
  name: ''
})

// Validation functions
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

const validateCategoryForm = (): boolean => {
  categoryFormErrors.value.name = validateCategoryName(categoryForm.value.name)
  return !categoryFormErrors.value.name
}

const clearValidationErrors = () => {
  categoryFormErrors.value = { name: '' }
}

// Computed properties
const isFormDisabled = computed(() => {
  return !categoryForm.value.name.trim() || !!categoryFormErrors.value.name
})

const fetchCategories = async (search: string = "", page: number = 1) => {
  try {
    loading.value = true;
    error.value = "";
    
    const params = {
      search: search.trim(),
      page: page,
      limit: itemsPerPage.value
    };

    const response = await categoryApi.getAllCategories(params);

    if (response && response.data && Array.isArray(response.data.categories)) {
      categories.value = response.data.categories.map((cat: any) => ({
        id: cat._id,
        name: cat.name,
        createdAt: cat.createdAt,
      }));
      
    
      if (response.data.pagination) {
        totalPages.value = response.data.pagination.pages || 1;
        totalItems.value = response.data.pagination.total || 0;
        currentPage.value = response.data.pagination.current || 1;
      }
    } else if (Array.isArray(response)) {
      categories.value = response.map((cat: any) => ({
        id: cat._id || cat.id,
        name: cat.name,
        createdAt: cat.createdAt,
      }));
    } else {
      console.warn("Unexpected categories API response structure:", response);
      categories.value = [];
    }
  } catch (err) {
    console.error("Error fetching categories:", err);
    error.value = "Failed to load categories";
    categories.value = [];
  } finally {
    loading.value = false;
  }
};


let searchTimeout: ReturnType<typeof setTimeout>;
watch(searchQuery, (newQuery) => {
 
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
 
  searchTimeout = setTimeout(() => {
    currentPage.value = 1; 
    fetchCategories(newQuery, 1);
  }, 500); 
});


const createCategory = async (categoryData: Omit<Category, "id">) => {
  try {
    const response = await categoryApi.createCategory(categoryData);

    if (response && response.data) {
      const newCategory = {
        id: response.data._id,
        name: response.data.name,
        createdAt: response.data.createdAt,
      };

     
      await fetchCategories(searchQuery.value, currentPage.value);
      return newCategory;
    }
  } catch (err) {
    console.error("Error creating category:", err);
    error.value = "Failed to create category";
    throw err;
  }
};


const updateCategory = async (id: string, categoryData: Partial<Category>) => {
  try {
    const response = await categoryApi.updateCategory(id, categoryData);

    if (response && response.data) {
     
      await fetchCategories(searchQuery.value, currentPage.value);
      return response.data;
    }
  } catch (err) {
    console.error("Error updating category:", err);
    error.value = "Failed to update category";
    throw err;
  }
};


const deleteCategoryFromAPI = async (id: string) => {
  try {
    await categoryApi.deleteCategory(id);
   
    await fetchCategories(searchQuery.value, currentPage.value);
  } catch (err) {
    console.error("Error deleting category:", err);
    error.value = "Failed to delete category";
    throw err;
  }
};


const displayedCategories = computed(() => categories.value);

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

const clearSearch = () => {
  searchQuery.value = "";
 
};

const editCategory = (category: Category) => {
  categoryForm.value = {
    id: category.id,
    name: category.name,
  };
  showEditModal.value = true;
};

const deleteCategory = async (category: Category) => {
  if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
    try {
      await deleteCategoryFromAPI(category.id);
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  }
};

const saveCategory = async () => {
  try {
    error.value = "";
    
    // Validate form
    if (!validateCategoryForm()) {
      return
    }
    
    // Prepare clean data
    const categoryData = {
      name: categoryForm.value.name.trim(),
    };

    if (showCreateModal.value) {
      await createCategory(categoryData);
    } else {
      await updateCategory(categoryForm.value.id, categoryData);
    }

    closeModals();
  } catch (err) {
    console.error("Error saving category:", err);
    error.value = "Failed to save category";
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  categoryForm.value = {
    id: "",
    name: "",
  };
  clearValidationErrors();
};

const goToPage = (page: number) => {
  currentPage.value = page;
  fetchCategories(searchQuery.value, page);
};

const previousPage = () => {
  if (currentPage.value > 1) {
    const newPage = currentPage.value - 1;
    currentPage.value = newPage;
    fetchCategories(searchQuery.value, newPage);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    const newPage = currentPage.value + 1;
    currentPage.value = newPage;
    fetchCategories(searchQuery.value, newPage);
  }
};

// Fetch data when component mounts
onMounted(async () => {
  await fetchCategories();
});
</script>

<template>
  <div class="min-h-screen bg-gray-300 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Category Management</h1>
        <button
          @click="showCreateModal = true"
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
        >
          Add New Category
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-6 p-4 text-red-700 bg-red-100 border border-red-300 rounded-lg"
      >
        {{ error }}
        <button
          @click="error = ''"
          class="float-right text-red-700 hover:text-red-900"
        >
          ×
        </button>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                class="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="search"
              class="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search categories..."
            />
            <!-- Loading indicator for search -->
            <div v-if="loading" class="absolute inset-y-0 end-0 flex items-center pe-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          </div>
          <button
            @click="clearSearch"
            type="button"
            class="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Clear
          </button>
        </div>
        
        <!-- Search results info -->
        <div v-if="searchQuery && !loading" class="mt-2 text-sm text-gray-600">
          Found {{ totalItems }} categories for "{{ searchQuery }}"
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && categories.length === 0" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        <span class="ml-3 text-gray-600">Loading categories...</span>
      </div>

      <!-- Categories Table -->
      <div v-else class="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Created Date</th>
              <th scope="col" class="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="displayedCategories.length === 0 && !loading">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                {{ searchQuery ? 'No categories found matching your search' : 'No categories found' }}
              </td>
            </tr>
            <tr
              v-for="category in displayedCategories"
              :key="category.id"
              class="odd:bg-white even:bg-gray-50 border-b"
            >
              <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {{ category.name }}
              </th>
              <td class="px-6 py-4">{{ formatDate(category.createdAt) }}</td>
              <td class="px-6 py-4 space-x-2">
                <router-link
                  :to="`/categories/${category.id}`"
                  class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-2 inline-block"
                >
                  View
                </router-link>
                <button
                  @click="editCategory(category)"
                  type="button"
                  class="text-white bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-2"
                >
                  Edit
                </button>
                <button
                  @click="deleteCategory(category)"
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

      <!-- Pagination -->
      <div  class="flex justify-center mt-6">
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
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700',
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
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ showCreateModal ? "Add New Category" : "Edit Category" }}
          </h3>

          <form @submit.prevent="saveCategory" class="space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Category Name <span class="text-red-500">*</span></span>
              </label>
              <input
                v-model="categoryForm.name"
                @blur="categoryFormErrors.name = validateCategoryName(categoryForm.name)"
                @input="categoryFormErrors.name = validateCategoryName(categoryForm.name)"
                type="text"
                required
                :class="[
                  'input input-bordered w-full',
                  categoryFormErrors.name ? 'input-error' : ''
                ]"
                placeholder="Enter category name"
              />
              <p v-if="categoryFormErrors.name" class="text-red-500 text-sm mt-1">
                {{ categoryFormErrors.name }}
              </p>
              <p class="text-gray-500 text-xs mt-1">
                2-50 characters, letters only (no spaces or special characters)
              </p>
            </div>
          </form>

          <div class="modal-action">
            <button
              @click="saveCategory"
              :disabled="isFormDisabled"
              :class="[
                'btn',
                isFormDisabled ? 'btn-disabled' : 'btn-primary'
              ]"
            >
              {{ showCreateModal ? "Create" : "Update" }}
            </button>
            <button @click="closeModals" class="btn btn-ghost">Cancel</button>
          </div>
        </div>
        <div class="modal-backdrop" @click="closeModals"></div>
      </div>
    </div>
  </div>
</template>
