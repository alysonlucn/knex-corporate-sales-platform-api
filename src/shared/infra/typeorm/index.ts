import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { seedCompanies } from './seeds/seedCompanies';
import { seedUsers } from './seeds/seedUsers';
import { Logger } from '../../helpers/logger';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: ['./src/modules/**/infra/typeorm/entities/*.ts'],
  migrations: ['./src/shared/infra/typeorm/migrations/*.ts'],
});

export const runSeeds = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    Logger.info('Running seeds');
    await seedCompanies();
    await seedUsers();
    Logger.info('Seeds completed!');
  } catch (error) {
    Logger.error('Error running seeds:', error);
    throw error;
  }
};
