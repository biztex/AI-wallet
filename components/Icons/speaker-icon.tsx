import Svg, { Path } from "react-native-svg"

export function SpeakerIcon() {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <Path
        d="M18.333 8.333L11.667 15H6.667v10h5l6.666 6.667V8.333zM28.333 20a8.333 8.333 0 0 0-4.166-7.217M28.333 20a8.333 8.333 0 0 1-4.166 7.217M28.333 20h.001"
        stroke="#4CAF50"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M30.833 13.333a13.333 13.333 0 0 1 0 13.334"
        stroke="#4CAF50"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}
