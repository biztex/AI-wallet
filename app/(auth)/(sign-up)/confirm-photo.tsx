"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const VALIDATION_ITEMS = [
  { id: 1, text: "Readable, clear and not blurry" },
  { id: 2, text: "Well-lit, not reflective, not too dark" },
  { id: 3, text: "ID occupies most of the image" },
] as const

const CONFIRMATION_ITEMS = [{ id: 1, text: "ID is not expired" }] as const

const ACTIVE_OPACITY = 0.7
const RETAKE_ICON_COLOR = "#FF4444"

const STORAGE_KEYS = {
  KYC_ID_TYPE: "@pucket_kyc_id_type",
  KYC_COUNTRY: "@pucket_kyc_country",
} as const

export default function ConfirmPhotoScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const params = useLocalSearchParams()
  const photoUri = params.photoUri as string
  const [isExpiredChecked, setIsExpiredChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = useCallback(async () => {
    if (!isExpiredChecked) return

    setIsLoading(true)
    try {
      router.push({
        pathname: "/kyc-form",
        params: { photoUri },
      })
    } catch (error) {
      console.error("[DEV] Error navigating to KYC form:", error)
    } finally {
      setIsLoading(false)
    }
  }, [isExpiredChecked, photoUri, router])

  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  const toggleExpiredCheck = useCallback(() => {
    setIsExpiredChecked((prev) => !prev)
  }, [])

  const renderValidationItems = useMemo(
    () =>
      VALIDATION_ITEMS.map((item) => (
        <View key={item.id} style={styles.checkItem}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <Path
              d="M16.6667 5L7.50004 14.1667L3.33337 10"
              stroke={colors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.checkText, { color: colors.textSecondary }]}>{item.text}</Text>
        </View>
      )),
    [colors.primary, colors.textSecondary],
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={ACTIVE_OPACITY}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Photo</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Passport Image */}
        <View style={styles.passportContainer}>
          <View style={[styles.passportImageWrapper, { backgroundColor: colors.card }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.passportImage} resizeMode="cover" />
            ) : (
              <View style={styles.passportPlaceholder}>
                <Text style={[styles.passportPlaceholderText, { color: colors.textSecondary }]}>PASSPORT IMAGE</Text>
              </View>
            )}

            {/* Retake Icon */}
            <TouchableOpacity style={styles.retakeIcon} onPress={handleBack} activeOpacity={ACTIVE_OPACITY}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M1 4V10H7"
                  stroke={RETAKE_ICON_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M3.51 15C4.15839 16.8404 5.38734 18.4202 7.01166 19.5014C8.63598 20.5826 10.5677 21.1066 12.5157 20.9945C14.4637 20.8824 16.3226 20.1402 17.8121 18.8798C19.3017 17.6193 20.3413 15.9089 20.7742 14.0064C21.2072 12.1038 21.0101 10.1095 20.2126 8.33214C19.4152 6.55476 18.0605 5.08741 16.3528 4.1398C14.6451 3.1922 12.6769 2.81762 10.7447 3.06689C8.81245 3.31615 7.0163 4.17547 5.64 5.52L1 10"
                  stroke={RETAKE_ICON_COLOR}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>
        </View>

        {/* Validation Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>After detected, you photo</Text>
          {renderValidationItems}
        </View>

        {/* Confirmation Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Please confirm that</Text>

          <TouchableOpacity style={styles.checkboxItem} onPress={toggleExpiredCheck} activeOpacity={ACTIVE_OPACITY}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.border,
                  backgroundColor: isExpiredChecked ? colors.primary : "transparent",
                },
              ]}
            >
              {isExpiredChecked && (
                <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                  <Path
                    d="M13.3333 4L6 11.3333L2.66667 8"
                    stroke={colors.background}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              )}
            </View>
            <Text style={[styles.checkboxText, { color: colors.text }]}>ID is not expired</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!isExpiredChecked || isLoading}
          activeOpacity={ACTIVE_OPACITY}
          style={{ opacity: isExpiredChecked && !isLoading ? 1 : 0.6 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmButton}
          >
            <Text style={[styles.confirmButtonText, { color: "#FFFFFF" }]}>
              {isLoading ? "CONTINUING..." : "CONFIRM"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.retakeButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={handleBack}
          activeOpacity={ACTIVE_OPACITY}
        >
          <Text style={[styles.retakeButtonText, { color: colors.text }]}>RETAKE</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  passportContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  passportImageWrapper: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
  },
  passportImage: {
    width: "100%",
    aspectRatio: 1,
  },
  passportPlaceholder: {
    width: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  passportPlaceholderText: {
    fontSize: 16,
    color: "#999999",
    fontWeight: "600",
  },
  retakeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  checkText: {
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  checkboxText: {
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    gap: 12,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  retakeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  retakeButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "600",
  },
})
