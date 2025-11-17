"use client"

import { BackButton } from "@/components/Icons/back-button"
import { KYCOverlay } from "@/components/ScreenComponent/kyc-overlay"
import { EXCHANGE_OPTIONS, type OptionConfig } from "@/constants/options"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { getKYCAPI } from "@/utils/kyc-api"
import { KYCStorage } from "@/utils/kyc-storage"
import { router } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Path, Svg } from "react-native-svg"

export default function ExchangeScreen() {
  const [isKYCCompleted, setIsKYCCompleted] = useState(false)
  const [isLoadingKYC, setIsLoadingKYC] = useState(true)
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const shouldShowKYCOverlay = useMemo(() => !isLoadingKYC && !isKYCCompleted, [isLoadingKYC, isKYCCompleted])

  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        setIsLoadingKYC(true)

        // Get user ID from storage
        const userId = await KYCStorage.getUserId()

        if (!userId) {
          // No user ID means user hasn't started KYC
          setIsKYCCompleted(false)
          setIsLoadingKYC(false)
          return
        }

        // Fetch status from backend
        const response = await getKYCAPI().getKYCStatus(userId)

        // Check if approved/verified (handle extended statuses from backend)
        const status = response.status as string
        const isApproved = status === "approved" || status === "verified"
        setIsKYCCompleted(isApproved)

        // Update local storage
        const mappedStatus = isApproved
          ? "approved"
          : status === "pending" || status === "submitted"
            ? "pending"
            : status === "rejected" || status === "failed"
              ? "rejected"
              : "not_started"
        await KYCStorage.setStatus(mappedStatus)
      } catch (error) {
        console.error("Error checking KYC status:", error)
        // Fallback to local storage on error
        const isApproved = await KYCStorage.isApproved()
        setIsKYCCompleted(isApproved)
      } finally {
        setIsLoadingKYC(false)
      }
    }
    checkKYCStatus()
  }, [])

  const renderChevronRight = useCallback(
    () => (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9 18L15 12L9 6"
          stroke={colors.textSecondary}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    [colors.textSecondary],
  )

  const renderOptionCard = useCallback(
    (option: OptionConfig) => {
      const IconComponent = option.icon
      return (
        <TouchableOpacity
          key={option.title}
          style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push(option.route as any)}
          activeOpacity={0.7}
        >
          <View style={styles.optionLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
              <IconComponent />
            </View>
            <View style={styles.optionInfo}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
              <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>{option.description}</Text>
            </View>
          </View>
          {renderChevronRight()}
        </TouchableOpacity>
      )
    },
    [colors, renderChevronRight],
  )

  const renderInfoCard = useCallback(
    (title: string, description: string) => (
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" style={styles.infoIcon}>
          <Path
            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke={colors.primary}
            strokeWidth={2}
          />
          <Path d="M12 16V12" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 8H12.01" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <View style={styles.infoTextContainer}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{description}</Text>
        </View>
      </View>
    ),
    [colors],
  )

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Exchange</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Buy or sell cryptocurrency to manage your wallet balance
        </Text>

        {EXCHANGE_OPTIONS.map(renderOptionCard)}

        {renderInfoCard(
          "Need help?",
          "Exchange your wallet by buying cryptocurrency or cash out by selling. All transactions are secure and processed instantly.",
        )}
      </View>

      {shouldShowKYCOverlay && (
        <Modal visible transparent animationType="fade">
          <KYCOverlay />
        </Modal>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  optionInfo: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
})
