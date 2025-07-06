// Enhanced debugging utilities for UBBClicker
// Run these in browser console to diagnose issues

// 1. Test WebSocket connection manually
window.testWebSocketConnection = async function() {
  console.log('🔧 Testing WebSocket Connection...')
  
  const token = localStorage.getItem('access_token')
  if (!token) {
    console.error('❌ No access token found')
    return false
  }
  
  console.log('🔑 Token found:', token.substring(0, 20) + '...')
  
  try {
    const ws = new WebSocket(`ws://localhost:3001/game/ws/${token}`)
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection successful!')
      ws.close()
    }
    
    ws.onerror = (error) => {
      console.error('❌ WebSocket connection failed:', error)
    }
    
    ws.onclose = (event) => {
      console.log('🔌 WebSocket closed:', event.code, event.reason)
    }
    
  } catch (error) {
    console.error('❌ WebSocket test error:', error)
  }
}

// 2. Check game store state
window.checkGameStore = function() {
  console.log('🎮 Game Store State:')
  
  // Access stores through the app instance
  const gameStore = window.__GAME_STORE__ || (() => {
    try {
      return Vue.getCurrentInstance()?.appContext.config.globalProperties.$gameStore
    } catch {
      return null
    }
  })()
  
  if (!gameStore) {
    console.error('❌ Cannot access game store')
    return
  }
  
  console.log('├─ isConnected:', gameStore.isConnected)
  console.log('├─ connectionStatus:', gameStore.connectionStatus)
  console.log('├─ points:', gameStore.points)
  console.log('├─ items count:', gameStore.items?.length || 0)
  console.log('├─ items:', gameStore.items)
  console.log('└─ error:', gameStore.error)
}

// 3. Test API endpoints directly
window.testAPIEndpoints = async function() {
  console.log('🌐 Testing API Endpoints...')
  
  const token = localStorage.getItem('access_token')
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
  
  // Test health endpoint
  try {
    const health = await fetch('http://localhost:3001/health')
    const healthData = await health.json()
    console.log('✅ Health check:', healthData)
  } catch (error) {
    console.error('❌ Health check failed:', error)
  }
  
  // Test items endpoint
  try {
    const items = await fetch('http://localhost:3001/items', { headers })
    const itemsData = await items.json()
    console.log('✅ Items endpoint:', itemsData.length, 'items')
    console.log('First item:', itemsData[0])
  } catch (error) {
    console.error('❌ Items endpoint failed:', error)
  }
  
  // Test game state endpoint
  try {
    const gameState = await fetch('http://localhost:3001/game/state/with-items', { headers })
    const gameData = await gameState.json()
    console.log('✅ Game state with items:', gameData)
  } catch (error) {
    console.error('❌ Game state endpoint failed:', error)
  }
}

// 4. Check authentication state
window.checkAuthState = function() {
  console.log('🔐 Authentication State:')
  
  const token = localStorage.getItem('access_token')
  const user = localStorage.getItem('user')
  
  console.log('├─ Has token:', !!token)
  console.log('├─ Token preview:', token ? token.substring(0, 50) + '...' : 'None')
  console.log('├─ User data:', user ? JSON.parse(user) : 'None')
  
  if (token) {
    // Decode JWT payload (basic, no signature verification)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('├─ Token payload:', payload)
      console.log('└─ Token expires:', new Date(payload.exp * 1000))
    } catch (error) {
      console.log('└─ Could not decode token')
    }
  }
}

// 5. Run all diagnostics
window.runAllDiagnostics = async function() {
  console.log('🔍 Running Full Diagnostics...\n')
  
  console.log('═══ 1. Authentication Check ═══')
  checkAuthState()
  
  console.log('\n═══ 2. API Endpoints Test ═══')
  await testAPIEndpoints()
  
  console.log('\n═══ 3. WebSocket Connection Test ═══')
  await testWebSocketConnection()
  
  console.log('\n═══ 4. Game Store State ═══')
  checkGameStore()
  
  console.log('\n🏁 Diagnostics Complete!')
}

// 6. Fix connection issues
window.forceReconnect = async function() {
  console.log('🔄 Forcing reconnection...')
  
  // Get stores from window if available
  const gameStore = window.__GAME_STORE__
  const authStore = window.__AUTH_STORE__
  
  if (authStore && gameStore) {
    try {
      await authStore.connectWebSocket()
      console.log('✅ Reconnection attempted')
    } catch (error) {
      console.error('❌ Reconnection failed:', error)
    }
  } else {
    console.error('❌ Cannot access stores for reconnection')
  }
}

// Auto-expose stores to window for debugging
if (typeof window !== 'undefined') {
  // This will be set by the stores when they initialize
  console.log('🔧 Debugging utilities loaded!')
  console.log('Available commands:')
  console.log('- testWebSocketConnection()')
  console.log('- checkGameStore()')
  console.log('- testAPIEndpoints()')
  console.log('- checkAuthState()')
  console.log('- runAllDiagnostics()')
  console.log('- forceReconnect()')
}
