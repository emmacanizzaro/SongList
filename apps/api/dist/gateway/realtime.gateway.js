"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const meetingPresence = {};
const songPresence = {};
let RealtimeGateway = class RealtimeGateway {
    handleConnection(client) {
        this.server.emit('user:connected', { id: client.id });
    }
    handleDisconnect(client) {
        for (const meetingId in meetingPresence) {
            const before = meetingPresence[meetingId].length;
            meetingPresence[meetingId] = meetingPresence[meetingId].filter((u) => u.socketId !== client.id);
            if (meetingPresence[meetingId].length !== before) {
                this.server.emit('meeting:presence', {
                    meetingId,
                    users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
                });
            }
        }
        for (const songId in songPresence) {
            const before = songPresence[songId].length;
            songPresence[songId] = songPresence[songId].filter((u) => u.socketId !== client.id);
            if (songPresence[songId].length !== before) {
                this.server.emit('song:presence', {
                    songId,
                    users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
                });
            }
        }
        this.server.emit('user:disconnected', { id: client.id });
    }
    handleSongJoin(data, client) {
        const { songId, user } = data;
        if (!songPresence[songId])
            songPresence[songId] = [];
        if (!songPresence[songId].some((u) => u.userId === user.userId)) {
            songPresence[songId].push({ ...user, socketId: client.id });
        }
        this.server.emit('song:presence', {
            songId,
            users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
        });
    }
    handleSongLeave(data, client) {
        const { songId, user } = data;
        if (songPresence[songId]) {
            songPresence[songId] = songPresence[songId].filter((u) => u.userId !== user.userId);
            this.server.emit('song:presence', {
                songId,
                users: songPresence[songId].map(({ userId, name }) => ({ userId, name })),
            });
        }
    }
    handleMeetingJoin(data, client) {
        const { meetingId, user } = data;
        if (!meetingPresence[meetingId])
            meetingPresence[meetingId] = [];
        if (!meetingPresence[meetingId].some((u) => u.userId === user.userId)) {
            meetingPresence[meetingId].push({ ...user, socketId: client.id });
        }
        this.server.emit('meeting:presence', {
            meetingId,
            users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
        });
    }
    handleMeetingLeave(data, client) {
        const { meetingId, user } = data;
        if (meetingPresence[meetingId]) {
            meetingPresence[meetingId] = meetingPresence[meetingId].filter((u) => u.userId !== user.userId);
            this.server.emit('meeting:presence', {
                meetingId,
                users: meetingPresence[meetingId].map(({ userId, name }) => ({ userId, name })),
            });
        }
    }
    handleSongUpdate(data) {
        this.server.emit('song:update', data);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('song:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSongJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('song:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSongLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('meeting:join'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleMeetingJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('meeting:leave'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleMeetingLeave", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('song:update'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RealtimeGateway.prototype, "handleSongUpdate", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true })
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map