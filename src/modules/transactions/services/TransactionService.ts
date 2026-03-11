import { AppDataSource } from '../../../shared/infra/typeorm';
import { Transaction } from '../infra/typeorm/entities/Transaction';
import { Product } from '../../products/infra/typeorm/entities/Product';
import { User } from '../../users/infra/typeorm/entities/User';
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
  private transactionRepository = AppDataSource.getRepository(Transaction);
  private productRepository = AppDataSource.getRepository(Product);
  private userRepository = AppDataSource.getRepository(User);

  async purchase(data: PurchaseData) {
    const { userId, productId, quantity } = data;

    return AppDataSource.transaction(async (transactionManager) => {
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      const product = await transactionManager.getRepository(Product).findOne({
        where: { id: productId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!product) {
        throw new AppError(404, 'Product not found');
      }

      if (product.stock === 0) {
        throw new AppError(400, 'Product out of stock');
      }

      if (product.stock < quantity) {
        throw new AppError(
          400,
          `Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`,
        );
      }

      const totalPrice = parseFloat(product.price.toString()) * quantity;

      product.stock -= quantity;
      await transactionManager.getRepository(Product).save(product);

      const transaction = transactionManager.create(Transaction, {
        user,
        product,
        quantity,
        totalPrice,
      });

      await transactionManager.save(transaction);

      return {
        id: transaction.id,
        quantity: transaction.quantity,
        totalPrice: transaction.totalPrice,
        createdAt: transaction.createdAt,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
        },
      };
    });
  }

  async findByUser(
    userId: number,
    pagination?: PaginationParams,
  ): Promise<PaginationResponse<any>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const skip = calculatePaginationOffset(page, limit);

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        where: { user: { id: userId } },
        relations: ['product'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      },
    );

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

    const [transactions, total] = await this.transactionRepository.findAndCount(
      {
        relations: ['user', 'product'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      },
    );

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
