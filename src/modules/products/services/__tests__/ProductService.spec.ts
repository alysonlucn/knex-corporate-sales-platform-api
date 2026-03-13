import { ProductService } from '../ProductService';
import { IProductRepository } from '../../repositories/IProductRepository';
import { IUserRepository } from '../../../users/repositories/IUserRepository';
import { UserRole } from '../../../users/infra/typeorm/entities/User';

const makeProductRepositoryMock = (): jest.Mocked<IProductRepository> => ({
  findByIdWithCompany: jest.fn(),
  findAllFiltered: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeUserRepositoryMock = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByIdWithCompany: jest.fn(),
  findByEmail: jest.fn(),
  findByEmailWithPassword: jest.fn(),
  findAllPaginated: jest.fn(),
  save: jest.fn(),
});

const makeFakeCollaborator = (companyId = 10) => ({
  id: 1,
  name: 'Collaborator',
  email: 'collab@test.com',
  password: 'hashed',
  role: UserRole.COLLABORATOR,
  company: {
    id: companyId,
    name: 'Acme',
    cnpj: '12345678000110',
    description: 'Test',
    users: [],
    products: [],
  },
  transactions: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const makeFakeConsumer = () => ({
  ...makeFakeCollaborator(),
  id: 2,
  role: UserRole.CONSUMER,
  company: null as any,
});

const makeFakeProduct = (overrides = {}) => ({
  id: 1,
  name: 'Laptop',
  price: 2500,
  stock: 50,
  company: {
    id: 10,
    name: 'Acme',
    cnpj: '12345678000110',
    description: 'Test',
    users: [],
    products: [],
  },
  ...overrides,
});

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: jest.Mocked<IProductRepository>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    productRepository = makeProductRepositoryMock();
    userRepository = makeUserRepositoryMock();
    productService = new ProductService(productRepository, userRepository);
  });

  describe('create', () => {
    it('deve criar produto quando collaborator da mesma company', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator() as any,
      );
      productRepository.save.mockResolvedValue(makeFakeProduct() as any);

      const result = await productService.create(
        { name: 'Laptop', price: 2500, stock: 50, companyId: 10 },
        '1',
      );

      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Laptop',
          price: 2500,
          stock: 50,
          company: { id: 10 },
        }),
      );
      expect(result).toHaveProperty('id');
    });

    it('deve lançar 404 quando user não existe', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(null);

      await expect(
        productService.create(
          { name: 'X', price: 10, stock: 1, companyId: 10 },
          '999',
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: 'User not found',
      });
    });

    it('deve lançar 403 quando user não é collaborator', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeConsumer() as any,
      );

      await expect(
        productService.create(
          { name: 'X', price: 10, stock: 1, companyId: 10 },
          '2',
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Only collaborators can create products',
      });
    });

    it('deve lançar 403 quando collaborator é de outra company', async () => {
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator(20) as any,
      );

      await expect(
        productService.create(
          { name: 'X', price: 10, stock: 1, companyId: 10 },
          '1',
        ),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'User is not a collaborator of this company',
      });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada de produtos', async () => {
      const products = [makeFakeProduct(), makeFakeProduct({ id: 2 })];
      productRepository.findAllFiltered.mockResolvedValue([products as any, 2]);

      const result = await productService.findAll({
        companyId: 10,
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        pages: 1,
      });
    });

    it('deve calcular skip correto para paginação', async () => {
      productRepository.findAllFiltered.mockResolvedValue([[], 0]);

      await productService.findAll({ page: 3, limit: 5 });

      expect(productRepository.findAllFiltered).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, limit: 5 }),
      );
    });

    it('deve usar page=1 e limit=10 como padrão', async () => {
      productRepository.findAllFiltered.mockResolvedValue([[], 0]);

      await productService.findAll();

      expect(productRepository.findAllFiltered).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, limit: 10 }),
      );
    });

    it('deve passar filtro de search para o repositório', async () => {
      productRepository.findAllFiltered.mockResolvedValue([[], 0]);

      await productService.findAll({ search: 'Laptop' });

      expect(productRepository.findAllFiltered).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Laptop' }),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar produto quando existe', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );

      const result = await productService.findById(1);

      expect(result).toHaveProperty('name', 'Laptop');
    });

    it('deve lançar 404 quando produto não existe', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(null);

      await expect(productService.findById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Product not found',
      });
    });
  });

  describe('update', () => {
    it('deve atualizar produto quando collaborator da mesma company', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator() as any,
      );
      productRepository.save.mockResolvedValue(
        makeFakeProduct({ name: 'Updated' }) as any,
      );

      const result = await productService.update(1, { name: 'Updated' }, '1');

      expect(result.name).toBe('Updated');
    });

    it('deve lançar 404 quando user não existe no update', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(null);

      await expect(
        productService.update(1, { name: 'X' }, '999'),
      ).rejects.toMatchObject({ statusCode: 404, message: 'User not found' });
    });

    it('deve lançar 403 quando user não é collaborator no update', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeConsumer() as any,
      );

      await expect(
        productService.update(1, { name: 'X' }, '2'),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Only collaborators can update products',
      });
    });

    it('deve lançar 403 quando collaborator de outra company no update', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator(99) as any,
      );

      await expect(
        productService.update(1, { name: 'X' }, '1'),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to update this product',
      });
    });
  });

  describe('delete', () => {
    it('deve remover produto quando collaborator da mesma company', async () => {
      const product = makeFakeProduct();
      productRepository.findByIdWithCompany.mockResolvedValue(product as any);
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator() as any,
      );
      productRepository.remove.mockResolvedValue(product as any);

      await productService.delete(1, '1');

      expect(productRepository.remove).toHaveBeenCalledWith(product);
    });

    it('deve lançar 404 quando user não existe no delete', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(null);

      await expect(productService.delete(1, '999')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('deve lançar 403 quando consumer tenta deletar', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeConsumer() as any,
      );

      await expect(productService.delete(1, '2')).rejects.toMatchObject({
        statusCode: 403,
        message: 'Only collaborators can delete products',
      });
    });

    it('deve lançar 403 quando collaborator de outra company deleta', async () => {
      productRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeProduct() as any,
      );
      userRepository.findByIdWithCompany.mockResolvedValue(
        makeFakeCollaborator(99) as any,
      );

      await expect(productService.delete(1, '1')).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to delete this product',
      });
    });
  });
});
