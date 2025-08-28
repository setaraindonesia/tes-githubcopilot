import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    // Enable global validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));
    
    // Enable CORS for both HTTP and WebSocket
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
    
    // Global prefix
    app.setGlobalPrefix('api/v1');
    
    // Railway uses PORT env variable
    const port = process.env.PORT || 3004;
    await app.listen(port, '0.0.0.0'); // Listen on all interfaces
    
    console.log(`🚀 Chat Service is running on: http://0.0.0.0:${port}`);
    console.log(`📝 API Documentation: http://0.0.0.0:${port}/api/v1`);
    console.log(`💬 WebSocket ready for real-time chat`);
  } catch (error) {
    console.error('❌ Failed to start Chat Service:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Bootstrap failed:', error);
  process.exit(1);
});
