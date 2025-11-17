// WebSocket configuration for development
// Set ENABLE_WEBSOCKET to false if you don't want to run the backend server

export const WEBSOCKET_CONFIG = {
    // Enable/disable WebSocket connection
    ENABLE_WEBSOCKET: process.env.EXPO_PUBLIC_ENABLE_WEBSOCKET !== "false",
  
    // WebSocket server URL
    WS_URL: process.env.EXPO_PUBLIC_WS_URL || "ws://192.168.100.11:3000",
  
    // Reconnection settings
    MAX_RECONNECT_ATTEMPTS: 5,
    RECONNECT_DELAY: 3000,
  }
      