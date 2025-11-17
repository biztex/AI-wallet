import { SvgXml } from "react-native-svg";

const Xml = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
<rect width="48" height="48" rx="24" fill="#F9FAFB"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 18H21V31H15V18ZM27 18H33V31H27V18Z" fill="#0A6A30"/>
</svg>
`

export function NigeriaBankIcon() {
  return <SvgXml xml={Xml} width={48} height={48} />
}