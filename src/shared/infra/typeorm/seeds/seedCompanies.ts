import { AppDataSource } from '../index';
import { Company } from '../../../../modules/companies/infra/typeorm/entities/Company';

export const seedCompanies = async () => {
  const companyRepository = AppDataSource.getRepository(Company);

  const companies = [
    {
      name: 'Apple',
      cnpj: '12345678000110',
      description: 'Tech company specializing in consumer electronics',
    },
    {
      name: 'Samsung',
      cnpj: '12345678000111',
      description: 'South Korean multinational electronics corporation',
    },
    {
      name: 'Microsoft',
      cnpj: '12345678000112',
      description: 'American technology company and software corporation',
    },
    {
      name: 'Google',
      cnpj: '12345678000113',
      description: 'American technology and search engine company',
    },
    {
      name: 'Amazon',
      cnpj: '12345678000114',
      description: 'American e-commerce and cloud computing company',
    },
  ];

  for (const companyData of companies) {
    const exists = await companyRepository.findOneBy({
      cnpj: companyData.cnpj,
    });

    if (!exists) {
      const company = companyRepository.create(companyData);
      await companyRepository.save(company);
      // eslint-disable-next-line no-console
      console.log(`Company created: ${company.name}`);
    } else {
      // eslint-disable-next-line no-console
      console.log(`Company already exists: ${companyData.name}`);
    }
  }
};
