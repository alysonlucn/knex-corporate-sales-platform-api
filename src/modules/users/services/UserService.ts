import { IUserRepository } from '../repositories/IUserRepository';
import { AppError } from '../../../shared/errors/AppError';
import { UserResponseDTO } from '../dtos/UserResponseDTO';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async findById(id: number): Promise<UserResponseDTO> {
    const user = await this.userRepository.findByIdWithCompany(id);

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
    const [users, total] = await this.userRepository.findAllPaginated(
      limit,
      offset,
    );

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
