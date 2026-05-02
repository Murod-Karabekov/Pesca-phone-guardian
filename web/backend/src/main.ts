import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: false });
  app.setGlobalPrefix('api');
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  const cors = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? [
    'http://localhost:5173',
    'http://localhost:8080',
  ];
  app.enableCors({ origin: cors, credentials: true });
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Pesca Phone Guardian API listening on :${port}`);
}

bootstrap();
