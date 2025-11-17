import { SvgXml } from "react-native-svg"

const xml = `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="48" height="48" rx="24" fill="#D9F0FF"/>
<path d="M32.75 20.5H15.25C13.4551 20.5 12 21.9551 12 23.75V28.25C12 30.0449 13.4551 31.5 15.25 31.5H16.5V33.625C16.5 34.193 17.1248 34.5128 17.5687 34.1736L20.9587 31.5H32.75C34.5449 31.5 36 30.0449 36 28.25V23.75C36 21.9551 34.5449 20.5 32.75 20.5Z" fill="#1C6FEB"/>
<path d="M18.75 16C18.75 14.7574 19.7574 13.75 21 13.75H27C28.2426 13.75 29.25 14.7574 29.25 16V20.5H18.75V16Z" fill="#1C6FEB"/>
<path d="M19.75 24C19.75 23.3096 20.3096 22.75 21 22.75C21.6904 22.75 22.25 23.3096 22.25 24V26C22.25 26.6904 21.6904 27.25 21 27.25C20.3096 27.25 19.75 26.6904 19.75 26V24Z" fill="white"/>
<path d="M25.75 24C25.75 23.3096 26.3096 22.75 27 22.75C27.6904 22.75 28.25 23.3096 28.25 24V26C28.25 26.6904 27.6904 27.25 27 27.25C26.3096 27.25 25.75 26.6904 25.75 26V24Z" fill="white"/>
<path d="M21 29.5H27" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
</svg>`

export function AssistantAvatarIcon() {
  return <SvgXml xml={xml} width={40} height={40} />
}

