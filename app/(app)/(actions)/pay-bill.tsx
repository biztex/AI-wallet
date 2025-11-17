"use client"

import { BackButton } from "@/components/Icons/back-button"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { useRouter } from "expo-router"
import { useCallback } from "react"
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import Svg, { G, Path, Rect } from "react-native-svg"

const SERVICES = [
  { id: "airtime", name: "Airtime", route: "/pay-bill-airtime" },
  { id: "data", name: "Data", route: "/pay-bill-data" },
  { id: "betting", name: "Bet", route: "/pay-bill-betting" },
  { id: "electricity", name: "Electricity", route: "/pay-bill-electricity" },
  { id: "cable", name: "TV", route: "/pay-bill-tv" },
]

const renderServiceIcon = (serviceId: string, iconColor: string) => {
  switch (serviceId) {
    case "airtime":
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <G fill={iconColor}>
            <Path d="M22 12A10 10 0 0 0 12 2v2a8 8 0 0 1 7.391 4.938A8 8 0 0 1 20 12zM2 10V5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H6a8 8 0 0 0 8 8v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5C7.373 22 2 16.627 2 10" />
            <Path d="M17.543 9.704A6 6 0 0 1 18 12h-1.8A4.2 4.2 0 0 0 12 7.8V6a6 6 0 0 1 5.543 3.704" />
          </G>
        </Svg>
      )
    case "data":
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Path fill={iconColor} d="M3 21h3v-3H3m5 3h3v-7H8m5 7h3V9h-3m5 12h3V3h-3z" />
        </Svg>
      )
    case "betting":
      return (
        <Svg width={28} height={28} viewBox="0 0 14 14">
          <G fill="none" stroke={iconColor} strokeLinecap="round" strokeWidth={1.2}>
            <Path
              strokeLinejoin="round"
              d="M7.08 11.827a1.55 1.55 0 0 0 1.361 1.364c.529.059 1.072.11 1.625.11c.554 0 1.096-.051 1.625-.11a1.55 1.55 0 0 0 1.361-1.364c.056-.526.104-1.066.104-1.616s-.048-1.09-.104-1.616a1.55 1.55 0 0 0-1.36-1.364a15 15 0 0 0-1.626-.11c-.553 0-1.096.051-1.625.11a1.55 1.55 0 0 0-1.36 1.364a15 15 0 0 0-.104 1.616c0 .55.047 1.09.103 1.616"
            />
            <Path d="M8.954 10.852v.48m2.178-2.461v.48" />
            <Path
              strokeLinejoin="round"
              d="M9.425 5.083c-.33-1.234-.782-2.398-1.196-3.519A1.04 1.04 0 0 0 7.123.897c-.964.123-1.974.232-2.97.499c-.996.266-1.924.677-2.82 1.052A1.04 1.04 0 0 0 .707 3.58c.201 1.177.393 2.411.723 3.645s.782 2.398 1.196 3.518a1.04 1.04 0 0 0 1.107.668c.472-.06.955-.117 1.443-.191m6.672-6.081c.135-.694.246-1.38.361-2.048a1.04 1.04 0 0 0-.625-1.131c-.465-.195-.94-.4-1.427-.589"
            />
            <Path strokeLinejoin="round" d="M6.971 5.727L4.93 4.247L3.902 6.55L5.32 7.597" />
          </G>
        </Svg>
      )
    case "electricity":
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <Path
            fill={iconColor}
            d="M11 21h-1l1-7H7.5c-.88 0-.33-.75-.31-.78C8.48 10.94 10.42 7.54 13.01 3h1l-1 7h3.51c.4 0 .62.19.4.66C12.97 17.55 11 21 11 21"
          />
        </Svg>
      )
    case "cable":
      return (
        <Svg width={28} height={28} viewBox="0 0 24 24">
          <G fill="none" stroke={iconColor} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
            <Path d="m17 2l-5 5l-5-5" />
            <Rect width={20} height={15} x={2} y={7} rx={2} />
          </G>
        </Svg>
      )
    default:
      return null
  }
}

export default function PayBillScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const handleServiceSelect = useCallback(
    (route: string) => {
      router.push(route as any)
    },
    [router],
  )

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pay Bills</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Select the service to pay for</Text>

          <View style={styles.serviceGrid}>
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  {
                    backgroundColor: colors.card,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  },
                ]}
                onPress={() => handleServiceSelect(service.route)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  {renderServiceIcon(service.id, colors.primary)}
                </View>
                <Text style={[styles.serviceName, { color: colors.text }]}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
    fontWeight: "500",
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  serviceCard: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
})
