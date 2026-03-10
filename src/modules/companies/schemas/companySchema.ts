import * as Yup from 'yup';

export const createCompanySchema = Yup.object().shape({
  name: Yup.string()
    .required('Company name is required')
    .min(3, 'Company name must be at least 3 characters'),
  cnpj: Yup.string()
    .required('CNPJ is required')
    .matches(/^\d{14}$/, 'CNPJ must be exactly 14 digits'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
});

export const updateCompanySchema = Yup.object().shape({
  name: Yup.string().min(3, 'Company name must be at least 3 characters'),
  cnpj: Yup.string().matches(/^\d{14}$/, 'CNPJ must be exactly 14 digits'),
  description: Yup.string().min(
    10,
    'Description must be at least 10 characters',
  ),
});
