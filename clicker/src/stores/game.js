import { defineStore } from 'pinia'
import { gameAPI } from '@/services/api'
import websocketService from '@/services/websocket'

export const useGameStore = defineStore('game', {
  state: () => ({
    // Game state
    points: 0,
    lifetimePoints: 0,
    clicks: 0,
    pointsPerClick: 1,
    pointsPerSecond: 0,
    
    // Items and upgrades
    items: [],
    userItems: {},
    
    // Leaderboard
    leaderboard: [],
    
    // UI state
    isLoading: false,
    error: null,
    
    // WebSocket connection status
    isConnected: false,
    connectionStatus: 'CLOSED',
  }),

  getters: {
    // Format points for display
    formattedPoints: (state) => {
      return new Intl.NumberFormat().format(state.points)
    },
    
    formattedLifetimePoints: (state) => {
      return new Intl.NumberFormat().format(state.lifetimePoints)
    },
    
    // Get available items (items that can be purchased)
    availableItems: (state) => {
      return state.items.filter(item => item.current_cost <= state.points)
    },
    
    // Check if user can afford an item
    canAfford: (state) => (itemId) => {
      const item = state.items.find(i => i.id === itemId)
      return item ? item.current_cost <= state.points : false
    },
    
    // Get user's rank in leaderboard
    userRank: (state) => {
      const rank = state.leaderboard.findIndex(entry => entry.user_id === state.user?.id)
      return rank >= 0 ? rank + 1 : null
    },
  },

  actions: {
    // Initialize game store
    async initialize() {
      await this.setupWebSocketListeners()
      await this.loadGameData()
    },

    // Load initial game data
    async loadGameData() {
      this.isLoading = true
      this.error = null

      try {
        console.log('Loading game data...')
        
        // Load game state with items
        const gameData = await gameAPI.getGameStateWithItems()
        console.log('Game data received:', gameData)
        this.updateGameState(gameData)
        
        // Load leaderboard
        await this.loadLeaderboard()
        
        // Connect to WebSocket if not connected
        if (!websocketService.isConnected()) {
          const token = localStorage.getItem('access_token')
          if (token) {
            console.log('Connecting to WebSocket with token:', token.substring(0, 20) + '...')
            await websocketService.connect(token)
          } else {
            console.warn('No access token found for WebSocket connection')
          }
        }
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to load game data'
        console.error('Error loading game data:', error)
      } finally {
        this.isLoading = false
      }
    },

    // Setup WebSocket event listeners
    async setupWebSocketListeners() {
      // Connection status
      websocketService.on('connected', () => {
        this.isConnected = true
        this.connectionStatus = 'OPEN'
        console.log('🎮 Game store: WebSocket connected successfully')
        
        // Request initial data once connected
        setTimeout(() => {
          websocketService.requestGameState()
          websocketService.requestItems()
        }, 100)
      })

      websocketService.on('disconnected', (event) => {
        this.isConnected = false
        this.connectionStatus = 'CLOSED'
        console.log('🎮 Game store: WebSocket disconnected', event?.code, event?.reason)
      })

      websocketService.on('error', (error) => {
        this.error = 'WebSocket connection error'
        console.error('🎮 Game store: WebSocket error:', error)
      })

      // Game events
      websocketService.on('game_state', (data) => {
        this.updateGameState(data)
      })

      websocketService.on('click_result', (data) => {
        this.points = data.new_total
        this.lifetimePoints = data.lifetime_points
        this.clicks = data.clicks
        
        // Trigger animation or effects here if needed
        console.log(`Earned ${data.points_earned} points!`)
      })

      websocketService.on('purchase_result', (data) => {
        if (data.success) {
          this.points = data.new_points
          this.pointsPerClick = data.new_points_per_click
          this.pointsPerSecond = data.new_points_per_second
          
          // Update items data
          this.requestItems()
          
          console.log(`Successfully purchased item!`)
        } else {
          this.error = data.message
          console.error('Purchase failed:', data.message)
        }
      })

      websocketService.on('items_list', (data) => {
        this.items = data
        this.updateUserItems()
      })

      websocketService.on('leaderboard_update', (data) => {
        this.leaderboard = data
      })
    },

    // Update game state from API response
    updateGameState(data) {
      console.log('Updating game state with data:', data)
      
      this.points = data.points || 0
      this.lifetimePoints = data.lifetime_points || 0
      this.clicks = data.clicks || 0
      this.pointsPerClick = data.points_per_click || 1
      this.pointsPerSecond = data.points_per_second || 0
      
      if (data.items) {
        console.log('Found items in game state:', data.items.length, 'items')
        this.items = data.items
        this.updateUserItems()
      } else {
        console.warn('No items found in game state data')
      }
    },

    // Update user items map for quick access
    updateUserItems() {
      this.userItems = {}
      this.items.forEach(item => {
        this.userItems[item.id] = item.quantity || 0
      })
    },

    // Process a click (via WebSocket for real-time updates)
    async click() {
      if (websocketService.isConnected()) {
        websocketService.sendClick()
      } else {
        // Fallback to API if WebSocket not connected
        try {
          const result = await gameAPI.processClick()
          this.points = result.new_total
          this.lifetimePoints = result.lifetime_points
          this.clicks = result.clicks
          return result
        } catch (error) {
          this.error = error.response?.data?.detail || 'Click failed'
          throw error
        }
      }
    },

    // Buy an item (via WebSocket for real-time updates)
    async buyItem(itemId) {
      if (websocketService.isConnected()) {
        websocketService.sendBuyItem(itemId)
      } else {
        // Fallback to API if WebSocket not connected
        try {
          const result = await gameAPI.buyItem(itemId)
          if (result.success) {
            this.points = result.new_points
            this.pointsPerClick = result.new_points_per_click
            this.pointsPerSecond = result.new_points_per_second
            await this.loadGameData() // Refresh data
          }
          return result
        } catch (error) {
          this.error = error.response?.data?.detail || 'Purchase failed'
          throw error
        }
      }
    },

    // Request current game state via WebSocket
    requestGameState() {
      if (websocketService.isConnected()) {
        websocketService.requestGameState()
      }
    },

    // Request items list via WebSocket
    requestItems() {
      if (websocketService.isConnected()) {
        websocketService.requestItems()
      }
    },

    // Load leaderboard
    async loadLeaderboard(limit = 10) {
      try {
        this.leaderboard = await gameAPI.getLeaderboard(limit)
      } catch (error) {
        console.error('Error loading leaderboard:', error)
      }
    },

    // Start passive income (points per second)
    startPassiveIncome() {
      // This would be handled by the backend's automatic point generation
      // The frontend just needs to periodically sync with the server
      setInterval(() => {
        if (this.pointsPerSecond > 0) {
          this.requestGameState()
        }
      }, 1000) // Update every second
    },

    // Clear error
    clearError() {
      this.error = null
    },

    // Reset game state (useful for logout)
    reset() {
      this.points = 0
      this.lifetimePoints = 0
      this.clicks = 0
      this.pointsPerClick = 1
      this.pointsPerSecond = 0
      this.items = []
      this.userItems = {}
      this.leaderboard = []
      this.isConnected = false
      this.connectionStatus = 'CLOSED'
      this.error = null
    },
  },
})
