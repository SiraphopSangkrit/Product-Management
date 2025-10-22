<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</h2>
        <p class="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <div class="space-y-4">
        <router-link 
          to="/products" 
          class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Go to Products
        </router-link>
        
        <router-link 
          to="/categories" 
          class="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Go to Categories
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Page Not Found - Product Management'
})
</script>