"use client"

// Hook for polling KYC status when verification is pending
// This will be replaced with WebSocket real-time updates

import { getKYCAPI } from "@/utils/kyc-api"
import { KYCStorage } from "@/utils/kyc-storage"
import { useCallback, useEffect, useRef, useState } from "react"

export function useKYCPolling() {
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const isPolling = useRef(false)
  const [kycStatus, setKycStatus] = useState<"not_started" | "pending" | "approved" | "rejected">("not_started")

  const startPolling = useCallback(async () => {
    if (isPolling.current) return

    isPolling.current = true
    console.log("[DEV] Starting KYC status polling")

    // Poll every 30 seconds
    pollingInterval.current = setInterval(async () => {
      try {
        const userId = await KYCStorage.getUserId()
        if (!userId) {
          stopPolling()
          return
        }

        const response = await getKYCAPI().getKYCStatus(userId)

        // Map backend status to local status
        let mappedStatus: "not_started" | "pending" | "approved" | "rejected" = "not_started"
        if (response.status === "approved" || response.status === "verified") {
          mappedStatus = "approved"
          stopPolling() // Stop polling when approved
        } else if (response.status === "pending" || response.status === "submitted") {
          mappedStatus = "pending"
        } else if (response.status === "rejected" || response.status === "failed") {
          mappedStatus = "rejected"
          stopPolling() // Stop polling when rejected
        }

        // Update AsyncStorage
        await KYCStorage.setStatus(mappedStatus)
        
        // Update local state to trigger re-render
        setKycStatus(mappedStatus)

        if (response.rejection_reason) {
          await KYCStorage.setRejectionReason(response.rejection_reason)
        }
      } catch (error) {
        console.error("[DEV] Error polling KYC status:", error)
      }
    }, 30000)
  }, [])

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current)
      pollingInterval.current = null
      isPolling.current = false
      console.log("[DEV] Stopped KYC status polling")
    }
  }, [])

  // Load initial status from AsyncStorage
  useEffect(() => {
    const loadInitialStatus = async () => {
      try {
        const status = await KYCStorage.getStatus()
        setKycStatus(status)
      } catch (error) {
        console.error("[DEV] Error loading initial KYC status:", error)
      }
    }
    loadInitialStatus()
  }, [])

  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return { startPolling, stopPolling, kycStatus }
}
