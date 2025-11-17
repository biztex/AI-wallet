import { Stack } from "expo-router"

export default function WalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="create-seed" />
      <Stack.Screen name="confirm-seed" />
      <Stack.Screen name="import-wallet" />
      <Stack.Screen name="setup-security" />
      <Stack.Screen name="wallet-address" />
      <Stack.Screen name="wallet-choice" />
    </Stack>
  )
}
