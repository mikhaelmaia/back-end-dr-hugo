import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSourceOptions } from 'typeorm';

export const provideDataSource = async (
  configService: ConfigService,
): Promise<DataSourceOptions> => {
  const config: DataSourceOptions = {
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    entities: [join(__dirname, '../../../', '**/*.entity{.ts,.js}')],
    synchronize: false,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
    } : false,
    logging: process.env.NODE_ENV === 'development' ? ['error'] : false,
  };

  return config;
};
