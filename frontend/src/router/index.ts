import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import your views
import Products from '../views/Products.vue'
import Categories from '../views/Categories.vue'

// Define routes
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'Products',
    component: Products,
    meta: {
      title: 'Products',
      requiresAuth: false
    }
  },
  {
    path: '/products/:id',
    name: 'ProductDetails',
    component: () => import('../views/ProductDetails.vue'),
    meta: {
      title: 'Product Details',
      requiresAuth: false
    }
  },
  {
    path: '/categories',
    name: 'Categories', 
    component: Categories,
    meta: {
      title: 'Categories',
      requiresAuth: false
    }
  },
  {
    path: '/categories/:id',
    name: 'CategoryDetails',
    component: () => import('../views/CategoryDetail.vue'),
    meta: {
      title: 'Category Details',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_, __, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach((to, _, next) => {

  if (to.meta?.title) {
    document.title = `${to.meta.title} - Product Management`
  } else {
    document.title = 'Product Management'
  }
  
  next()
})

export default router