"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { AuthAPI } from "@/utils/auth-api"
import { AuthStorage } from "@/utils/auth-storage"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

interface BankAccount {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  bvn: string
}

interface KYCFormData {
  firstName: string
  lastName: string
  address: string
  city: string
  country: string
  nationality: string
  mobileNumber: string
  dateOfBirth: string
  gender: string
  bankAccounts: BankAccount[]
}

const INITIAL_FORM_DATA: KYCFormData = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  country: "",
  nationality: "",
  mobileNumber: "",
  dateOfBirth: "",
  gender: "",
  bankAccounts: [],
}

export default function KYCFormScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const params = useLocalSearchParams()

  const [formData, setFormData] = useState<KYCFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCountryFromStorage, setSelectedCountryFromStorage] = useState<string>("")

  // Load selected country from AsyncStorage on mount
  useEffect(() => {
    const loadCountry = async () => {
      try {
        const countryData = await AsyncStorage.getItem("@pucket_kyc_country")
        if (countryData) {
          const country = JSON.parse(countryData)
          setSelectedCountryFromStorage(country.name || "")
        }
      } catch (error) {
        console.error("[DEV] Error loading country from storage:", error)
      }
    }
    loadCountry()
  }, [])

  const isNigeria = useMemo(() => {
    return selectedCountryFromStorage.toLowerCase().trim() === "nigeria"
  }, [selectedCountryFromStorage])

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.address.trim().length > 0 &&
      formData.city.trim().length > 0 &&
      formData.country.trim().length > 0 &&
      formData.nationality.trim().length > 0 &&
      formData.mobileNumber.trim().length > 0 &&
      formData.dateOfBirth.trim().length > 0 &&
      formData.gender.trim().length > 0
    )
  }, [formData])

  const updateField = useCallback((field: keyof KYCFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const addBankAccount = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        {
          id: Date.now().toString(),
          bankName: "",
          accountNumber: "",
          routingNumber: "",
          bvn: "",
        },
      ],
    }))
  }, [])

  const removeBankAccount = useCallback((id: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((account) => account.id !== id),
    }))
  }, [])

  const updateBankAccount = useCallback((id: string, field: keyof BankAccount, value: string) => {
    setFormData((prev) => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account) => (account.id === id ? { ...account, [field]: value } : account)),
    }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!isFormValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      const idTypeRaw = await AsyncStorage.getItem("@pucket_kyc_id_type")
      const region = await AsyncStorage.getItem("@pucket_kyc_country")
      const photoUri = params.photoUri as string

      // Type guard to ensure idType is one of the allowed values
      const validIdTypes = ["id-card", "passport", "drivers-license"] as const
      const idType: "id-card" | "passport" | "drivers-license" = 
        idTypeRaw && validIdTypes.includes(idTypeRaw as any) 
          ? (idTypeRaw as "id-card" | "passport" | "drivers-license")
          : "passport"

      let userId = await AuthStorage.getUserId()

      if (!userId) {
        console.log("[DEV] No user account found, creating one before KYC submission...")

        const signUpResponse = await AuthAPI.signUp({})

        if (signUpResponse.success && signUpResponse.userId) {
          userId = signUpResponse.userId
          console.log("[DEV] User account created successfully:", userId)
        } else {
          Alert.alert("Error", "Failed to create user account. Please try again.")
          setIsSubmitting(false)
          return
        }
      }

      const response = await AuthAPI.submitKYC({
        userId,
        idType,
        region: region || "US",
        photoUri,
        personalInfo: formData,
      })

      if (response.success) {
        console.log("[DEV] KYC submitted successfully")
        router.push("/verification-success")
      } else {
        Alert.alert("Error", response.message || "Failed to submit KYC. Please try again.")
      }
    } catch (error) {
      console.error("[DEV] Error submitting KYC:", error)
      Alert.alert("Error", "Failed to submit KYC. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }, [isFormValid, isSubmitting, formData, params.photoUri, router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const renderInputField = useCallback(
    (
      label: string,
      field: keyof KYCFormData,
      options?: { keyboardType?: any; placeholder?: string; required?: boolean },
    ) => (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {options?.required !== false && <Text style={{ color: "#F44336" }}> *</Text>}
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          value={formData[field] as string}
          onChangeText={(value) => updateField(field, value)}
          placeholder={options?.placeholder || label}
          placeholderTextColor={colors.textSecondary}
          keyboardType={options?.keyboardType}
        />
      </View>
    ),
    [colors, formData, updateField],
  )

  const renderBankAccountFields = useCallback(
    (account: BankAccount, index: number) => (
      <View
        key={account.id}
        style={[styles.bankAccountContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={styles.accountHeaderRow}>
          <Text style={[styles.accountTitle, { color: colors.text }]}>Bank Account {index + 1}</Text>
          {formData.bankAccounts.length > 1 && (
            <TouchableOpacity
              onPress={() => removeBankAccount(account.id)}
              activeOpacity={0.7}
              style={styles.removeButton}
            >
              <Text style={{ color: "#F44336", fontSize: 18, fontWeight: "bold" }}>−</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Bank Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={account.bankName}
            onChangeText={(value) => updateBankAccount(account.id, "bankName", value)}
            placeholder="Your bank name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Account Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={account.accountNumber}
            onChangeText={(value) => updateBankAccount(account.id, "accountNumber", value)}
            placeholder="Your account number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>BVN (Bank Verification Number)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={account.bvn}
            onChangeText={(value) => updateBankAccount(account.id, "bvn", value)}
            placeholder="11-digit BVN"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={11}
          />
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Enter your 11-digit Bank Verification Number
          </Text>
        </View>

        {!isNigeria && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Routing Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={account.routingNumber}
              onChangeText={(value) => updateBankAccount(account.id, "routingNumber", value)}
              placeholder="Bank routing number"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
        )}
      </View>
    ),
    [colors, formData.bankAccounts, isNigeria, removeBankAccount, updateBankAccount],
  )

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Please provide your personal information to complete the verification process. All fields marked with * are
          required.
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Details</Text>
        {renderInputField("First Name", "firstName")}
        {renderInputField("Last Name", "lastName")}
        {renderInputField("Date of Birth", "dateOfBirth", { placeholder: "YYYY-MM-DD" })}
        {renderInputField("Gender", "gender", { placeholder: "Male/Female/Other" })}
        {renderInputField("Nationality", "nationality")}
        {renderInputField("Mobile Number", "mobileNumber", {
          keyboardType: "phone-pad",
          placeholder: "+1 234 567 8900",
        })}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Address</Text>
        {renderInputField("Address", "address", { placeholder: "Street address" })}
        {renderInputField("City", "city")}
        {renderInputField("Country", "country")}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Bank Details (Optional)</Text>

        {formData.bankAccounts.map((account, index) => renderBankAccountFields(account, index))}

        <TouchableOpacity onPress={addBankAccount} activeOpacity={0.7} style={styles.addAccountButton}>
          <View style={[styles.addAccountButtonContent, { borderColor: colors.primary }]}>
            <Text style={[styles.addAccountButtonText, { color: colors.primary }]}>+ Add Another Bank Account</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.7}
          style={{ opacity: isFormValid && !isSubmitting ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>{isSubmitting ? "SUBMITTING..." : "SUBMIT VERIFICATION"}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          By submitting, you confirm that all information provided is accurate and matches your identity documents.
        </Text>
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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  bankAccountContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  accountHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  addAccountButton: {
    marginBottom: 20,
  },
  addAccountButtonContent: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addAccountButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 40,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
})
