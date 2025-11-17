"use client"

import { VerificationIcon } from "@/components/Icons/verification"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function VerificationSuccessScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  useEffect(() => {
    const saveKycStatus = async () => {
      try {
        await AsyncStorage.setItem("kycCompleted", "true")
        console.log("[DEV] KYC completion status saved")
      } catch (error) {
        console.error("[DEV] Error saving KYC status:", error)
      }
    }
    saveKycStatus()
  }, [])

  const handleDone = useCallback(() => {
    router.push("/home")
  }, [router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Success Illustration */}
      <View style={styles.illustrationContainer}>
        <VerificationIcon />
      </View>

      {/* Success Message */}
      <View style={styles.messageContainer}>
        <Text style={[styles.title, { color: colors.text }]}>Verified</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          You currently have access to all of VAEX's features and high limits
        </Text>
      </View>

      {/* Done Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleDone} activeOpacity={0.7}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.doneButton}
          >
            <Text style={[styles.doneButtonText, { color: "#FFFFFF" }]}>DONE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  buttonContainer: {
    width: "100%",
    position: "absolute",
    bottom: 40,
    paddingHorizontal: 20,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
