import * as yup from 'yup';

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
  role: yup
    .string()
    .oneOf(['admin', 'collaborator'])
    .required('Role is required'),
  companyId: yup.string().when('role', {
    is: 'collaborator',
    then: (schema) =>
      schema.required('companyId is required for collaborators'),
    otherwise: (schema) => schema.notRequired(),
  }),
});
