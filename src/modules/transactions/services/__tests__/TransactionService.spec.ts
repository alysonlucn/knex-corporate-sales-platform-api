import { TransactionService } from '../TransactionService';
import { ITransactionRepository } from '../../repositories/ITransactionRepository';
import { IUserRepository } from '../../../users/repositories/IUserRepository';
import { UserRole } from '../../../users/infra/typeorm/entities/User';

const makeTransactionRepositoryMock =
  (): jest.Mocked<ITransactionRepository> => ({
    executePurchase: jest.fn(),
    findByUserPaginated: jest.fn(),
    findAllPaginated: jest.fn(),
  });

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
  name: 'Consumer',
  email: 'consumer@test.com',
  password: 'hashed',
  role: UserRole.CONSUMER,
  company: null as any,
  transactions: [],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
});

const makeFakeProduct = () => ({
  id: 5,
  name: 'Laptop',
  price: 2500,
  stock: 50,
  company: { id: 10 } as any,
});

const makeFakeTransaction = (overrides = {}) => ({
  id: 1,
  quantity: 2,
  totalPrice: 5000,
  createdAt: new Date('2026-03-01'),
  user: makeFakeUser(),
  product: makeFakeProduct(),
  ...overrides,
});

const makePurchaseResult = () => ({
  id: 1,
  quantity: 2,
  totalPrice: 5000,
  createdAt: new Date('2026-03-01'),
  product: { id: 5, name: 'Laptop', price: 2500 },
});

describe('TransactionService', () => {
  let transactionService: TransactionService;
  let transactionRepository: jest.Mocked<ITransactionRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    transactionRepository = makeTransactionRepositoryMock();
    userRepository = makeUserRepositoryMock();
    transactionService = new TransactionService(
      transactionRepository,
      userRepository,
    );
  });

  describe('purchase', () => {
    it('deve executar compra com sucesso', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findById.mockResolvedValue(fakeUser);
      transactionRepository.executePurchase.mockResolvedValue(
        makePurchaseResult(),
      );

      const result = await transactionService.purchase({
        userId: 1,
        productId: 5,
        quantity: 2,
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          quantity: 2,
          totalPrice: 5000,
          product: expect.objectContaining({ id: 5, name: 'Laptop' }),
        }),
      );
    });

    it('deve chamar executePurchase com user e dados corretos', async () => {
      const fakeUser = makeFakeUser();
      userRepository.findById.mockResolvedValue(fakeUser);
      transactionRepository.executePurchase.mockResolvedValue(
        makePurchaseResult(),
      );

      await transactionService.purchase({
        userId: 1,
        productId: 5,
        quantity: 3,
      });

      expect(transactionRepository.executePurchase).toHaveBeenCalledWith({
        user: fakeUser,
        productId: 5,
        quantity: 3,
      });
    });

    it('deve lançar 404 quando user não existe', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        transactionService.purchase({
          userId: 999,
          productId: 5,
          quantity: 1,
        }),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });

      expect(transactionRepository.executePurchase).not.toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('deve retornar transações paginadas do user', async () => {
      const transactions = [makeFakeTransaction()];
      transactionRepository.findByUserPaginated.mockResolvedValue([
        transactions as any,
        1,
      ]);

      const result = await transactionService.findByUser(1, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: 1,
          quantity: 2,
          totalPrice: 5000,
          product: expect.objectContaining({ id: 5, name: 'Laptop' }),
        }),
      );
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('deve calcular skip correto', async () => {
      transactionRepository.findByUserPaginated.mockResolvedValue([[], 0]);

      await transactionService.findByUser(1, { page: 3, limit: 5 });

      expect(transactionRepository.findByUserPaginated).toHaveBeenCalledWith(
        1,
        10,
        5,
      );
    });

    it('deve usar page=1 e limit=10 como padrão', async () => {
      transactionRepository.findByUserPaginated.mockResolvedValue([[], 0]);

      await transactionService.findByUser(1);

      expect(transactionRepository.findByUserPaginated).toHaveBeenCalledWith(
        1,
        0,
        10,
      );
    });

    it('deve retornar lista vazia quando sem transações', async () => {
      transactionRepository.findByUserPaginated.mockResolvedValue([[], 0]);

      const result = await transactionService.findByUser(1);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as transações paginadas', async () => {
      const transactions = [
        makeFakeTransaction({ id: 1 }),
        makeFakeTransaction({ id: 2 }),
      ];
      transactionRepository.findAllPaginated.mockResolvedValue([
        transactions as any,
        2,
      ]);

      const result = await transactionService.findAll({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toHaveProperty('user');
      expect(result.data[0]).toHaveProperty('product');
      expect(result.pagination.total).toBe(2);
    });

    it('deve mapear user com id, name e email', async () => {
      transactionRepository.findAllPaginated.mockResolvedValue([
        [makeFakeTransaction()] as any,
        1,
      ]);

      const result = await transactionService.findAll();

      expect(result.data[0].user).toEqual({
        id: 1,
        name: 'Consumer',
        email: 'consumer@test.com',
      });
    });

    it('deve mapear product com id, name e price', async () => {
      transactionRepository.findAllPaginated.mockResolvedValue([
        [makeFakeTransaction()] as any,
        1,
      ]);

      const result = await transactionService.findAll();

      expect(result.data[0].product).toEqual({
        id: 5,
        name: 'Laptop',
        price: 2500,
      });
    });

    it('deve calcular totalPages corretamente', async () => {
      transactionRepository.findAllPaginated.mockResolvedValue([[], 25]);

      const result = await transactionService.findAll({
        page: 1,
        limit: 10,
      });

      expect(result.pagination.totalPages).toBe(3);
    });

    it('deve usar page=1 e limit=10 como padrão', async () => {
      transactionRepository.findAllPaginated.mockResolvedValue([[], 0]);

      await transactionService.findAll();

      expect(transactionRepository.findAllPaginated).toHaveBeenCalledWith(
        0,
        10,
      );
    });
  });
});
