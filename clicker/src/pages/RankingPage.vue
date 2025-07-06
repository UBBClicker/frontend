<template>
  <div class="ranking-page">
    <MainHeader />
    
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card dark class="ranking-card">
            <v-card-title class="text-center pa-6">
              <v-icon left size="32" color="gold">mdi-trophy</v-icon>
              <span class="ranking-title">Ranking Graczy</span>
            </v-card-title>
            
            <v-divider></v-divider>
            
            <!-- Loading state -->
            <div v-if="gameStore.isLoading" class="text-center pa-8">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4">Ładowanie rankingu...</p>
            </div>
            
            <!-- Error state -->
            <v-alert
              v-else-if="gameStore.error"
              type="error"
              class="ma-4"
              closable
              @click:close="gameStore.clearError()"
            >
              {{ gameStore.error }}
            </v-alert>
            
            <!-- Leaderboard content -->
            <v-card-text v-else class="pa-0">
              <div v-if="leaderboard.length === 0" class="text-center pa-8">
                <v-icon size="64" color="grey">mdi-account-group</v-icon>
                <p class="mt-4 text-grey">Brak danych w rankingu</p>
              </div>
              
              <v-list v-else class="leaderboard-list">
                <v-list-item
                  v-for="(entry, index) in leaderboard"
                  :key="entry.user_id"
                  :class="getPlayerClass(index)"
                  class="ranking-entry"
                >
                  <!-- Rank badge -->
                  <template #prepend>
                    <v-avatar
                      :color="getRankColor(index)"
                      size="40"
                      class="rank-avatar"
                    >
                      <v-icon v-if="index < 3" color="white">{{ getRankIcon(index) }}</v-icon>
                      <span v-else class="rank-number">{{ index + 1 }}</span>
                    </v-avatar>
                  </template>
                  
                  <!-- Player info -->
                  <v-list-item-content>
                    <v-list-item-title class="player-name">
                      {{ entry.nickname }}
                      <v-chip
                        v-if="isCurrentUser(entry.user_id)"
                        size="small"
                        color="primary"
                        class="ml-2"
                      >
                        To Ty!
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle class="player-stats">
                      {{ formatPoints(entry.lifetime_points) }} punktów • {{ entry.clicks }} kliknięć
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  
                  <!-- Score -->
                  <template #append>
                    <div class="score-display">
                      <span class="score-value">{{ formatPoints(entry.lifetime_points) }}</span>
                      <span class="score-label">punktów</span>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
            
            <!-- Refresh button -->
            <v-card-actions class="justify-center pa-4">
              <v-btn
                @click="refreshLeaderboard"
                :loading="gameStore.isLoading"
                color="primary"
                variant="outlined"
              >
                <v-icon left>mdi-refresh</v-icon>
                Odśwież ranking
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useGameStore } from '@/stores/game'
import MainHeader from '@/components/MainHeader.vue'

const authStore = useAuthStore()
const gameStore = useGameStore()

// Computed properties
const leaderboard = computed(() => gameStore.leaderboard)

// Methods
const formatPoints = (points) => {
  return new Intl.NumberFormat('pl-PL').format(points)
}

const getRankColor = (index) => {
  switch (index) {
    case 0: return 'gold'
    case 1: return 'silver'
    case 2: return '#CD7F32' // bronze
    default: return 'grey'
  }
}

const getRankIcon = (index) => {
  switch (index) {
    case 0: return 'mdi-trophy'
    case 1: return 'mdi-medal'
    case 2: return 'mdi-medal'
    default: return ''
  }
}

const getPlayerClass = (index) => {
  if (index === 0) return 'first-place'
  if (index === 1) return 'second-place'
  if (index === 2) return 'third-place'
  return ''
}

const isCurrentUser = (userId) => {
  return authStore.userId === userId
}

const refreshLeaderboard = async () => {
  await gameStore.loadLeaderboard()
}

// Initialize
onMounted(async () => {
  // Ensure user is authenticated
  authStore.initializeAuth()
  
  // Load leaderboard
  await gameStore.loadLeaderboard()
})
</script>

<style scoped>
.ranking-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.ranking-card {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 1px solid #4a5568;
}

.ranking-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffd700;
}

.leaderboard-list {
  background: transparent;
}

.ranking-entry {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px 16px;
  transition: background 0.2s ease;
}

.ranking-entry:hover {
  background: rgba(255, 255, 255, 0.05);
}

.ranking-entry.first-place {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
}

.ranking-entry.second-place {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, transparent 100%);
}

.ranking-entry.third-place {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, transparent 100%);
}

.rank-avatar {
  margin-right: 16px;
}

.rank-number {
  font-weight: bold;
  font-size: 1.1rem;
}

.player-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
}

.player-stats {
  color: #b0bec5;
  font-size: 0.9rem;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
}

.score-value {
  font-size: 1.1rem;
  font-weight: bold;
  color: #ffd700;
}

.score-label {
  font-size: 0.8rem;
  color: #9ca3af;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .ranking-title {
    font-size: 1.3rem;
  }
  
  .player-name {
    font-size: 1rem;
  }
  
  .score-value {
    font-size: 1rem;
  }
  
  .rank-avatar {
    margin-right: 12px;
  }
}
</style>