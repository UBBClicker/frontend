import { onMounted, onUnmounted } from 'vue'
import websocketService from '@/services/websocket'

/**
 * Composable for managing WebSocket connections and events
 * Provides a clean interface for components to interact with WebSocket
 */
export function useWebSocket() {
  // Connection management
  const connect = async (token) => {
    try {
      await websocketService.connect(token)
      return true
    } catch (error) {
      console.error('WebSocket connection failed:', error)
      return false
    }
  }

  const disconnect = () => {
    websocketService.disconnect()
  }

  const isConnected = () => {
    return websocketService.isConnected()
  }

  const getConnectionStatus = () => {
    return websocketService.getReadyState()
  }

  // Event management
  const on = (event, callback) => {
    websocketService.on(event, callback)
  }

  const off = (event, callback) => {
    websocketService.off(event, callback)
  }

  // Game-specific actions
  const sendClick = () => {
    return websocketService.sendClick()
  }

  const sendBuyItem = (itemId) => {
    return websocketService.sendBuyItem(itemId)
  }

  const requestGameState = () => {
    return websocketService.requestGameState()
  }

  const requestItems = () => {
    return websocketService.requestItems()
  }

  // Auto-cleanup on component unmount
  onUnmounted(() => {
    // Note: We don't automatically disconnect here because
    // the WebSocket should persist across component changes
    // Only disconnect when user logs out
  })

  return {
    connect,
    disconnect,
    isConnected,
    getConnectionStatus,
    on,
    off,
    sendClick,
    sendBuyItem,
    requestGameState,
    requestItems
  }
}

/**
 * Composable for handling specific WebSocket events
 * Automatically sets up and cleans up event listeners
 */
export function useWebSocketEvents(events = {}) {
  const callbacks = new Map()

  onMounted(() => {
    // Set up event listeners
    Object.entries(events).forEach(([event, callback]) => {
      websocketService.on(event, callback)
      callbacks.set(event, callback)
    })
  })

  onUnmounted(() => {
    // Clean up event listeners
    callbacks.forEach((callback, event) => {
      websocketService.off(event, callback)
    })
    callbacks.clear()
  })

  return {
    addListener: (event, callback) => {
      websocketService.on(event, callback)
      callbacks.set(event, callback)
    },
    removeListener: (event, callback) => {
      websocketService.off(event, callback)
      callbacks.delete(event)
    }
  }
}
