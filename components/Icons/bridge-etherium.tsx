import { SvgXml } from "react-native-svg";

const Xml = `
<svg width="21" height="21" viewBox="0 0 21 21" fill="none">
<path d="M10.7354 20.6963C16.2582 20.6963 20.7354 16.2191 20.7354 10.6963C20.7354 5.17344 16.2582 0.696289 10.7354 0.696289C5.2125 0.696289 0.735352 5.17344 0.735352 10.6963C0.735352 16.2191 5.2125 20.6963 10.7354 20.6963Z" fill="#627EEA"/>
<path d="M11.0469 3.1947V8.73872L15.7325 10.8328L11.0469 3.1947Z" fill="black" fill-opacity="0.6"/>
<path d="M11.0469 3.1947L6.36133 10.8328L11.0469 8.73872V3.1947Z" fill="#101212"/>
<path d="M11.0469 14.425V18.1921L15.7352 11.705L11.0469 14.425Z" fill="black" fill-opacity="0.6"/>
<path d="M11.0469 18.1921V14.425L6.36133 11.705L11.0469 18.1921Z" fill="#101212"/>
<path d="M11.0469 13.5531L15.7325 10.8331L11.0469 8.73901V13.5531Z" fill="black" fill-opacity="0.2"/>
<path d="M6.36133 10.8331L11.0469 13.5531V8.73901L6.36133 10.8331Z" fill="black" fill-opacity="0.6"/>
</svg>
`

export function BEtheriumIcon() {
  return <SvgXml xml={Xml} width={21} height={21} />
}