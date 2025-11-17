"use client"

import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Path } from "react-native-svg"

interface FAQQuestion {
  q: string
  a: string
}

interface FAQCategory {
  id: string
  title: string
  icon: "rocket" | "transaction" | "security" | "payment"
  questions: FAQQuestion[]
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: "1",
    title: "Getting Started",
    icon: "rocket",
    questions: [
      { q: "How do I create an account?", a: "getting-started" },
      { q: "How to verify my identity?", a: "verification" },
      { q: "Setting up 2FA security", a: "2fa-setup" },
    ],
  },
  {
    id: "2",
    title: "Transactions",
    icon: "transaction",
    questions: [
      { q: "How to send Bitcoin?", a: "send-bitcoin" },
      { q: "How to receive Bitcoin?", a: "receive-bitcoin" },
      { q: "Transaction fees explained", a: "fees" },
    ],
  },
  {
    id: "3",
    title: "Account & Security",
    icon: "security",
    questions: [
      { q: "How to change my password?", a: "change-password" },
      { q: "Enable two-factor authentication", a: "enable-2fa" },
      { q: "Forgot my password", a: "forgot-password" },
    ],
  },
  {
    id: "4",
    title: "Payments",
    icon: "payment",
    questions: [
      { q: "How to top up my account?", a: "top-up" },
      { q: "How to withdraw funds?", a: "withdraw" },
      { q: "Payment methods available", a: "payment-methods" },
    ],
  },
]

const SUPPORT_EMAIL = "support@pucket.com"

export default function HelpScreen() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_CATEGORIES

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      questions: category.questions.filter((q) => q.q.toLowerCase().includes(searchQuery.toLowerCase())),
    })).filter((category) => category.questions.length > 0)
  }, [searchQuery])

  const handleBackPress = useCallback(() => {
    router.push("/account")
  }, [router])

  const renderCategoryIcon = useCallback(
    (icon: FAQCategory["icon"]) => {
      const iconProps = {
        stroke: colors.primary,
        strokeWidth: 2,
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
      }

      switch (icon) {
        case "rocket":
          return <Path d="M12 2L2 7L12 12L22 7L12 2Z M2 17L12 22L22 17 M2 12L12 17L22 12" {...iconProps} />
        case "transaction":
          return (
            <>
              <Path d="M7 16L3 12L7 8" {...iconProps} />
              <Path d="M17 8L21 12L17 16" {...iconProps} />
              <Path d="M3 12H21" {...iconProps} />
            </>
          )
        case "security":
          return <Path d="M12 2L4 6V12C4 16.42 7.03 20.57 12 22C16.97 20.57 20 16.42 20 12V6L12 2Z" {...iconProps} />
        case "payment":
          return (
            <>
              <Path
                d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
                {...iconProps}
              />
              <Path d="M1 10H23" {...iconProps} />
            </>
          )
      }
    },
    [colors.primary],
  )

  const renderQuestion = useCallback(
    (item: FAQQuestion, index: number, isLast: boolean) => (
      <TouchableOpacity
        key={index}
        style={[styles.questionItem, { borderBottomColor: colors.border }, isLast && styles.lastQuestionItem]}
        activeOpacity={0.7}
        onPress={() => Alert.alert("Coming Soon", "Information about how things will be managed is still missing")}
      >
        <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
          {item.q}
        </Text>
        <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
          <Path
            d="M7.5 15L12.5 10L7.5 5"
            stroke={colors.textSecondary}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>
    ),
    [colors],
  )

  const renderCategory = useCallback(
    ({ item }: { item: FAQCategory }) => (
      <View style={[styles.categoryCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={[styles.categoryHeader, { backgroundColor: colors.card }]}>
          <View style={styles.categoryIconContainer}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              {renderCategoryIcon(item.icon)}
            </Svg>
          </View>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>{item.title}</Text>
        </View>
        <View style={[styles.questionsContainer, { backgroundColor: colors.background }]}>
          {item.questions.map((question, index) =>
            renderQuestion(question, index, index === item.questions.length - 1),
          )}
        </View>
      </View>
    ),
    [colors, renderCategoryIcon, renderQuestion],
  )

  const keyExtractor = useCallback((item: FAQCategory) => item.id, [])

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
          <Svg width={20} height={20} viewBox="0 0 20 20" fill="none" style={styles.searchIcon}>
            <Circle cx={9} cy={9} r={7} stroke={colors.textSecondary} strokeWidth={2} />
            <Path d="M14 14L18 18" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for help..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Coming Soon", "Information about how things will be managed is still missing")}
          >
            <View style={styles.quickActionIcon}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>Chat Support</Text>
            <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>Get instant help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => Alert.alert("Coming Soon", "Information about how things will be managed is still missing")}
          >
            <View style={styles.quickActionIcon}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M22 6L12 13L2 6"
                  stroke={colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={[styles.quickActionTitle, { color: colors.text }]}>Email Us</Text>
            <Text style={[styles.quickActionDescription, { color: colors.textSecondary }]}>{SUPPORT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ Categories */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Contact Section */}
        <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.contactTitle, { color: colors.text }]}>Still need help?</Text>
          <Text style={[styles.contactDescription, { color: colors.textSecondary }]}>
            Our support team is available 24/7 to assist you with any questions or concerns.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => Alert.alert("Coming Soon", "Information about how things will be managed is still missing")}
          >
            <LinearGradient
              colors={["#84C718", "#09791A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactButton}
            >
              <Text style={styles.contactButtonText}>CONTACT SUPPORT</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  quickActionsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  categoriesList: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  questionsContainer: {},
  questionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  lastQuestionItem: {
    borderBottomWidth: 0,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    marginRight: 12,
  },
  contactCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 100,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  contactButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
