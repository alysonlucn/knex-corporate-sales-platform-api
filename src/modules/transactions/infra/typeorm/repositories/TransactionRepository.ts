import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../../shared/infra/typeorm';
import { Transaction } from '../entities/Transaction';
import { Product } from '../../../../products/infra/typeorm/entities/Product';
import {
  ITransactionRepository,
  PurchaseInput,
  PurchaseResult,
} from '../../../repositories/ITransactionRepository';
import { AppError } from '../../../../../shared/errors/AppError';

export class TransactionRepository implements ITransactionRepository {
  private repository: Repository<Transaction>;

  constructor() {
    this.repository = AppDataSource.getRepository(Transaction);
  }

  async executePurchase(data: PurchaseInput): Promise<PurchaseResult> {
    const { user, productId, quantity } = data;

    return AppDataSource.transaction(async (manager) => {
      const product = await manager.getRepository(Product).findOne({
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
      await manager.getRepository(Product).save(product);

      const transaction = manager.create(Transaction, {
        user,
        product,
        quantity,
        totalPrice,
      });

      await manager.save(transaction);

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

  async findByUserPaginated(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[Transaction[], number]> {
    return this.repository.findAndCount({
      where: { user: { id: userId } },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }

  async findAllPaginated(
    skip: number,
    take: number,
  ): Promise<[Transaction[], number]> {
    return this.repository.findAndCount({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take,
    });
  }
}
