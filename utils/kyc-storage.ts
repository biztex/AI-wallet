import AsyncStorage from "@react-native-async-storage/async-storage"

export type KYCStatus = "not_started" | "pending" | "approved" | "rejected"

const KYC_STATUS_KEY = "@kyc_status"
const KYC_USER_ID_KEY = "@kyc_user_id"
const KYC_REJECTION_REASON_KEY = "@kyc_rejection_reason"

export class KYCStorage {
  /**
   * Get the current KYC status
   */
  static async getStatus(): Promise<KYCStatus> {
    try {
      const status = await AsyncStorage.getItem(KYC_STATUS_KEY)
      if (status && ["not_started", "pending", "approved", "rejected"].includes(status)) {
        return status as KYCStatus
      }
      return "not_started"
    } catch (error) {
      console.error("[DEV] Error getting KYC status:", error)
      return "not_started"
    }
  }

  /**
   * Set the KYC status
   */
  static async setStatus(status: KYCStatus): Promise<void> {
    try {
      await AsyncStorage.setItem(KYC_STATUS_KEY, status)
    } catch (error) {
      console.error("[DEV] Error setting KYC status:", error)
      throw error
    }
  }

  /**
   * Check if KYC is approved
   */
  static async isApproved(): Promise<boolean> {
    const status = await this.getStatus()
    return status === "approved"
  }

  /**
   * Clear KYC status (for logout or reset)
   */
  static async clearStatus(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KYC_STATUS_KEY, KYC_USER_ID_KEY, KYC_REJECTION_REASON_KEY])
    } catch (error) {
      console.error("[DEV] Error clearing KYC status:", error)
    }
  }

  /**
   * Get user ID associated with KYC
   */
  static async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KYC_USER_ID_KEY)
    } catch (error) {
      console.error("[DEV] Error getting KYC user ID:", error)
      return null
    }
  }

  /**
   * Set user ID for KYC
   */
  static async setUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KYC_USER_ID_KEY, userId)
    } catch (error) {
      console.error("[DEV] Error setting KYC user ID:", error)
      throw error
    }
  }

  /**
   * Get rejection reason if KYC was rejected
   */
  static async getRejectionReason(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KYC_REJECTION_REASON_KEY)
    } catch (error) {
      console.error("[DEV] Error getting rejection reason:", error)
      return null
    }
  }

  /**
   * Set rejection reason when KYC is rejected
   */
  static async setRejectionReason(reason: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KYC_REJECTION_REASON_KEY, reason)
    } catch (error) {
      console.error("[DEV] Error setting rejection reason:", error)
      throw error
    }
  }

  /**
   * Clear all KYC data (for logout)
   */
  static async clearKYCData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([KYC_STATUS_KEY, KYC_USER_ID_KEY, KYC_REJECTION_REASON_KEY])
      console.log("[DEV] KYC data cleared")
    } catch (error) {
      console.error("[DEV] Error clearing KYC data:", error)
      throw error
    }
  }
}
