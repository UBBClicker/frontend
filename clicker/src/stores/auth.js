import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'
import websocketService from '@/services/websocket'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    userName: (state) => state.user?.nickname || '',
    userId: (state) => state.user?.id || null,
  },

  actions: {
    // Initialize auth state from localStorage
    initializeAuth() {
      const token = localStorage.getItem('access_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          this.token = token
          this.user = JSON.parse(user)
          this.isAuthenticated = true
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          this.clearAuth()
        }
      }
    },

    // Register new user
    async register(userData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authAPI.register(userData)
        
        // After successful registration, log the user in
        await this.login(userData.nickname, userData.password)
        
        return response
      } catch (error) {
        this.error = error.response?.data?.detail || 'Registration failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Login user
    async login(nickname, password) {
      this.isLoading = true
      this.error = null

      try {
        const response = await authAPI.login(nickname, password)
        
        // Store token and get user info
        this.token = response.access_token
        localStorage.setItem('access_token', response.access_token)
        
        // Get current user info
        const userInfo = await authAPI.getCurrentUser()
        this.user = userInfo
        this.isAuthenticated = true
        
        // Store user info
        localStorage.setItem('user', JSON.stringify(userInfo))
        
        // Connect to WebSocket
        await this.connectWebSocket()
        
        return response
      } catch (error) {
        this.error = error.response?.data?.detail || 'Login failed'
        throw error
      } finally {
        this.isLoading = false
      }
    },

    // Logout user
    async logout() {
      // Disconnect WebSocket
      websocketService.disconnect()
      
      // Clear auth state
      this.clearAuth()
      
      // Redirect to login page
      window.location.href = '/login'
    },

    // Clear authentication data
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    // Refresh token
    async refreshToken() {
      try {
        const response = await authAPI.refreshToken()
        this.token = response.access_token
        localStorage.setItem('access_token', response.access_token)
        return response
      } catch (error) {
        console.error('Token refresh failed:', error)
        this.logout()
        throw error
      }
    },

    // Connect to WebSocket
    async connectWebSocket() {
      if (this.token && !websocketService.isConnected()) {
        try {
          await websocketService.connect(this.token)
          console.log('WebSocket connected successfully')
        } catch (error) {
          console.error('WebSocket connection failed:', error)
        }
      }
    },

    // Update user info
    updateUser(userData) {
      this.user = { ...this.user, ...userData }
      localStorage.setItem('user', JSON.stringify(this.user))
    },

    // Update token (used by auto-refresh)
    updateToken(newToken) {
      this.token = newToken
      localStorage.setItem('access_token', newToken)
    },

    // Clear error
    clearError() {
      this.error = null
    },
  },
})
