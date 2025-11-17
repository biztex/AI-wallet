  import { SvgXml } from "react-native-svg";

  const Xml = `
  <svg width="41" height="42" viewBox="0 0 41 42" fill="none">
  <circle cx="20.5" cy="21" r="20.5" fill="url(#paint0_linear_24_4644)"/>
  <path d="M21 28.5V14.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 21.5L21 14.5L28 21.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <defs>
  <linearGradient id="paint0_linear_24_4644" x1="0" y1="0.5" x2="41.0137" y2="41.4863" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  </defs>
  </svg>
  `
  
  export function SendButton() {
    return <SvgXml xml={Xml} width={41} height={42} />
  }