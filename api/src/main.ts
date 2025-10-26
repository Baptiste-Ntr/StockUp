import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  
  // Middleware pour parser les cookies
  app.use(cookieParser());
  
  // Configuration CORS avec credentials pour les cookies
  app.enableCors({
    origin: (origin, callback) => {
      // En développement, autoriser tous les localhost et capacitor
      const allowedOrigins = [
        'http://localhost:5173',
        'capacitor://localhost',
        'http://localhost',
        'ionic://localhost',
      ];
      
      // Autoriser les requêtes sans origin (applications mobiles natives)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true, // Important pour les cookies
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 API démarrée sur http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
