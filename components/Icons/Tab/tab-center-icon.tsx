
import { SvgXml } from "react-native-svg"

const centerXml = `<svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="25" cy="25" r="25" fill="url(#paint0_linear_24_4865)"/>
<path d="M34.375 22.0938V20.2188C34.375 19.4366 34.0647 18.6861 33.5114 18.1328C32.9581 17.5795 32.2076 17.2692 31.4254 17.2692H28.4375M28.4375 33.375H31.4254C32.2076 33.375 32.9581 33.0647 33.5114 32.5114C34.0647 31.9581 34.375 31.2076 34.375 30.4254V28.5504M15.625 28.5504V30.4254C15.625 31.2076 15.9353 31.9581 16.4886 32.5114C17.0419 33.0647 17.7924 33.375 18.5746 33.375H22.0625M22.0625 17.2692H18.5746C17.7924 17.2692 17.0419 17.5795 16.4886 18.1328C15.9353 18.6861 15.625 19.4366 15.625 20.2188V22.0938M15 24H34.375" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<defs>
<linearGradient id="paint0_linear_24_4865" x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
<stop stop-color="#84C718"/>
<stop offset="1" stop-color="#09791A"/>
</linearGradient>
</defs>
</svg>`

export function TabCenterIcon() {
  return <SvgXml xml={centerXml} width={50} height={50} style={{ marginTop: 2 }} />
}