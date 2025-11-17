import { SvgXml } from "react-native-svg"

const xml = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" rx="24" fill="#FFE2EB"/>
<path d="M24 12C20.9624 12 18.5 14.4624 18.5 17.5C18.5 20.5376 20.9624 23 24 23C27.0376 23 29.5 20.5376 29.5 17.5C29.5 14.4624 27.0376 12 24 12Z" fill="#302B3A"/>
<path d="M14.75 33.25C14.75 28.6937 18.4437 25 23 25H25C29.5563 25 33.25 28.6937 33.25 33.25V34.5C33.25 35.7426 32.2426 36.75 31 36.75H17C15.7574 36.75 14.75 35.7426 14.75 34.5V33.25Z" fill="#302B3A"/>
</svg>`

export function UserAvatarIcon() {
  return <SvgXml xml={xml} width={40} height={40} />
}

