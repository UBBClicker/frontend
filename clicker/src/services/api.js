import axios from 'axios'

// API base configuration
const API_BASE_URL = 'http://localhost:3001'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors and auto-refresh tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        console.log('Token expired, attempting automatic refresh...')
        
        // Try to refresh token
        const refreshResponse = await api.post('/user/refresh-token')
        const newToken = refreshResponse.data.access_token
        
        // Update stored token
        localStorage.setItem('access_token', newToken)
        
        // Update auth store if available
        if (typeof window !== 'undefined' && window.__PINIA__) {
          try {
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.updateToken(newToken)
          } catch (storeError) {
            console.warn('Could not update auth store:', storeError)
          }
        }
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        console.log('Token refreshed successfully, retrying request...')
        
        return api(originalRequest)
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        // Clear auth data and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        
        // Clear auth store if available
        if (typeof window !== 'undefined' && window.__PINIA__) {
          try {
            const { useAuthStore } = await import('@/stores/auth')
            const authStore = useAuthStore()
            authStore.clearAuth()
          } catch (storeError) {
            console.warn('Could not clear auth store:', storeError)
          }
        }
        
        window.location.href = '/login'
      }
    }
    
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/user/register', userData)
    return response.data
  },

  // Login user
  login: async (nickname, password) => {
    const formData = new FormData()
    formData.append('username', nickname)
    formData.append('password', password)
    
    const response = await api.post('/user/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/user/me')
    return response.data
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/user/refresh-token')
    return response.data
  },
}

// Game API
export const gameAPI = {
  // Get current game state
  getGameState: async () => {
    const response = await api.get('/game/state')
    return response.data
  },

  // Get game state with items
  getGameStateWithItems: async () => {
    const response = await api.get('/game/state/with-items')
    return response.data
  },

  // Process a click
  processClick: async () => {
    const response = await api.post('/game/click')
    return response.data
  },

  // Buy an item
  buyItem: async (itemId) => {
    const response = await api.post(`/game/buy/${itemId}`)
    return response.data
  },

  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/game/leaderboard?limit=${limit}`)
    return response.data
  },
}

// Items API
export const itemsAPI = {
  // Get all items
  getAllItems: async () => {
    const response = await api.get('/items')
    return response.data
  },

  // Get user items
  getUserItems: async () => {
    const response = await api.get('/items/user')
    return response.data
  },
}

export default api
