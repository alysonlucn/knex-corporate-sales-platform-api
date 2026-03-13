import { Product } from '../infra/typeorm/entities/Product';
import { DeepPartial } from '../../../shared/types';

export interface IProductRepository {
  findByIdWithCompany(id: number): Promise<Product | null>;
  findAllFiltered(filters: {
    companyId?: number;
    search?: string;
    skip: number;
    limit: number;
  }): Promise<[Product[], number]>;
  save(data: DeepPartial<Product>): Promise<Product>;
  remove(product: Product): Promise<Product>;
}
