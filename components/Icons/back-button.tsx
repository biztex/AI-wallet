"use client"

import { KYCOverlay } from "@/components/ScreenComponent/kyc-overlay"
import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { KYCStorage } from "@/utils/kyc-storage"
import { WalletManager } from "@/utils/wallet-manager"
import * as Clipboard from "expo-clipboard"
import { usePathname, useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import { Alert, Animated, Dimensions, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import Svg, { Circle, Path, Rect } from "react-native-svg"
import { TabAccountIcon } from "./Tab/tab-account-icon"
import { TabAiIcon } from "./Tab/tab-ai-icon"
import { TabGiftcardIcon } from "./Tab/tab-giftcard-icon"
import { TabHomeIcon } from "./Tab/tab-home-icon"
import { TabMarketIcon } from "./Tab/tab-market-icon"

export function BackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]
  const [showMenuModal, setShowMenuModal] = useState(false)
  const [showKYCModal, setShowKYCModal] = useState(false)
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renamingWalletId, setRenamingWalletId] = useState<string | null>(null)
  const [newWalletName, setNewWalletName] = useState("")
  const [wallets, setWallets] = useState<any[]>([])
  const [activeWallet, setActiveWallet] = useState<any>(null)
  const [previousWallet, setPreviousWallet] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState("")
  const [showAppSettings, setShowAppSettings] = useState(false)

  const slideAnim = useRef(new Animated.Value(-Dimensions.get("window").width * 0.75)).current
  const walletModalAnim = useRef(new Animated.Value(Dimensions.get("window").height)).current

  useEffect(() => {
    const loadWallets = async () => {
      const allWallets = await WalletManager.getAllWallets()
      setWallets(allWallets)

      const active = await WalletManager.getActiveWallet()
      if (active) {
        setActiveWallet(active)
        setWalletAddress(active.evmAddress)

        const activeIndex = allWallets.findIndex((w) => w.id === active.id)
        if (activeIndex > 0) {
          setPreviousWallet(allWallets[activeIndex - 1])
        } else if (allWallets.length > 1) {
          setPreviousWallet(allWallets[allWallets.length - 1])
        }
      }
    }
    loadWallets()
  }, [])

  useEffect(() => {
    if (showMenuModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get("window").width * 0.75,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [showMenuModal, slideAnim])

  useEffect(() => {
    if (showWalletModal) {
      Animated.spring(walletModalAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start()
    } else {
      Animated.timing(walletModalAnim, {
        toValue: Dimensions.get("window").height,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [showWalletModal, walletModalAnim])

  const handleOpenMenu = () => {
    setShowMenuModal(true)
  }

  const handleCloseMenu = () => {
    setShowMenuModal(false)
    setShowAppSettings(false)
  }

  const handleMenuNavigation = async (route: string) => {
    setShowMenuModal(false)
    const normalizedRoute = route.replace("/(app)", "")
    const isBillsRoute = route.includes("pay-bill") || normalizedRoute.includes("/pay-bill")

    const currentPath = pathname.replace("/(app)", "")
    const targetPath = normalizedRoute.startsWith("/") ? normalizedRoute : `/${normalizedRoute}`

    if (currentPath === targetPath) {
      return
    }

    if (isBillsRoute) {
      const status = await KYCStorage.getStatus()
      if (status === "approved") {
        router.push(route as any)
      } else {
        setShowKYCModal(true)
      }
      return
    }

    router.push(route as any)
  }

  const handleCloseKYCModal = () => {
    setShowKYCModal(false)
  }

  const handleStartKYC = () => {
    setShowKYCModal(false)
    router.push("/lets-get-started")
  }

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await Clipboard.setStringAsync(walletAddress)
      Alert.alert("Copied!", "Wallet address copied to clipboard")
    }
  }

  const handlePreviousWalletClick = async () => {
    if (previousWallet) {
      await handleWalletSelect(previousWallet.id)
    }
  }

  const handleWalletSelect = async (walletId: string) => {
    const previousActive = activeWallet
    await WalletManager.setActiveWallet(walletId)
    const wallet = wallets.find((w) => w.id === walletId)
    if (wallet) {
      setActiveWallet(wallet)
      setWalletAddress(wallet.evmAddress)
      setPreviousWallet(previousActive)
    }
    setShowWalletModal(false)
  }

  const handleAddWallet = () => {
    setShowWalletModal(false)
    setShowMenuModal(false)
    router.push("/(wallet)/wallet-choice")
  }

  const handleRenameWallet = (walletId: string, currentName: string) => {
    setRenamingWalletId(walletId)
    setNewWalletName(currentName)
    setShowRenameModal(true)
  }

  const handleSaveRename = async () => {
    if (renamingWalletId && newWalletName.trim()) {
      await WalletManager.renameWallet(renamingWalletId, newWalletName.trim())
      const updatedWallets = await WalletManager.getAllWallets()
      setWallets(updatedWallets)

      if (activeWallet?.id === renamingWalletId) {
        setActiveWallet({ ...activeWallet, name: newWalletName.trim() })
      }

      setShowRenameModal(false)
      setRenamingWalletId(null)
      setNewWalletName("")
    }
  }

  const maskAddress = (address: string) => {
    if (!address) return "••••••"
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const getWalletInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "W"
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.menuButton, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={handleOpenMenu}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24">
          <Path
            fill="none"
            stroke={colors.text}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4.5 6.5h15M4.5 12h15m-15 5.5h15"
          />
        </Svg>
      </TouchableOpacity>

      <Modal visible={showMenuModal} transparent animationType="fade" onRequestClose={handleCloseMenu}>
        <View style={styles.modalContainer}>
          <Animated.View
            style={[
              styles.menuModal,
              {
                backgroundColor: colors.background,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={styles.walletHeader}>
              <View style={styles.walletIconsRow}>
                <View style={[styles.walletIconCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.walletIconText}>{getWalletInitial(activeWallet?.name || "Wallet 1")}</Text>
                </View>

                <View style={styles.rightIcons}>
                  {previousWallet && (
                    <TouchableOpacity
                      onPress={handlePreviousWalletClick}
                      style={[styles.previousWalletIcon, { backgroundColor: colors.primary }]}
                    >
                      <Text style={[styles.walletIconText, { opacity: 0.6 }]}>
                        {getWalletInitial(previousWallet.name)}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => setShowWalletModal(true)} style={styles.moreButton}>
                    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <Circle cx="12" cy="6" r="1.5" fill={colors.text} />
                      <Circle cx="12" cy="12" r="1.5" fill={colors.text} />
                      <Circle cx="12" cy="18" r="1.5" fill={colors.text} />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.walletName, { color: colors.primary }]}>{activeWallet?.name || "Wallet 1"}</Text>
              <Text style={[styles.walletBalance, { color: colors.text }]}>$0.00</Text>

              <View style={styles.addressRow}>
                <Text style={[styles.walletAddress, { color: colors.textSecondary }]}>
                  {maskAddress(walletAddress)}
                </Text>
                <TouchableOpacity onPress={handleCopyAddress} style={styles.copyButton}>
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <Rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      stroke={colors.textSecondary}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5"
                      stroke={colors.textSecondary}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuSection}>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleMenuNavigation("/(app)/chat")}
              >
                <TabAiIcon />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleMenuNavigation("/(app)/home")}
              >
                <TabHomeIcon />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Portfolio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleMenuNavigation("/(app)/(actions)/gift-card")}
              >
                <TabGiftcardIcon />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Gift Cards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleMenuNavigation("/(app)/(actions)/pay-bill")}
              >
                <TabMarketIcon />
                <Text style={[styles.menuItemText, { color: colors.text }]}>Bills</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuItem, styles.menuItemLast]}
                onPress={() => handleMenuNavigation("/(app)/(config)/(account)/account")}
              >
                <TabAccountIcon />
                <Text style={[styles.menuItemText, { color: colors.text }]}>App Settings</Text>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={styles.chevron}>
                  <Path
                    d="M9 18L15 12L9 6"
                    stroke={colors.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.bottomButton, { backgroundColor: colors.card }]}
                onPress={() => {
                  Alert.alert("Review", "When the application is launched this will send to the playstore")
                }}
              >
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 2L15.09 8.26 22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    stroke={colors.text}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
                <Text style={[styles.bottomButtonText, { color: colors.text }]}>Review</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.socialIcons}>
              {/* Twitter */}
              <TouchableOpacity style={styles.socialButton}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    fill={colors.textSecondary}
                  />
                </Svg>
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity style={styles.socialButton}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2z"
                    stroke={colors.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"
                    stroke={colors.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M17.5 6.5h.01"
                    stroke={colors.textSecondary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>

              {/* YouTube */}
              <TouchableOpacity style={styles.socialButton}>
                <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                    fill={colors.textSecondary}
                  />
                </Svg>
              </TouchableOpacity>
            </View>
          </Animated.View>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseMenu} />
        </View>
      </Modal>

      <Modal
        visible={showWalletModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <View style={styles.walletModalContainer}>
          <TouchableOpacity
            style={styles.walletModalOverlay}
            activeOpacity={1}
            onPress={() => setShowWalletModal(false)}
          />
          <Animated.View
            style={[
              styles.walletModalContent,
              {
                backgroundColor: colors.background,
                transform: [{ translateY: walletModalAnim }],
              },
            ]}
          >
            <View style={styles.walletModalHeader}>
              <Text style={[styles.walletModalTitle, { color: colors.text }]}>Wallets</Text>
              <TouchableOpacity onPress={handleAddWallet} style={styles.addWalletButton}>
                <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V19M5 12H19"
                    stroke={colors.primary}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            </View>

            <View style={styles.walletsList}>
              <Text style={[styles.recoveryPhraseLabel, { color: colors.textSecondary }]}>Recovery Phrase 1</Text>

              {wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={[
                    styles.walletCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: wallet.id === activeWallet?.id ? colors.primary : colors.border,
                    },
                    wallet.id === activeWallet?.id && styles.walletCardActive,
                  ]}
                  onPress={() => handleWalletSelect(wallet.id)}
                >
                  <View style={styles.walletCardContent}>
                    <View style={[styles.walletCardIcon, { backgroundColor: colors.primary }]}>
                      <Text style={styles.walletCardIconText}>{getWalletInitial(wallet.name)}</Text>
                    </View>
                    <View style={styles.walletCardInfo}>
                      <View style={styles.walletNameRow}>
                        <Text style={[styles.walletCardName, { color: colors.text }]}>{wallet.name}</Text>
                        <TouchableOpacity
                          onPress={() => handleRenameWallet(wallet.id, wallet.name)}
                          style={styles.editWalletButton}
                        >
                          <Svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <Path
                              d="M14.166 2.5a2.121 2.121 0 0 1 3 3L6.25 16.417l-4.167.833.833-4.167L13.833 2.5z"
                              stroke={colors.text}
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.walletCardAddress, { color: colors.textSecondary }]}>
                        {maskAddress(wallet.evmAddress)}
                      </Text>
                    </View>
                    <Text style={[styles.walletCardBalance, { color: colors.text }]}>$0.00</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Rename Wallet Modal */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.renameModalContainer}>
          <TouchableOpacity
            style={styles.renameModalOverlay}
            activeOpacity={1}
            onPress={() => setShowRenameModal(false)}
          />
          <View style={[styles.renameModalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.renameModalTitle, { color: colors.text }]}>Rename Wallet</Text>
            <TextInput
              style={[
                styles.renameInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              value={newWalletName}
              onChangeText={setNewWalletName}
              placeholder="Enter wallet name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              maxLength={20}
            />
            <View style={styles.renameModalButtons}>
              <TouchableOpacity
                style={[styles.renameModalButton, { backgroundColor: colors.background }]}
                onPress={() => {
                  setShowRenameModal(false)
                  setRenamingWalletId(null)
                  setNewWalletName("")
                }}
              >
                <Text style={[styles.renameModalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.renameModalButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveRename}
              >
                <Text style={[styles.renameModalButtonText, { color: "#FFFFFF" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* KYC Modal */}
      <Modal visible={showKYCModal} transparent animationType="fade" onRequestClose={handleCloseKYCModal}>
        <KYCOverlay onStartKYC={handleStartKYC} />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  menuModal: {
    width: "85%",
    height: "100%",
    paddingHorizontal: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  walletHeader: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  walletIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  walletIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  previousWalletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.4,
  },
  moreButton: {
    padding: 4,
  },
  walletIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  walletName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  walletAddress: {
    fontSize: 14,
    fontWeight: "500",
  },
  copyButton: {
    padding: 4,
  },
  menuSection: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  chevron: {
    marginLeft: "auto",
  },
  subMenuSection: {
    paddingLeft: 36,
    marginTop: -8,
    marginBottom: 8,
  },
  subMenuItem: {
    paddingVertical: 12,
  },
  subMenuItemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  bottomActions: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
    marginTop: "auto",
    marginBottom: 16,
  },
  bottomButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    paddingBottom: 20,
  },
  socialButton: {
    padding: 8,
    opacity: 0.7,
  },
  walletModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  walletModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  walletModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    maxHeight: "80%",
  },
  walletModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  walletModalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  addWalletButton: {
    padding: 4,
  },
  walletsList: {
    gap: 12,
  },
  recoveryPhraseLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  walletCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
  },
  walletCardActive: {
    borderWidth: 2,
  },
  walletCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  walletCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  walletCardIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  walletCardInfo: {
    flex: 1,
  },
  walletCardName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  walletCardAddress: {
    fontSize: 13,
    fontWeight: "500",
  },
  walletCardBalance: {
    fontSize: 16,
    fontWeight: "600",
  },
  renameModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  renameModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  renameModalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 24,
  },
  renameModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  renameModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  renameModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  renameModalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  walletNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editWalletButton: {
    padding: 4,
  },
})
