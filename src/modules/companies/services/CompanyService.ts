import { ICompanyRepository } from '../repositories/ICompanyRepository';
import { AppError } from '../../../shared/errors/AppError';

export class CompanyService {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  async create(data: { name: string; cnpj: string; description: string }) {
    const cnpjExists = await this.companyRepository.findByCnpj(data.cnpj);

    if (cnpjExists) {
      throw new AppError(409, 'Company with this CNPJ already exists');
    }

    return await this.companyRepository.save(data);
  }

  async findAll() {
    return await this.companyRepository.findAll();
  }

  async findById(id: number) {
    const company = await this.companyRepository.findByIdWithRelations(id);

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
      const cnpjExists = await this.companyRepository.findByCnpj(data.cnpj);
      if (cnpjExists) {
        throw new AppError(409, 'Company with this CNPJ already exists');
      }
    }

    Object.assign(company, data);
    return await this.companyRepository.save(company);
  }

  async delete(id: number) {
    const company = await this.findById(id);
    return await this.companyRepository.remove(company);
  }
}
