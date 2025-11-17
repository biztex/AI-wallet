"use client"

import { BackButton } from "@/components/Icons/back-button"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import * as ImagePicker from "expo-image-picker"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useMemo, useState } from "react"
import { Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Path } from "react-native-svg"

const AVAILABLE_BALANCE = 10378.0

const GIFT_CARDS = [
  {
    id: "steam",
    name: "Steam",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20-steam-digital-gift-card-email-delivery-2x-FibKS21b7XWdEwF5XXTKlZcVsVbBdo.webp",
  },
  {
    id: "gold",
    name: "Gold",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luxury-golden-gift-card-imitation-lace-exclusive-51189618-ocOhmBfh9qCh9eHcBUDuNFSyoRkP9O.webp",
  },
  {
    id: "footlocker",
    name: "Foot Locker",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OIP-JYzJh5OQbTe2seYdvAu4dD7qefJlcZ.webp",
  },
  {
    id: "ebay",
    name: "eBay",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ebay-gift-card-NY6oWWaNvFkbyw18DYysLDJARFxhJZ.png",
  },
  {
    id: "vanilla",
    name: "Vanilla",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OIP-QIiE9WeanDdmaRUzxPT4Wn6OaRqWFw.webp",
  },
  {
    id: "sephora",
    name: "Sephora",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/223-2232629_sephora-gift-card-png-J4cA8ljfREpBUmGuDOsQNS9GbomCqv.jpg",
  },
  {
    id: "nike",
    name: "Nike",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Nike-gift-card_1024x1024-AP2xij2PEHMLkfNMX464qNnZ6Lqaqq.webp",
  },
  {
    id: "amex",
    name: "American Express",
    logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/american-express-payment-credit-card-membership-rewards-money-png-favpng-jWa5tUkv28HGWjQiw4FTjvcmE-eK6BPu0O3fyxzSsI8rq3XHYc9w6IUu.jpg",
  },
]

type SubCategory = {
  id: string
  label: string
  flag: string
  minPrice: number
  maxPrice: number
  rate: number // NGN per USD
}

const SUB_CATEGORIES: SubCategory[] = [
  { id: "usa-20-49", label: "USA ($20 - $49)", flag: "🇺🇸", minPrice: 20, maxPrice: 49, rate: 790 },
  { id: "usa-50-500", label: "USA ($50 - $500)", flag: "🇺🇸", minPrice: 50, maxPrice: 500, rate: 790 },
  { id: "usa-ecode-20-200", label: "USA Ecode ($20 - $200)", flag: "🇺🇸", minPrice: 20, maxPrice: 200, rate: 790 },
  { id: "uk-20-500", label: "UK (£20 - £500)", flag: "🇬🇧", minPrice: 20, maxPrice: 500, rate: 1050 },
  { id: "uk-ecode-20-500", label: "UK Ecode (£20 - £500)", flag: "🇬🇧", minPrice: 20, maxPrice: 500, rate: 1050 },
]

