import { AuthStorage } from "./auth-storage"
import { KYCStorage } from "./kyc-storage"

// WebSocket configuration
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "ws://192.168.100.11:3000"

export interface SignUpData {
  email?: string
  phone?: string
}

export interface LoginData {
  userId: string
  token?: string
}

export interface KYCSubmissionData {
  userId: string
  idType: "id-card" | "passport" | "drivers-license"
  region: string
  photoUri: string
  personalInfo?: {
    firstName: string
    lastName: string
    address: string
    city: string
    country: string
    nationality: string
    mobileNumber: string
    dateOfBirth: string
    gender: string
    bankAccountNumber?: string
    bankName?: string
    bankRoutingNumber?: string
  }
}

export interface BiometricLoginData {
  userId: string
  biometricType: "face" | "fingerprint"
}

export interface AuthResponse {
  success: boolean
  userId?: string
  token?: string
  message?: string
}

export interface KYCResponse {
  success: boolean
  status: "pending" | "approved" | "rejected"
  message?: string
  rejectionReason?: string
}

export class AuthAPI {
  private static ws: WebSocket | null = null
  private static messageHandlers: Map<string, (data: any) => void> = new Map()
  private static reconnectAttempts = 0
  private static maxReconnectAttempts = 5
  private static isConnecting = false

