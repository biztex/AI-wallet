import { SvgXml } from "react-native-svg";

const Xml = `
<svg width="29" height="28" viewBox="0 0 29 28" fill="none">
<g clip-path="url(#clip0_555_869)">
<path d="M23.6665 7C23.9759 7 24.2727 7.12292 24.4915 7.34171C24.7102 7.5605 24.8332 7.85725 24.8332 8.16667V19.8333C24.8332 20.1428 24.7102 20.4395 24.4915 20.6583C24.2727 20.8771 23.9759 21 23.6665 21H10.8332L4.99983 15.1667C4.71285 14.8458 4.5542 14.4305 4.5542 14C4.5542 13.5695 4.71285 13.1542 4.99983 12.8333L10.8332 7H23.6665Z" stroke="#1D3A70" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M18.9997 11.6666L14.333 16.3333M14.333 11.6666L18.9997 16.3333L14.333 11.6666Z" stroke="#1D3A70" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_555_869">
<rect width="28" height="28" fill="white" transform="translate(0.333008)"/>
</clipPath>
</defs>
</svg>
`

export function DeleteIcon() {
  return <SvgXml xml={Xml} width={29} height={28} />
}