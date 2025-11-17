import { SvgXml } from "react-native-svg";

const Xml = `
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="60" height="60" rx="30" fill="url(#paint0_linear_24_4392)" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M38.5595 22.1711C39.0172 22.4801 39.1379 23.1016 38.8289 23.5594L29.38 37.5594C29.2215 37.7942 28.9709 37.9507 28.6904 37.9902C28.41 38.0297 28.1259 37.9484 27.9088 37.7665L21.3578 32.277C20.9344 31.9223 20.8788 31.2916 21.2335 30.8683C21.5883 30.445 22.219 30.3893 22.6423 30.7441L28.3429 35.5209L37.1711 22.4405C37.4801 21.9828 38.1017 21.8621 38.5595 22.1711Z"
                    fill="black"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_24_4392"
                      x1="0"
                      y1="0"
                      x2="60.02"
                      y2="59.9799"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#BCF420" />
                      <stop offset="1" stopColor="#55C42A" />
                    </linearGradient>
                  </defs>
                </svg>
`

export function VerificationTwoIcon() {
  return <SvgXml xml={Xml} width={60} height={60} />
}