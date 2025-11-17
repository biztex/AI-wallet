import { SvgXml } from "react-native-svg";

const Xml = `
<svg width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M10.5 21.5C11.3284 21.5 12 20.8284 12 20C12 19.1716 11.3284 18.5 10.5 18.5C9.67157 18.5 9 19.1716 9 20C9 20.8284 9.67157 21.5 10.5 21.5Z" fill="url(#paint0_linear_555_1284)"/>
  <path d="M17.5 21.5C18.3284 21.5 19 20.8284 19 20C19 19.1716 18.3284 18.5 17.5 18.5C16.6716 18.5 16 19.1716 16 20C16 20.8284 16.6716 21.5 17.5 21.5Z" fill="url(#paint1_linear_555_1284)"/>
  <path d="M14 14.49L18 9.48999H15V5.48999H13V9.48999H10L14 14.49Z" fill="url(#paint2_linear_555_1284)"/>
  <path d="M17.31 15.5H10.67L6.18 4.73C6.02776 4.36507 5.77077 4.05344 5.44149 3.83452C5.11221 3.61559 4.72542 3.49918 4.33 3.5H2V5.5H4.33L9.08 16.88C9.15502 17.0626 9.28242 17.219 9.44614 17.3293C9.60986 17.4396 9.80257 17.499 10 17.5H18C18.2014 17.4994 18.398 17.438 18.564 17.3238C18.7299 17.2096 18.8575 17.0479 18.93 16.86L21.76 9.5H19.62L17.31 15.5Z" fill="url(#paint3_linear_555_1284)"/>
  <defs>
  <linearGradient id="paint0_linear_555_1284" x1="9" y1="18.5" x2="12.001" y2="21.499" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  <linearGradient id="paint1_linear_555_1284" x1="16" y1="18.5" x2="19.001" y2="21.499" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  <linearGradient id="paint2_linear_555_1284" x1="10" y1="5.48999" x2="18.9402" y2="13.4315" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  <linearGradient id="paint3_linear_555_1284" x1="2" y1="3.5" x2="15.2153" y2="22.14" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  </defs>
  </svg>
`

export function BuyIcon() {
  return <SvgXml xml={Xml} width={24} height={25} />
}