export default function GiftCardScreen() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const ENABLED_BUTTON_GRADIENT: [string, string] = ["#84C718", "#09791A"]

  const [giftCardSearch, setGiftCardSearch] = useState("")
  const [selectedGiftCard, setSelectedGiftCard] = useState<(typeof GIFT_CARDS)[number] | null>(null)

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showSubCategoryDropdown, setShowSubCategoryDropdown] = useState(false)
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory>(SUB_CATEGORIES[0])
  const [amount, setAmount] = useState("")
  const [comments, setComments] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const [showGiftCardVerificationModal, setShowGiftCardVerificationModal] = useState(false)
  const [showGiftCardSuccessModal, setShowGiftCardSuccessModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const amountToReceive = amount ? (Number.parseFloat(amount) * selectedSubCategory.rate).toFixed(2) : "0"

  const handleGiftCardSelect = useCallback((card: (typeof GIFT_CARDS)[number]) => {
    setSelectedGiftCard(card)
    setShowDetailModal(true)
    // Reset form
    setAmount("")
    setComments("")
    setUploadedImage(null)
    setSelectedSubCategory(SUB_CATEGORIES[0])
  }, [])

  const handleImageUpload = useCallback(async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setUploadedImage(result.assets[0].uri)
    }
  }, [])

  const handleTradeCard = useCallback(() => {
    if (!amount || Number.parseFloat(amount) < selectedSubCategory.minPrice) {
      alert(`Minimum amount is $${selectedSubCategory.minPrice}`)
      return
    }
    if (Number.parseFloat(amount) > selectedSubCategory.maxPrice) {
      alert(`Maximum amount is $${selectedSubCategory.maxPrice}`)
      return
    }

    setShowDetailModal(false)
    setIsProcessing(true)
    setTimeout(() => {
      setShowGiftCardVerificationModal(false)
      setShowGiftCardSuccessModal(true)
      setIsProcessing(false)
    }, 1000)
  }, [amount, selectedSubCategory])

  const handleGiftCardConfirm = useCallback(() => {
    setIsProcessing(true)
    setTimeout(() => {
      setShowGiftCardVerificationModal(false)
      setShowGiftCardSuccessModal(true)
      setIsProcessing(false)
    }, 1000)
  }, [])

  const handleBackToHome = useCallback(() => {
    router.push("/home")
  }, [router])

  const filteredGiftCards = useMemo(
    () => GIFT_CARDS.filter((card) => card.name.toLowerCase().includes(giftCardSearch.toLowerCase())),
    [giftCardSearch],
  )

  const isTradeButtonEnabled = amount !== "" && Number.parseFloat(amount) >= 20

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <BackButton />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Gift Card</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.47715 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                stroke={colors.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search gift cards"
              placeholderTextColor={colors.textSecondary}
              value={giftCardSearch}
              onChangeText={setGiftCardSearch}
            />
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke={colors.textSecondary}
                strokeWidth={2}
              />
              <Path d="M12 16V12M12 8H12.01" stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              All giftcard transactions will appear on your naira wallet
            </Text>
          </View>

          <View style={styles.giftCardGrid}>
            {filteredGiftCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[styles.giftCardItem, { backgroundColor: colors.card }]}
                activeOpacity={0.7}
                onPress={() => handleGiftCardSelect(card)}
              >
                <View style={styles.giftCardLogo}>
                  <Image source={{ uri: card.logo }} style={{ width: 90, height: 90 }} resizeMode="contain" />
                  <Text style={[styles.giftCardName, { color: colors.text }]}>{card.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.detailModalOverlay}>
          <View style={[styles.detailModalContent, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.detailModalHeader}>
              <TouchableOpacity onPress={() => setShowDetailModal(false)} style={styles.backButton}>
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
              <Text style={[styles.detailModalTitle, { color: colors.text }]}>Gift Cards</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.detailScrollView} showsVerticalScrollIndicator={false}>
              {/* Gift Card Image */}
              <View style={styles.cardImageContainer}>
                <View style={[styles.cardImageWrapper, { backgroundColor: colors.card }]}>
                  <Image source={{ uri: selectedGiftCard?.logo }} style={styles.cardImage} resizeMode="contain" />
                </View>
              </View>

              {/* Sub Category Dropdown */}
              <View style={styles.formSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Sub Category</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setShowSubCategoryDropdown(true)}
                >
                  <Text style={styles.flagEmoji}>{selectedSubCategory.flag}</Text>
                  <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{selectedSubCategory.label}</Text>
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M6 9L12 15L18 9"
                      stroke={colors.text}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>

                {/* Info Message */}
                <View style={[styles.warningBox, { backgroundColor: "#FF006E20", borderColor: "#FF006E" }]}>
                  <View style={styles.warningDot} />
                  <Text style={[styles.warningText, { color: "#FF006E" }]}>
                    Only physical USA {selectedGiftCard?.name} gift cards are accepted in this trade. The average
                    processing time is 3 to 10 minutes.
                  </Text>
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.formSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Amount</Text>
                <View
                  style={[styles.amountInputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <TextInput
                    style={[styles.amountInput, { color: colors.text }]}
                    placeholder="0.0"
                    placeholderTextColor={colors.textSecondary}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.conversionRate, { color: colors.textSecondary }]}>
                    1USD= {selectedSubCategory.rate} NGN
                  </Text>
                </View>
                <Text style={[styles.minimumAmountText, { color: colors.textSecondary }]}>Minimum is 20</Text>
                <Text style={[styles.receiveAmount, { color: colors.textSecondary }]}>
                  Amount to receive <Text style={{ color: colors.text }}>₦{amountToReceive}</Text>
                </Text>
              </View>

              {/* Comments */}
              <View style={styles.formSection}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Comments</Text>
                <TextInput
                  style={[
                    styles.commentsInput,
                    { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="Leave comment here"
                  placeholderTextColor={colors.textSecondary}
                  value={comments}
                  onChangeText={setComments}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Upload Section */}
              <View style={styles.formSection}>
                <TouchableOpacity
                  style={[styles.uploadContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={handleImageUpload}
                >
                  {uploadedImage ? (
                    <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} resizeMode="cover" />
                  ) : (
                    <>
                      <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C5 19.4772 5.46957 19 6 19C6.53043 19 7.03914 19.4696 7 20C7 20.5304 7.46957 21 8 21H16C16.5304 21 17.0391 20.5304 17 20C16.5609 19.4696 16.134 19 16 19C15.4696 19 15 19.4772 15 20V15"
                          stroke={colors.textSecondary}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M17 8L12 3L7 8"
                          stroke={colors.textSecondary}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <Path
                          d="M12 3V15"
                          stroke={colors.textSecondary}
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                      <Text style={[styles.uploadText, { color: colors.text }]}>Upload your gift card</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Trade Button */}
              <TouchableOpacity
                onPress={handleTradeCard}
                activeOpacity={0.8}
                disabled={!isTradeButtonEnabled}
                style={[styles.tradeButtonContainer, { opacity: isTradeButtonEnabled ? 1 : 0.5 }]}
              >
                <LinearGradient
                  colors={["#84C718", "#09791A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tradeButton}
                >
                  <Text style={styles.tradeButtonText}>Trade Card</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSubCategoryDropdown} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSubCategoryDropdown(false)}
        >
          <View style={[styles.dropdownModalContent, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowSubCategoryDropdown(false)}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M18 6L6 18M6 6L18 18"
                  stroke={colors.text}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>

            <ScrollView style={styles.dropdownScroll}>
              {SUB_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.dropdownOption,
                    { borderBottomColor: colors.border },
                    selectedSubCategory.id === category.id && { backgroundColor: colors.primary + "20" },
                  ]}
                  onPress={() => {
                    setSelectedSubCategory(category)
                    setShowSubCategoryDropdown(false)
                  }}
                >
                  <Text style={styles.flagEmoji}>{category.flag}</Text>
                  <Text style={[styles.dropdownOptionText, { color: colors.text }]}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showGiftCardVerificationModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalAmount, { color: colors.text }]}>₦100.00</Text>
            <View style={styles.verificationDetails}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Gift Card</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{selectedGiftCard?.name ?? "--"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Delivery</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>Email - Instantly</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>₦100.00</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleGiftCardConfirm} disabled={isProcessing} activeOpacity={0.8}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmButtonText}>{isProcessing ? "PROCESSING..." : "CONFIRM"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showGiftCardSuccessModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconInner}>
                  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
                    <Path
                      d="M10 20L17 27L30 13"
                      stroke="#FFFFFF"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              </View>
            </View>
            <Text style={[styles.successAmount, { color: colors.text }]}>₦{amountToReceive}</Text>
            <Text style={[styles.successMessage, { color: colors.text }]}>Gift card trade successful.</Text>
            <Text style={[styles.transactionId, { color: colors.textSecondary }]}>Transaction ID: #26247878</Text>
            <TouchableOpacity onPress={handleBackToHome} activeOpacity={0.8}>
              <LinearGradient
                colors={["#84C718", "#09791A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>BACK TO HOME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  giftCardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  giftCardItem: {
    width: "48%",
    aspectRatio: 1.3,
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  giftCardLogo: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  giftCardName: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  detailModalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  detailModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  detailScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  cardImageWrapper: {
    width: 200,
    height: 130,
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  formSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  flagEmoji: {
    fontSize: 20,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  warningBox: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  warningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF006E",
    marginTop: 4,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  conversionRate: {
    fontSize: 13,
  },
  minimumAmountText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  receiveAmount: {
    fontSize: 13,
    marginTop: 8,
  },
  commentsInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 100,
  },
  uploadContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  uploadText: {
    fontSize: 15,
    fontWeight: "500",
  },
  tradeButtonContainer: {
    marginBottom: 40,
  },
  tradeButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  tradeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownModalContent: {
    width: "100%",
    maxWidth: 400,
    maxHeight: "60%",
    borderRadius: 16,
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 12,
  },
  dropdownScroll: {
    maxHeight: 400,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "70%",
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  verificationDetails: {
    gap: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  successIconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C8E6C9",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  successAmount: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  transactionId: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 24,
  },
  homeButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
})
