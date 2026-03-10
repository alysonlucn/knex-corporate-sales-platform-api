import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './shared/infra/typeorm';
import authRoutes from './modules/auth/routes/auth.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
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

app.use(errorHandler);
