"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            transform: true,
        }));
        app.enableCors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || [
                'http://localhost:3000',
                'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
            ],
            credentials: true,
        });
        app.setGlobalPrefix('api/v1');
        const port = process.env.PORT || 3001;
        await app.listen(port, '0.0.0.0');
        console.log(`ðŸš€ Auth Service is running on: http://0.0.0.0:${port}`);
        console.log(`ðŸ“ API Documentation: http://0.0.0.0:${port}/api/v1`);
    }
    catch (error) {
        console.error('âŒ Failed to start Auth Service:', error);
        process.exit(1);
    }
}
bootstrap().catch((error) => {
    console.error('âŒ Bootstrap failed:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map