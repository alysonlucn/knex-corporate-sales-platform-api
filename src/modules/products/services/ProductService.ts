import { IProductRepository } from '../repositories/IProductRepository';
import { IUserRepository } from '../../users/repositories/IUserRepository';
import { AppError } from '../../../shared/errors/AppError';

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
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async create(data: CreateProductData, userId: string) {
    const user = await this.userRepository.findByIdWithCompany(Number(userId));

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.role !== 'collaborator') {
      throw new AppError(403, 'Only collaborators can create products');
    }

    if (!user.company || user.company.id !== data.companyId) {
      throw new AppError(403, 'User is not a collaborator of this company');
    }

    return await this.productRepository.save({
      name: data.name,
      price: data.price,
      stock: data.stock,
      company: { id: data.companyId },
    });
  }

  async findAll(filters: FindAllFilters = {}) {
    const { companyId, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository.findAllFiltered({
      companyId,
      search,
      skip,
      limit,
    });

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
    const product = await this.productRepository.findByIdWithCompany(id);

    if (!product) {
      throw new AppError(404, 'Product not found');
    }

    return product;
  }

  async update(id: number, data: UpdateProductData, userId: string) {
    const product = await this.findById(id);

    const user = await this.userRepository.findByIdWithCompany(Number(userId));

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
    return await this.productRepository.save(product);
  }

  async delete(id: number, userId: string) {
    const product = await this.findById(id);

    const user = await this.userRepository.findByIdWithCompany(Number(userId));

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

    return await this.productRepository.remove(product);
  }
}
