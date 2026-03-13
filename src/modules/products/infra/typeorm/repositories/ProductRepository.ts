import { Repository, DeepPartial as TypeORMDeepPartial } from 'typeorm';
import { AppDataSource } from '../../../../../shared/infra/typeorm';
import { Product } from '../entities/Product';
import { IProductRepository } from '../../../repositories/IProductRepository';
import { DeepPartial } from '../../../../../shared/types';

export class ProductRepository implements IProductRepository {
  private repository: Repository<Product>;

  constructor() {
    this.repository = AppDataSource.getRepository(Product);
  }

  async findByIdWithCompany(id: number): Promise<Product | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async findAllFiltered(filters: {
    companyId?: number;
    search?: string;
    skip: number;
    limit: number;
  }): Promise<[Product[], number]> {
    const { companyId, search, skip, limit } = filters;

    let query = this.repository.createQueryBuilder('product');

    if (companyId) {
      query = query.where('product.companyId = :companyId', { companyId });
    }

    if (search) {
      query = query.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    return query.skip(skip).take(limit).getManyAndCount();
  }

  async save(data: DeepPartial<Product>): Promise<Product> {
    const entity = this.repository.create(data as TypeORMDeepPartial<Product>);
    return this.repository.save(entity);
  }

  async remove(product: Product): Promise<Product> {
    return this.repository.remove(product);
  }
}
