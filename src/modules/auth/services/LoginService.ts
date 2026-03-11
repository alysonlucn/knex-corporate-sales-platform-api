import { AppDataSource } from '../../../shared/infra/typeorm';
import { User } from '../../users/infra/typeorm/entities/User';
import { AppError } from '../../../shared/errors/AppError';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginDTO } from '../dtos/LoginDTO';

interface TokenPayload {
  id: string;
  role: string;
  companyId: string | null;
}

interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export class LoginService {
  async execute(data: LoginDTO): Promise<LoginResponse> {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { email: data.email },
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

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    const payload: TokenPayload = {
      id: String(user.id),
      role: user.role,
      companyId: user.company?.id ? String(user.company.id) : null,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'default-secret',
      {
        expiresIn: '8h',
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }
}
