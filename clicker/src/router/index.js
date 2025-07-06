// router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginPage from '@/pages/LoginPage.vue'
import IndexPage from '@/pages/IndexPage.vue'
import GamePage from '@/pages/GamePage.vue'
import RankingPage from '@/pages/RankingPage.vue'

// Definiowanie tras
const routes = [
  {
    path: '/',
    name: 'Index',
    component: IndexPage,
    meta: { title: 'Strona Główna' }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { title: 'Strona Logowania', requiresGuest: true } 
  },
  {
    path: '/game',
    name: 'UBBClicker',
    component: GamePage,
    meta: { title: 'UBBClicker', requiresAuth: true } 
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: RankingPage,
    meta: { title: 'Ranking Graczy', requiresAuth: true } 
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Route guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state from localStorage
  authStore.initializeAuth()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // Check if route requires guest (unauthenticated user)
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    next('/game')
    return
  }
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  next()
})

export default router
