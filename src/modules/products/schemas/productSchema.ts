import * as Yup from 'yup';

export const createProductSchema = Yup.object().shape({
  name: Yup.string()
    .required('Product name is required')
    .min(3, 'Product name must be at least 3 characters'),
  price: Yup.number()
    .required('Price is required')
    .positive('Price must be a positive number'),
  stock: Yup.number()
    .required('Stock is required')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

export const updateProductSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Product name must be at least 3 characters'),
  price: Yup.number().positive('Price must be a positive number'),
  stock: Yup.number()
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative'),
});

export const queryProductSchema = Yup.object().shape({
  search: Yup.string().optional(),
  page: Yup.number().optional().positive('Page must be positive'),
  limit: Yup.number().optional().positive('Limit must be positive'),
});
