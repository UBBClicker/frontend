<template>
    <div class="tabs">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-item', { active: tab === selectedTab }]"
        @click="$emit('update:selectedTab', tab)"
      >
        {{ tab }}
      </div>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    tabs: {
      type: Array,
      default: () => []
    },
    selectedTab: {
      type: String,
      default: ''
    }
  })
  
  const emits = defineEmits(['update:selectedTab'])
  </script>
  
  <style scoped>
  .tabs {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #444;
  }
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 0.5rem;
    background: #444;
    cursor: pointer;
    transition: background 0.2s;
    border: 1px solid #555;
    border-bottom: none;
  }
  
  .tab-item.active {
    background: #555;
    color: #fff;
  }
  </style>
  