"use client"

import { DriveLicenseIcon } from "@/components/Icons/driver-license"
import { Canada } from "@/components/Icons/flags/canada"
import { Nigeria } from "@/components/Icons/flags/nigeria"
import { UK } from "@/components/Icons/flags/uk"
import { USA } from "@/components/Icons/flags/usa"
import { IdPIcon } from "@/components/Icons/id-process"
import { PassportProcessIcon } from "@/components/Icons/passaport-process"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const COUNTRIES = [
  { id: "ng", name: "Nigeria", flag: "nigeria" },
  { id: "us", name: "United States", flag: "us" },
  { id: "uk", name: "United Kingdom", flag: "uk" },
  { id: "ca", name: "Canada", flag: "ca" },
]

const STORAGE_KEYS = {
  KYC_ID_TYPE: "@pucket_kyc_id_type",
  KYC_COUNTRY: "@pucket_kyc_country",
} as const

export default function SelectIdTypeScreen() {
  const router = useRouter()
  const [selectedMethod, setSelectedMethod] = useState<"id-card" | "passport" | "drivers-license">("passport")
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryModal, setShowCountryModal] = useState(false)

  const handleContinue = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.KYC_ID_TYPE, selectedMethod)
      await AsyncStorage.setItem(STORAGE_KEYS.KYC_COUNTRY, JSON.stringify(selectedCountry))
      console.log("[DEV] ID type and country saved:", selectedMethod, selectedCountry.name)
      router.push("/camera")
    } catch (error) {
      console.error("[DEV] Error saving ID type and country:", error)
    }
  }, [selectedMethod, selectedCountry, router])

  const handleBackPress = useCallback(() => {
    router.push("/lets-get-started")
  }, [router])

  const getFlagComponent = (flag: string) => {
    switch (flag) {
      case "us":
        return <USA />
      case "uk":
        return <UK />
      case "ca":
        return <Canada />
      case "ng":
        return <Nigeria />
      default:
        return <Nigeria />
    }
  }

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select ID type</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Page Title */}
        <Text style={[styles.pageTitle, { color: colors.text }]}>Select ID type</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          To ensure the security of your account and protect against fraud, we require you to complete our identity
          verification process
        </Text>

        {/* Country/Region Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Document issuing Country/Region</Text>
          <TouchableOpacity
            style={[styles.countrySelector, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowCountryModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.countryLeft}>
              <View style={styles.flagIcon}>{getFlagComponent(selectedCountry.flag)}</View>
              <Text style={[styles.countryText, { color: colors.text }]}>{selectedCountry.name}</Text>
            </View>
            <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
              <Path
                d="M5 7.5L10 12.5L15 7.5"
                stroke={colors.text}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>

        {/* ID Method Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>What method would you prefer to use?</Text>
          <View style={styles.methodList}>
            {/* ID Card Option */}
            <TouchableOpacity
              style={[styles.methodItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelectedMethod("id-card")}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <IdPIcon />
                </View>
                <Text style={[styles.methodText, { color: colors.text }]}>ID card</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  { borderColor: selectedMethod === "id-card" ? colors.primary : colors.border },
                  selectedMethod === "id-card" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "id-card" && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            {/* Passport Option */}
            <TouchableOpacity
              style={[styles.methodItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelectedMethod("passport")}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <PassportProcessIcon />
                </View>
                <Text style={[styles.methodText, { color: colors.text }]}>Passport</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  { borderColor: selectedMethod === "passport" ? colors.primary : colors.border },
                  selectedMethod === "passport" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "passport" && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>

            {/* Driver's License Option */}
            <TouchableOpacity
              style={[styles.methodItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setSelectedMethod("drivers-license")}
              activeOpacity={0.7}
            >
              <View style={styles.methodLeft}>
                <View style={styles.methodIcon}>
                  <DriveLicenseIcon />
                </View>
                <Text style={[styles.methodText, { color: colors.text }]}>Driver's license</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  { borderColor: selectedMethod === "drivers-license" ? colors.primary : colors.border },
                  selectedMethod === "drivers-license" && styles.radioButtonSelected,
                ]}
              >
                {selectedMethod === "drivers-license" && (
                  <View style={[styles.radioButtonInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={handleContinue}>
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>CONTINUE</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <Modal visible={showCountryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Country</Text>
            {COUNTRIES.map((country) => (
              <TouchableOpacity
                key={country.id}
                style={[styles.countryOption, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setSelectedCountry(country)
                  setShowCountryModal(false)
                }}
                activeOpacity={0.7}
              >
                <View style={styles.countryOptionLeft}>
                  <View style={styles.flagIcon}>{getFlagComponent(country.flag)}</View>
                  <Text style={[styles.countryOptionText, { color: colors.text }]}>{country.name}</Text>
                </View>
                {selectedCountry.id === country.id && (
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12L10 17L19 8"
                      stroke="#4CAF50"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCountryModal(false)}>
              <Text style={styles.modalCloseButtonText}>CLOSE</Text>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  countryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flagIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  countryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  methodList: {
    gap: 12,
  },
  methodItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  methodText: {
    fontSize: 16,
    fontWeight: "500",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: "#4CAF50",
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  countryOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  countryOptionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalCloseButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
