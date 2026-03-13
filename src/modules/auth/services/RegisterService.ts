import { IUserRepository } from '../../users/repositories/IUserRepository';
import { ICompanyRepository } from '../../companies/repositories/ICompanyRepository';
import { User } from '../../users/infra/typeorm/entities/User';
import { AppError } from '../../../shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { RegisterDTO } from '../dtos/RegisterDTO';

export class RegisterService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(data: RegisterDTO): Promise<Omit<User, 'password'>> {
    const emailExists = await this.userRepository.findByEmail(data.email);

    if (emailExists) {
      throw new AppError(409, 'Email already registered');
    }

    if (data.role === 'collaborator' && data.companyId) {
      const company = await this.companyRepository.findById(
        Number(data.companyId),
      );

      if (!company) {
        throw new AppError(404, 'Company not found');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.save({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      company: data.companyId ? { id: Number(data.companyId) } : undefined,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
