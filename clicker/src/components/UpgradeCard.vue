<template>
    <v-card 
      class="upgrade-item" 
      :class="{ 'affordable': canAfford, 'unaffordable': !canAfford }"
      :disabled="!canAfford"
      dark
    >
      <v-card-text class="pa-3">
        <div class="d-flex align-center mb-2">
          <!-- Item image placeholder or icon -->
          <v-avatar size="48" class="mr-3 upgrade-avatar" rounded="0">
  <v-img 
    :src="item.image_url"
    :alt="item.name"
    cover
    eager
    class="upgrade-image"
  />
  <template #placeholder>
    <v-icon color="grey lighten-1" size="48">mdi-alert</v-icon>
  </template>
</v-avatar>


          
          <div class="flex-grow-1">
            <h4 class="item-name">{{ item.name }}</h4>
            <p class="item-description">{{ item.description }}</p>
          </div>
          
          <!-- Quantity owned -->
          <v-chip 
            v-if="item.quantity > 0" 
            size="small" 
            color="success" 
            class="quantity-chip"
          >
            {{ item.quantity }}
          </v-chip>
        </div>
        
        <!-- Item effects -->
        <div class="item-effects mb-2">
          <v-chip 
            v-if="item.points_per_click > 0" 
            size="small" 
            color="primary" 
            class="mr-1"
          >
            <v-icon left size="small">mdi-cursor-pointer</v-icon>
            +{{ item.points_per_click }} za klik
          </v-chip>
          
          <v-chip 
            v-if="item.points_per_second > 0" 
            size="small" 
            color="secondary"
          >
            <v-icon left size="small">mdi-clock-fast</v-icon>
            +{{ item.points_per_second }}/s
          </v-chip>
        </div>
        
        <!-- Cost and buy button -->
        <div class="d-flex align-center justify-space-between">
          <div class="cost-info">
            <span class="cost-label">Koszt:</span>
            <span class="cost-value">{{ formattedCost }}</span>
          </div>
          
          <v-btn
            @click="$emit('buy', item)"
            :disabled="!canAfford"
            :color="canAfford ? 'success' : 'grey'"
            size="small"
            variant="elevated"
          >
            <v-icon left>mdi-cart</v-icon>
            Kup
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    item: {
      type: Object,
      required: true
    },
    canAfford: {
      type: Boolean,
      default: false
    }
  })
  
  const emits = defineEmits(['buy'])
  
  // Format cost for display
  const formattedCost = computed(() => {
    const cost = props.item.current_cost || props.item.base_cost || 0
    if (cost === 0) {
      console.warn('Item has no cost:', props.item)
    }
    return new Intl.NumberFormat('pl-PL').format(cost)
  })
  </script>

  <style scoped>
  .upgrade-item {
    transition: all 0.2s ease;
    border: 1px solid rgba(194, 32, 32, 0.603);
    min-height: 150px;
  }
  
  .upgrade-item.affordable {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    border-color: #3b82f6;
  }
  
  .upgrade-item.affordable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  
  .upgrade-item.unaffordable {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    opacity: 0.7;
  }
  
  .item-name {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0;
    color: #fff;
  }
  
  .item-description {
    font-size: 0.875rem;
    margin: 4px 0 0 0;
    color: #d1d5db;
    line-height: 1.3;
  }
  
  .quantity-chip {
    position: absolute;
    top: 8px;
    right: 8px;
  }
  
  .item-effects {
    min-height: 32px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .cost-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .cost-label {
    font-size: 0.75rem;
    color: #9ca3af;
    text-transform: uppercase;
    font-weight: 500;
  }
  
  .cost-value {
    font-size: 1rem;
    font-weight: bold;
    color: #fbbf24;
  }
  
  .v-card-text {
    position: relative;
  }

  .upgrade-avatar {
  border: 1px solid rgba(255, 255, 255, 0.1);
  background-color: #1f2937;
  flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    .item-name {
      font-size: 1rem;
    }
    
    .item-description {
      font-size: 0.8rem;
    }
    
    .cost-value {
      font-size: 0.9rem;
    }
  }
  </style>
  