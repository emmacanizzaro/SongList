import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket(url: string) {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io(url, { transports: ['websocket'] })
    socketRef.current = socket
    return () => {
      socket.disconnect()
    }
  }, [url])

  // Ejemplo de uso para emitir y escuchar eventos de reunión:
  // useEffect(() => {
  //   const socket = socketRef.current;
  //   if (!socket) return;
  //   function onMeetingUpdated(data) {
  //     // Actualiza el estado local con los cambios recibidos
  //   }
  //   socket.on('meeting:updated', onMeetingUpdated);
  //   return () => {
  //     socket.off('meeting:updated', onMeetingUpdated);
  //   };
  // }, []);

  // Para emitir:
  // socketRef.current?.emit('meeting:update', { meetingId, changes, userId });

  return socketRef
}
