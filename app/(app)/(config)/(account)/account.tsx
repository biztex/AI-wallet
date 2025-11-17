"use client"

import { Acc2FAIcon } from "@/components/Icons/acc/acc-2fa"
import { AccBiometricIcon } from "@/components/Icons/acc/acc-biometric"
import { AccChangeIcon } from "@/components/Icons/acc/acc-change"
import { AccFontSizeIcon } from "@/components/Icons/acc/acc-font-size"
import { AccHelpIcon } from "@/components/Icons/acc/acc-help"
import { AccLanguageIcon } from "@/components/Icons/acc/acc-language"
import { AccLightIcon } from "@/components/Icons/acc/acc-light"
import { AccProfileIcon } from "@/components/Icons/acc/acc-profile"
import { AccTopUpIcon } from "@/components/Icons/acc/acc-top-up"
import { AccWithdrawIcon } from "@/components/Icons/acc/acc-withdraw"
import { BackButton } from "@/components/Icons/back-button"
import { ProfileIcon } from "@/components/Icons/profile"
import { TabTransactionIcon } from "@/components/Icons/Tab/tab-transaction-icon"
import { KYCOverlay } from "@/components/ScreenComponent/kyc-overlay"
import { PinVerificationModal } from "@/components/ScreenComponent/pin-verification-modal"
import { Colors } from "@/constants/theme"
import { useFontSize } from "@/contexts/font-size-context"
import { useTheme } from "@/contexts/theme-context"
import { useKYCPolling } from "@/hooks/use-kyc-polling"
import { AuthAPI } from "@/utils/auth-api"
import { AuthStorage } from "@/utils/auth-storage"
import { KYCStorage } from "@/utils/kyc-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import Svg, { Path } from "react-native-svg"

interface MenuItem {
  icon: React.ComponentType
  label: string
  route?: string
  value?: string
  isSwitch?: boolean
  requiresKYC?: boolean
}

const MENU_ITEMS: MenuItem[] = [
  { icon: AccProfileIcon, label: "Profile", route: "/profile-details", requiresKYC: true },
  { icon: AccLanguageIcon, label: "Language", route: "/language", value: "English (US)" },
  { icon: AccFontSizeIcon, label: "Font Size", route: "/font-size" },
  { icon: TabTransactionIcon, label: "History", route: "/(app)/(actions)/transactions" },
  { icon: AccTopUpIcon, label: "Top up", route: "/top-up" },
  { icon: AccWithdrawIcon, label: "Withdraw", route: "/withdraw" },
  { icon: AccLightIcon, label: "Dark Mode", isSwitch: true },
  { icon: AccBiometricIcon, label: "Biometric Login", route: "/biometric-settings", requiresKYC: true },
  { icon: AccHelpIcon, label: "Help center", route: "/help" },
  { icon: Acc2FAIcon, label: "2FA Security", route: "/recovery-intro" },
  { icon: AccChangeIcon, label: "Change PIN", route: "/update-password" },
]

