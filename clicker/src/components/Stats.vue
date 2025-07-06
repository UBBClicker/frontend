<template>
    <v-card class="stats-panel" dark>
      <v-card-title class="text-center">
        <v-icon left>mdi-chart-line</v-icon>
        Statystyki
      </v-card-title>
      
      <v-card-text>
        <div class="stat-item">
          <v-icon class="stat-icon">mdi-coins</v-icon>
          <div class="stat-content">
            <label>Punkty:</label>
            <span class="stat-value">{{ formattedPoints }}</span>
          </div>
        </div>
        
        <v-divider class="my-2"></v-divider>
        
        <div class="stat-item">
          <v-icon class="stat-icon">mdi-cursor-pointer</v-icon>
          <div class="stat-content">
            <label>Punkty za klik:</label>
            <span class="stat-value">{{ pointsPerClick }}</span>
          </div>
        </div>
        
        <div class="stat-item">
          <v-icon class="stat-icon">mdi-clock-fast</v-icon>
          <div class="stat-content">
            <label>Punkty na sekundę:</label>
            <span class="stat-value">{{ pointsPerSecond }}</span>
          </div>
        </div>
        
        <v-divider class="my-2"></v-divider>
        
        <div class="stat-item">
          <v-icon class="stat-icon">mdi-trophy</v-icon>
          <div class="stat-content">
            <label>Łączne punkty:</label>
            <span class="stat-value">{{ formattedLifetimePoints }}</span>
          </div>
        </div>
        
      </v-card-text>
    </v-card>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    points: {
      type: Number,
      default: 0
    },
    pointsPerClick: {
      type: Number,
      default: 1
    },
    pointsPerSecond: {
      type: Number,
      default: 0
    },
    lifetimePoints: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    }
  })
  
  // Format large numbers for better readability
  const formattedPoints = computed(() => {
    return new Intl.NumberFormat('pl-PL').format(props.points)
  })
  
  const formattedLifetimePoints = computed(() => {
    return new Intl.NumberFormat('pl-PL').format(props.lifetimePoints)
  })
  </script>
  
  <style scoped>
  .stats-panel {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    border: 1px solid #4a5568;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    padding: 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.05);
    transition: background 0.2s ease;
  }
  
  .stat-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .stat-icon {
    margin-right: 12px;
    color: #64b5f6;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  
  label {
    font-weight: 500;
    font-size: 0.875rem;
    color: #b0bec5;
    margin-bottom: 2px;
  }
  
  .stat-value {
    font-weight: bold;
    font-size: 1.125rem;
    color: #fff;
  }
  
  .v-card-title {
    padding-bottom: 8px;
    color: #64b5f6 !important;
  }
  
  @media (max-width: 768px) {
    .stat-item {
      margin-bottom: 8px;
      margin-top: 8opx;
      padding: 6px;
    }
    
    label {
      font-size: 0.8rem;
    }
    
    .stat-value {
      font-size: 1rem;
    }
  }
  </style>
  