import { BSwapIcon } from "@/components/Icons/bride-swap"
import { BuyIcon } from "@/components/Icons/home/buy-icon"
import { ReceiveIcon } from "@/components/Icons/home/receive-icon"
import { SendIcon } from "@/components/Icons/home/send-icon"
import { SellIcon } from "@/components/Icons/sell-icon"
import { SwapIcon } from "@/components/Icons/swap"
import type { ComponentType } from "react"

export interface OptionConfig {
  icon: ComponentType
  title: string
  description: string
  route: string
}

export const WALLET_OPTIONS: OptionConfig[] = [
  {
    icon: SendIcon,
    title: "Send",
    description: "Transfer cryptocurrency to another wallet address",
    route: "/send",
  },
  {
    icon: ReceiveIcon,
    title: "Receive",
    description: "Get cryptocurrency from another wallet",
    route: "/receive",
  },
  {
    icon: BSwapIcon,
    title: "Bridge",
    description: "Transfer assets between different blockchains",
    route: "/bridge",
  },
  {
    icon: SwapIcon,
    title: "Swap",
    description: "Exchange one cryptocurrency for another",
    route: "/swap",
  },
]

export const EXCHANGE_OPTIONS: OptionConfig[] = [
  {
    icon: BuyIcon,
    title: "Buy Crypto",
    description: "Purchase cryptocurrency with fiat currency",
    route: "/buy-bitcoin",
  },
  {
    icon: SellIcon,
    title: "Sell Crypto",
    description: "Convert cryptocurrency to fiat currency",
    route: "/sell-bitcoin",
  },
]
