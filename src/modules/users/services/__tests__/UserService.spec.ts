import { UserService } from '../UserService';
import { IUserRepository } from '../../repositories/IUserRepository';
import { AppError } from '../../../../shared/errors/AppError';
import { UserRole } from '../../infra/typeorm/entities/User';

const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIdWithCompany: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAllPaginated: jest.fn(),
  save: jest.fn(),
});

const makeFakeUser = (overrides = {}) => ({
  id: 1,
  name: 'Alice Smith',
  email: 'alice@example.com',
  password: 'hashed',
  role: UserRole.CONSUMER,
  company: null as any,
  transactions: [],
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-20'),
  ...overrides,
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    userRepository = makeUserRepositoryMock();
    userService = new UserService(userRepository);
  });

  describe('findById', () => {
    it('deve retornar o DTO correto quando user existe', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByIdWithCompany.mockResolvedValue(fakeUser);

      const result = await userService.findById(1);

      expect(result).toEqual({
        id: 1,
        name: 'Alice Smith',
        email: 'alice@example.com',
        role: UserRole.CONSUMER,
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-02-20'),
      });
    });

    it('não deve incluir password no retorno', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByIdWithCompany.mockResolvedValue(fakeUser);

      const result = await userService.findById(1);

      expect(result).not.toHaveProperty('password');
    });

    it('não deve incluir company ou transactions no retorno', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findByIdWithCompany.mockResolvedValue(fakeUser);

      const result = await userService.findById(1);

      expect(result).not.toHaveProperty('company');
      expect(result).not.toHaveProperty('transactions');
    });

    it('deve chamar findByIdWithCompany com o id correto', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(makeFakeUser());

      await userService.findById(42);

      expect(userRepository.findByIdWithCompany).toHaveBeenCalledTimes(1);
      expect(userRepository.findByIdWithCompany).toHaveBeenCalledWith(42);
    });

    it('deve lançar AppError 404 quando user não existe', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(null);

      await expect(userService.findById(999)).rejects.toThrow(AppError);
      await expect(userService.findById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada com dados formatados', async () => {
      const users = [
        makeFakeUser({ id: 1, name: 'Alice', email: 'alice@test.com' }),
        makeFakeUser({ id: 2, name: 'Bob', email: 'bob@test.com' }),
      ];
      userRepository.findAllPaginated.mockResolvedValue([users, 2]);

      const result = await userService.findAll(10, 0);

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: 1,
          name: 'Alice',
          email: 'alice@test.com',
        }),
      );
      expect(result.data[1]).toEqual(
        expect.objectContaining({
          id: 2,
          name: 'Bob',
          email: 'bob@test.com',
        }),
      );
    });

    it('deve retornar metadados de paginação corretos', async () => {
      userRepository.findAllPaginated.mockResolvedValue([[makeFakeUser()], 50]);

      const result = await userService.findAll(10, 20);

      expect(result.pagination).toEqual({
        total: 50,
        limit: 10,
        offset: 20,
      });
    });

    it('deve usar valores padrão limit=10 e offset=0', async () => {
      userRepository.findAllPaginated.mockResolvedValue([[], 0]);

      await userService.findAll();

      expect(userRepository.findAllPaginated).toHaveBeenCalledWith(10, 0);
    });

    it('deve passar limit e offset para o repositório', async () => {
      userRepository.findAllPaginated.mockResolvedValue([[], 0]);

      await userService.findAll(25, 50);

      expect(userRepository.findAllPaginated).toHaveBeenCalledWith(25, 50);
    });

    it('não deve incluir password nos items retornados', async () => {
      userRepository.findAllPaginated.mockResolvedValue([[makeFakeUser()], 1]);

      const result = await userService.findAll();

      result.data.forEach((user) => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('company');
        expect(user).not.toHaveProperty('transactions');
      });
    });

    it('deve retornar lista vazia quando não há users', async () => {
      userRepository.findAllPaginated.mockResolvedValue([[], 0]);

      const result = await userService.findAll();

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });
});
