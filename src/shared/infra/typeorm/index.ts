import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { seedCompanies } from './seeds/seedCompanies';
import { seedUsers } from './seeds/seedUsers';

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
    // eslint-disable-next-line no-console
    console.log('Running seeds');
    await seedCompanies();
    await seedUsers();
    // eslint-disable-next-line no-console
    console.log('Seeds completed!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running seeds:', error);
    throw error;
  }
};
