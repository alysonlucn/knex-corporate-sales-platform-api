import { User } from '../infra/typeorm/entities/User';
import { DeepPartial } from '../../../shared/types';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByIdWithCompany(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  findAllPaginated(limit: number, offset: number): Promise<[User[], number]>;
  save(data: DeepPartial<User>): Promise<User>;
}
