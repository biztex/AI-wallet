import { useEffect, useState } from 'react'
import WebSocketManager from '../utils/websocket-manager'

export const useWebSocketManager = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{ auth: boolean; password: boolean }>({
    auth: false,
    password: false
  })

  useEffect(() => {
    const initializeConnections = async () => {
      try {
        await WebSocketManager.initialize()
        console.log("[DEV] WebSocket connections initialized via hook")
      } catch (error) {
        console.error("[DEV] Error initializing WebSocket connections:", error)
      }
    }

    const checkConnectionStatus = () => {
      const status = WebSocketManager.getConnectionStatus()
      setConnectionStatus(status)
      setIsConnected(status.auth && status.password)
    }

    // NO inicializar automáticamente - solo cuando sea necesario
    // initializeConnections()

    // NO verificar estado automáticamente - esto causa reconexiones
    // const intervalId = setInterval(checkConnectionStatus, 5000)

    // Verificación inicial
    checkConnectionStatus()

    // Cleanup al desmontar
    return () => {
      // No hay intervalId que limpiar
      // No desconectar aquí para mantener conexiones activas
      // WebSocketManager.disconnect()
    }
  }, [])

  const reconnect = async () => {
    try {
      await WebSocketManager.reconnect()
      console.log("[DEV] WebSocket connections reconnected")
    } catch (error) {
      console.error("[DEV] Error reconnecting WebSocket connections:", error)
    }
  }

  const disconnect = () => {
    WebSocketManager.disconnect()
    setIsConnected(false)
    setConnectionStatus({ auth: false, password: false })
  }

  return {
    isConnected,
    connectionStatus,
    reconnect,
    disconnect
  }
}

export default useWebSocketManager
