import { Request, Response } from 'express';
import { CompanyService } from '../services/CompanyService';

export class CompanyController {
  private companyService = new CompanyService();

  async create(req: Request, res: Response) {
    const { name, cnpj, description } = req.body;

    const company = await this.companyService.create({
      name,
      cnpj,
      description,
    });

    return res.status(201).json(company);
  }

  async findAll(req: Request, res: Response) {
    const companies = await this.companyService.findAll();

    return res.status(200).json(companies);
  }

  async findById(req: Request, res: Response) {
    const { id } = req.params;

    const company = await this.companyService.findById(Number(id));

    return res.status(200).json(company);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, cnpj, description } = req.body;

    const company = await this.companyService.update(Number(id), {
      name,
      cnpj,
      description,
    });

    return res.status(200).json(company);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    await this.companyService.delete(Number(id));

    return res.status(204).send();
  }
}
