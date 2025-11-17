import { SvgXml } from "react-native-svg";

const Xml = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 7410 3900" preserveAspectRatio="xMidYMid meet"><path fill="#b31942" d="M0 0h7410v3900H0"></path><path stroke="#FFF" stroke-width="300" d="M0 450h7410m0 600H0m0 600h7410m0 600H0m0 600h7410m0 600H0"></path><path fill="#0a3161" d="M0 0h2964v2100H0"></path><g fill="#FFF"><g id="d"><g id="c"><g id="e"><g id="b"><path id="a" d="m247 90 70.534 217.082-184.66-134.164h228.253L176.466 307.082z"></path><use xlink:href="#a" y="420"></use><use xlink:href="#a" y="840"></use><use xlink:href="#a" y="1260"></use></g><use xlink:href="#a" y="1680"></use></g><use xlink:href="#b" x="247" y="210"></use></g><use xlink:href="#c" x="494"></use></g><use xlink:href="#d" x="988"></use><use xlink:href="#c" x="1976"></use><use xlink:href="#e" x="2470"></use></g></svg>
`

export function USA() {
  return <SvgXml xml={Xml} width={25} height={18} />
}