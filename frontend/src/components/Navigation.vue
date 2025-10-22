<template>
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <router-link to="/" class="text-xl font-bold text-gray-900">
            Product Management
          </router-link>
        </div>

        <!-- Navigation Links -->
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link
              to="/products"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'Products' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Products
            </router-link>
            
            <router-link
              to="/categories"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="[
                $route.name === 'Categories' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              Categories
            </router-link>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                v-if="!mobileMenuOpen"
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16" 
              />
              <path 
                v-else
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile menu -->
      <div v-if="mobileMenuOpen" class="md:hidden">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link
            to="/products"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="[
              $route.name === 'Products' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            Products
          </router-link>
          
          <router-link
            to="/categories"
            @click="mobileMenuOpen = false"
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors"
            :class="[
              $route.name === 'Categories' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            ]"
          >
            Categories
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>