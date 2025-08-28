import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));
    
    // Enable CORS
    app.enableCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'https://web-5it9deahv-setaraindonesias-projects.vercel.app'
      ],
      credentials: true,
    });
    
    // Global prefix
    app.setGlobalPrefix('api/v1');
    
    // Railway uses PORT env variable
    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0'); // Listen on all interfaces
    
    console.log(`🚀 Auth Service is running on: http://0.0.0.0:${port}`);
    console.log(`📝 API Documentation: http://0.0.0.0:${port}/api/v1`);
  } catch (error) {
    console.error('❌ Failed to start Auth Service:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
