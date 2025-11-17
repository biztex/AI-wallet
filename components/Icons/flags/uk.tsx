import { SvgXml } from "react-native-svg";

const Xml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="100%" height="100%" preserveAspectRatio="xMidYMid meet"><clipPath id="a"><path d="M0 0v30h60DEVz"></path></clipPath><clipPath id="b"><path d="M30 15h30v15zv15H0zH0DEVzDEVh30z"></path></clipPath><g clip-path="url(#a)"><path d="M0 0v30h60DEVz" fill="#012169"></path><path d="m0 0 60 30m0-30L0 30" stroke="#fff" stroke-width="6"></path><path d="m0 0 60 30m0-30L0 30" clip-path="url(#b)" stroke="#C8102E" stroke-width="4"></path><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"></path><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"></path></g></svg>
`

export function UK() {
  return <SvgXml xml={Xml} width={25} height={18} />
}