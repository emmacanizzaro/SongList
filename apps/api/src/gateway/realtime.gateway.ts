import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Presencia en memoria (simple, por demo)
const meetingPresence: Record<string, { userId: string; name: string; socketId: string }[]> = {}
const songPresence: Record<string, { userId: string; name: string; socketId: string }[]> = {}

@WebSocketGateway({ cors: true })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  handleConnection(client: Socket) {
    this.server.emit('user:connected', { id: client.id })
  }

  handleDisconnect(client: Socket) {
    // Eliminar usuario de todas las reuniones donde esté presente
    for (const meetingId in meetingPresence) {
      const before = meetingPresence[meetingId].length
      meetingPresence[meetingId] = meetingPresence[meetingId].filter(
        (u) => u.socketId !== client.id,
      )
      if (meetingPresence[meetingId].length !== before) {
        this.server.emit('meeting:presence', {
          meetingId,
          users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
        })
      }
    }
    // Eliminar usuario de todas las canciones donde esté presente
    for (const songId in songPresence) {
      const before = songPresence[songId].length
      songPresence[songId] = songPresence[songId].filter((u) => u.socketId !== client.id)
      if (songPresence[songId].length !== before) {
        this.server.emit('song:presence', {
          songId,
          users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
        })
      }
    }
    this.server.emit('user:disconnected', { id: client.id })
  }

  @SubscribeMessage('song:join')
  handleSongJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { songId, user } = data
    if (!songPresence[songId]) songPresence[songId] = []
    if (!songPresence[songId].some((u) => u.userId === user.userId)) {
      songPresence[songId].push({ ...user, socketId: client.id })
    }
    this.server.emit('song:presence', {
      songId,
      users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
    })
  }

  @SubscribeMessage('song:leave')
  handleSongLeave(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { songId, user } = data
    if (songPresence[songId]) {
      songPresence[songId] = songPresence[songId].filter((u) => u.userId !== user.userId)
      this.server.emit('song:presence', {
        songId,
        users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
      })
    }
  }

  @SubscribeMessage('meeting:join')
  handleMeetingJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { meetingId, user } = data
    if (!meetingPresence[meetingId]) meetingPresence[meetingId] = []
    if (!meetingPresence[meetingId].some((u) => u.userId === user.userId)) {
      meetingPresence[meetingId].push({ ...user, socketId: client.id })
    }
    this.server.emit('meeting:presence', {
      meetingId,
      users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
    })
  }

  @SubscribeMessage('meeting:leave')
  handleMeetingLeave(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { meetingId, user } = data
    if (meetingPresence[meetingId]) {
      meetingPresence[meetingId] = meetingPresence[meetingId].filter(
        (u) => u.userId !== user.userId,
      )
      this.server.emit('meeting:presence', {
        meetingId,
        users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
      })
    }
  }

  @SubscribeMessage('song:update')
  handleSongUpdate(@MessageBody() data: any) {
    // Implementar lógica de actualización de canción si es necesario
    // Por ahora solo re-emite el evento a todos los clientes
    this.server.emit('song:update', data)
  }

  // Eliminar duplicados: aquí termina la clase correctamente
}
