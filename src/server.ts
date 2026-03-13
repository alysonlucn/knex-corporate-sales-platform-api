import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource, runSeeds } from './shared/infra/typeorm';
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

AppDataSource.initialize()
  .then(async () => {
    await runSeeds();

    const PORT = process.env.PORT || 3333;
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
