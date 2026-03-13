import { RegisterService } from '../RegisterService';
import { IUserRepository } from '../../../users/repositories/IUserRepository';
import { ICompanyRepository } from '../../../companies/repositories/ICompanyRepository';
import { AppError } from '../../../../shared/errors/AppError';
import { UserRole } from '../../../users/infra/typeorm/entities/User';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIdWithCompany: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAllPaginated: jest.fn(),
  save: jest.fn(),
});

const makeCompanyRepositoryMock = (): jest.Mocked<ICompanyRepository> => ({
  findByCnpj: jest.fn(),
  findById: jest.fn(),
  findByIdWithRelations: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeFakeCompany = () => ({
  id: 10,
  name: 'Acme',
  cnpj: '12345678000110',
  description: 'Test company',
  users: [],
  products: [],
});

const makeSavedUser = () => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-pass',
  role: UserRole.COLLABORATOR,
  company: { id: 10 } as any,
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('RegisterService', () => {
  let registerService: RegisterService;
  let userRepository: jest.Mocked<IUserRepository>;
  let companyRepository: jest.Mocked<ICompanyRepository>;

  beforeEach(() => {
    userRepository = makeUserRepositoryMock();
    companyRepository = makeCompanyRepositoryMock();
    registerService = new RegisterService(userRepository, companyRepository);
    mockedBcrypt.hash.mockImplementation(() => Promise.resolve('hashed-pass'));
  });

  describe('execute — sucesso', () => {
    it('deve registrar um admin e retornar user sem password', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(makeSavedUser());

      const result = await registerService.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        role: 'admin',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', 'John Doe');
    });

    it('deve registrar collaborator validando a company', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      companyRepository.findById.mockResolvedValue(makeFakeCompany() as any);
      userRepository.save.mockResolvedValue(makeSavedUser());

      const result = await registerService.execute({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
        role: 'collaborator',
        companyId: '10',
      });

      expect(companyRepository.findById).toHaveBeenCalledWith(10);
      expect(result).toHaveProperty('id');
    });

    it('deve fazer hash da password com bcrypt', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(makeSavedUser());

      await registerService.execute({
        name: 'John',
        email: 'john@example.com',
        password: 'my-secret',
        role: 'admin',
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('my-secret', 10);
    });

    it('deve chamar save com os dados corretos incluindo hash', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(makeSavedUser());

      await registerService.execute({
        name: 'John',
        email: 'john@example.com',
        password: 'raw',
        role: 'admin',
      });

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John',
          email: 'john@example.com',
          password: 'hashed-pass',
        }),
      );
    });

    it('não deve validar company quando role é admin', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue(makeSavedUser());

      await registerService.execute({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'secret',
        role: 'admin',
      });

      expect(companyRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('execute — erro', () => {
    it('deve lançar AppError 409 quando email já existe', async () => {
      userRepository.findByEmail.mockResolvedValue(makeSavedUser());

      await expect(
        registerService.execute({
          name: 'John',
          email: 'john@example.com',
          password: 'any',
          role: 'admin',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email already registered',
      });
    });

    it('deve lançar AppError 404 quando company não existe para collaborator', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      companyRepository.findById.mockResolvedValue(null);

      await expect(
        registerService.execute({
          name: 'John',
          email: 'john@example.com',
          password: 'any',
          role: 'collaborator',
          companyId: '999',
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'Company not found',
      });
    });

    it('não deve salvar user quando email duplicado', async () => {
      userRepository.findByEmail.mockResolvedValue(makeSavedUser());

      await expect(
        registerService.execute({
          name: 'John',
          email: 'john@example.com',
          password: 'any',
          role: 'admin',
        }),
      ).rejects.toThrow(AppError);

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('não deve salvar user quando company inválida', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      companyRepository.findById.mockResolvedValue(null);

      await expect(
        registerService.execute({
          name: 'John',
          email: 'john@example.com',
          password: 'any',
          role: 'collaborator',
          companyId: '999',
        }),
      ).rejects.toThrow(AppError);

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
