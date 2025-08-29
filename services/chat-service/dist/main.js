"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
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
            origin: process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'http://localhost:3001',
                'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
            ],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        });
        app.setGlobalPrefix('api/v1');
        const port = process.env.PORT || 3004;
        await app.listen(port, '0.0.0.0');
        console.log(`🚀 Chat Service is running on: http://0.0.0.0:${port}`);
        console.log(`📝 API Documentation: http://0.0.0.0:${port}/api/v1`);
        console.log(`💬 WebSocket ready for real-time chat`);
    }
    catch (error) {
        console.error('❌ Failed to start Chat Service:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('❌ Bootstrap failed:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map