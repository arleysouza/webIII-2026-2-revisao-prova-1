import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { DatabaseModule } from './database/database.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';

// Preserva a conexão injetada pelo Compose antes de carregar o .env local.
const databaseHost = process.env.PGHOST;
const databasePort = process.env.PGPORT;

@Module({
  imports: [
    // Tanto src quanto dist ficam dois níveis abaixo do .env da raiz.
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../.env'),
      isGlobal: true, // Evita importar ConfigModule novamente em cada módulo.
      load: [() => ({
        database: {
          // Fora do Compose, usa a porta publicada no host.
          host: databaseHost ?? (process.env.PGHOST === 'postgres' ? 'localhost' : process.env.PGHOST),
          port: Number(databasePort ?? process.env.PGPORT_HOST ?? process.env.PGPORT ?? 5432),
          user: process.env.PGUSER ?? process.env.POSTGRES_USER,
          password: process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD,
          database: process.env.PGDATABASE ?? process.env.POSTGRES_DB,
        },
      })],
    }),
    DatabaseModule,
    StudentsModule,
    CoursesModule,
    EnrollmentsModule
  ],
})
export class AppModule {}
