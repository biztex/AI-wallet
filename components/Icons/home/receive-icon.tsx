import { SvgXml } from "react-native-svg";

  const Xml = `
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M6 15.5H18V17.5H6V15.5ZM11 1.5V7.5H6L12 13.5L18 7.5H13V1.5H11Z" fill="url(#paint0_linear_555_1307)"/>
  <defs>
  <linearGradient id="paint0_linear_555_1307" x1="6" y1="1.5" x2="21.3623" y2="13.014" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  </defs>
  </svg>
  `
  
  export function ReceiveIcon() {
    return <SvgXml xml={Xml} width={24} height={25} />
  }