import { Repository, DeepPartial as TypeORMDeepPartial } from 'typeorm';
import { AppDataSource } from '../../../../../shared/infra/typeorm';
import { Company } from '../entities/Company';
import { ICompanyRepository } from '../../../repositories/ICompanyRepository';
import { DeepPartial } from '../../../../../shared/types';

export class CompanyRepository implements ICompanyRepository {
  private repository: Repository<Company>;

  constructor() {
    this.repository = AppDataSource.getRepository(Company);
  }

  async findByCnpj(cnpj: string): Promise<Company | null> {
    return this.repository.findOneBy({ cnpj });
  }

  async findById(id: number): Promise<Company | null> {
    return this.repository.findOneBy({ id });
  }

  async findByIdWithRelations(id: number): Promise<Company | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['users', 'products'],
    });
  }

  async findAll(): Promise<Company[]> {
    return this.repository.find();
  }

  async save(data: DeepPartial<Company>): Promise<Company> {
    const entity = this.repository.create(data as TypeORMDeepPartial<Company>);
    return this.repository.save(entity);
  }

  async remove(company: Company): Promise<Company> {
    return this.repository.remove(company);
  }
}
