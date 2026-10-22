import { ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { APP_NAME } from "./common/constants/brand";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
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

  // ---- Proxy de la plataforma (Railway/Render) ----
  // Sin esto, req.ip es la IP del proxy y el rate limiting trataría a todos
  // los usuarios como uno solo. TRUST_PROXY_HOPS = cantidad de proxies delante.
  app.set("trust proxy", Number(config.get<string>("TRUST_PROXY_HOPS") ?? 1));

  // ---- Helmet (headers de seguridad HTTP) ----
  app.use(helmet());

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
      .setTitle(`${APP_NAME} API`)
      .setDescription(
        `API REST para la plataforma SaaS ${APP_NAME} - Equipos de Alabanza`,
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

  console.log(`🎵 ${APP_NAME} API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
