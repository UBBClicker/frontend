<template>
    <div class="game-page">
      <MainHeader />
      
      <!-- Loading overlay -->
      <v-overlay v-if="gameStore.isLoading" class="align-center justify-center">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
      
      <!-- Error message -->
      <v-alert
        v-if="gameStore.error"
        type="error"
        class="ma-4"
        closable
        @click:close="gameStore.clearError()"
      >
        {{ gameStore.error }}
      </v-alert>
      
      <!-- Connection status -->
      <v-chip
        :color="gameStore.isConnected ? 'success' : 'warning'"
        class="connection-status"
        size="small"
      >
        <v-icon start :icon="gameStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off'"></v-icon>
        {{ gameStore.isConnected ? 'Połączono' : 'Rozłączono' }}
      </v-chip>
      
      <div class="main-content">
        <!-- Left section: clickable image -->
        <div class="left-section">
          <ClickIcon @click="handleClick" :disabled="gameStore.isLoading" />
        </div>
        
        <!-- Right section: stats panel and upgrades -->
        <div class="right-section">
          <div class="right-half">
            <Stats
              :points="gameStore.points"
              :pointsPerClick="gameStore.pointsPerClick"
              :pointsPerSecond="gameStore.pointsPerSecond"
              :lifetimePoints="gameStore.lifetimePoints"
              :clicks="gameStore.clicks"
            />
          </div>
          <div class="right-half">
            <Upgrades
              :items="gameStore.items"
              :userItems="gameStore.userItems"
              @buy-item="handleBuyItem"
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'
  import { useGameStore } from '@/stores/game'
  import MainHeader from '@/components/MainHeader.vue'
  import ClickIcon from '@/components/ClickIcon.vue'
  import Stats from '@/components/Stats.vue'
  import Upgrades from '@/components/Upgrades.vue'
  
  const router = useRouter()
  const authStore = useAuthStore()
  const gameStore = useGameStore()
  
  // Check authentication
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
  
  // Handle click events
  const handleClick = async () => {
    try {
      await gameStore.click()
    } catch (error) {
      console.error('Click failed:', error)
    }
  }
  
  // Handle item purchase
  const handleBuyItem = async (itemId) => {
    try {
      await gameStore.buyItem(itemId)
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }
  
  // Initialize game when component mounts
  onMounted(async () => {
    try {
      console.log('GamePage: Starting initialization...')
      
      // Initialize auth if needed
      authStore.initializeAuth()
      
      // Ensure user is logged in
      if (!authStore.isLoggedIn) {
        console.log('User not logged in, redirecting...')
        router.push('/login')
        return
      }
      
      console.log('User is logged in:', authStore.userName)
      
      // Initialize game data first
      await gameStore.initialize()
      
      // Connect to WebSocket after game store is initialized
      if (!gameStore.isConnected) {
        console.log('Connecting to WebSocket...')
        await authStore.connectWebSocket()
      }
      
      // Start passive income tracking
      gameStore.startPassiveIncome()
      
      console.log('GamePage: Initialization complete')
    } catch (error) {
      console.error('Game initialization failed:', error)
    }
  })
  
  // Cleanup on unmount
  onBeforeUnmount(() => {
    // Cleanup is handled by the stores
  })
  </script>
  
  <style scoped>
  .game-page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    height: 100vh;
   /* background-color: #222;  Dark background */
    background-image: url("/background.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    color: #ccc;
    position: relative;
  }
  
  .connection-status {
    position: absolute;
    top: 80px;
    right: 16px;
    z-index: 10;
  }
  
  .main-content {
  display: flex;
  flex: 1;
  height: calc(100vh - 64px); /* adjust based on your header */
  overflow: hidden;
}
  
  .left-section {
    flex: 2;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
  
  .right-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100vh;
  min-height: 0;;
  min-width: 650px;
  overflow: hidden;
  padding: 1rem;
  gap: 1rem;
  padding-top: 5rem;
}

.right-half:first-child {
  flex: 1 1 auto; /* stats fixed size */
}

.right-half:last-child {
  flex: 1 1 auto; /* upgrades grow */
  overflow-y: auto;
  min-height: 0;
}

  .right-half {
  flex: 1 1 auto;
  overflow-y: auto;
  min-height: 390px;
}
  
  @media (max-width: 768px) {
    .main-content {
      flex-direction: column;
    }
    
    .left-section {
      flex: none;
      height: 50vh;
    }
    
    .right-section {
      flex: none;
      max-height: none;
    }
  }
  </style>
  