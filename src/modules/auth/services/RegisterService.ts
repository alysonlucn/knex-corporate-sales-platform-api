import { AppDataSource } from '../../../shared/infra/typeorm';
import { User } from '../../users/infra/typeorm/entities/User';
import { Company } from '../../companies/infra/typeorm/entities/Company';
import { AppError } from '../../../shared/errors/AppError';
import bcrypt from 'bcryptjs';
import { RegisterDTO } from '../dtos/RegisterDTO';

export class RegisterService {
  async execute(data: RegisterDTO): Promise<Omit<User, 'password'>> {
    const userRepository = AppDataSource.getRepository(User);
    const companyRepository = AppDataSource.getRepository(Company);

    const emailExists = await userRepository.findOne({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new AppError(409, 'Email already registered');
    }

    if (data.role === 'collaborator' && data.companyId) {
      const company = await companyRepository.findOne({
        where: { id: Number(data.companyId) },
      });

      if (!company) {
        throw new AppError(404, 'Company not found');
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role as any,
      company: data.companyId ? { id: Number(data.companyId) } : undefined,
    });

    await userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
