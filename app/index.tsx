"use client"

import { BackgroundSvg } from "@/components/Icons/background"
import { SplashIcon } from "@/components/Icons/splash"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import { StatusBar, StyleSheet, View } from "react-native"

const SPLASH_DURATION = 2000
const DEFAULT_ROUTE = "/onboarding"

export default function SplashScreen() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)

  const navigateToOnboarding = useCallback(() => {
    router.replace(DEFAULT_ROUTE)
  }, [router])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const prepare = async () => {
      try {
        await new Promise((resolve) => {
          timeoutId = setTimeout(resolve, SPLASH_DURATION)
        })

        setIsReady(true)
        navigateToOnboarding()
      } catch (error) {
        console.error("[Pucket] Splash screen error:", error)
        navigateToOnboarding()
      }
    }

    prepare()

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [navigateToOnboarding])

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <BackgroundSvg />
      <View style={styles.iconContainer}>
        <SplashIcon />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  iconContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
})
