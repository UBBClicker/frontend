// Utilities
import { createPinia } from 'pinia'

// Export individual stores
export { useAuthStore } from './auth'
export { useGameStore } from './game'
export { useAppStore } from './app'

export default createPinia()
