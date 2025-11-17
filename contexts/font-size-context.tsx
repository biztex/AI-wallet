"use client"

import type React from "react"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

type FontSizeScale = number // 0.8 to 1.4

interface FontSizeContextType {
  fontSizeScale: FontSizeScale
  setFontSizeScale: (scale: FontSizeScale) => void
  scaleFontSize: (baseFontSize: number) => number
}

const FONT_SIZE_STORAGE_KEY = "fontSizeScale"
const DEFAULT_FONT_SIZE_SCALE = 1.0

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeScale, setFontSizeScaleState] = useState<FontSizeScale>(DEFAULT_FONT_SIZE_SCALE)

  const loadFontSizeScale = useCallback(async () => {
    try {
      const savedScale = await AsyncStorage.getItem(FONT_SIZE_STORAGE_KEY)
      if (savedScale) {
        const scale = Number.parseFloat(savedScale)
        if (!isNaN(scale) && scale >= 0.8 && scale <= 1.4) {
          setFontSizeScaleState(scale)
        }
      }
    } catch (error) {
      console.error("[Pucket] Error loading font size scale:", error)
    }
  }, [])

  const setFontSizeScale = useCallback(async (newScale: FontSizeScale) => {
    try {
      await AsyncStorage.setItem(FONT_SIZE_STORAGE_KEY, newScale.toString())
      setFontSizeScaleState(newScale)
    } catch (error) {
      console.error("[Pucket] Error saving font size scale:", error)
      setFontSizeScaleState(newScale)
    }
  }, [])

  const scaleFontSize = useCallback(
    (baseFontSize: number) => {
      return Math.round(baseFontSize * fontSizeScale)
    },
    [fontSizeScale],
  )

  useEffect(() => {
    loadFontSizeScale()
  }, [loadFontSizeScale])

  const contextValue = useMemo(
    () => ({ fontSizeScale, setFontSizeScale, scaleFontSize }),
    [fontSizeScale, setFontSizeScale, scaleFontSize],
  )

  return <FontSizeContext.Provider value={contextValue}>{children}</FontSizeContext.Provider>
}

export function useFontSize() {
  const context = useContext(FontSizeContext)
  if (context === undefined) {
    throw new Error("useFontSize must be used within a FontSizeProvider")
  }
  return context
}
