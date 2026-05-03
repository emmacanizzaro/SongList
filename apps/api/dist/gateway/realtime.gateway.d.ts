import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSongJoin(data: any, client: Socket): void;
    handleSongLeave(data: any, client: Socket): void;
    handleMeetingJoin(data: any, client: Socket): void;
    handleMeetingLeave(data: any, client: Socket): void;
    handleSongUpdate(data: any): void;
}
