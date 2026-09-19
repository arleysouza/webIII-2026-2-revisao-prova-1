import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplica validação automática em todas as entradas que usam DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Mantém apenas propriedades declaradas no DTO.
      transform: true, // Converte valores para os tipos esperados pelo DTO.
      forbidNonWhitelisted: true, // Interrompe a requisição quando chegam campos extras.
    }),
  );

  // Lê a porta do ambiente e usa 3000 como fallback local.
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}

bootstrap();
