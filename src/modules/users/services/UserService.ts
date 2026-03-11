import { AppDataSource } from '../../../shared/infra/typeorm';
import { User } from '../infra/typeorm/entities/User';
import { AppError } from '../../../shared/errors/AppError';
import { UserResponseDTO } from '../dtos/UserResponseDTO';

export class UserService {
  private repository = AppDataSource.getRepository(User);

  async findById(id: number): Promise<UserResponseDTO> {
    const user = await this.repository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findAll(limit = 10, offset = 0) {
    const [users, total] = await this.repository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }
}
