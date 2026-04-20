"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(config_1.ConfigService);
    const canUseTransform = await (async () => {
        try {
            await Promise.resolve().then(() => require("class-transformer"));
            return true;
        }
        catch {
            return false;
        }
    })();
    const configuredOrigins = (config.get("FRONTEND_URL") ?? "http://localhost:3000")
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
    app.setGlobalPrefix("api");
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: "1" });
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
    try {
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: canUseTransform,
            transformOptions: canUseTransform
                ? { enableImplicitConversion: true }
                : undefined,
        }));
    }
    catch {
        console.warn("ValidationPipe deshabilitado temporalmente en este entorno demo.");
    }
    if (config.get("NODE_ENV") !== "production") {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle("SongList API")
            .setDescription("API REST para la plataforma SaaS SongList - Equipos de Alabanza")
            .setVersion("1.0")
            .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" }, "JWT")
            .addTag("auth", "Autenticación y registro")
            .addTag("churches", "Gestión de iglesias (tenants)")
            .addTag("songs", "Canciones y versiones")
            .addTag("meetings", "Reuniones de alabanza")
            .addTag("instruments", "Instrumentos personalizados")
            .addTag("subscriptions", "Planes y pagos")
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup("docs", app, document, {
            swaggerOptions: { persistAuthorization: true },
        });
    }
    app
        .getHttpAdapter()
        .get("/health", (_req, res) => {
        res.json({ status: "ok", timestamp: new Date().toISOString() });
    });
    const port = Number(config.get("PORT") ?? config.get("API_PORT") ?? "3001");
    await app.listen(port, "0.0.0.0");
    console.log(`🎵 SongList API running on: http://localhost:${port}/api/v1`);
    console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map