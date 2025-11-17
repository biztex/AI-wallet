import { StyleSheet, View } from "react-native"
import Svg, { Circle, G } from "react-native-svg"

interface PieChartData {
  name: string
  value: number
  color: string
  percentage: number
}

interface PieChartProps {
  data: PieChartData[]
  size?: number
  strokeWidth?: number
}

export function PieChart({ data, size = 200, strokeWidth = 40 }: PieChartProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  let currentAngle = -90 // Start from top

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation={0} origin={`${center}, ${center}`}>
          {data.map((item, index) => {
            const percentage = item.percentage
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
            const rotation = currentAngle

            currentAngle += (percentage / 100) * 360

            return (
              <Circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={0}
                rotation={rotation}
                origin={`${center}, ${center}`}
                strokeLinecap="round"
              />
            )
          })}
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
})
