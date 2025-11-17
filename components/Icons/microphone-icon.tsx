import { SvgXml } from "react-native-svg";

const Xml = `
      <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M10 10.5C12.2091 10.5 14 8.70914 14 6.5C14 4.29086 12.2091 2.5 10 2.5C7.79086 2.5 6 4.29086 6 6.5C6 8.70914 7.79086 10.5 10 10.5Z" stroke="url(#paint0_linear_555_1313)" stroke-width="1.5"/>
  <path d="M19 2.5C19 2.5 21 3.7 21 6.5C21 9.3 19 10.5 19 10.5M17 4.5C17 4.5 18 5.1 18 6.5C18 7.9 17 8.5 17 8.5M13 21.115C12.09 21.362 11.074 21.5 10 21.5C6.134 21.5 3 19.71 3 17.5C3 15.29 6.134 13.5 10 13.5C13.866 13.5 17 15.29 17 17.5C17 17.845 16.923 18.18 16.78 18.5" stroke="url(#paint1_linear_555_1313)" stroke-width="1.5" stroke-linecap="round"/>
  <defs>
  <linearGradient id="paint0_linear_555_1313" x1="6" y1="2.5" x2="14.0027" y2="10.4973" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  <linearGradient id="paint1_linear_555_1313" x1="3" y1="2.5" x2="21.9779" y2="20.4671" gradientUnits="userSpaceOnUse">
  <stop stop-color="#84C718"/>
  <stop offset="1" stop-color="#09791A"/>
  </linearGradient>
  </defs>
  </svg>
`

export function MicrophoneIcon() {
  return <SvgXml xml={Xml} width={24} height={25} />
}