import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const canUseTransform = await (async () => {
    try {
      await import("class-transformer");
      return true;
    } catch {
      return false;
    }
  })();
  const configuredOrigins = (
    config.get<string>("FRONTEND_URL") ?? "http://localhost:3000"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localDevOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
  ];
  const allowedOrigins = new Set([...configuredOrigins, ...localDevOrigins]);

  // ---- Prefijo global de API ----
  app.setGlobalPrefix("api");

  // ---- Versionado de API ----
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: "1" });

  // ---- CORS ----
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
  });

  // ---- Validación global de DTOs ----
  try {
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: canUseTransform,
        transformOptions: canUseTransform
          ? { enableImplicitConversion: true }
          : undefined,
      }),
    );
  } catch {
    console.warn(
      "ValidationPipe deshabilitado temporalmente en este entorno demo.",
    );
  }

  // ---- Swagger (solo en desarrollo) ----
  if (config.get("NODE_ENV") !== "production") {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("SongList API")
      .setDescription(
        "API REST para la plataforma SaaS SongList - Equipos de Alabanza",
      )
      .setVersion("1.0")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "JWT",
      )
      .addTag("auth", "Autenticación y registro")
      .addTag("churches", "Gestión de iglesias (tenants)")
      .addTag("songs", "Canciones y versiones")
      .addTag("meetings", "Reuniones de alabanza")
      .addTag("instruments", "Instrumentos personalizados")
      .addTag("subscriptions", "Planes y pagos")
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  // ---- Health check (Render, Railway, etc.) ----
  app
    .getHttpAdapter()
    .get("/health", (_req: unknown, res: { json: (d: unknown) => void }) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

  const port = Number(
    config.get<string>("PORT") ?? config.get<string>("API_PORT") ?? "3001",
  );
  await app.listen(port, "0.0.0.0");

  console.log(`🎵 SongList API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
