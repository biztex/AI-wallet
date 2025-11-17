import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useWebSocketManager } from '../../hooks/use-websocket-manager'

export const WebSocketStatus: React.FC = () => {
  const { isConnected, connectionStatus, reconnect, disconnect } = useWebSocketManager()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estado de Conexiones WebSocket</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, isConnected ? styles.connected : styles.disconnected]}>
          {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </Text>
        
        <Text style={styles.detailText}>
          Auth API: {connectionStatus.auth ? '🟢' : '🔴'}
        </Text>
        
        <Text style={styles.detailText}>
          Password API: {connectionStatus.password ? '🟢' : '🔴'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.reconnectButton]} 
          onPress={reconnect}
        >
          <Text style={styles.buttonText}>Reconectar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.disconnectButton]} 
          onPress={disconnect}
        >
          <Text style={styles.buttonText}>Desconectar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  connected: {
    color: '#4CAF50',
  },
  disconnected: {
    color: '#F44336',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 100,
  },
  reconnectButton: {
    backgroundColor: '#2196F3',
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
})

export default WebSocketStatus
