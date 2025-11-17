"use client"

import { Colors } from "@/constants/theme"
import { useFontSize } from "@/contexts/font-size-context"
import { useTheme } from "@/contexts/theme-context"
import Slider from "@react-native-community/slider"
import { useRouter } from "expo-router"
import { useCallback } from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

export default function FontSizeScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const { fontSizeScale, setFontSizeScale } = useFontSize()

  const handleBackPress = useCallback(() => {
    router.back()
  }, [router])

  const getFontSizeLabel = (scale: number) => {
    if (scale <= 0.85) return "Small"
    if (scale <= 1.05) return "Medium"
    if (scale <= 1.25) return "Large"
    return "Extra Large"
  }

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Font Size</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.previewCard}>
          <Text style={[styles.previewTitle, { color: colors.text, fontSize: 16 * fontSizeScale }]}>Preview Text</Text>
          <Text style={[styles.previewBody, { color: colors.textSecondary, fontSize: 14 * fontSizeScale }]}>
            This is how your text will appear throughout the app. Adjust the slider below to find your preferred reading
            size.
          </Text>
        </View>

        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <Text style={[styles.sliderLabel, { color: colors.text }]}>Text Size</Text>
            <Text style={[styles.sliderValue, { color: colors.primary }]}>{getFontSizeLabel(fontSizeScale)}</Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={0.8}
            maximumValue={1.4}
            step={0.1}
            value={fontSizeScale}
            onValueChange={setFontSizeScale}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />

          <View style={styles.sliderLabels}>
            <Text style={[styles.sliderLabelText, { color: colors.textSecondary }]}>A</Text>
            <Text style={[styles.sliderLabelText, { color: colors.textSecondary, fontSize: 20 }]}>A</Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.infoText, { color: colors.textSecondary, fontSize: 13 * fontSizeScale }]}>
            Changes will be applied throughout the app. You can adjust this setting anytime from your account settings.
          </Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  previewCard: {
    padding: 20,
    marginBottom: 32,
  },
  previewTitle: {
    fontWeight: "600",
    marginBottom: 12,
  },
  previewBody: {
    lineHeight: 22,
  },
  sliderSection: {
    marginBottom: 32,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    lineHeight: 20,
  },
})
