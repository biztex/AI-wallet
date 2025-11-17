import AsyncStorage from "@react-native-async-storage/async-storage"

export interface WalletAccount {
  id: string
  evmAddress: string
  solanaAddress: string
  createdAt: number
  lastSynced: number
}

class WebSocketClientClass {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private isConnecting = false
  private messageQueue: Array<{ type: string; data: any }> = []
  private isEnabled = true
  private backendAvailable = true

  private readonly WS_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://192.168.100.11:3000"

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    if (!enabled && this.ws) {
      this.disconnect()
    }
  }

  async connect(): Promise<void> {
    if (!this.isEnabled || !this.backendAvailable) {
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return
    }

    this.isConnecting = true

    try {
      this.ws = new WebSocket(this.WS_URL)

      this.ws.onopen = () => {
        console.log("[DEV] WebSocket connected")
        this.reconnectAttempts = 0
        this.isConnecting = false
        this.backendAvailable = true
        this.processMessageQueue()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        if (this.reconnectAttempts === 0) {
          console.log("[DEV] WebSocket connection failed - backend may not be running")
        }
        this.isConnecting = false
      }

      this.ws.onclose = () => {
        if (this.reconnectAttempts === 0 && this.backendAvailable) {
          console.log("[DEV] WebSocket disconnected")
        }
        this.isConnecting = false
        this.attemptReconnect()
      }
    } catch (error) {
      if (this.reconnectAttempts === 0) {
        console.log("[DEV] WebSocket unavailable - app will work in offline mode")
      }
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    // NO reconectar automáticamente - solo cuando sea necesario
    console.log("[DEV] WebSocket Client: Disconnected. Will reconnect when needed.")
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data)
      console.log("[DEV] Received message:", message)

      switch (message.type) {
        case "connected":
          console.log("[DEV] Backend connection established")
          break
        case "wallet_synced":
          this.handleWalletSynced(message.data)
          break
        case "wallet_updated":
          this.handleWalletUpdated(message.data)
          break
        case "wallet_data":
          this.handleWalletData(message.data)
          break
        case "wallet_deleted":
          this.handleWalletDeleted(message.data)
          break
        case "error":
          console.error("[DEV] Backend error:", message.message)
          break
        default:
          console.log("[DEV] Unknown message type:", message.type)
      }
    } catch (error) {
      console.error("[DEV] Error parsing message:", error)
    }
  }

  private async handleWalletSynced(data: any): Promise<void> {
    console.log("[DEV] Wallet synced:", data)
    await AsyncStorage.setItem("wallet_last_synced", Date.now().toString())
    await AsyncStorage.setItem("wallet_id", data.walletId)
  }

  private async handleWalletUpdated(data: any): Promise<void> {
    console.log("[DEV] Wallet updated:", data)
    await AsyncStorage.setItem("wallet_last_synced", Date.now().toString())
  }

  private async handleWalletData(data: any): Promise<void> {
    console.log("[DEV] Wallet data received:", data)
  }

  private async handleWalletDeleted(data: any): Promise<void> {
    console.log("[DEV] Wallet deleted:", data)
    await AsyncStorage.removeItem("wallet_id")
    await AsyncStorage.removeItem("wallet_last_synced")
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()
      if (message) {
        this.send(message.type, message.data)
      }
    }
  }

  send(type: string, data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else if (this.isEnabled && this.backendAvailable) {
      this.messageQueue.push({ type, data })
      this.connect()
    }
  }

  async syncWallet(walletData: {
    evmAddress: string
    solanaAddress: string
    encryptedSeed?: string
  }): Promise<void> {
    this.send("sync_wallet", {
      evmAddress: walletData.evmAddress,
      solanaAddress: walletData.solanaAddress,
      encryptedSeed: walletData.encryptedSeed,
      timestamp: Date.now(),
    })
  }

  async getWallet(evmAddress: string, solanaAddress: string): Promise<void> {
    this.send("get_wallet", {
      evmAddress,
      solanaAddress,
    })
  }

  async updateWallet(walletData: {
    evmAddress: string
    solanaAddress: string
    encryptedSeed?: string
  }): Promise<void> {
    this.send("update_wallet", {
      evmAddress: walletData.evmAddress,
      solanaAddress: walletData.solanaAddress,
      encryptedSeed: walletData.encryptedSeed,
    })
  }

  async deleteWallet(evmAddress: string, solanaAddress: string): Promise<void> {
    this.send("delete_wallet", {
      evmAddress,
      solanaAddress,
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  isBackendAvailable(): boolean {
    return this.backendAvailable
  }
}

export const WebSocketClient = new WebSocketClientClass()
