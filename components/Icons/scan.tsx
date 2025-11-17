
import { SvgXml } from "react-native-svg"

const scanXml = `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M1.83398 3.83337V3.00004C1.83398 2.55801 2.00958 2.13409 2.32214 1.82153C2.6347 1.50897 3.05862 1.33337 3.50065 1.33337H5.16732" stroke="#101212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M1.83398 12.1667V13.0001C1.83398 13.4421 2.00958 13.866 2.32214 14.1786C2.6347 14.4912 3.05862 14.6667 3.50065 14.6667H5.16732" stroke="#101212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.834 1.33337H13.5007C13.9427 1.33337 14.3666 1.50897 14.6792 1.82153C14.9917 2.13409 15.1673 2.55801 15.1673 3.00004V3.83337" stroke="#101212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M11.834 14.6667H13.5007C13.9427 14.6667 14.3666 14.4912 14.6792 14.1786C14.9917 13.866 15.1673 13.4421 15.1673 13.0001V12.1667" stroke="#101212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M2.66797 8H14.3346" stroke="#101212" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`

export function ScanIcon() {
  return <SvgXml xml={scanXml} width={17} height={16} />
}