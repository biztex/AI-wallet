"use client"

import { Buffer } from "buffer"
import "react-native-get-random-values"
global.Buffer = Buffer

import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from "@react-navigation/native"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { Text, TextInput } from "react-native"
import "react-native-reanimated"

import { DefaultTextStyle } from "@/constants/theme"
import { FontSizeProvider, useFontSize } from "@/contexts/font-size-context"
import { ThemeProvider, useTheme } from "@/contexts/theme-context"

SplashScreen.preventAutoHideAsync()

// Parche global temprano: envolver createElement y jsx runtimes para Text/TextInput
try {
  const React = require("react")
  const { Text: RNText, TextInput: RNTextInput, StyleSheet } = require("react-native")
  const originalCreateElement = React.createElement
  const jsxRuntime = (() => {
    try { return require("react/jsx-runtime") } catch { return null }
  })()
  const jsxDevRuntime = (() => {
    try { return require("react/jsx-dev-runtime") } catch { return null }
  })()

  function scaleStyleIfNeeded(style: any) {
    const flat = StyleSheet.flatten(style)
    if (flat && typeof flat === "object") {
      const scale = (global as any).__PUCKET_FONT_SCALE || 1
      const next = { ...flat }
      if (typeof next.fontSize === "number") {
        next.fontSize = Math.round(next.fontSize * scale)
      }
      return next
    }
    return style
  }
  if (!(originalCreateElement as any).__pucketFontWrapped) {
    const wrappedCreateElement = function (type: any, props: any, ...children: any[]) {
      if (type === RNText || type === RNTextInput) {
        const nextProps = { ...props }
        if (nextProps && nextProps.style) {
          const flat = StyleSheet.flatten(nextProps.style)
          if (flat && typeof flat === "object") {
            const scale = (global as any).__PUCKET_FONT_SCALE || 1
            const next = { ...flat }
            if (typeof next.fontSize === "number") {
              next.fontSize = Math.round(next.fontSize * scale)
            }
            nextProps.style = next
          }
        }
        return originalCreateElement(type, nextProps, ...children)
      }
      return originalCreateElement(type, props, ...children)
    }
    ;(wrappedCreateElement as any).__pucketFontWrapped = true
    ;(React as any).createElement = wrappedCreateElement
  }

  // Envolver nuevo transform JSX (react/jsx-runtime)
  if (jsxRuntime && !(jsxRuntime.jsx as any)?.__pucketFontWrapped) {
    const origJsx = jsxRuntime.jsx
    const origJsxs = jsxRuntime.jsxs
    const wrap = (orig: any) => (type: any, props: any, key?: any) => {
      if (type === RNText || type === RNTextInput) {
        const nextProps = { ...props }
        if (nextProps && nextProps.style) {
          nextProps.style = scaleStyleIfNeeded(nextProps.style)
        }
        return orig(type, nextProps, key)
      }
      return orig(type, props, key)
    }
    if (origJsx) jsxRuntime.jsx = wrap(origJsx)
    if (origJsxs) jsxRuntime.jsxs = wrap(origJsxs)
    try { (jsxRuntime.jsx as any).__pucketFontWrapped = true } catch {}
  }

  // Envolver jsx-dev-runtime para modo dev
  if (jsxDevRuntime && !(jsxDevRuntime.jsxDEV as any)?.__pucketFontWrapped) {
    const origJsxDev = jsxDevRuntime.jsxDEV
    if (origJsxDev) {
      jsxDevRuntime.jsxDEV = (type: any, props: any, key?: any, isStatic?: any, source?: any, self?: any) => {
        if (type === RNText || type === RNTextInput) {
          const nextProps = { ...props }
          if (nextProps && nextProps.style) {
            nextProps.style = scaleStyleIfNeeded(nextProps.style)
          }
          return origJsxDev(type, nextProps, key, isStatic, source, self)
        }
        return origJsxDev(type, props, key, isStatic, source, self)
      }
      try { (jsxDevRuntime.jsxDEV as any).__pucketFontWrapped = true } catch {}
    }
  }
} catch {}

function FontSizeApplier() {
  const { fontSizeScale } = useFontSize()

  useEffect(() => {
    // Exponer el scale actual de manera global para que el wrapper lo lea siempre actualizado
    ;(global as any).__PUCKET_FONT_SCALE = fontSizeScale

    const baseFontSize = (DefaultTextStyle as any).fontSize || 16
    const scaledStyle = {
      ...DefaultTextStyle,
      fontSize: Math.round(baseFontSize * fontSizeScale),
    }

    // 1) Estilo por defecto escalado (para textos sin fontSize explícito)
    ;(Text as any).defaultProps = (Text as any).defaultProps || {}
    ;(Text as any).defaultProps.style = scaledStyle
    ;(TextInput as any).defaultProps = (TextInput as any).defaultProps || {}
    ;(TextInput as any).defaultProps.style = scaledStyle

    // 2) Envoltorio global para escalar cualquier fontSize explícito en estilos
    const React = require("react")
    const { StyleSheet } = require("react-native")
    const originalCreateElement = React.createElement

    function scaleFontInStyle(style: any): any {
      if (!style) return style
      // a) Resolver StyleSheet ids y arrays a un objeto plano
      const flat = StyleSheet.flatten(style)
      if (!flat || typeof flat !== "object") return style

      // b) Escalar usando el valor global actual, no el del closure
      const currentScale = (global as any).__PUCKET_FONT_SCALE || 1
      const next = { ...flat }
      if (typeof next.fontSize === "number") {
        next.fontSize = Math.round(next.fontSize * currentScale)
      }
      return next
    }

    // Evitar múltiples envolturas: marcamos un flag en React.createElement
    if (!(originalCreateElement as any).__pucketFontWrapped) {
      const wrappedCreateElement = function (type: any, props: any, ...children: any[]) {
        if (type === Text || type === TextInput) {
          const nextProps = { ...props }
          if (nextProps && nextProps.style) {
            nextProps.style = scaleFontInStyle(nextProps.style)
          }
          return originalCreateElement(type, nextProps, ...children)
        }
        return originalCreateElement(type, props, ...children)
      }
      ;(wrappedCreateElement as any).__pucketFontWrapped = true
      ;(React as any).createElement = wrappedCreateElement
    }
  }, [fontSizeScale])

  return null
}
;(Text as any).defaultProps = (Text as any).defaultProps || {}
;(Text as any).defaultProps.style = DefaultTextStyle
;(TextInput as any).defaultProps = (TextInput as any).defaultProps || {}
;(TextInput as any).defaultProps.style = DefaultTextStyle

export const unstable_settings = {
  anchor: "(app)",
}

function RootLayoutContent() {
  const { resolvedTheme } = useTheme()
  const { fontSizeScale } = useFontSize()

  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <NavigationThemeProvider
      value={resolvedTheme === "dark" ? DarkTheme : DefaultTheme}
      key={`nav-${resolvedTheme}-${fontSizeScale}`}
    >
      <FontSizeApplier />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
        }}
        key={`stack-${fontSizeScale}`}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="unlock-wallet" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(wallet)" />
        <Stack.Screen name="(process)" />
      </Stack>
      <StatusBar style={resolvedTheme === "dark" ? "light" : "dark"} translucent backgroundColor="transparent" />
    </NavigationThemeProvider>
  )
}

export default function RootLayout() {
  return (
    <FontSizeProvider>
      <ThemeProvider>
        <RootLayoutContent />
      </ThemeProvider>
    </FontSizeProvider>
  )
}
