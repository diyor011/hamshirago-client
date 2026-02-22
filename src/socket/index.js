import { io } from 'socket.io-client'

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false })
  }
  return socket
}

export const connectSocket = () => {
  const s = getSocket()
  if (!s.connected) s.connect()
  return s
}

export const disconnectSocket = () => {
  if (socket?.connected) socket.disconnect()
}
