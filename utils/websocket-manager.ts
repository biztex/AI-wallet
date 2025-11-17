import { AuthAPI } from "./auth-api"
import PasswordAPI from "./password-api"

/**
 * Central WebSocket connection manager
 * Prevents multiple connections and handles cleanup
 */
export class WebSocketManager {
  private static isInitialized = false

  /**
   * Initializes the necessary WebSocket connections
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log("[DEV] WebSocket connections already initialized")
      return
    }

    try {
      console.log("[DEV] Initializing WebSocket connections...")
      
      // Initialize AuthAPI (main connection)
      await AuthAPI.connect()
      
      // PasswordAPI automatically connects when imported,
      // but we can ensure it's ready
      console.log("[DEV] WebSocket connections initialized successfully")
      
      this.isInitialized = true
    } catch (error) {
      console.error("[DEV] Error initializing WebSocket connections:", error as Error)
      throw error
    }
  }

  /**
   * Cleans up all WebSocket connections
   */
  static disconnect(): void {
    try {
      console.log("[DEV] Disconnecting all WebSocket connections...")
      
      // Disconnect AuthAPI
      AuthAPI.disconnect()
      
      // Disconnect PasswordAPI
      PasswordAPI.getInstance().disconnect()
      
      this.isInitialized = false
      console.log("[DEV] All WebSocket connections disconnected")
    } catch (error) {
      console.error("[DEV] Error disconnecting WebSocket connections:", error as Error)
    }
  }

  /**
   * Restarts all connections
   */
  static async reconnect(): Promise<void> {
    console.log("[DEV] Reconnecting all WebSocket connections...")
    this.disconnect()
    await this.initialize()
  }

  /**
   * Checks the connection status
   */
  static getConnectionStatus(): Readonly<{ auth: boolean; password: boolean }> {
    return {
      auth: AuthAPI.isConnected(),
      password: PasswordAPI.isConnected()
    }
  }
}

// Export the manager for application usage
export default WebSocketManager
