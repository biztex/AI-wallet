"use client"

import { FaceIdIcon } from "@/components/Icons/face-id"
import { TouchIdIcon } from "@/components/Icons/touch-id"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { AuthStorage } from "@/utils/auth-storage"
import * as LocalAuthentication from "expo-local-authentication"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

type BiometricType = "face" | "fingerprint" | "none"

export default function BiometricSettingsScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [isLoading, setIsLoading] = useState(true)
  const [biometricType, setBiometricType] = useState<BiometricType>("none")
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false)
  const [isHardwareAvailable, setIsHardwareAvailable] = useState(false)
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false)

  useEffect(() => {
    const checkBiometricCapability = async () => {
      try {
        setIsLoading(true)

        // Check hardware availability
        const hardware = await LocalAuthentication.hasHardwareAsync()
        setIsHardwareAvailable(hardware)

        if (!hardware) {
          setIsLoading(false)
          return
        }

        // Check if biometrics are enrolled
        const enrolled = await LocalAuthentication.isEnrolledAsync()
        setIsBiometricEnrolled(enrolled)

        if (!enrolled) {
          setIsLoading(false)
          return
        }

        // Determine biometric type
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync()
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType("face")
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType("fingerprint")
        }

        // Check if biometric login is enabled
        const enabled = await AuthStorage.isBiometricEnabled()
        setIsBiometricEnabled(enabled)
      } catch (error) {
        console.error("[DEV] Error checking biometric capability:", error)
        Alert.alert("Error", "Failed to check biometric settings")
      } finally {
        setIsLoading(false)
      }
    }

    checkBiometricCapability()
  }, [])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const handleToggleBiometric = useCallback(
    async (value: boolean) => {
      if (!isHardwareAvailable || !isBiometricEnrolled) {
        Alert.alert("Biometric Not Available", "Please set up Face ID or Touch ID in your device settings first.")
        return
      }

      if (value) {
        // Enabling biometric - require authentication first
        try {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: `Enable ${biometricType === "face" ? "Face ID" : "Touch ID"} Login`,
            fallbackLabel: "Use Passcode",
            cancelLabel: "Cancel",
            disableDeviceFallback: false,
          })

          if (result.success) {
            await AuthStorage.setBiometricEnabled(true)
            await AuthStorage.setBiometricType(biometricType)
            setIsBiometricEnabled(true)
            Alert.alert("Success", `${biometricType === "face" ? "Face ID" : "Touch ID"} login has been enabled.`)
          } else {
            Alert.alert("Authentication Failed", "Biometric authentication was not successful.")
          }
        } catch (error) {
          console.error("[DEV] Error enabling biometric:", error)
          Alert.alert("Error", "Failed to enable biometric login")
        }
      } else {
        // Disabling biometric - require authentication first
        Alert.alert(
          "Disable Biometric Login",
          `Are you sure you want to disable ${biometricType === "face" ? "Face ID" : "Touch ID"} login?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Disable",
              style: "destructive",
              onPress: async () => {
                try {
                  const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Authenticate to disable biometric login",
                    fallbackLabel: "Use Passcode",
                    cancelLabel: "Cancel",
                    disableDeviceFallback: false,
                  })

                  if (result.success) {
                    await AuthStorage.setBiometricEnabled(false)
                    setIsBiometricEnabled(false)
                    Alert.alert("Success", "Biometric login has been disabled.")
                  }
                } catch (error) {
                  console.error("[DEV] Error disabling biometric:", error)
                  Alert.alert("Error", "Failed to disable biometric login")
                }
              },
            },
          ],
        )
      }
    },
    [isHardwareAvailable, isBiometricEnrolled, biometricType],
  )

  const renderBiometricIcon = useCallback(() => {
    if (biometricType === "face") {
      return <FaceIdIcon />
    } else if (biometricType === "fingerprint") {
      return <TouchIdIcon />
    }
    return (
      <Svg width={80} height={80} viewBox="0 0 80 80" fill="none">
        <Path
          d="M40 10C38 10 36.67 11.33 36.67 13.33C36.67 15.33 38 16.67 40 16.67C42 16.67 43.33 15.33 43.33 13.33C43.33 11.33 42 10 40 10Z"
          fill={colors.textSecondary}
        />
        <Path
          d="M40 23.33C34.85 23.33 30.67 27.52 30.67 32.67C30.67 37.82 34.85 42 40 42C45.15 42 49.33 37.82 49.33 32.67C49.33 27.52 45.15 23.33 40 23.33ZM40 38.67C36.67 38.67 34 36 34 32.67C34 29.33 36.67 26.67 40 26.67C43.33 26.67 46 29.33 46 32.67C46 36 43.33 38.67 40 38.67Z"
          fill={colors.textSecondary}
        />
      </Svg>
    )
  }, [biometricType, colors.textSecondary])

  const renderStatusMessage = useCallback(() => {
    if (!isHardwareAvailable) {
      return (
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
            <Path
              d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
              stroke="#F44336"
              strokeWidth={2}
            />
            <Path d="M16 16L32 32M32 16L16 32" stroke="#F44336" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={[styles.statusTitle, { color: colors.text }]}>Not Supported</Text>
          <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
            Your device does not support biometric authentication.
          </Text>
        </View>
      )
    }

    if (!isBiometricEnrolled) {
      return (
        <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Svg width={48} height={48} viewBox="0 0 48 48" fill="none">
            <Path
              d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
              stroke="#FF9800"
              strokeWidth={2}
            />
            <Path d="M24 14V26M24 32V34" stroke="#FF9800" strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <Text style={[styles.statusTitle, { color: colors.text }]}>Not Enrolled</Text>
          <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
            Please set up Face ID or Touch ID in your device settings to use biometric login.
          </Text>
        </View>
      )
    }

    return null
  }, [isHardwareAvailable, isBiometricEnrolled, colors])

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton} activeOpacity={0.7}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M15 18L9 12L15 6"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Biometric Login</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton} activeOpacity={0.7}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18L9 12L15 6"
              stroke={colors.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Biometric Login</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.iconContainer}>{renderBiometricIcon()}</View>

        <Text style={[styles.title, { color: colors.text }]}>
          {biometricType === "face" ? "Face ID" : biometricType === "fingerprint" ? "Touch ID" : "Biometric Login"}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isHardwareAvailable && isBiometricEnrolled
            ? `Use ${biometricType === "face" ? "Face ID" : "Touch ID"} to quickly and securely access your account.`
            : "Biometric authentication is not available on this device."}
        </Text>

        {renderStatusMessage()}

        {isHardwareAvailable && isBiometricEnrolled && (
          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>
                  Enable {biometricType === "face" ? "Face ID" : "Touch ID"}
                </Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Use biometric authentication to log in
                </Text>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: "#E0E0E0", true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        )}

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke={colors.primary}
              strokeWidth={2}
            />
            <Path d="M12 16V12M12 8H12.01" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <View style={styles.infoTextContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Security Note</Text>
            <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
              Your biometric data is stored securely on your device and is never shared with our servers. You can
              disable this feature at any time.
            </Text>
          </View>
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  statusCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    alignItems: "center",
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  settingCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
})
