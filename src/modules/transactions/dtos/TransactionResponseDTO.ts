export interface TransactionResponseDTO {
  id: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  product: {
    id: number;
    name: string;
    price: number;
  };
}

export interface TransactionDetailResponseDTO {
  id: number;
  quantity: number;
  totalPrice: number;
  createdAt: Date;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
    price: number;
  };
}
