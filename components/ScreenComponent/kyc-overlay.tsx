"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { useKYCPolling } from "@/hooks/use-kyc-polling"
import { KYCStorage } from "@/utils/kyc-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Path, Svg } from "react-native-svg"

interface KYCOverlayProps {
  onStartKYC?: () => void
}

export function KYCOverlay({ onStartKYC }: KYCOverlayProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [kycStatus, setKycStatus] = useState<string>("not_started")
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const { startPolling } = useKYCPolling()

  useEffect(() => {
    const checkStatus = async () => {
      const status = await KYCStorage.getStatus()
      setKycStatus(status)

      if (status === "pending") {
        startPolling()
      }

      if (status === "rejected") {
        const reason = await KYCStorage.getRejectionReason()
        setRejectionReason(reason)
      }
    }
    checkStatus()
  }, [startPolling])

  const handleStartKYC = async () => {
    if (onStartKYC) {
      onStartKYC()
    } else {
      router.push("/lets-get-started")
    }
  }

  // Show pending status overlay
  if (kycStatus === "pending") {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background + "F5" }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
            <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M12 6V12L16 14"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Verification Under Review</Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Your verification is being reviewed. Please check again in 24 hours. You'll be notified once your account is
            approved.
          </Text>

          <Text style={[styles.infoText, { color: colors.textSecondary }]}>This usually takes 1-2 business days</Text>
        </View>
      </View>
    )
  }

  // Show rejected status overlay
  if (kycStatus === "rejected") {
    return (
      <View style={[styles.overlay, { backgroundColor: colors.background + "F5" }]}>
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: "#F4433620" }]}>
            <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#F44336"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path
                d="M15 9L9 15M9 9L15 15"
                stroke="#F44336"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Verification Failed</Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {rejectionReason || "Your verification could not be completed. Please review your documents and try again."}
          </Text>

          <TouchableOpacity onPress={handleStartKYC} activeOpacity={0.8}>
            <LinearGradient
              colors={["#84C718", "#09791A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaButtonText}>Retry Verification</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Make sure your documents are clear and valid
          </Text>
        </View>
      </View>
    )
  }

  // Show not started overlay (default)
  return (
    <View style={[styles.overlay, { backgroundColor: colors.background + "F5" }]}>
      <View style={[styles.content, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
          <Svg width={56} height={56} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 12L11 14L15 10"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>KYC Verification Required</Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Complete KYC verification to buy and sell crypto with fiat currency.
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.featureText, { color: colors.text }]}>Buy crypto with fiat</Text>
          </View>
          <View style={styles.featureItem}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.featureText, { color: colors.text }]}>Sell crypto for fiat</Text>
          </View>
          <View style={styles.featureItem}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.featureText, { color: colors.text }]}>Higher transaction limits</Text>
          </View>
          <View style={styles.featureItem}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17L4 12"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={[styles.featureText, { color: colors.text }]}>Enhanced security</Text>
          </View>
        </View>

        <TouchableOpacity onPress={handleStartKYC} activeOpacity={0.8}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaButtonText}>Start KYC Verification</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.infoText, { color: colors.textSecondary }]}>Takes 5-10 minutes</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    maxHeight: 520,
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  featuresList: {
    width: "100%",
    marginBottom: 20,
    gap: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
  },
  ctaButton: {
    width: "100%",
    paddingVertical: 14,
    paddingHorizontal: "22%",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 12,
    textAlign: "center",
  },
})
