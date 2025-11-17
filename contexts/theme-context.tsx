"use client"

import type React from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useColorScheme as useSystemColorScheme } from "react-native"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = "theme"

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme()
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(systemColorScheme || "light")

  const loadTheme = useCallback(async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
        setThemeState(savedTheme as Theme)
      }
    } catch (error) {
      console.error("[Pucket] Error loading theme:", error)
    }
  }, [])

  const setTheme = useCallback(async (newTheme: Theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme)
      setThemeState(newTheme)
    } catch (error) {
      console.error("[Pucket] Error saving theme:", error)
      setThemeState(newTheme)
    }
  }, [])

  useEffect(() => {
    loadTheme()
  }, [loadTheme])

  useEffect(() => {
    const newResolvedTheme = theme === "system" ? systemColorScheme || "light" : (theme as ResolvedTheme)
    setResolvedTheme(newResolvedTheme)
  }, [theme, systemColorScheme])

  const contextValue = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme])

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
