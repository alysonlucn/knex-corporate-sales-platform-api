import { Company } from '../infra/typeorm/entities/Company';
import { DeepPartial } from '../../../shared/types';

export interface ICompanyRepository {
  findByCnpj(cnpj: string): Promise<Company | null>;
  findById(id: number): Promise<Company | null>;
  findByIdWithRelations(id: number): Promise<Company | null>;
  findAll(): Promise<Company[]>;
  save(data: DeepPartial<Company>): Promise<Company>;
  remove(company: Company): Promise<Company>;
}
