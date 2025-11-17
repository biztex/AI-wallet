
import { SvgXml } from "react-native-svg"

const moneyXml = `<svg width="18" height="13" viewBox="0 0 18 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H6V13H0V0ZM12 0H18V13H12V0Z" fill="#0A6A30"/>
</svg>

`

export function MoneyIcon() {
  return <SvgXml xml={moneyXml} width={18} height={13} />
}