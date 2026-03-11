import * as yup from 'yup';

export const updateUserSchema = yup.object().shape({
  name: yup.string().min(3, 'Name must be at least 3 characters'),
  email: yup.string().email('Invalid email format'),
  role: yup.string().oneOf(['admin', 'manager', 'employee'], 'Invalid role'),
});
