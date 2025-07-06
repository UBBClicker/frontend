<template>
    <v-card class="upgrades-panel" dark>
      <v-card-title class="text-center">
        <v-icon left>mdi-store</v-icon>
        Sklep
      </v-card-title>
      
      <v-card-text>
        <!-- Notice the array uses 'Za klik' (lowercase k) -->
        <Tabs :tabs="['Za klik', 'Automatyczne']" v-model:selectedTab="selectedTab" />
        
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-2">Ładowanie przedmiotów...</p>
        </div>
        
        <!-- Empty state -->
        <div v-else-if="filteredItems.length === 0" class="text-center py-4">
          <v-icon size="48" color="grey">mdi-package-variant</v-icon>
          <p class="mt-2 text-grey">Brak dostępnych przedmiotów</p>
        </div>
    
        <!-- Check the exact same text in the condition -->
        <div class="upgrades-list" v-else>
          <!-- Show items based on selected tab -->
          <UpgradeCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            :canAfford="canAffordItem(item)"
            @buy="buyItem"
          />
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useGameStore } from '@/stores/game'
  import Tabs from '@/components/Tabs.vue'
  import UpgradeCard from '@/components/UpgradeCard.vue'
  
  const props = defineProps({
    items: {
      type: Array,
      default: () => []
    },
    userItems: {
      type: Object,
      default: () => ({})
    }
  })
  
  const emits = defineEmits(['buy-item'])
  
  const gameStore = useGameStore()
  const selectedTab = ref('Za klik')
  
  // Computed properties
  const isLoading = computed(() => gameStore.isLoading)
  
  const filteredItems = computed(() => {
    if (!props.items || props.items.length === 0) return []
    
    if (selectedTab.value === 'Za klik') {
      // Items that increase points per click
      return props.items.filter(item => item.points_per_click > 0)
    } else {
      // Items that provide passive income (points per second)
      return props.items.filter(item => item.points_per_second > 0)
    }
  })
  
  // Methods
  function canAffordItem(item) {
    const cost = item.current_cost || item.base_cost || 0
    return gameStore.points >= cost
  }
  
  function buyItem(item) {
    console.log('Kupiono przedmiot:', item)
    emits('buy-item', item.id)
  }
  </script>
 
  
  <style scoped>
  .upgrades-panel {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border: 1px solid #4a5568;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.v-card-text {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden; /* prevent extra scrollbars */
}

.upgrades-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
}

.upgrades-list::-webkit-scrollbar {
  width: 6px;
}

.upgrades-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.upgrades-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.upgrades-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.v-card-title {
  color: #64b5f6 !important;
  padding-bottom: 8px;
}

.text-grey {
  color: #9e9e9e !important;
}

@media (max-width: 768px) {
  .upgrades-list {
    max-height: none;
  }
}

  </style>
  