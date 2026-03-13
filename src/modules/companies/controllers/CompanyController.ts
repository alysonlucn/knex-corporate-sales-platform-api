import { Request, Response } from 'express';
import { CompanyService } from '../services/CompanyService';
import { ResponseHelper } from '../../../shared/helpers/response';

export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  async create(req: Request, res: Response) {
    const { name, cnpj, description } = req.body;

    const company = await this.companyService.create({
      name,
      cnpj,
      description,
    });

    return ResponseHelper.success(res, company, 201);
  }

  async findAll(req: Request, res: Response) {
    const companies = await this.companyService.findAll();

    return ResponseHelper.success(res, companies);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const company = await this.companyService.findById(Number(id));

    return ResponseHelper.success(res, company);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, cnpj, description } = req.body;

    const company = await this.companyService.update(Number(id), {
      name,
      cnpj,
      description,
    });

    return ResponseHelper.success(res, company);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await this.companyService.delete(Number(id));

    return res.status(204).send();
  }
}