export default function AccountScreen() {
  const router = useRouter()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDarkMode = resolvedTheme === "dark"
  const colors = Colors[resolvedTheme]
  const { fontSizeScale } = useFontSize()

  const { kycStatus, startPolling, stopPolling } = useKYCPolling()
  const [isLoadingKYC, setIsLoadingKYC] = useState(true)
  const [kycError, setKycError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pendingRoute, setPendingRoute] = useState<string | null>(null)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)

  const getFontSizeLabel = useCallback((scale: number) => {
    if (scale <= 0.85) return "Small"
    if (scale <= 1.05) return "Medium"
    if (scale <= 1.25) return "Large"
    return "Extra Large"
  }, [])

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setIsLoadingKYC(true)
        setKycError(null)

        // Start polling for KYC status updates
        startPolling()

        // Load rejection reason if exists
        const localReason = await KYCStorage.getRejectionReason()
        setRejectionReason(localReason)

        const userId = await AuthStorage.getUserId()
        if (userId) {
          const profileResponse = await AuthAPI.getUserProfile(userId)
          if (profileResponse.success && profileResponse.data) {
            setUserProfile(profileResponse.data.personalInfo)
            setProfileImage(profileResponse.data.profileImage)
          }
        }
      } catch (error) {
        console.error("[DEV] Error initializing component:", error)
        setKycError("Failed to load verification status")
      } finally {
        setIsLoadingKYC(false)
      }
    }

    const checkBiometricStatus = async () => {
      try {
        const enabled = await AuthStorage.isBiometricEnabled()
        setBiometricEnabled(enabled)
      } catch (error) {
        console.error("[DEV] Error checking biometric status:", error)
      }
    }

    initializeComponent()
    checkBiometricStatus()
  }, [startPolling])

  const handleThemeToggle = useCallback(
    (value: boolean) => {
      setTheme(value ? "dark" : "light")
    },
    [setTheme],
  )

  const handleNavigation = useCallback(
    async (route: string, requiresKYC?: boolean) => {
      if (route === "/biometric-settings") {
        setPendingRoute(route)
        setShowPinModal(true)
        return
      }

      if (requiresKYC) {
        try {
          const isApproved = await KYCStorage.isApproved()
          if (!isApproved) {
            setShowKYCModal(true)
            return
          }
        } catch (error) {
          console.error("[DEV] Error checking KYC status:", error)
        }
      }

      if (route === "/top-up") {
        try {
          const isApproved = await KYCStorage.isApproved()
          if (!isApproved) {
            setShowKYCModal(true)
            return
          }
          router.push("/home?activeTab=exchange")
          return
        } catch (error) {
          console.error("[DEV] Error checking KYC status:", error)
        }
      }
      router.push(route as any)
    },
    [router],
  )

  const handlePinSuccess = useCallback(() => {
    setShowPinModal(false)
    if (pendingRoute) {
      router.push(pendingRoute as any)
      setPendingRoute(null)
    }
  }, [pendingRoute, router])

  const handlePinCancel = useCallback(() => {
    setShowPinModal(false)
    setPendingRoute(null)
  }, [])

  const handleCloseKYCModal = useCallback(() => {
    setShowKYCModal(false)
  }, [])

  const handleStartKYC = useCallback(() => {
    setShowKYCModal(false)
    router.push("/lets-get-started")
  }, [router])

  const isLogoutDisabled = useMemo(() => {
    return kycStatus === "not_started"
  }, [kycStatus])

  const handleLogout = useCallback(async () => {
    if (isLogoutDisabled) {
      return
    }

    try {
      // Limpiar datos de autenticación y KYC pero mantener datos de wallet
      await AuthStorage.logoutAuthSession()
      await KYCStorage.clearKYCData()

      console.log("[DEV] Auth session logged out, navigating to unlock wallet")

      // Navegar a la pantalla de desbloqueo de wallet
      router.replace("/unlock-wallet")
    } catch (error) {
      console.error("[DEV] Error during logout:", error)
      // En caso de error, navegar de todas formas
      router.replace("/unlock-wallet")
    }
  }, [router, isLogoutDisabled])

  const handleKYCAction = useCallback(() => {
    if (kycStatus === "not_started" || kycStatus === "rejected") {
      router.push("/lets-get-started")
    }
  }, [kycStatus, router])

  const renderKYCBadge = useCallback(() => {
    const badgeConfig = {
      approved: { text: "Verified", color: "#4CAF50", bgColor: "#4CAF5020" },
      pending: { text: "Pending", color: "#FF9800", bgColor: "#FF980020" },
      rejected: { text: "Failed", color: "#F44336", bgColor: "#F4433620" },
      not_started: { text: "Not Verified", color: "#9E9E9E", bgColor: "#9E9E9E20" },
    } as const

    const config = badgeConfig[kycStatus]

    return (
      <View style={[styles.kycBadge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.kycBadgeText, { color: config.color }]}>{config.text}</Text>
      </View>
    )
  }, [kycStatus])

  const renderChevronRight = useCallback(
    () => (
      <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
        <Path
          d="M7.5 15L12.5 10L7.5 5"
          stroke={colors.textSecondary}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    ),
    [colors.textSecondary],
  )

  const renderMenuItem = useCallback(
    (item: MenuItem, index: number) => {
      const IconComponent = item.icon

      if (item.requiresKYC && kycStatus !== "approved") {
        return null
      }

      if (item.isSwitch) {
        return (
          <View key={item.label} style={[styles.menuItem, { backgroundColor: colors.card }]}>
            <View style={styles.menuLeft}>
              <View style={styles.menuIconContainer}>
                <IconComponent />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: "#E0E0E0", true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        )
      }

      const displayValue =
        item.label === "Biometric Login"
          ? biometricEnabled
            ? "Enabled"
            : "Disabled"
          : item.label === "Font Size"
            ? getFontSizeLabel(fontSizeScale)
            : item.value

      return (
        <TouchableOpacity
          key={item.label}
          style={[styles.menuItem, { backgroundColor: colors.card }]}
          onPress={() => item.route && handleNavigation(item.route, item.requiresKYC)}
        >
          <View style={styles.menuLeft}>
            <View style={styles.menuIconContainer}>
              <IconComponent />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>{item.label}</Text>
          </View>
          <View style={styles.menuRight}>
            {displayValue && (
              <Text style={[styles.menuSecondaryText, { color: colors.textSecondary }]}>{displayValue}</Text>
            )}
            {renderChevronRight()}
          </View>
        </TouchableOpacity>
      )
    },
    [
      colors,
      isDarkMode,
      biometricEnabled,
      fontSizeScale,
      getFontSizeLabel,
      handleThemeToggle,
      handleNavigation,
      renderChevronRight,
      kycStatus,
    ],
  )

  const renderKYCFailedMessage = useCallback(() => {
    if (rejectionReason) {
      return <Text style={[styles.kycFailedDetailText, { color: colors.textSecondary }]}>{rejectionReason}</Text>
    }

    const failedReasons = {
      document_invalid: "The provided documents are invalid or unreadable.",
      selfie_mismatch: "The selfie photo does not match the identity document.",
      incomplete_info: "Verification information is incomplete or incorrect.",
      default: "Verification could not be completed. Please review your documents and try again.",
    }

    const message = failedReasons.default

    return <Text style={[styles.kycFailedDetailText, { color: colors.textSecondary }]}>{message}</Text>
  }, [rejectionReason, colors.textSecondary])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {!isLoadingKYC && ["approved", "pending", "rejected"].includes(kycStatus) && (
          <View style={styles.profileCard}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImageStyle} />
              ) : (
                <ProfileIcon />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "John Doe"}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => handleNavigation("/edit-profile")}>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M14.166 2.5a2.121 2.121 0 0 1 3 3L6.25 16.417l-4.167.833.833-4.167L13.833 2.5z"
                  stroke={colors.text}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.kycCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.kycHeader}>
            <View style={styles.kycLeft}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {kycStatus === "approved" && (
                  <Path
                    d="M9 12L11 14L15 10"
                    stroke={colors.primary}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Svg>
              <View style={styles.kycTextContainer}>
                <Text style={[styles.kycTitle, { color: colors.text }]}>KYC Verification</Text>
                <Text style={[styles.kycSubtitle, { color: colors.textSecondary }]}>
                  {isLoadingKYC
                    ? "Checking verification status..."
                    : kycStatus === "approved"
                      ? "Your account is verified"
                      : kycStatus === "pending"
                        ? "Verification in progress"
                        : kycStatus === "rejected"
                          ? "Verification failed"
                          : "Required for Exchange features"}
                </Text>
              </View>
            </View>
            {isLoadingKYC ? <ActivityIndicator size="small" color={colors.primary} /> : renderKYCBadge()}
          </View>

          {kycError && <Text style={[styles.kycErrorText, { color: "#F44336" }]}>{kycError}</Text>}

          {!isLoadingKYC && (kycStatus === "not_started" || kycStatus === "rejected") && (
            <TouchableOpacity onPress={handleKYCAction} activeOpacity={0.8}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.kycButton}
              >
                <Text style={styles.kycButtonText}>
                  {kycStatus === "rejected" ? "Retry Verification" : "Start Verification"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {!isLoadingKYC && kycStatus === "rejected" && <>{renderKYCFailedMessage()}</>}
        </View>

        <View style={[styles.menuContainer]}>{MENU_ITEMS.map(renderMenuItem).filter((item) => item !== null)}</View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }, isLogoutDisabled && { opacity: 0.5 }]}
          onPress={handleLogout}
          disabled={isLogoutDisabled}
        >
          <Text style={[styles.logoutButtonText, { color: colors.text }]}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>
      <PinVerificationModal
        visible={showPinModal}
        onSuccess={handlePinSuccess}
        onCancel={handlePinCancel}
        title="Enter PIN"
        subtitle="Enter your PIN to access biometric settings"
      />

      <Modal visible={showKYCModal} transparent animationType="fade" onRequestClose={handleCloseKYCModal}>
        <KYCOverlay onStartKYC={handleStartKYC} />
      </Modal>
    </View>
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
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  kycCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kycHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  kycLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  kycTextContainer: {
    flex: 1,
  },
  kycTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  kycSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  kycBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kycBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  kycButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  kycButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  kycRejectionText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  kycErrorText: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  kycFailedDetailText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  menuText: {
    fontSize: 15,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuSecondaryText: {
    fontSize: 13,
  },
  logoutButton: {
    borderRadius: 16,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 100,
    backgroundColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  profileImageStyle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
})
