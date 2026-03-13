import { CompanyService } from '../CompanyService';
import { ICompanyRepository } from '../../repositories/ICompanyRepository';

const makeCompanyRepositoryMock = (): jest.Mocked<ICompanyRepository> => ({
  findByCnpj: jest.fn(),
  findById: jest.fn(),
  findByIdWithRelations: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

const makeFakeCompany = (overrides = {}) => ({
  id: 1,
  name: 'Acme Corp',
  cnpj: '12345678000110',
  description: 'Technology company',
  users: [],
  products: [],
  ...overrides,
});

describe('CompanyService', () => {
  let companyService: CompanyService;
  let companyRepository: jest.Mocked<ICompanyRepository>;

  beforeEach(() => {
    companyRepository = makeCompanyRepositoryMock();
    companyService = new CompanyService(companyRepository);
  });

  describe('create', () => {
    it('deve criar company quando CNPJ é único', async () => {
      const data = {
        name: 'Acme',
        cnpj: '12345678000110',
        description: 'Tech company',
      };
      companyRepository.findByCnpj.mockResolvedValue(null);
      companyRepository.save.mockResolvedValue(makeFakeCompany() as any);

      const result = await companyService.create(data);

      expect(companyRepository.findByCnpj).toHaveBeenCalledWith(
        '12345678000110',
      );
      expect(companyRepository.save).toHaveBeenCalledWith(data);
      expect(result).toHaveProperty('id');
    });

    it('deve lançar AppError 409 quando CNPJ já existe', async () => {
      companyRepository.findByCnpj.mockResolvedValue(makeFakeCompany() as any);

      await expect(
        companyService.create({
          name: 'New',
          cnpj: '12345678000110',
          description: 'Duplicate',
        }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Company with this CNPJ already exists',
      });

      expect(companyRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as companies', async () => {
      const companies = [makeFakeCompany(), makeFakeCompany({ id: 2 })];
      companyRepository.findAll.mockResolvedValue(companies as any);

      const result = await companyService.findAll();

      expect(result).toHaveLength(2);
      expect(companyRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('deve retornar lista vazia quando não há companies', async () => {
      companyRepository.findAll.mockResolvedValue([]);

      const result = await companyService.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve retornar company com relations quando existe', async () => {
      companyRepository.findByIdWithRelations.mockResolvedValue(
        makeFakeCompany() as any,
      );

      const result = await companyService.findById(1);

      expect(result).toHaveProperty('name', 'Acme Corp');
      expect(companyRepository.findByIdWithRelations).toHaveBeenCalledWith(1);
    });

    it('deve lançar AppError 404 quando company não existe', async () => {
      companyRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(companyService.findById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Company not found',
      });
    });
  });

  describe('update', () => {
    it('deve atualizar company quando dados válidos', async () => {
      const existing = makeFakeCompany();
      companyRepository.findByIdWithRelations.mockResolvedValue(
        existing as any,
      );
      companyRepository.save.mockResolvedValue({
        ...existing,
        name: 'Updated',
      } as any);

      const result = await companyService.update(1, { name: 'Updated' });

      expect(companyRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('Updated');
    });

    it('deve verificar unicidade do CNPJ ao atualizar', async () => {
      const existing = makeFakeCompany({ cnpj: '11111111111111' });
      companyRepository.findByIdWithRelations.mockResolvedValue(
        existing as any,
      );
      companyRepository.findByCnpj.mockResolvedValue(
        makeFakeCompany({ id: 2 }) as any,
      );

      await expect(
        companyService.update(1, { cnpj: '22222222222222' }),
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Company with this CNPJ already exists',
      });
    });

    it('deve permitir update sem mudar CNPJ', async () => {
      const existing = makeFakeCompany();
      companyRepository.findByIdWithRelations.mockResolvedValue(
        existing as any,
      );
      companyRepository.save.mockResolvedValue(existing as any);

      await companyService.update(1, { cnpj: existing.cnpj });

      expect(companyRepository.findByCnpj).not.toHaveBeenCalled();
      expect(companyRepository.save).toHaveBeenCalled();
    });

    it('deve lançar 404 quando company não existe', async () => {
      companyRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(
        companyService.update(999, { name: 'X' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('delete', () => {
    it('deve remover company quando existe', async () => {
      const existing = makeFakeCompany();
      companyRepository.findByIdWithRelations.mockResolvedValue(
        existing as any,
      );
      companyRepository.remove.mockResolvedValue(existing as any);

      await companyService.delete(1);

      expect(companyRepository.remove).toHaveBeenCalledWith(existing);
    });

    it('deve lançar 404 quando company não existe', async () => {
      companyRepository.findByIdWithRelations.mockResolvedValue(null);

      await expect(companyService.delete(999)).rejects.toMatchObject({
        statusCode: 404,
      });

      expect(companyRepository.remove).not.toHaveBeenCalled();
    });
  });
});
