import { SvgXml } from "react-native-svg";

const Xml = `
<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><defs><linearGradient id="swapGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#84C718;stop-opacity:1" /><stop offset="100%" style="stop-color:#09791A;stop-opacity:1" /></linearGradient></defs><path fill="url(#swapGradient)" d="M3.005 3.003h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-18a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1m12 4v2h-4v2h4v2l3.5-3zm-6 10v-2h4v-2h-4v-2l-3.5 3z"/></svg>
`

export function SwapNewIcon() {
  return <SvgXml xml={Xml} width={24} height={25} />
}