import { Colors } from "@/constants/theme"
import { useTheme } from "@/contexts/theme-context"
import { SvgXml } from "react-native-svg"

export function SwapIcon() {
  const { resolvedTheme } = useTheme()
  const colors = Colors[resolvedTheme]

  const Xml = `
<svg width="42" height="42" viewBox="0 0 42 42" fill="none">
<circle cx="21" cy="21" r="20.5" stroke="${colors.border}"/>
<path d="M13.5 25.1667L17.6667 29.3334M17.6667 29.3334L21.8333 25.1667M17.6667 29.3334L17.6667 16.8334" stroke="${colors.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20.167 16.8333L24.3337 12.6666M24.3337 12.6666L28.5003 16.8333M24.3337 12.6666L24.3337 25.1666" stroke="${colors.text}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

  return <SvgXml xml={Xml} width={42} height={42} />
}
