"use client"

import { ProfileTwoIcon } from "@/components/Icons/avatar-two"
import { EditIcon } from "@/components/Icons/edit"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

interface ProfileField {
  label: string
  value: string
  hasIcon?: boolean
}

const PROFILE_DATA: ProfileField[] = [
  { label: "First Name", value: "John" },
  { label: "Last Name", value: "Doe" },
  { label: "Address", value: "abc..." },
  { label: "City", value: "Madrid" },
  { label: "Country", value: "Spain" },
  { label: "Nationality", value: "Spain" },
  { label: "Mobile Number", value: "+34 *** 958-000666" },
  { label: "Date of birth", value: "2000-12-17", hasIcon: true },
  { label: "Gender", value: "Male" },
]

import { AuthAPI } from "@/utils/auth-api"
import { AuthStorage } from "@/utils/auth-storage"

export default function ProfileDetailsScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [profileData, setProfileData] = useState<ProfileField[]>(PROFILE_DATA)
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
              setProfileData([
                { label: "First Name", value: personalInfo.firstName || "John" },
                { label: "Last Name", value: personalInfo.lastName || "Doe" },
                { label: "Address", value: personalInfo.address || "abc..." },
                { label: "City", value: personalInfo.city || "Madrid" },
                { label: "Country", value: personalInfo.country || "Spain" },
                { label: "Nationality", value: personalInfo.nationality || "Spain" },
                { label: "Mobile Number", value: personalInfo.mobileNumber || "+34 *** 958-000666" },
                { label: "Date of birth", value: personalInfo.dateOfBirth || "2000-12-17", hasIcon: true },
                { label: "Gender", value: personalInfo.gender || "Male" },
              ])
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

  const handleEdit = useCallback(() => {
    router.push("/edit-profile")
  }, [router])

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const renderField = useCallback(
    (field: ProfileField, index: number) => (
      <View key={index} style={[styles.fieldGroup, index === profileData.length - 1 && { marginBottom: 40 }]}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
        <View style={[styles.fieldValue, { backgroundColor: colors.card }]}>
          {field.hasIcon && (
            <Svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={styles.calendarIcon}>
              {/* Calendar icon placeholder */}
            </Svg>
          )}
          <Text style={[styles.fieldText, { color: colors.text }]}>{field.value}</Text>
        </View>
      </View>
    ),
    [colors, profileData],
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Details</Text>
          <TouchableOpacity onPress={handleEdit} style={styles.editButton} activeOpacity={0.7}>
            <EditIcon />
          </TouchableOpacity>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile Details</Text>
        <TouchableOpacity onPress={handleEdit} style={styles.editButton} activeOpacity={0.7}>
          <EditIcon />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            {profileData[0]?.value} {profileData[1]?.value}
          </Text>
        </View>

        {/* Profile Fields */}
        {profileData.map(renderField)}
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
  editButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  fieldValue: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  fieldText: {
    fontSize: 16,
  },
  calendarIcon: {
    marginRight: 8,
  },
  profilePhotoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
})
