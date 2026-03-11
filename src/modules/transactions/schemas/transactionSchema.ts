import * as Yup from 'yup';

export const purchaseTransactionSchema = Yup.object().shape({
  productId: Yup.number()
    .required('Product ID is required')
    .positive('Product ID must be positive'),
  quantity: Yup.number()
    .required('Quantity is required')
    .positive('Quantity must be positive')
    .integer('Quantity must be an integer'),
});

export type PurchaseTransactionData = Yup.InferType<
  typeof purchaseTransactionSchema
>;
