import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { existsSync } from 'fs';
import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const isProduction = process.env.NODE_ENV === 'production';

  // Run migrations automatically in production
  if (isProduction && process.env.RUN_MIGRATIONS === 'true') {
    logger.log('Running database migrations...');
    try {
      const { dataSourceOptions } = await import('./config/typeorm.config');
      const dataSource = new DataSource(dataSourceOptions);
      await dataSource.initialize();
      const migrations = await dataSource.runMigrations();
      if (migrations.length > 0) {
        logger.log(`${migrations.length} migrations applied successfully`);
      } else {
        logger.log('No pending migrations');
      }
      await dataSource.destroy();
    } catch (error) {
      logger.error('Migration failed:', error.message);
      // Continuar de todos modos - las migraciones pueden ya estar aplicadas
      // o las columnas nuevas se crean manualmente con el script SQL
    }
  }

  // Create app with optimized logger for production
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Security: Helmet helps secure Express apps by setting various HTTP headers
  app.use(helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: isProduction ? undefined : false,
  }));

  // Performance: Enable compression for all responses
  app.use(compression());

  // Global prefix for all routes (only in development, Digital Ocean handles /api routing)
  if (!isProduction) {
    app.setGlobalPrefix('api');
  }

  // CORS Configuration: Dynamic origins based on environment
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['http://localhost:4200'];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  // Global validation pipe with error messages optimization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Don't expose internal error details in production
      disableErrorMessages: isProduction,
    }),
  );

  // Graceful shutdown
  app.enableShutdownHooks();

  // Serve static files from frontend in production
  if (isProduction) {
    const publicPath = join(__dirname, '..', 'public');
    if (existsSync(publicPath)) {
      app.useStaticAssets(publicPath);
      // Serve index.html for all non-API routes (SPA fallback)
      app.use((req: Request, res: Response, next: NextFunction) => {
        if (!req.path.startsWith('/api') && !req.path.includes('.')) {
          res.sendFile(join(publicPath, 'index.html'));
        } else {
          next();
        }
      });
      logger.log(`📁 Serving static files from: ${publicPath}`);
    }
  }

  // Get port from environment variable (Azure uses PORT by default)
  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';

  await app.listen(port, host);

  logger.log(`🚀 Application is running on: http://${host}:${port}${isProduction ? '' : '/api'}`);
  logger.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.log(`🔒 CORS enabled for: ${corsOrigins.join(', ')}`);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Error starting application:', error.stack || error.message);
  process.exit(1);
});
