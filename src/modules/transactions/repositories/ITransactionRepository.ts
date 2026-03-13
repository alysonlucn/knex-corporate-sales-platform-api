import { Transaction } from '../infra/typeorm/entities/Transaction';
import { User } from '../../users/infra/typeorm/entities/User';

export interface PurchaseInput {
  user: User;
  productId: number;
  quantity: number;
}

export interface PurchaseResult {
  id: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export interface ITransactionRepository {
  executePurchase(data: PurchaseInput): Promise<PurchaseResult>;
  findByUserPaginated(
    userId: number,
    skip: number,
    take: number,
  ): Promise<[Transaction[], number]>;
  findAllPaginated(
    skip: number,
    take: number,
  ): Promise<[Transaction[], number]>;
}
