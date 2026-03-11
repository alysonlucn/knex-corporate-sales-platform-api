import { Response } from 'express';
import { ProductService } from '../services/ProductService';
import { AuthRequest } from '../../auth/middlewares/AuthMiddleware';

export class ProductController {
  private productService = new ProductService();

  async create(req: AuthRequest, res: Response) {
    const { name, price, stock } = req.body;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    if (!userId || !companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
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

    return res.status(201).json(product);
  }

  async findAll(req: AuthRequest, res: Response) {
    const { search, page = 1, limit = 10 } = req.query;
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await this.productService.findAll({
      companyId: Number(companyId),
      search: search as string,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json(result);
  }

  async findById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const product = await this.productService.findById(Number(id));

    return res.status(200).json(product);
  }

  async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const product = await this.productService.update(
      Number(id),
      { name, price, stock },
      userId,
    );

    return res.status(200).json(product);
  }

  async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await this.productService.delete(Number(id), userId);

    return res.status(204).send();
  }
}
