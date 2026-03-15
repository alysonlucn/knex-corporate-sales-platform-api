import 'reflect-metadata';
import { DataSource } from 'typeorm';
import path from 'path';
import dotenv from 'dotenv';
import { seedCompanies } from './seeds/seedCompanies';
import { seedUsers } from './seeds/seedUsers';
import { Logger } from '../../helpers/logger';

import { Company } from '@modules/companies/infra/typeorm/entities/Company';
import { User } from '@modules/users/infra/typeorm/entities/User';
import { Product } from '@modules/products/infra/typeorm/entities/Product';
import { Transaction } from '@modules/transactions/infra/typeorm/entities/Transaction';

dotenv.config();

const migrationsPath = path.join(__dirname, 'migrations', '*{.ts,.js}');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [Company, User, Product, Transaction],
  migrations: [migrationsPath],
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
