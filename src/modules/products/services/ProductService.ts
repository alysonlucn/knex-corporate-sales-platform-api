import { AppDataSource } from '../../../shared/infra/typeorm';
import { Product } from '../infra/typeorm/entities/Product';
import { AppError } from '../../../shared/errors/AppError';
import { User } from '../../users/infra/typeorm/entities/User';

interface CreateProductData {
  name: string;
  price: number;
  stock: number;
  companyId: number;
}

interface UpdateProductData {
  name?: string;
  price?: number;
  stock?: number;
}

interface FindAllFilters {
  companyId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProductService {
  private repository = AppDataSource.getRepository(Product);
  private userRepository = AppDataSource.getRepository(User);

  async create(data: CreateProductData, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
      relations: ['company'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role !== 'collaborator') {
      throw new AppError(403, 'Only collaborators can create products');
    }

    if (!user.company || user.company.id !== data.companyId) {
      throw new AppError(403, 'User is not a collaborator of this company');
    }

    const product = this.repository.create({
      ...data,
      company: { id: data.companyId },
    });

    return await this.repository.save(product);
  }

  async findAll(filters: FindAllFilters = {}) {
    const { companyId, search, page = 1, limit = 10 } = filters;

    let query = this.repository.createQueryBuilder('product');

    if (companyId) {
      query = query.where('product.companyId = :companyId', { companyId });
    }

    if (search) {
      query = query.andWhere('product.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const skip = (page - 1) * limit;

    const [products, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: number) {
    const product = await this.repository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductData, userId: string) {
    const product = await this.findById(id);

    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
      relations: ['company'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role !== 'collaborator') {
      throw new AppError(403, 'Only collaborators can update products');
    }

    if (!user.company || user.company.id !== product.company.id) {
      throw new AppError(
        403,
        'You do not have permission to update this product',
      );
    }

    Object.assign(product, data);
    return await this.repository.save(product);
  }

  async delete(id: number, userId: string) {
    const product = await this.findById(id);

    const user = await this.userRepository.findOne({
      where: { id: Number(userId) },
      relations: ['company'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role !== 'collaborator') {
      throw new AppError(403, 'Only collaborators can delete products');
    }

    if (!user.company || user.company.id !== product.company.id) {
      throw new AppError(
        403,
        'You do not have permission to delete this product',
      );
    }

    return await this.repository.remove(product);
  }
}
