import Svg, { Path } from "react-native-svg"

export function AccBiometricIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2C10.9 2 10 2.9 10 4C10 5.1 10.9 6 12 6C13.1 6 14 5.1 14 4C14 2.9 13.1 2 12 2Z" fill="#6C63FF" />
      <Path
        d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z"
        fill="#6C63FF"
      />
      <Path
        d="M12 18C8.69 18 6 20.69 6 24H8C8 21.79 9.79 20 12 20C14.21 20 16 21.79 16 24H18C18 20.69 15.31 18 12 18Z"
        fill="#6C63FF"
      />
      <Path
        d="M4 12C4 7.58 7.58 4 12 4V2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22V20C7.58 20 4 16.42 4 12Z"
        fill="#6C63FF"
        opacity={0.3}
      />
    </Svg>
  )
}
