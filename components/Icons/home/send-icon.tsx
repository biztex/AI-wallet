  import { SvgXml } from "react-native-svg";

  const Xml = `
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M6 4.5H18V6.5H6V4.5ZM11 14.5V20.5H13V14.5H18L12 8.5L6 14.5H11Z" fill="url(#paint0_linear_555_1303)"/>
  <defs>
  <linearGradient id="paint0_linear_555_1303" x1="6" y1="4.5" x2="21.3623" y2="16.014" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  </defs>
  </svg>
  `
  
  export function SendIcon() {
    return <SvgXml xml={Xml} width={25} height={25} />
  }