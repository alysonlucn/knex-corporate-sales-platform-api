import { Response } from 'express';
import { TransactionService } from '../services/TransactionService';
import { AuthRequest } from '../../auth/middlewares/AuthMiddleware';
import { AppError } from '../../../shared/errors/AppError';
import { ResponseHelper } from '../../../shared/helpers/response';

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  async purchase(req: AuthRequest, res: Response) {
    const { productId, quantity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const transaction = await this.transactionService.purchase({
      userId: Number(userId),
      productId: Number(productId),
      quantity: Number(quantity),
    });

    return ResponseHelper.success(res, transaction, 201);
  }

  async findByUser(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await this.transactionService.findByUser(Number(userId), {
      page: Number(page),
      limit: Number(limit),
    });

    return ResponseHelper.success(res, result);
  }

  async findAll(req: AuthRequest, res: Response) {
    const { page = 1, limit = 10 } = req.query;

    const result = await this.transactionService.findAll({
      page: Number(page),
      limit: Number(limit),
    });

    return ResponseHelper.success(res, result);
  }
}
