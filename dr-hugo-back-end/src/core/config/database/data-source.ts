import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'node:path';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST') || process.env.DATABASE_HOST,
  port:
    configService.get<number>('DATABASE_PORT') ||
    Number.parseInt(process.env.DATABASE_PORT || '5432'),
  username:
    configService.get<string>('DATABASE_USER') ||
    process.env.DATABASE_USER,
  password:
    configService.get<string>('DATABASE_PASSWORD') ||
    process.env.DATABASE_PASSWORD,
  database:
    configService.get<string>('DATABASE_NAME') || process.env.DATABASE_NAME,
  entities: [join(__dirname, '../../../', '**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/**/*{.ts,.js}')],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false,
  } : false,
  logging: process.env.NODE_ENV === 'development' ? ['error'] : false,
});
