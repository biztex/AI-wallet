"use client"

import { ProfileTwoIcon } from "@/components/Icons/avatar-two"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { AuthAPI } from "@/utils/auth-api"
import { AuthStorage } from "@/utils/auth-storage"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import Svg, { Path } from "react-native-svg"

interface ProfileFormData {
  firstName: string
  lastName: string
  address: string
  city: string
  country: string
  nationality: string
  mobileNumber: string
  dateOfBirth: string
  gender: string
}

const INITIAL_PROFILE_DATA: ProfileFormData = {
  firstName: "John",
  lastName: "Doe",
  address: "abc...",
  city: "Madrid",
  country: "Spain",
  nationality: "Spain",
  mobileNumber: "+34 *** 958-000666",
  dateOfBirth: "YYYY-MM-DD",
  gender: "Male",
}

const CheckIcon = ({ colors }: { colors: any }) => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path d="M3 8L6 11L13 4" stroke="#4CAF50" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
)

export default function EditProfileScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [formData, setFormData] = useState<ProfileFormData>(INITIAL_PROFILE_DATA)
  const [isSaving, setIsSaving] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true)
        const userId = await AuthStorage.getUserId()
        if (userId) {
          const profileResponse = await AuthAPI.getUserProfile(userId)
          if (profileResponse.success && profileResponse.data) {
            const personalInfo = profileResponse.data.personalInfo
            if (personalInfo) {
              setFormData({
                firstName: personalInfo.firstName || "",
                lastName: personalInfo.lastName || "",
                address: personalInfo.address || "",
                city: personalInfo.city || "",
                country: personalInfo.country || "",
                nationality: personalInfo.nationality || "",
                mobileNumber: personalInfo.mobileNumber || "",
                dateOfBirth: personalInfo.dateOfBirth || "",
                gender: personalInfo.gender || "",
              })
            }
            if (profileResponse.data.profileImage) {
              setProfileImage(profileResponse.data.profileImage)
            }
          }
        }
      } catch (error) {
        console.error("[DEV] Error loading profile data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0 &&
      formData.city.trim().length > 0 &&
      formData.country.trim().length > 0
    )
  }, [formData])

  const updateField = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!isFormValid || isSaving) return

    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      Alert.alert("Success", "Profile updated successfully", [
        { text: "OK", onPress: () => router.push("/profile-details") },
      ])
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }, [isFormValid, isSaving, router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const handleChangeProfilePicture = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library to change your profile picture.")
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri
        setProfileImage(imageUri)

        const userId = await AuthStorage.getUserId()
        if (userId) {
          const uploadResponse = await AuthAPI.updateProfileImage(userId, imageUri)
          if (uploadResponse.success) {
            Alert.alert("Success", "Profile picture updated successfully")
          } else {
            Alert.alert("Error", uploadResponse.message || "Failed to update profile picture")
          }
        }
      }
    } catch (error) {
      console.error("[DEV] Error picking image:", error)
      Alert.alert("Error", "Failed to pick image. Please try again.")
    }
  }, [])

  const renderInputField = useCallback(
    (label: string, field: keyof ProfileFormData, options?: { keyboardType?: any; icon?: boolean }) => (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options?.icon && <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={styles.calendarIcon} />}
          <TextInput
            style={[styles.input, { color: colors.text, flex: options?.icon ? 1 : undefined }]}
            value={formData[field]}
            onChangeText={(value) => updateField(field, value)}
            placeholder={label}
            placeholderTextColor={colors.textSecondary}
            keyboardType={options?.keyboardType}
          />
          <CheckIcon colors={colors} />
        </View>
      </View>
    ),
    [colors, formData, updateField],
  )

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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Profile Photo */}
        <View style={styles.profilePhotoContainer}>
          <View style={styles.profilePhoto}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profilePhotoImage} />
            ) : (
              <ProfileTwoIcon />
            )}
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {formData.firstName} {formData.lastName}
          </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={handleChangeProfilePicture}>
            <Text style={styles.changePhotoText}>Change Profile Picture</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Fields */}
        {renderInputField("First Name", "firstName")}
        {renderInputField("Last Name", "lastName")}
        {renderInputField("Address", "address")}
        {renderInputField("City", "city")}
        {renderInputField("Country", "country")}
        {renderInputField("Nationality", "nationality")}
        {renderInputField("Mobile Number", "mobileNumber", { keyboardType: "phone-pad" })}
        {renderInputField("Date of birth", "dateOfBirth", { icon: true })}
        {renderInputField("Gender", "gender")}

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isFormValid || isSaving}
          activeOpacity={0.7}
          style={{ opacity: isFormValid && !isSaving ? 1 : 0.5 }}
        >
          <LinearGradient
            colors={["#84C718", "#09791A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButton}
          >
            <Text style={styles.saveButtonText}>{isSaving ? "SAVING..." : "SAVE"}</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  profilePhotoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 32,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profilePhotoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  changePhotoText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  calendarIcon: {
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
