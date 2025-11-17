
import { SvgXml } from "react-native-svg"

const homeXml = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><g fill="none" stroke="#999999" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="20" height="14" x="2" y="9" rx="4"/><circle cx="12" cy="3" r="2"/><path d="M12 5v4m-3 8v-2m6 0v2"/></g></svg>
`

export function TabAiIcon() {
  return <SvgXml xml={homeXml} width={24} height={24} />
}