import { Response } from 'express';
import { ProductService } from '../services/ProductService';
import { AuthRequest } from '../../auth/middlewares/AuthMiddleware';
import { ResponseHelper } from '../../../shared/helpers/response';
import { AppError } from '../../../shared/errors/AppError';

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async create(req: AuthRequest, res: Response) {
    const { name, price, stock } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      throw new AppError(401, 'Unauthorized');
    }

    const product = await this.productService.create(
      {
        name,
        price,
        stock,
        companyId: Number(companyId),
      },
      userId,
    );

    return ResponseHelper.success(res, product, 201);
  }

  async findAll(req: AuthRequest, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;
    const companyId = req.user?.companyId;

    if (!companyId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await this.productService.findAll({
      companyId: Number(companyId),
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    });

    return ResponseHelper.success(res, result);
  }

  async findById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const product = await this.productService.findById(Number(id));

    return ResponseHelper.success(res, product);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const product = await this.productService.update(
      Number(id),
      { name, price, stock },
      userId,
    );

    return ResponseHelper.success(res, product);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    await this.productService.delete(Number(id), userId);

    return res.status(204).send();
  }
}
