"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { G, Path, Rect } from "react-native-svg"

const TV_PROVIDERS = [
  { id: "dstv", name: "DSTV" },
  { id: "gotv", name: "GOtv" },
  { id: "startimes", name: "Startimes" },
  { id: "showmax", name: "Showmax" },
]

const TV_PACKAGES = [
  { id: "compact", name: "Compact", price: 6000 },
  { id: "premium", name: "Premium", price: 9800 },
  { id: "family", name: "Family", price: 4500 },
  { id: "access", name: "Access", price: 3200 },
]

export default function PayBillTVScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [selectedTVProvider, setSelectedTVProvider] = useState<(typeof TV_PROVIDERS)[number] | null>(null)
  const [selectedTVPackage, setSelectedTVPackage] = useState<(typeof TV_PACKAGES)[number] | null>(null)
  const [smartCardNumber, setSmartCardNumber] = useState("")
  const [tvPhoneNumber, setTvPhoneNumber] = useState("")
  const [showTVProviderModal, setShowTVProviderModal] = useState(false)
  const [showTVPackageModal, setShowTVPackageModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isFormValid = useMemo(() => {
    return selectedTVProvider !== null && selectedTVPackage !== null && smartCardNumber !== "" && tvPhoneNumber !== ""
  }, [selectedTVProvider, selectedTVPackage, smartCardNumber, tvPhoneNumber])

  const handleContinue = useCallback(() => {
    if (isFormValid && !isProcessing) {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        setShowSuccessModal(true)
      }, 1000)
    }
  }, [isFormValid, isProcessing])

  const handleBackToHome = useCallback(() => {
    setShowSuccessModal(false)
    router.push("/home")
  }, [router])

  const formatCurrency = useCallback((value: number) => {
    return `₦${value.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>TV Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Select provider</Text>
            <TouchableOpacity
              style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
              onPress={() => setShowTVProviderModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.dropdownWithIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <G stroke={colors.textSecondary} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                    <Path d="m17 2l-5 5l-5-5" />
                    <Rect width={20} height={15} x={2} y={7} rx={2} />
                  </G>
                </Svg>
                <Text
                  style={[
                    styles.dropdownPlaceholder,
                    { color: selectedTVProvider ? colors.text : colors.textSecondary },
                  ]}
                >
                  {selectedTVProvider ? selectedTVProvider.name : "Select provider"}
                </Text>
              </View>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke={colors.textSecondary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Select Package</Text>
            <TouchableOpacity
              style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
              onPress={() => setShowTVPackageModal(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dropdownPlaceholder, { color: selectedTVPackage ? colors.text : colors.textSecondary }]}
              >
                {selectedTVPackage ? selectedTVPackage.name : "Select package"}
              </Text>
              <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
                <Path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke={colors.textSecondary}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Smart card number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="10-13 digits"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              value={smartCardNumber}
              onChangeText={setSmartCardNumber}
              maxLength={13}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g 08184991004"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              value={tvPhoneNumber}
              onChangeText={setTvPhoneNumber}
              maxLength={11}
            />
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isFormValid || isProcessing}
            activeOpacity={0.8}
            style={{ opacity: !isFormValid && !isProcessing ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={ENABLED_BUTTON_GRADIENT}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.continueButton}
            >
              <Text style={[styles.continueButtonText, { color: "#FFFFFF" }]}>
                {isProcessing ? "PROCESSING..." : "Continue"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showTVProviderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Provider</Text>
            {TV_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedTVProvider(provider)
                  setShowTVProviderModal(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{provider.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowTVProviderModal(false)}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCloseButtonGradient}
              >
                <Text style={styles.modalCloseButtonText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTVPackageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Package</Text>
            {TV_PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedTVPackage(pkg)
                  setShowTVPackageModal(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{pkg.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowTVPackageModal(false)}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalCloseButtonGradient}
              >
                <Text style={styles.modalCloseButtonText}>CLOSE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M10 20L17 27L30 13"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>
            <Text style={[styles.successAmount, { color: colors.text }]}>
              {formatCurrency(selectedTVPackage?.price || 0)}
            </Text>
            <Text style={[styles.successMessage, { color: colors.text }]}>TV subscription renewed successfully.</Text>
            <Text style={[styles.transactionId, { color: colors.textSecondary }]}>Transaction ID: #26247878</Text>
            <TouchableOpacity onPress={handleBackToHome} activeOpacity={0.8} style={{ width: "100%" }}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>BACK TO HOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "600" },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1, paddingHorizontal: 20 },
  content: { paddingTop: 24, paddingBottom: 40 },
  inputGroup: { gap: 12, marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: "600" },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  dropdownWithIcon: { flexDirection: "row", alignItems: "center", gap: 8 },
  dropdownPlaceholder: { fontSize: 14, flex: 1 },
  input: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, height: 56, fontSize: 14 },
  continueButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 24 },
  continueButtonText: { fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "70%", paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: { fontSize: 16, fontWeight: "600" },
  modalCloseButton: { marginTop: 20 },
  modalCloseButtonGradient: { borderRadius: 16, height: 50, justifyContent: "center", alignItems: "center" },
  modalCloseButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  successModalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  successModalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  successIconContainer: { alignItems: "center", marginBottom: 24 },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  successAmount: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  successMessage: { fontSize: 15, textAlign: "center", marginBottom: 8, fontWeight: "600" },
  transactionId: { fontSize: 12, textAlign: "center", marginBottom: 24, fontWeight: "500" },
  homeButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", width: "100%" },
  homeButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
})
