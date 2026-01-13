import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina campos extra
      forbidNonWhitelisted: true, // error si mandan campos no permitidos
      transform: true,            // convierte tipos (query params)
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
