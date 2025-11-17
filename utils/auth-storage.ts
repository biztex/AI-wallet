import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEYS = {
  USER_EMAIL: "@pucket_user_email", // legacy
  USER_PASSWORD: "@pucket_user_password", // legacy
  USER_PIN: "@pucket_user_pin",
  USER_ID: "@pucket_user_id",
  JWT_TOKEN: "@pucket_jwt_token",
  BIOMETRIC_ENABLED: "@pucket_biometric_enabled",
  BIOMETRIC_TYPE: "@pucket_biometric_type", // "face" | "fingerprint"
  BIOMETRIC_USER_ID: "@pucket_biometric_user_id",
  IS_LOGGED_IN: "@pucket_is_logged_in",
} as const

export type BiometricType = "face" | "fingerprint" | null

export interface UserCredentials {
  email?: string
  password?: string
  pin?: string
}

export interface AuthData {
  userId: string
  token: string
}

export interface BiometricData {
  userId: string
  biometricType: BiometricType
}

export class AuthStorage {
  static setBiometricEnabled(arg0: boolean) {
    throw new Error("Method not implemented.")
  }
  static setBiometricType(biometricType: string) {
    throw new Error("Method not implemented.")
  }
  // Save user credentials during sign up
  static async saveCredentials(email: string, password: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_EMAIL, email],
        [STORAGE_KEYS.USER_PASSWORD, password],
      ])
      console.log("[DEV] Credentials saved to AsyncStorage")
    } catch (error) {
      console.error("[DEV] Error saving credentials:", error)
      throw error
    }
  }

  // New: Save PIN only
  static async savePin(pin: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PIN, pin)
      console.log("[DEV] PIN saved to AsyncStorage")
    } catch (error) {
      console.error("[DEV] Error saving PIN:", error)
      throw error
    }
  }

  // Get stored credentials
  static async getCredentials(): Promise<UserCredentials | null> {
    try {
      const [[, email], [, password], [, pin]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_PASSWORD,
        STORAGE_KEYS.USER_PIN,
      ])

      if (pin) return { pin }
      if (email && password) return { email, password }
      return null
    } catch (error) {
      console.error("[DEV] Error getting credentials:", error)
      return null
    }
  }

  // Save auth data after successful login
  static async saveAuthData(userId: string, token: string): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.USER_ID, userId],
        [STORAGE_KEYS.JWT_TOKEN, token],
        [STORAGE_KEYS.IS_LOGGED_IN, "true"],
      ])
      console.log("[DEV] Auth data saved to AsyncStorage")
    } catch (error) {
      console.error("[DEV] Error saving auth data:", error)
      throw error
    }
  }

  // Get JWT token
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN)
    } catch (error) {
      console.error("[DEV] Error getting token:", error)
      return null
    }
  }

  static async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token)
      console.log("[DEV] Token saved to AsyncStorage")
    } catch (error) {
      console.error("[DEV] Error saving token:", error)
      throw error
    }
  }

  // Get user ID
  static async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID)
    } catch (error) {
      console.error("[DEV] Error getting user ID:", error)
      return null
    }
  }

  // Check if user is logged in
  static async isLoggedIn(): Promise<boolean> {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN)
      return isLoggedIn === "true"
    } catch (error) {
      console.error("[DEV] Error checking login status:", error)
      return false
    }
  }

  // Save biometric settings
  static async saveBiometricSettings(
    enabled: boolean,
    type: BiometricType,
    userId: string | null = null,
  ): Promise<void> {
    try {
      const data: [string, string][] = [
        [STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString()],
        [STORAGE_KEYS.BIOMETRIC_TYPE, type || ""],
      ]

      if (userId) {
        data.push([STORAGE_KEYS.BIOMETRIC_USER_ID, userId])
      }

      await AsyncStorage.multiSet(data)
      console.log("[DEV] Biometric settings saved")
    } catch (error) {
      console.error("[DEV] Error saving biometric settings:", error)
      throw error
    }
  }

  // Get biometric settings
  static async getBiometricSettings(): Promise<{
    enabled: boolean
    type: BiometricType
    userId: string | null
  }> {
    try {
      const [[, enabled], [, type], [, userId]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.BIOMETRIC_TYPE,
        STORAGE_KEYS.BIOMETRIC_USER_ID,
      ])

      return {
        enabled: enabled === "true",
        type: (type as BiometricType) || null,
        userId: userId || null,
      }
    } catch (error) {
      console.error("[DEV] Error getting biometric settings:", error)
      return { enabled: false, type: null, userId: null }
    }
  }

  // Check if biometric is enabled
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED)
      return enabled === "true"
    } catch (error) {
      console.error("[DEV] Error checking biometric status:", error)
      return false
    }
  }

  static async getBiometricData(): Promise<BiometricData | null> {
    try {
      const [[, userId], [, type]] = await AsyncStorage.multiGet([
        STORAGE_KEYS.BIOMETRIC_USER_ID,
        STORAGE_KEYS.BIOMETRIC_TYPE,
      ])

      if (userId && type) {
        return {
          userId,
          biometricType: type as BiometricType,
        }
      }
      return null
    } catch (error) {
      console.error("[DEV] Error getting biometric data:", error)
      return null
    }
  }

  // Logout - clear all auth data
  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEYS.USER_PASSWORD, STORAGE_KEYS.JWT_TOKEN, STORAGE_KEYS.IS_LOGGED_IN])
      console.log("[DEV] User logged out")
    } catch (error) {
      console.error("[DEV] Error during logout:", error)
      throw error
    }
  }

  // Logout from auth session but keep wallet data
  static async logoutAuthSession(): Promise<void> {
    try {
      // Limpiar solo datos de autenticación/KYC, mantener datos de wallet
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_EMAIL,
        STORAGE_KEYS.USER_PASSWORD, 
        STORAGE_KEYS.USER_PIN,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.JWT_TOKEN,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.BIOMETRIC_TYPE,
        STORAGE_KEYS.BIOMETRIC_USER_ID,
        STORAGE_KEYS.IS_LOGGED_IN,
      ])
      console.log("[DEV] Auth session logged out (wallet data preserved)")
    } catch (error) {
      console.error("[DEV] Error during auth logout:", error)
      throw error
    }
  }

  // Clear all data (for testing)
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS))
      console.log("[DEV] All auth data cleared")
    } catch (error) {
      console.error("[DEV] Error clearing all data:", error)
      throw error
    }
  }
}
