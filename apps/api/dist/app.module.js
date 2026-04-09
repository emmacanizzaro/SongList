"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const churches_module_1 = require("./churches/churches.module");
const instruments_module_1 = require("./instruments/instruments.module");
const meetings_module_1 = require("./meetings/meetings.module");
const prisma_module_1 = require("./prisma/prisma.module");
const songs_module_1 = require("./songs/songs.module");
const subscriptions_module_1 = require("./subscriptions/subscriptions.module");
const transposition_module_1 = require("./transposition/transposition.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env.local", ".env"],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: "short", ttl: 1000, limit: 10 },
                { name: "medium", ttl: 60_000, limit: 100 },
            ]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            churches_module_1.ChurchesModule,
            songs_module_1.SongsModule,
            meetings_module_1.MeetingsModule,
            instruments_module_1.InstrumentsModule,
            transposition_module_1.TranspositionModule,
            subscriptions_module_1.SubscriptionsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map