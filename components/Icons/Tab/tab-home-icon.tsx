
import { SvgXml } from "react-native-svg"

const homeXml = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 32 32"><path fill="none" stroke="#999999" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M29 17v11H3V17M2 8h28v8s-6 4-14 4s-14-4-14-4zm14 14v-4m4-10s0-4-4-4s-4 4-4 4"/></svg>
`

export function TabHomeIcon() {
  return <SvgXml xml={homeXml} width={24} height={24} />
}