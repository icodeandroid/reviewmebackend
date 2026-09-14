import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

export const buildTypeOrmOptions = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.name'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: config.get<boolean>('database.synchronize'),
  logging: config.get<boolean>('database.logging'),
  autoLoadEntities: true,
});
