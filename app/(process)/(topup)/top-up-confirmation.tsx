"use client"

import { CreditCardIcon } from "@/components/Icons/credit-card"
import { PiggyIcon } from "@/components/Icons/piggy"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function TopUpConfirmationScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const handleConfirm = () => {
    setShowSuccessModal(true)
  }

  const handleBackToHome = () => {
    setShowSuccessModal(false)
    router.push("/home")
  }

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Confirmation</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {/* Credit Card Display */}
        <View style={styles.cardContainer}>
          <CreditCardIcon />
        </View>

        {/* Transaction Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Top up balance</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>$2,256.00</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Fee</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>$3.0</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.detailLabelTotal, { color: colors.text }]}>Total</Text>
            <Text style={[styles.detailValueTotal, { color: colors.text }]}>$2,259.00</Text>
          </View>
        </View>
      </View>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleConfirm} activeOpacity={0.8}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>CONFIRM TOP UP</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.illustrationContainer}>
              <PiggyIcon />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>Top Up Success</Text>
            <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
              Top up are reviewed which may result in delays or funds being frozen
            </Text>

            <TouchableOpacity onPress={handleBackToHome} activeOpacity={0.8}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.backToHomeButton}
              >
                <Text style={styles.backToHomeButtonText}>BACK TO HOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cardContainer: {
    marginBottom: 32,
    marginLeft: 12.5,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardStripe: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  cardholderInfo: {
    gap: 4,
  },
  cardholderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardExpiry: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  mastercardLogo: {
    flexDirection: "row",
    position: "relative",
    width: 40,
    height: 24,
  },
  mastercardCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: "absolute",
  },
  mastercardCircleLeft: {
    backgroundColor: "#EB001B",
    left: 0,
  },
  mastercardCircleRight: {
    backgroundColor: "#F79E1B",
    right: 0,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailRowTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
  },
  detailLabelTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  detailValueTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 32,
    paddingBottom: 40,
    width: "100%",
    alignItems: "center",
  },
  illustrationContainer: {
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center",
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  backToHomeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: "30%",
  },
  backToHomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
