import { LoginService } from '../LoginService';
import { IUserRepository } from '../../../users/repositories/IUserRepository';
import { AppError } from '../../../../shared/errors/AppError';
import { UserRole } from '../../../users/infra/typeorm/entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIdWithCompany: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAllPaginated: jest.fn(),
  save: jest.fn(),
});

const makeFakeUser = () => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-password-123',
  role: UserRole.COLLABORATOR,
  company: {
    id: 10,
    name: 'Acme',
    cnpj: '12345678000110',
    description: 'Test',
    users: [],
    products: [],
  },
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

describe('LoginService', () => {
  let loginService: LoginService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = makeUserRepositoryMock();
    loginService = new LoginService(userRepository);
  });

  describe('execute — sucesso', () => {
    it('deve retornar token e user sem password quando credenciais válidas', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      mockedJwt.sign.mockImplementation(() => 'fake-jwt-token');

      const result = await loginService.execute({
        email: 'john@example.com',
        password: 'correct-password',
      });

      expect(result).toHaveProperty('token', 'fake-jwt-token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');

      expect(result.user).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: UserRole.COLLABORATOR,
        }),
      );
    });

    it('deve chamar findByEmailWithPassword com o email correto', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      mockedJwt.sign.mockImplementation(() => 'token');

      await loginService.execute({
        email: 'john@example.com',
        password: 'any-password',
      });

      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledTimes(1);
      expect(userRepository.findByEmailWithPassword).toHaveBeenCalledWith(
        'john@example.com',
      );
    });

    it('deve comparar a password fornecida com o hash armazenado', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      mockedJwt.sign.mockImplementation(() => 'token');

      await loginService.execute({
        email: 'john@example.com',
        password: 'my-secret-pass',
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        'my-secret-pass',
        'hashed-password-123',
      );
    });

    it('deve gerar JWT com payload contendo id, role e companyId', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      mockedJwt.sign.mockImplementation(() => 'token');

      await loginService.execute({
        email: 'john@example.com',
        password: 'any',
      });

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        { id: '1', role: 'collaborator', companyId: '10' },
        expect.any(String),
        { expiresIn: '8h' },
      );
    });

    it('deve definir companyId como null quando user não tem company', async () => {
      const fakeUser = { ...makeFakeUser(), company: undefined as any };
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(true));
      mockedJwt.sign.mockImplementation(() => 'token');

      await loginService.execute({
        email: 'john@example.com',
        password: 'any',
      });

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({ companyId: null }),
        expect.any(String),
        expect.any(Object),
      );
    });
  });

  describe('execute — erro', () => {
    it('deve lançar AppError 401 quando email não encontrado', async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        loginService.execute({
          email: 'nonexistent@example.com',
          password: 'any',
        }),
      ).rejects.toThrow(AppError);

      await expect(
        loginService.execute({
          email: 'nonexistent@example.com',
          password: 'any',
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('deve lançar AppError 401 quando password incorreta', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(false));

      await expect(
        loginService.execute({
          email: 'john@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(AppError);

      await expect(
        loginService.execute({
          email: 'john@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'Invalid email or password',
      });
    });

    it('não deve gerar JWT quando password é inválida', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByEmailWithPassword.mockResolvedValue(fakeUser);
      mockedBcrypt.compare.mockImplementation(() => Promise.resolve(false));

      await expect(
        loginService.execute({
          email: 'john@example.com',
          password: 'wrong',
        }),
      ).rejects.toThrow();

      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });

    it('não deve gerar JWT quando user não existe', async () => {
      userRepository.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        loginService.execute({
          email: 'ghost@example.com',
          password: 'any',
        }),
      ).rejects.toThrow();

      expect(mockedJwt.sign).not.toHaveBeenCalled();
    });
  });
});
