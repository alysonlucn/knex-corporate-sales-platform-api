import { AppDataSource } from '../../../shared/infra/typeorm';
import { Company } from '../infra/typeorm/entities/Company';
import { AppError } from '../../../shared/errors/AppError';

export class CompanyService {
  private repository = AppDataSource.getRepository(Company);

  async create(data: { name: string; cnpj: string; description: string }) {
    const cnpjExists = await this.repository.findOneBy({ cnpj: data.cnpj });

    if (cnpjExists) {
      throw new AppError(409, 'Company with this CNPJ already exists');
    }

    const company = this.repository.create(data);
    return await this.repository.save(company);
  }

  async findAll() {
    return await this.repository.find();
  }

  async findById(id: number) {
    const company = await this.repository.findOne({
      where: { id },
      relations: ['users', 'products'],
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    return company;
  }

  async update(
    id: number,
    data: { name?: string; cnpj?: string; description?: string },
  ) {
    const company = await this.findById(id);

    if (data.cnpj && data.cnpj !== company.cnpj) {
      const cnpjExists = await this.repository.findOneBy({ cnpj: data.cnpj });
      if (cnpjExists) {
        throw new AppError(409, 'Company with this CNPJ already exists');
      }
    }

    Object.assign(company, data);
    return await this.repository.save(company);
  }

  async delete(id: number) {
    const company = await this.findById(id);
    return await this.repository.remove(company);
  }
}
