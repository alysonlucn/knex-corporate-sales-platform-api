import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource, runSeeds } from './shared/infra/typeorm';
import { swaggerSpec } from './shared/infra/swagger/swagger';
import authRoutes from './modules/auth/routes/auth.routes';
import companiesRoutes from './modules/companies/routes/companies.routes';
import productRoutes from './modules/products/routes/product.routes';
import transactionsRoutes from './modules/transactions/routes/transactions.routes';
import usersRoutes from './modules/users/routes/users.routes';
import { errorHandler } from './shared/middlewares/errorHandler';
import { Logger } from './shared/helpers/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Corporate Sales Platform - API Docs',
  }),
);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

AppDataSource.initialize()
  .then(async () => {
    Logger.info('Running migrations...');
    await AppDataSource.runMigrations();
    Logger.info('Migrations completed!');

    await runSeeds();

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      Logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    Logger.error('Error in initialization', err);
  });

app.use('/auth', authRoutes);
app.use('/companies', companiesRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/users', usersRoutes);

app.use(errorHandler);
