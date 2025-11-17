"use client"

import type React from "react"

import { AddressIcon } from "@/components/Icons/lgs-address"
import { FacialIcon } from "@/components/Icons/lgs-facial"
import { IdIcon } from "@/components/Icons/lgs-id"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { AuthAPI } from "@/utils/auth-api"
import { AuthStorage } from "@/utils/auth-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

interface VerificationItem {
  icon: React.ReactNode
  title: string
  description: string
}

const VERIFICATION_ITEMS: VerificationItem[] = [
  {
    icon: <IdIcon />,
    title: "Photo ID",
    description: "ID card, passport, driver license supported",
  },
  {
    icon: <AddressIcon />,
    title: "Proof of address",
    description: "Documents that can prove the address, such as utility bills, etc",
  },
  {
    icon: <FacialIcon />,
    title: "Facial recognition",
    description: "Confirm that the portrait matches the picture on the identification document.",
  },
]

export default function LetsGetStartedScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)

  const handleBack = useCallback(() => {
    router.push("/home")
  }, [router])

  const handleContinue = useCallback(async () => {
    setIsCreatingAccount(true)
    try {
      const existingUserId = await AuthStorage.getUserId()

      if (!existingUserId) {
        console.log("[DEV] No existing user account, creating one...")

        const response = await AuthAPI.signUp({})

        if (response.success && response.userId) {
          console.log("[DEV] User account created successfully:", response.userId)
        } else {
          console.error("[DEV] Failed to create user account:", response.message)
        }
      } else {
        console.log("[DEV] User account already exists:", existingUserId)
      }

      router.push("/select-id-type")
    } catch (error) {
      console.error("[DEV] Error in handleContinue:", error)
      router.push("/select-id-type")
    } finally {
      setIsCreatingAccount(false)
    }
  }, [router])

  const renderVerificationItem = useCallback(
    (item: VerificationItem, index: number) => (
      <View key={index} style={styles.verificationItem}>
        <View style={styles.iconWrapper}>{item.icon}</View>
        <View style={styles.verificationContent}>
          <Text style={[styles.verificationTitle, { color: colors.text }]}>{item.title}</Text>
          <Text style={[styles.verificationDescription, { color: colors.textSecondary }]}>{item.description}</Text>
        </View>
      </View>
    ),
    [colors],
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Let's get started</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Let's get started</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          To ensure the security of your account and protect against fraud, we require you to complete our identity
          verification process
        </Text>

        {/* Verification Items */}
        <View style={styles.verificationList}>{VERIFICATION_ITEMS.map(renderVerificationItem)}</View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
            Clicking the continue button, means that I have read and agreed to the{" "}
            <Text style={[styles.disclaimerLink, { color: colors.text }]}>
              user identity authentication information statement
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleContinue} activeOpacity={0.7} disabled={isCreatingAccount}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            {isCreatingAccount ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.continueButtonText}>Agree and continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  verificationList: {
    gap: 20,
  },
  verificationItem: {
    flexDirection: "row",
    gap: 16,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  verificationContent: {
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  verificationDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  disclaimerContainer: {
    marginTop: 40,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  disclaimerLink: {
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  continueButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
