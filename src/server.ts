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

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    await runSeeds();

    const PORT = process.env.PORT || 3333;
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error in initialization', err);
  });

app.use('/auth', authRoutes);
app.use('/companies', companiesRoutes);
app.use('/products', productRoutes);
app.use('/transactions', transactionsRoutes);
app.use('/users', usersRoutes);

app.use(errorHandler);
