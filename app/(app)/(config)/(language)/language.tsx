"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { useRouter } from "expo-router"
import { useCallback, useState } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path, Polyline } from "react-native-svg"

interface Language {
  id: string
  name: string
}

const LANGUAGES: Language[] = [
  { id: "en", name: "English" },
  { id: "it", name: "Italian" },
  { id: "es", name: "Spanish" },
  { id: "ar", name: "Arabic" },
  { id: "la", name: "Latin" },
]

export default function LanguageScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const [selectedLanguage, setSelectedLanguage] = useState("en")

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const handleLanguageSelect = useCallback((languageId: string) => {
    setSelectedLanguage(languageId)
    // TODO: Save language preference to AsyncStorage
  }, [])

  const renderLanguageItem = useCallback(
    (language: Language, index: number) => (
      <TouchableOpacity
        key={language.id}
        style={[
          styles.languageItem,
          index !== LANGUAGES.length - 1 && styles.languageItemBorder,
          index !== LANGUAGES.length - 1 && { borderBottomColor: colors.border },
        ]}
        onPress={() => handleLanguageSelect(language.id)}
        activeOpacity={0.7}
      >
        <Text style={[styles.languageText, { color: colors.text }]}>{language.name}</Text>
        {selectedLanguage === language.id && (
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Polyline
              points="20 6 9 17 4 12"
              stroke="#4CAF50"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </TouchableOpacity>
    ),
    [colors, selectedLanguage, handleLanguageSelect],
  )

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Language</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Language List */}
        <View style={[styles.languageList, { backgroundColor: colors.background }]}>
          {LANGUAGES.map(renderLanguageItem)}
        </View>
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
  languageList: {},
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  languageItemBorder: {
    borderBottomWidth: 1,
  },
  languageText: {
    fontSize: 16,
  },
})
