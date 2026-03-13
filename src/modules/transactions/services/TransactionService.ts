import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IUserRepository } from '../../users/repositories/IUserRepository';
import { AppError } from '../../../shared/errors/AppError';
import {
  createPaginationResponse,
  PaginationResponse,
  calculatePaginationOffset,
} from '../../../shared/helpers/pagination';

interface PurchaseData {
  userId: number;
  productId: number;
  quantity: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export class TransactionService {
  constructor(
    private readonly transactionRepository: ITransactionRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async purchase(data: PurchaseData) {
    const { userId, productId, quantity } = data;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return this.transactionRepository.executePurchase({
      user,
      productId,
      quantity,
    });
  }

  async findByUser(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginationResponse<any>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = calculatePaginationOffset(page, limit);

    const [transactions, total] =
      await this.transactionRepository.findByUserPaginated(userId, skip, limit);

    const data = transactions.map((transaction) => ({
      id: transaction.id,
      quantity: transaction.quantity,
      totalPrice: transaction.totalPrice,
      createdAt: transaction.createdAt,
      product: {
        id: transaction.product.id,
        name: transaction.product.name,
        price: transaction.product.price,
      },
    }));

    return createPaginationResponse(data, total, page, limit);
  }

  async findAll(
    pagination?: PaginationParams,
  ): Promise<PaginationResponse<any>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = calculatePaginationOffset(page, limit);

    const [transactions, total] =
      await this.transactionRepository.findAllPaginated(skip, limit);

    const data = transactions.map((transaction) => ({
      id: transaction.id,
      quantity: transaction.quantity,
      totalPrice: transaction.totalPrice,
      createdAt: transaction.createdAt,
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
      },
      product: {
        id: transaction.product.id,
        name: transaction.product.name,
        price: transaction.product.price,
      },
    }));

    return createPaginationResponse(data, total, page, limit);
  }
}
