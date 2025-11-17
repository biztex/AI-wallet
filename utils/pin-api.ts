import AsyncStorage from "@react-native-async-storage/async-storage"

const STORAGE_KEYS = {
  WALLET_PIN: "@pucket_wallet_pin",
}

interface PINUpdateResponse {
  success: boolean
  message: string
}

class PINAPIService {
  /**
   * Updates the wallet PIN
   * @param newPin - The new PIN to set
   * @param confirmPin - Confirmation of the new PIN
   * @returns Promise with success status and message
   */
  async updateWalletPIN(newPin: string, confirmPin: string): Promise<PINUpdateResponse> {
    try {
      // Validate that PINs match
      if (newPin !== confirmPin) {
        throw new Error("PINs do not match")
      }

      // Validate PIN format
      if (!/^\d{4,6}$/.test(newPin)) {
        throw new Error("PIN must be 4-6 digits")
      }

      // In a real app, this would call an API endpoint
      // For now, we'll store it locally
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET_PIN, newPin)

      console.log("[PINAPIService] Wallet PIN updated successfully")

      return {
        success: true,
        message: "Wallet PIN updated successfully",
      }
    } catch (error) {
      console.error("[PINAPIService] Error updating wallet PIN:", error)
      throw error
    }
  }

  /**
   * Verifies the current wallet PIN
   * @param pin - The PIN to verify
   * @returns Promise with verification result
   */
  async verifyWalletPIN(pin: string): Promise<boolean> {
    try {
      const storedPin = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_PIN)
      return storedPin === pin
    } catch (error) {
      console.error("[PINAPIService] Error verifying wallet PIN:", error)
      return false
    }
  }

  /**
   * Checks if a wallet PIN exists
   * @returns Promise with boolean indicating if PIN exists
   */
  async hasWalletPIN(): Promise<boolean> {
    try {
      const pin = await AsyncStorage.getItem(STORAGE_KEYS.WALLET_PIN)
      return pin !== null
    } catch (error) {
      console.error("[PINAPIService] Error checking wallet PIN existence:", error)
      return false
    }
  }

  /**
   * Clears the wallet PIN (for testing/reset purposes)
   */
  async clearWalletPIN(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WALLET_PIN)
      console.log("[PINAPIService] Wallet PIN cleared")
    } catch (error) {
      console.error("[PINAPIService] Error clearing wallet PIN:", error)
    }
  }
}

// Export a singleton instance
const pinAPIService = new PINAPIService()

export const getPinAPI = () => pinAPIService
export default pinAPIService
