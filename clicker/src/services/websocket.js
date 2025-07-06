class WebSocketService {
  constructor() {
    this.ws = null
    this.url = 'ws://localhost:3001/game/ws'
    this.token = null
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 1000
    this.isConnecting = false
  }

  // Connect to WebSocket with token
  connect(token) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting')
      return Promise.resolve()
    }

    this.token = token
    this.isConnecting = true
    
    console.log('Attempting WebSocket connection to:', `${this.url}/${token?.substring(0, 20)}...`)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}/${token}`)

        this.ws.onopen = (event) => {
          console.log('✅ WebSocket connected successfully')
          this.isConnecting = false
          this.reconnectAttempts = 0
          this.emit('connected', event)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📨 WebSocket message received:', data)
            this.emit('message', data)
            
            // Emit specific event types
            if (data.type) {
              this.emit(data.type, data.data)
            }
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('❌ WebSocket disconnected:', event.code, event.reason)
          this.isConnecting = false
          this.emit('disconnected', event)
          
          // Attempt to reconnect if not intentionally closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          this.isConnecting = false
          this.emit('error', error)
          reject(error)
        }
      } catch (error) {
        console.error('❌ WebSocket connection failed:', error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect')
      this.ws = null
    }
    this.token = null
    this.reconnectAttempts = 0
  }

  // Attempt to reconnect
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.token) {
      console.log('Max reconnection attempts reached or no token available')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
    
    setTimeout(() => {
      this.connect(this.token).catch(error => {
        console.error('Reconnection failed:', error)
      })
    }, delay)
  }

  // Send message to WebSocket
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
      return true
    } else {
      console.warn('WebSocket not connected, cannot send message:', message)
      return false
    }
  }

  // Game-specific methods
  sendClick() {
    return this.send({ type: 'click' })
  }

  sendBuyItem(itemId) {
    return this.send({ type: 'buy_item', item_id: itemId })
  }

  requestGameState() {
    return this.send({ type: 'get_state' })
  }

  requestItems() {
    return this.send({ type: 'get_items' })
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error)
        }
      })
    }
  }

  // Get connection status
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN
  }

  getReadyState() {
    if (!this.ws) return 'CLOSED'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING'
      case WebSocket.OPEN: return 'OPEN'
      case WebSocket.CLOSING: return 'CLOSING'
      case WebSocket.CLOSED: return 'CLOSED'
      default: return 'UNKNOWN'
    }
  }
}

// Create singleton instance
export const websocketService = new WebSocketService()
export default websocketService
