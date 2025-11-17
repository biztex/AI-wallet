import { SvgXml } from "react-native-svg"

const Xml = `
<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.75 3.75H16.25V5H14.375V16.25H12.5V5H7.5V16.25H5.625V5H3.75V3.75Z" fill="#838383"/>
<path d="M10 8.75H16.25V10H14.375V16.25H12.5V10H10V8.75Z" fill="#838383"/>
</svg>
`

export function AccFontSizeIcon() {
  return <SvgXml xml={Xml} width={24} height={24} />
}
