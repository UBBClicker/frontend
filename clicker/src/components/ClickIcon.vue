<template>
    <div class="clicker-container">
      <div class="click-effects" v-if="showEffect">
        <div class="points-popup">+{{ lastPointsEarned }}</div>
      </div>
      
      <img
        src="/UBBlogo.png"
        alt="UBB Logo"
        class="clicker-image"
        :class="{ 
          'clicking': isClicking,
          'disabled': disabled 
        }"
        @click="handleClick"
        @mousedown="startClick"
        @mouseup="endClick"
        @mouseleave="endClick"
      />
      
      <div class="click-counter">
        Kliknięcia: {{ clicks }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { useGameStore } from '@/stores/game'
  
  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false
    }
  })
  
  const emits = defineEmits(['click'])
  
  const gameStore = useGameStore()
  
  // Component state
  const isClicking = ref(false)
  const showEffect = ref(false)
  const lastPointsEarned = ref(0)
  
  // Computed properties
  const clicks = computed(() => gameStore.clicks)
  
  // Methods
  function handleClick() {
    if (props.disabled) return
    
    console.log("ClickIcon: handleClick -> emitting click")
    lastPointsEarned.value = gameStore.pointsPerClick
    
    // Show points animation
    showPointsEffect()
    
    // Emit click event
    emits('click')
  }
  
  function startClick() {
    if (!props.disabled) {
      isClicking.value = true
    }
  }
  
  function endClick() {
    isClicking.value = false
  }
  
  function showPointsEffect() {
    showEffect.value = true
    setTimeout(() => {
      showEffect.value = false
    }, 1000)
  }
  </script>
  
  <style scoped>
  .clicker-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    user-select: none;
  }
  
  .click-effects {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
  }
  
  .points-popup {
    color: #4CAF50;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
    animation: popupAnimation 1s ease-out forwards;
  }
  
  @keyframes popupAnimation {
    0% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    50% {
      transform: translateY(-30px) scale(1.2);
    }
    100% {
      opacity: 0;
      transform: translateY(-60px) scale(0.8);
    }
  }
  
  .clicker-image {
    width: 300px;
    height: auto;
    cursor: pointer;
    transition: all 0.1s ease;
    border-radius: 10px;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
  }
  
  .clicker-image:hover:not(.disabled) {
    transform: scale(1.05);
    filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4)) brightness(1.1);
  }
  
  .clicker-image.clicking {
    transform: scale(0.95);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6)) brightness(1.2);
  }
  
  .clicker-image.disabled {
    cursor: not-allowed;
    opacity: 0.6;
    filter: grayscale(50%);
  }
  
  .click-counter {
    margin-top: 16px;
    font-size: 18px;
    font-weight: bold;
    color: #FFF;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    padding: 8px 16px;
    background: rgba(255,255,255,0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
  }
  
  @media (max-width: 768px) {
    .clicker-image {
      width: 200px;
    }
    
    .points-popup {
      font-size: 20px;
    }
    
    .click-counter {
      font-size: 16px;
    }
  }
  </style>
  