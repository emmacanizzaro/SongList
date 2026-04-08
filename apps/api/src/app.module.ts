import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { ChurchesModule } from "./churches/churches.module";
import { InstrumentsModule } from "./instruments/instruments.module";
import { MeetingsModule } from "./meetings/meetings.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SongsModule } from "./songs/songs.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { TranspositionModule } from "./transposition/transposition.module";

@Module({
  imports: [
    // ---- Configuración global ----
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),

    // ---- Rate limiting: 100 req/min por IP ----
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 10 },
      { name: "medium", ttl: 60_000, limit: 100 },
    ]),

    // ---- Módulos de la app ----
    PrismaModule,
    AuthModule,
    ChurchesModule,
    SongsModule,
    MeetingsModule,
    InstrumentsModule,
    TranspositionModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
