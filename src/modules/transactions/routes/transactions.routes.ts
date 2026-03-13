import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import { TransactionService } from '../services/TransactionService';
import { TransactionRepository } from '../infra/typeorm/repositories/TransactionRepository';
import { UserRepository } from '../../users/infra/typeorm/repositories/UserRepository';
import { ensureAuthenticated } from '../../auth/middlewares/AuthMiddleware';
import { validate } from '../../../shared/middlewares/validate';
import { purchaseTransactionSchema } from '../schemas/transactionSchema';

const router = Router();

const transactionRepository = new TransactionRepository();
const userRepository = new UserRepository();
const transactionService = new TransactionService(
  transactionRepository,
  userRepository,
);
const transactionController = new TransactionController(transactionService);

router.post(
  '/',
  ensureAuthenticated,
  validate(purchaseTransactionSchema),
  (req, res) => transactionController.purchase(req, res),
);

router.get('/me', ensureAuthenticated, (req, res) =>
  transactionController.findByUser(req, res),
);

router.get('/', ensureAuthenticated, (req, res) =>
  transactionController.findAll(req, res),
);

export default router;
