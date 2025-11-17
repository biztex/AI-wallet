import { KYCStorage } from "./kyc-storage"

// WebSocket configuration
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://192.168.100.11:3000"

export interface KYCStatusResponse {
  status: "not_started" | "pending" | "approved" | "rejected"
  rejection_reason?: string
  user_id?: string
  updated_at?: string
}

export interface KYCSubmitRequest {
  user_id: string
  document_type: string
  document_front: string
  document_back?: string
  selfie: string
}

class KYCAPIClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private messageHandlers: Map<string, (data: any) => void> = new Map()
  private isConnecting = false

  private async connect(): Promise<void> {
    if (this.isConnecting) {
      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (!this.isConnecting) {
            clearInterval(checkConnection)
            resolve()
          }
        }, 100)
      })
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve()
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        console.log("[DEV] KYC API: Connecting to WebSocket:", WS_URL)
        this.ws = new WebSocket(WS_URL)

        this.ws.onopen = () => {
          console.log("[DEV] KYC API: WebSocket connected successfully")
          this.reconnectAttempts = 0
          this.isConnecting = false
          resolve()
        }

        this.ws.onerror = (error) => {
          // Completamente silencioso - no loggear errores de WebSocket
          this.isConnecting = false
          reject(error)
        }

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log("[DEV] KYC API: WebSocket message received:", response)

            // Handle response by message ID
            if (response.id) {
              const handler = this.messageHandlers.get(response.id)
              if (handler) {
                handler(response)
                this.messageHandlers.delete(response.id)
              }
            }
          } catch (error) {
            // Completamente silencioso - no loggear errores de parsing
          }
        }

        this.ws.onclose = () => {
          // Completamente silencioso - no loggear desconexiones
          this.ws = null
          this.isConnecting = false
        }
      } catch (error) {
        // Completamente silencioso - no loggear errores de conexión
        this.isConnecting = false
        reject(error)
      }
    })
  }

  private async send(type: string, data: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure connection
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          console.log("[DEV] KYC API: WebSocket not connected, connecting...")
          await this.connect()
        }

        const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Set up response handler
        this.messageHandlers.set(messageId, (response) => {
          console.log("[DEV] KYC API: Response received for:", messageId, response)
          resolve(response)
        })

        // Send message
        const message = {
          id: messageId,
          type,
          data,
          timestamp: Date.now(),
        }

        console.log("[DEV] KYC API: Sending WebSocket message:", message)
        this.ws?.send(JSON.stringify(message))

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.messageHandlers.has(messageId)) {
            this.messageHandlers.delete(messageId)
            reject(new Error("Request timeout"))
          }
        }, 30000)
      } catch (error) {
        console.error(`[DEV] KYC API: Error sending ${type}:`, error)
        reject(error)
      }
    })
  }

  async getKYCStatus(userId: string): Promise<KYCStatusResponse> {
    try {
      console.log("[DEV] Fetching KYC status for user:", userId)

      const response = await this.send("get_kyc_status", { userId })

      if (response.success && response.data) {
        // Update local storage with latest status
        await KYCStorage.setStatus(response.data.status)
        if (response.data.rejectionReason) {
          await KYCStorage.setRejectionReason(response.data.rejectionReason)
        }

        return {
          status: response.data.status,
          rejection_reason: response.data.rejectionReason,
          user_id: userId,
          updated_at: response.data.updatedAt || new Date().toISOString(),
        }
      } else {
        throw new Error(response.message || "Failed to fetch KYC status")
      }
    } catch (error) {
      console.error("[DEV] Error fetching KYC status:", error)
      throw error
    }
  }

  async submitKYC(data: KYCSubmitRequest): Promise<KYCStatusResponse> {
    try {
      console.log("[DEV] Submitting KYC data:", data)

      const response = await this.send("submit_kyc", {
        userId: data.user_id,
        idType: data.document_type,
        region: "US", // This should come from the form
        photoUri: data.document_front,
      })

      if (response.success) {
        // Update local storage
        await KYCStorage.setStatus("pending")
        await KYCStorage.setUserId(data.user_id)

        return {
          status: "pending",
          user_id: data.user_id,
          updated_at: new Date().toISOString(),
        }
      } else {
        throw new Error(response.message || "Failed to submit KYC")
      }
    } catch (error) {
      console.error("[DEV] Error submitting KYC:", error)
      throw error
    }
  }

  connectWebSocket(userId: string, onStatusUpdate: (status: KYCStatusResponse) => void) {
    console.log("[DEV] Setting up WebSocket listener for KYC updates:", userId)

    this.connect()
      .then(() => {
        // Listen for KYC status updates
        const updateHandler = (response: any) => {
          if (response.type === "kyc_status_update" && response.data.userId === userId) {
            console.log("[DEV] KYC status update received:", response.data)
            onStatusUpdate({
              status: response.data.status,
              rejection_reason: response.data.rejectionReason,
              user_id: userId,
              updated_at: response.data.updatedAt || new Date().toISOString(),
            })
          }
        }

        // Store handler for cleanup
        this.messageHandlers.set(`kyc_updates_${userId}`, updateHandler)
      })
      .catch((error) => {
        // Completamente silencioso - no loggear errores de setup
      })
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
      this.messageHandlers.clear()
      console.log("[DEV] KYC API: WebSocket disconnected")
    }
  }
}

// NO crear instancia automática - solo cuando sea necesario
// export const KYCAPI = new KYCAPIClient()

// Función para obtener instancia cuando sea necesario
export const getKYCAPI = () => new KYCAPIClient()
