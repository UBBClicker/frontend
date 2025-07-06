<template>
    <v-app-bar dark class="header" elevation="4">
      <!-- Left side: Title and user info -->
      <div class="left-header">
        <v-app-bar-title class="title">
          <v-icon left size="32" color="primary">mdi-mouse</v-icon>
          UBBClicker
        </v-app-bar-title>
        
        <v-chip
          v-if="authStore.isLoggedIn"
          color="primary"
          class="ml-4"
          size="small"
        >
          <v-icon left size="16">mdi-account</v-icon>
          {{ authStore.userName }}
        </v-chip>
      </div>

      <v-spacer></v-spacer>

      <!-- Right side: Navigation and actions -->
      <div class="right-header">
        <!-- Navigation buttons -->
        <v-btn
          to="/game"
          variant="text"
          class="mr-2"
          :class="{ 'active-route': $route.path === '/game' }"
        >
          <v-icon left>mdi-gamepad-variant</v-icon>
          Gra
        </v-btn>
        
        <v-btn
          to="/ranking"
          variant="text"
          class="mr-2"
          :class="{ 'active-route': $route.path === '/ranking' }"
        >
          <v-icon left>mdi-trophy</v-icon>
          Ranking
        </v-btn>
        
        <!-- Connection status indicator -->
        <v-tooltip bottom>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              size="small"
              class="mr-2"
              :color="gameStore.isConnected ? 'success' : 'warning'"
            >
              <v-icon>{{ gameStore.isConnected ? 'mdi-wifi' : 'mdi-wifi-off' }}</v-icon>
            </v-btn>
          </template>
          <span>{{ gameStore.isConnected ? 'Połączono z serwerem' : 'Brak połączenia z serwerem' }}</span>
        </v-tooltip>
        
        <!-- User menu -->
        <v-menu v-if="authStore.isLoggedIn">
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="text"
              icon
            >
              <v-icon>mdi-account-circle</v-icon>
            </v-btn>
          </template>
          
          <v-list>
            <v-list-item @click="logout" class="logout-item">
              <v-list-item-title>
                <v-icon left>mdi-logout</v-icon>
                Wyloguj się
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/auth'
  import { useGameStore } from '@/stores/game'
  
  const authStore = useAuthStore()
  const gameStore = useGameStore()
  
  // Methods
  const logout = async () => {
    await authStore.logout()
  }
  </script>
  
  <style scoped>
  .header {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
    border-bottom: 1px solid #4a5568;
  }
  
  .left-header {
    display: flex;
    align-items: center;
  }
  
  .title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #64b5f6 !important;
  }
  
  .right-header {
    display: flex;
    align-items: center;
  }
  
  .active-route {
    background: rgba(100, 181, 246, 0.2) !important;
    color: #64b5f6 !important;
  }
  
  .logout-item {
    color: #f87171 !important;
  }
  
  .logout-item:hover {
    background: rgba(248, 113, 113, 0.1) !important;
  }
  
  @media (max-width: 768px) {
    .title {
      font-size: 1.2rem;
    }
    
    .left-header .v-chip {
      display: none;
    }
  }
  </style>
  