/**
 * Theme configuration for the Pucket app
 * Defines color schemes for light and dark modes
 * Uses semantic naming for better maintainability
 */

import { Platform } from "react-native"

export type ThemeMode = "light" | "dark"

export interface ColorScheme {
  primary: string
  secondary: string
  background: string
  text: string
  textSecondary: string
  border: string
  card: string
  tint: string
  icon: string
  tabIconDefault: string
  tabIconSelected: string
  homeTab: string
  success: string
  error: string
  warning: string
}

export interface FontFamily {
  sans: string
  serif: string
  rounded: string
  mono: string
}

export const FontWeights = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
}

const BRAND_GREEN = "#4CAF50"
const BRAND_YELLOW = "#FFC107"
const BRAND_RED = "#F44336"
const BRAND_WARNING = "#FF9800"

export const Colors: Record<ThemeMode, ColorScheme> = {
  light: {
    primary: BRAND_GREEN,
    secondary: BRAND_YELLOW,
    background: "#FFFFFF",
    text: "#1A1A1A",
    textSecondary: "#666666",
    border: "#E0E0E0",
    card: "#F5F5F5",
    tint: BRAND_GREEN,
    icon: "#666666",
    tabIconDefault: "#999999",
    tabIconSelected: BRAND_GREEN,
    homeTab: BRAND_GREEN,
    success: BRAND_GREEN,
    error: BRAND_RED,
    warning: BRAND_WARNING,
  },
  dark: {
    primary: BRAND_GREEN,
    secondary: BRAND_YELLOW,
    background: "#1A1A1A",
    text: "#FFFFFF",
    textSecondary: "#CCCCCC",
    border: "#333333",
    card: "#2A2A2A",
    tint: BRAND_GREEN,
    icon: "#CCCCCC",
    tabIconDefault: "#666666",
    tabIconSelected: BRAND_GREEN,
    homeTab: "#5eaf16",
    success: "#69F0AE",
    error: "#FF5252",
    warning: "#FFB74D",
  },
}

export const Fonts: FontFamily = Platform.select({
  ios: {
    // SF Pro is the default system font on iOS
    sans: "SF Pro Text",
    serif: "New York",
    rounded: "SF Pro Rounded",
    mono: "SF Mono",
  },
  android: {
    // Roboto is the default system font on Android
    sans: "Roboto",
    serif: "serif",
    rounded: "Roboto",
    mono: "monospace",
  },
  web: {
    // Inter as primary font with SF Pro and Roboto as fallbacks
    sans: "Inter, 'SF Pro Text', Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Roboto, sans-serif",
    mono: "'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "Roboto",
    serif: "serif",
    rounded: "Roboto",
    mono: "monospace",
  },
}) as FontFamily

export const DefaultTextStyle = {
  fontFamily: Fonts.sans,
  fontWeight: FontWeights.medium,
}
