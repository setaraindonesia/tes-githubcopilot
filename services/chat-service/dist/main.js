"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
    });
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT || 3004;
    await app.listen(port);
    console.log(`🚀 Chat Service is running on: http://localhost:${port}`);
    console.log(`📝 API Documentation: http://localhost:${port}/api/v1`);
}
bootstrap();
//# sourceMappingURL=main.js.map