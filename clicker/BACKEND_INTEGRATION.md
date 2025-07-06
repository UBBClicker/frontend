# UBBClicker Frontend - Backend Integration

This document describes the frontend integration with the UBBClicker backend API and WebSocket services.

## Overview

The frontend has been updated to connect to the FastAPI backend running on `http://localhost:3001`. It includes both HTTP API calls and real-time WebSocket communication.

## Features Implemented

### 1. Authentication System
- **Login/Register**: Users can create accounts and login with nickname/password
- **JWT Token Management**: Automatic token handling and refresh
- **Protected Routes**: Authentication guards for game and ranking pages
- **Auto-login**: Persistent login state using localStorage

### 2. HTTP API Integration
- **User Management**: Registration, login, user info retrieval
- **Game State**: Get current points, clicks, upgrades
- **Item Purchases**: Buy upgrades and items
- **Leaderboard**: View top players ranking

### 3. WebSocket Real-time Features
- **Real-time Clicks**: Instant point updates via WebSocket
- **Live Purchases**: Real-time item buying with immediate feedback
- **Leaderboard Updates**: Live ranking updates when players make purchases
- **Connection Management**: Automatic reconnection with exponential backoff

### 4. State Management (Pinia Stores)
- **Auth Store**: User authentication and session management
- **Game Store**: Game state, items, leaderboard, WebSocket events
- **Reactive UI**: All components automatically update with state changes

## File Structure

```
src/
├── services/
│   ├── api.js          # HTTP API client with axios
│   └── websocket.js    # WebSocket service with reconnection
├── stores/
│   ├── auth.js         # Authentication state management
│   ├── game.js         # Game state and WebSocket events
│   └── index.js        # Store exports
├── composables/
│   └── useWebSocket.js # WebSocket composable utilities
├── components/
│   ├── LoginCard.vue   # Updated with API integration
│   ├── ClickIcon.vue   # Real-time clicking with animations
│   ├── Stats.vue       # Live stats display
│   ├── Upgrades.vue    # Shop with real items from backend
│   ├── UpgradeCard.vue # Item cards with purchase functionality
│   └── MainHeader.vue  # Navigation with user info and logout
└── pages/
    ├── GamePage.vue    # Main game with WebSocket integration
    ├── RankingPage.vue # Live leaderboard
    └── LoginPage.vue   # Authentication page
```

## Backend API Endpoints Used

### Authentication
- `POST /user/register` - Create new user account
- `POST /user/login` - Login with credentials (form-urlencoded)
- `GET /user/me` - Get current user information
- `POST /user/refresh-token` - Refresh JWT token

### Game API
- `GET /game/state` - Get current game state
- `GET /game/state/with-items` - Get game state with all items
- `POST /game/click` - Process a click
- `POST /game/buy/{item_id}` - Purchase an item
- `GET /game/leaderboard` - Get top players

### WebSocket
- `WS /game/ws/{token}` - Real-time game communication

## WebSocket Message Types

### Client → Server
```javascript
{ type: "click" }                    // Process a click
{ type: "buy_item", item_id: 123 }   // Buy an item
{ type: "get_state" }                // Request current state
{ type: "get_items" }                // Request items list
```

### Server → Client
```javascript
{ type: "game_state", data: {...} }      // Current game state
{ type: "click_result", data: {...} }    // Click result
{ type: "purchase_result", data: {...} } // Purchase result
{ type: "items_list", data: [...] }      // Items with costs
{ type: "leaderboard_update", data: [...] } // Live leaderboard
```

## Configuration

### API Base URL
The API base URL is configured in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001'
```

### WebSocket URL
The WebSocket URL is configured in `src/services/websocket.js`:
```javascript
this.url = 'ws://localhost:3001/game/ws'
```

## How to Run

1. **Start the Backend** (in `backend1/` directory):
   ```bash
   python main.py
   ```
   Backend will run on `http://localhost:3001`

2. **Start the Frontend** (in `frontend-main/frontend-main/clicker/` directory):
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Usage Flow

1. **Registration/Login**: 
   - Go to `/login` page
   - Register new account or login with existing credentials
   - Automatic redirect to game page on success

2. **Game Play**:
   - Click the UBB logo to earn points
   - Points update in real-time via WebSocket
   - Buy upgrades from the shop to increase points per click or get passive income

3. **Leaderboard**:
   - View live ranking of all players
   - See your current position
   - Rankings update automatically when players make progress

## Error Handling

- **Network Errors**: Automatic retry for failed requests
- **Authentication Errors**: Automatic token refresh, logout on invalid token
- **WebSocket Disconnection**: Automatic reconnection with exponential backoff
- **User Feedback**: Toast notifications and error displays for all operations

## Security

- **JWT Tokens**: Secure authentication with token-based system
- **CORS**: Proper CORS configuration for API calls
- **Input Validation**: Client-side validation before API calls
- **Route Protection**: Authentication guards prevent unauthorized access

## Real-time Features

The WebSocket integration provides these real-time features:
- Instant point updates when clicking
- Live purchase confirmations
- Real-time leaderboard updates
- Connection status indicators
- Automatic reconnection on network issues

This integration provides a smooth, real-time gaming experience with proper error handling and state management.