  // Initialize WebSocket connection
  static async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log("[DEV] Auth API already connecting, waiting...")
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
      console.log("[DEV] Auth API already connected, skipping...")
      return Promise.resolve()
    }

    this.isConnecting = true

    return new Promise((resolve, reject) => {
      try {
        // Cerrar conexión existente si existe
        if (this.ws) {
          this.ws.close()
          this.ws = null
        }

        console.log("[DEV] Connecting to WebSocket:", WS_URL)
        this.ws = new WebSocket(WS_URL)

        this.ws.onopen = () => {
          console.log("[DEV] WebSocket connected successfully")
          this.reconnectAttempts = 0
          this.isConnecting = false
          resolve()
        }

        this.ws.onerror = (error) => {
          // Completamente silencioso - no loggear nada
          this.isConnecting = false
        }

        this.ws.onmessage = (event) => {
          try {
            const response = JSON.parse(event.data)
            console.log("[DEV] WebSocket message received:", response)

            // Handle response by message ID
            if (response.id) {
              const handler = this.messageHandlers.get(response.id)
              if (handler) {
                handler(response)
                this.messageHandlers.delete(response.id)
              }
            }
          } catch (error) {
            console.error("[DEV] Error parsing WebSocket message:", error)
          }
        }

        this.ws.onclose = (event) => {
          console.log("[DEV] WebSocket disconnected", event.code, event.reason)
          this.ws = null
          this.isConnecting = false
          this.reconnectAttempts = 0 // Reset reconnect attempts
          // NO hacer nada más - no reconectar automáticamente
        }
      } catch (error) {
        console.error("[DEV] Error connecting to WebSocket:", error)
        this.isConnecting = false
        reject(error)
      }
    })
  }

  // Send message via WebSocket
  private static async send(type: string, data: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure connection
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
          console.log("[DEV] WebSocket not connected, connecting...")
          try {
            await this.connect()
          } catch (error) {
            console.error("[DEV] Failed to connect to WebSocket:", error)
            reject(new Error("Failed to connect to WebSocket"))
            return
          }
        }

        const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Set up response handler
        this.messageHandlers.set(messageId, (response) => {
          console.log("[DEV] Response received for:", messageId, response)
          resolve(response)
        })

        // Send message
        const message = {
          id: messageId,
          type,
          data,
          timestamp: Date.now(),
        }

        console.log("[DEV] Sending WebSocket message:", message)

        try {
          this.ws?.send(JSON.stringify(message))
        } catch (error) {
          console.error("[DEV] Error sending WebSocket message:", error)
          this.messageHandlers.delete(messageId)
          reject(new Error("Failed to send message"))
          return
        }

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.messageHandlers.has(messageId)) {
            this.messageHandlers.delete(messageId)
            reject(new Error("Request timeout"))
          }
        }, 30000)
      } catch (error) {
        console.error(`[DEV] Error sending ${type}:`, error)
        reject(error)
      }
    })
  }

  static async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      console.log("[DEV] Sending sign up request to WebSocket")

      const response = await this.send("signup", data)

      if (response.success) {
        // Save to AsyncStorage
        await AuthStorage.saveAuthData(response.data.userId, response.data.token)

        // Desconectar WebSocket inmediatamente después del registro exitoso
        this.disconnect()

        return {
          success: true,
          userId: response.data.userId,
          token: response.data.token,
          message: response.message || "Sign up successful",
        }
      } else {
        return {
          success: false,
          message: response.message || "Sign up failed",
        }
      }
    } catch (error) {
      console.error("[DEV] Sign up error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Sign up failed",
      }
    }
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    try {
      console.log("[DEV] Sending login request to WebSocket")

      const response = await this.send("login", data)

      if (response.success) {
        // Save auth data
        await AuthStorage.saveAuthData(response.data.userId, response.data.token)

        return {
          success: true,
          userId: response.data.userId,
          token: response.data.token,
          message: response.message || "Login successful",
        }
      } else {
        return {
          success: false,
          message: response.message || "Login failed",
        }
      }
    } catch (error) {
      console.error("[DEV] Login error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      }
    }
  }

  static async submitKYC(data: KYCSubmissionData): Promise<KYCResponse> {
    try {
      console.log("[DEV] Sending KYC submission to WebSocket")

      const response = await this.send("submit_kyc", data)

      if (response.success) {
        // Set KYC status to pending
        await KYCStorage.setStatus("pending")
        await KYCStorage.setUserId(data.userId)

        return {
          success: true,
          status: "pending",
          message: response.message || "KYC submission successful. Your verification is under review.",
        }
      } else {
        return {
          success: false,
          status: "pending",
          message: response.message || "KYC submission failed",
        }
      }
    } catch (error) {
      console.error("[DEV] KYC submission error:", error)
      return {
        success: false,
        status: "pending",
        message: error instanceof Error ? error.message : "KYC submission failed",
      }
    }
  }

  static async biometricLogin(data: BiometricLoginData): Promise<AuthResponse> {
    try {
      console.log("[DEV] Sending biometric login request to WebSocket")

      const response = await this.send("biometric_login", {
        userId: data.userId,
        biometricType: data.biometricType,
      })

      if (response.success) {
        // Save auth data
        await AuthStorage.saveAuthData(response.data.userId, response.data.token)

        return {
          success: true,
          userId: response.data.userId,
          token: response.data.token,
          message: response.message || "Biometric login successful",
        }
      } else {
        return {
          success: false,
          message: response.message || "Biometric authentication failed",
        }
      }
    } catch (error) {
      console.error("[DEV] Biometric login error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Biometric login failed",
      }
    }
  }

  static async registerBiometric(userId: string, biometricType: "face" | "fingerprint"): Promise<AuthResponse> {
    try {
      console.log("[DEV] Sending register biometric request to WebSocket")

      const response = await this.send("register_biometric", {
        userId,
        biometricType,
      })

      if (response.success) {
        // Save biometric settings locally
        await AuthStorage.saveBiometricSettings(true, biometricType, userId)

        return {
          success: true,
          message: response.message || "Biometric authentication registered successfully",
        }
      } else {
        return {
          success: false,
          message: response.message || "Failed to register biometric authentication",
        }
      }
    } catch (error) {
      console.error("[DEV] Register biometric error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to register biometric authentication",
      }
    }
  }

  static async removeBiometric(userId: string): Promise<AuthResponse> {
    try {
      console.log("[DEV] Sending remove biometric request to WebSocket")

      const response = await this.send("remove_biometric", {
        userId,
      })

      if (response.success) {
        // Remove biometric settings locally
        await AuthStorage.saveBiometricSettings(false, null, null)

        return {
          success: true,
          message: response.message || "Biometric authentication removed successfully",
        }
      } else {
        return {
          success: false,
          message: response.message || "Failed to remove biometric authentication",
        }
      }
    } catch (error) {
      console.error("[DEV] Remove biometric error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove biometric authentication",
      }
    }
  }

  // Disconnect WebSocket
  static disconnect(): void {
    if (this.ws) {
      console.log("[DEV] Disconnecting WebSocket cleanly")
      this.ws.close(1000, "Operation completed successfully")
      this.ws = null
      this.messageHandlers.clear()
      this.reconnectAttempts = 0
    }
  }

  // Check if WebSocket is connected
  static isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  static async getUserProfile(userId: string): Promise<any> {
    try {
      console.log("[DEV] Fetching user profile from WebSocket")

      const response = await this.send("get_user_profile", { userId })

      if (response.success) {
        return {
          success: true,
          data: response.data,
        }
      } else {
        return {
          success: false,
          message: response.message || "Failed to fetch user profile",
        }
      }
    } catch (error) {
      console.error("[DEV] Get user profile error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch user profile",
      }
    }
  }

  static async updateProfileImage(userId: string, imageUri: string): Promise<any> {
    try {
      console.log("[DEV] Updating profile image via WebSocket")

      const response = await this.send("update_profile_image", { userId, imageUri })

      if (response.success) {
        return {
          success: true,
          imageUri: response.data.imageUri,
          message: response.message || "Profile image updated successfully",
        }
      } else {
        return {
          success: false,
          message: response.message || "Failed to update profile image",
        }
      }
    } catch (error) {
      console.error("[DEV] Update profile image error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update profile image",
      }
    }
  }
}
