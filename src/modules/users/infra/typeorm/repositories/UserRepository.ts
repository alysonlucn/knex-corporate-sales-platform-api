import { Repository, DeepPartial as TypeORMDeepPartial } from 'typeorm';
import { AppDataSource } from '../../../../../shared/infra/typeorm';
import { User } from '../entities/User';
import { IUserRepository } from '../../../repositories/IUserRepository';
import { DeepPartial } from '../../../../../shared/types';

export class UserRepository implements IUserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  async findByIdWithCompany(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['company'],
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'password',
        'role',
        'createdAt',
        'updatedAt',
      ],
      relations: ['company'],
    });
  }

  async findAllPaginated(
    limit: number,
    offset: number,
  ): Promise<[User[], number]> {
    return this.repository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async save(data: DeepPartial<User>): Promise<User> {
    const entity = this.repository.create(data as TypeORMDeepPartial<User>);
    return this.repository.save(entity);
  }
}
