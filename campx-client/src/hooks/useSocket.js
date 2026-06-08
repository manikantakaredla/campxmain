import { useContext } from 'react'
import { SocketContext } from '../context/SocketContext'

export const useSocket = () => {
  const context = useContext(SocketContext)
  return context
}