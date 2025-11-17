import { AuthStorage } from "./auth-storage"
import { PasswordResetStorage } from "./password-reset-storage"

const WS_URL = "ws://192.168.100.11:3000"

interface PasswordResetResponse {
  success: boolean
  message?: string
  data?: any
}

class PasswordAPI {
  private static instance: PasswordAPI | null = null
  private ws: WebSocket | null = null
  private messageHandlers: Map<string, (response: any) => void> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private isConnecting = false

  private constructor() {
    // Constructor privado para implementar Singleton
  }

  public static getInstance(): PasswordAPI {
    if (!PasswordAPI.instance) {
      PasswordAPI.instance = new PasswordAPI()
    }
    return PasswordAPI.instance
  }

  private connect() {
    if (this.isConnecting) {
      console.log("[DEV] Password API already connecting, skipping...")
      return
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log("[DEV] Password API already connected, skipping...")
      return
    }

    this.isConnecting = true

    try {
      // Cerrar conexión existente si existe
      if (this.ws) {
        this.ws.close()
        this.ws = null
      }

      console.log("[DEV] Password API connecting to WebSocket...")
      this.ws = new WebSocket(WS_URL)

      this.ws.onopen = () => {
        console.log("[DEV] Password API WebSocket connected")
        this.reconnectAttempts = 0
        this.isConnecting = false
      }

      this.ws.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data)
          const handler = this.messageHandlers.get(response.id)
          if (handler) {
            handler(response)
            this.messageHandlers.delete(response.id)
          }
        } catch (error) {
          // Completamente silencioso - no loggear errores de parsing
        }
      }

      this.ws.onerror = (error) => {
        // Completamente silencioso - no loggear errores de WebSocket
        this.isConnecting = false
      }

      this.ws.onclose = (event) => {
        // Completamente silencioso - no loggear desconexiones
        this.ws = null
        this.isConnecting = false
      }
    } catch (error) {
      // Completamente silencioso - no loggear errores de conexión
      this.isConnecting = false
      this.attemptReconnect()
    }
  }

  private attemptReconnect() {
    // NO reconectar automáticamente - solo cuando sea necesario
    console.log("[DEV] Password API: WebSocket disconnected. Will reconnect when needed.")
  }

  private sendMessage(type: string, data: any): Promise<PasswordResetResponse> {
    return new Promise((resolve, reject) => {
      // Asegurar conexión antes de enviar
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        console.log("[DEV] WebSocket not connected, attempting to connect...")
        this.connect()
        // Esperar un poco y luego intentar de nuevo
        setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.sendMessage(type, data).then(resolve).catch(reject)
          } else {
            reject(new Error("WebSocket is not connected"))
          }
        }, 2000)
        return
      }

      const messageId = `${type}_${Date.now()}_${Math.random()}`
      const message = {
        id: messageId,
        type,
        data,
        timestamp: Date.now(),
      }

      this.messageHandlers.set(messageId, (response) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.message || "Operation failed"))
        }
      })

      setTimeout(() => {
        if (this.messageHandlers.has(messageId)) {
          this.messageHandlers.delete(messageId)
          reject(new Error("Request timeout"))
        }
      }, 10000)

      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error("[DEV] Error sending WebSocket message:", error)
        this.messageHandlers.delete(messageId)
        reject(new Error("Failed to send message"))
      }
    })
  }

  async requestPINReset(userId: string): Promise<PasswordResetResponse> {
    try {
      const response = await this.sendMessage("request_pin_reset", { userId })
      return response
    } catch (error) {
      console.error("[DEV] Request PIN reset error:", error)
      throw error
    }
  }

  // Legacy method - kept for compatibility but deprecated
  async requestPasswordReset(email: string): Promise<PasswordResetResponse> {
    console.warn("[DEV] requestPasswordReset is deprecated, use requestPINReset instead")
    const userId = await AuthStorage.getUserId()
    if (!userId) {
      throw new Error("No userId found")
    }
    return this.requestPINReset(userId)
  }

  async verifyOTP(otp: string): Promise<PasswordResetResponse> {
    try {
      const userId = await PasswordResetStorage.getResetUserId()
      if (!userId) {
        throw new Error("No userId found for PIN reset")
      }

      const response = await this.sendMessage("verify_otp", { userId, otp })
      // Store OTP token for PIN update
      if (response.data?.resetToken) {
        await PasswordResetStorage.setResetToken(response.data.resetToken)
      }
      return response
    } catch (error) {
      console.error("[DEV] Verify OTP error:", error)
      throw error
    }
  }

  async resendOTP(): Promise<PasswordResetResponse> {
    try {
      const userId = await PasswordResetStorage.getResetUserId()
      if (!userId) {
        throw new Error("No userId found for PIN reset")
      }

      const response = await this.sendMessage("resend_otp", { userId })
      return response
    } catch (error) {
      console.error("[DEV] Resend OTP error:", error)
      throw error
    }
  }

  async changePIN(oldPin: string, newPin: string): Promise<PasswordResetResponse> {
    try {
      const userId = await AuthStorage.getUserId()
      if (!userId) {
        throw new Error("User not logged in")
      }

      const response = await this.sendMessage("change_pin", {
        userId,
        oldPin,
        newPin,
      })

      return response
    } catch (error) {
      console.error("[DEV] Change PIN error:", error)
      throw error
    }
  }

  // Legacy method - kept for compatibility but deprecated
  async changePassword(oldPassword: string, newPassword: string): Promise<PasswordResetResponse> {
    console.warn("[DEV] changePassword is deprecated, use changePIN instead")
    return this.changePIN(oldPassword, newPassword)
  }

  async updatePIN(newPin: string, confirmPin: string, resetToken?: string): Promise<PasswordResetResponse> {
    try {
      if (resetToken) {
        // Reset de PIN via OTP (con token)
        const resetUserId = await PasswordResetStorage.getResetUserId()
        if (!resetUserId) {
          throw new Error("Reset userId not found")
        }

        const response = await this.sendMessage("update_pin", {
          userId: resetUserId,
          resetToken,
          newPin,
          confirmPin,
        })
        return response
      } else {
        // Cambio de PIN normal (usuario logueado)
        const userId = await AuthStorage.getUserId()
        if (!userId) {
          throw new Error("User not authenticated")
        }

        const response = await this.sendMessage("update_pin", {
          userId,
          newPin,
          confirmPin,
        })
        return response
      }
    } catch (error) {
      console.error("[DEV] Update PIN error:", error)
      throw error
    }
  }

  // Legacy method - kept for compatibility but deprecated
  async updatePassword(newPassword: string, confirmPassword: string, resetToken?: string): Promise<PasswordResetResponse> {
    console.warn("[DEV] updatePassword is deprecated, use updatePIN instead")
    return this.updatePIN(newPassword, confirmPassword, resetToken)
  }

  async resetPINWithOTP(newPin: string): Promise<PasswordResetResponse> {
    try {
      const resetToken = await PasswordResetStorage.getResetToken()
      const userId = await PasswordResetStorage.getResetUserId()

      if (!resetToken || !userId) {
        throw new Error("Invalid PIN reset session")
      }

      const response = await this.sendMessage("reset_pin_with_otp", {
        userId,
        resetToken,
        newPin,
      })

      // Clear reset session data
      await PasswordResetStorage.clearResetData()

      return response
    } catch (error) {
      console.error("[DEV] Reset PIN with OTP error:", error)
      throw error
    }
  }

  // Legacy method - kept for compatibility but deprecated
  async resetPasswordWithOTP(newPassword: string): Promise<PasswordResetResponse> {
    console.warn("[DEV] resetPasswordWithOTP is deprecated, use resetPINWithOTP instead")
    return this.resetPINWithOTP(newPassword)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.messageHandlers.clear()
    this.isConnecting = false
  }

  // Método para limpiar la instancia (útil para testing)
  static destroy() {
    if (PasswordAPI.instance) {
      PasswordAPI.instance.disconnect()
      PasswordAPI.instance = null
    }
  }

  // Verificar si está conectado (método estático)
  static isConnected(): boolean {
    return PasswordAPI.instance?.isConnected() || false
  }

  // Verificar si está conectado
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

// NO crear instancia automática - solo cuando sea necesario
// export default PasswordAPI.getInstance()

// Función para obtener instancia cuando sea necesario
export const getPasswordAPI = () => PasswordAPI.getInstance()
export default PasswordAPI
