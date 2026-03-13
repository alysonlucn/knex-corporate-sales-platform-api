import { AppDataSource } from '../index';
import {
  User,
  UserRole,
} from '../../../../modules/users/infra/typeorm/entities/User';
import { Company } from '../../../../modules/companies/infra/typeorm/entities/Company';
import bcrypt from 'bcryptjs';
import { Logger } from '../../../helpers/logger';

export const seedUsers = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const companyRepository = AppDataSource.getRepository(Company);

  const apple = await companyRepository.findOneBy({ cnpj: '12345678000110' });
  const samsung = await companyRepository.findOneBy({ cnpj: '12345678000111' });

  // Admin User
  const adminExists = await userRepository.findOneBy({
    email: 'admin@example.com',
  });
  if (!adminExists) {
    const admin = userRepository.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 8),
      role: UserRole.ADMIN,
    });
    await userRepository.save(admin);
    Logger.info('✅ Admin user created');
  }

  // Apple Collaborator
  const appleCollabExists = await userRepository.findOneBy({
    email: 'collaborator@apple.com',
  });
  if (!appleCollabExists && apple) {
    const appleCollab = userRepository.create({
      name: 'Apple Collaborator',
      email: 'collaborator@apple.com',
      password: await bcrypt.hash('collab123', 8),
      role: UserRole.COLLABORATOR,
      company: apple,
    });
    await userRepository.save(appleCollab);
    Logger.info('✅ Apple collaborator created');
  }

  // Samsung Collaborator
  const samsungCollabExists = await userRepository.findOneBy({
    email: 'collaborator@samsung.com',
  });
  if (!samsungCollabExists && samsung) {
    const samsungCollab = userRepository.create({
      name: 'Samsung Collaborator',
      email: 'collaborator@samsung.com',
      password: await bcrypt.hash('collab123', 8),
      role: UserRole.COLLABORATOR,
      company: samsung,
    });
    await userRepository.save(samsungCollab);
    Logger.info('✅ Samsung collaborator created');
  }

  // Consumer User
  const consumerExists = await userRepository.findOneBy({
    email: 'consumer@example.com',
  });
  if (!consumerExists) {
    const consumer = userRepository.create({
      name: 'Consumer User',
      email: 'consumer@example.com',
      password: await bcrypt.hash('consumer123', 8),
      role: UserRole.CONSUMER,
    });
    await userRepository.save(consumer);
    Logger.info('✅ Consumer user created');
  }
};
