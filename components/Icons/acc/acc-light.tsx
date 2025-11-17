
import { SvgXml } from "react-native-svg"

const Xml = `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 18.5C15.3137 18.5 18 15.8137 18 12.5C18 9.18629 15.3137 6.5 12 6.5C8.68629 6.5 6 9.18629 6 12.5C6 15.8137 8.68629 18.5 12 18.5Z" stroke="#838383" stroke-width="1.5"/>
<path d="M12 2.5V3.5M12 21.5V22.5M22 12.5H21M3 12.5H2M19.07 5.43L18.678 5.823M5.322 19.178L4.929 19.571M19.07 19.57L18.678 19.177M5.322 5.822L4.929 5.429" stroke="#838383" stroke-width="1.5" stroke-linecap="round"/>
</svg>

`

export function AccLightIcon() {
  return <SvgXml xml={Xml} width={24} height={24} />
}