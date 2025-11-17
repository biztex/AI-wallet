"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const NETWORK_PROVIDERS = [
  { id: "mtn", name: "MTN", color: "#FFCC00" },
  { id: "9mobile", name: "9mobile", color: "#00A65A" },
  { id: "glo", name: "Glo", color: "#4CAF50" },
  { id: "airtel", name: "Airtel", color: "#FF0000" },
]

const DATA_BUNDLES = [
  { id: "daily1", name: "110MB Daily Plan (1 Day) - ₦100", price: 100 },
  { id: "daily2", name: "230MB Daily Plan (1 Day) - ₦200", price: 200 },
  { id: "weekly", name: "1.5GB Weekly Plan (7 Days) - ₦1,000", price: 1000 },
  { id: "monthly", name: "7GB Monthly Plan - ₦3,500", price: 3500 },
]

const BEST_OFFERS = [
  { id: "1", title: "110MB Daily", subtitle: "₦100", price: 100 },
  { id: "2", title: "230MB Daily", subtitle: "₦200", price: 200 },
  { id: "3", title: "1.5GB Weekly", subtitle: "₦1,000", price: 1000 },
  { id: "4", title: "7GB Monthly", subtitle: "₦3,500", price: 3500 },
]

export default function PayBillDataScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [selectedBundle, setSelectedBundle] = useState<(typeof DATA_BUNDLES)[number] | null>(null)
  const [dataAmount, setDataAmount] = useState("")
  const [showBundleModal, setShowBundleModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const isFormValid = useMemo(() => {
    return selectedNetwork && phoneNumber.length === 11 && selectedBundle !== null && dataAmount !== ""
  }, [selectedNetwork, phoneNumber, selectedBundle, dataAmount])

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

  const formatCurrency = useCallback((value: string | number) => {
    const numericValue = typeof value === "number" ? value : Number.parseFloat(value.replace(/[^0-9.]/g, ""))
    if (Number.isNaN(numericValue)) return "₦0.00"
    return `₦${numericValue.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Buy Data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select network provider</Text>
          <View style={styles.networkGrid}>
            {NETWORK_PROVIDERS.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.networkCard,
                  { backgroundColor: colors.card },
                  selectedNetwork === provider.id && { borderWidth: 2, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedNetwork(provider.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.networkIcon, { backgroundColor: provider.color }]}>
                  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
                      fill="#FFFFFF"
                    />
                    <Path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6z" fill="#FFFFFF" />
                    <Path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3z" fill="#FFFFFF" />
                  </Svg>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Phone number</Text>
            <View style={[styles.phoneInputContainer, { backgroundColor: colors.card }]}>
              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={11}
              />
              <TouchableOpacity style={styles.contactIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Path
                    d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                    stroke={colors.textSecondary}
                    strokeWidth={2}
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Select bundle</Text>
            <TouchableOpacity
              style={[styles.dropdownContainer, { backgroundColor: colors.card }]}
              onPress={() => setShowBundleModal(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.dropdownPlaceholder, { color: selectedBundle ? colors.text : colors.textSecondary }]}
              >
                {selectedBundle ? selectedBundle.name : "Select bundle"}
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

          <View style={styles.bestOffersSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Best Offers</Text>
            <View style={styles.offersGrid}>
              {BEST_OFFERS.map((offer) => (
                <TouchableOpacity
                  key={offer.id}
                  style={[styles.offerCard, { backgroundColor: colors.card }]}
                  onPress={() => {
                    setDataAmount(offer.price.toString())
                    const bundle = DATA_BUNDLES.find((b) => b.price === offer.price)
                    if (bundle) setSelectedBundle(bundle)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.offerTitle, { color: colors.text }]} numberOfLines={2}>
                    {offer.title}
                  </Text>
                  <Text style={[styles.offerSubtitle, { color: colors.primary }]}>{offer.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
              placeholder="How much is the data plan?"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={dataAmount}
              onChangeText={setDataAmount}
            />
          </View>

          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isFormValid || isProcessing}
            activeOpacity={0.8}
            style={{ opacity: isFormValid && !isProcessing ? 1 : 0.5 }}
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

      <Modal visible={showBundleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Bundle</Text>
            {DATA_BUNDLES.map((bundle) => (
              <TouchableOpacity
                key={bundle.id}
                style={[styles.dropdownOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedBundle(bundle)
                  setDataAmount(bundle.price.toString())
                  setShowBundleModal(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{bundle.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowBundleModal(false)}>
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
            <Text style={[styles.successAmount, { color: colors.text }]}>{formatCurrency(dataAmount)}</Text>
            <Text style={[styles.successMessage, { color: colors.text }]}>Data purchase successful.</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 16 },
  networkGrid: { flexDirection: "row", gap: 12, marginBottom: 32, flexWrap: "wrap" },
  networkCard: {
    width: 79,
    height: 79,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  networkIcon: { width: 48, height: 48, borderRadius: 28, justifyContent: "center", alignItems: "center" },
  inputGroup: { gap: 12, marginBottom: 24 },
  inputLabel: { fontSize: 15, fontWeight: "600" },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  phoneInput: { flex: 1, fontSize: 15 },
  contactIcon: { padding: 4 },
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
  dropdownPlaceholder: { fontSize: 15, flex: 1 },
  bestOffersSection: { marginBottom: 24 },
  offersGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  offerCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    minHeight: 88,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  offerTitle: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  offerSubtitle: { fontSize: 16, fontWeight: "700" },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  continueButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", marginTop: 24 },
  continueButtonText: { fontSize: 16, fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 32, maxHeight: "70%", paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 20, textAlign: "center" },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  dropdownOptionText: { fontSize: 15, fontWeight: "600" },
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
  successAmount: { fontSize: 32, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  successMessage: { fontSize: 15, textAlign: "center", marginBottom: 8, fontWeight: "600" },
  transactionId: { fontSize: 13, textAlign: "center", marginBottom: 32, fontWeight: "500" },
  homeButton: { borderRadius: 16, height: 56, justifyContent: "center", alignItems: "center", width: "100%" },
  homeButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
})
