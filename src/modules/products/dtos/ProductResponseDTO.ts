export interface ProductResponseDTO {
  id: number;
  name: string;
  price: number;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductListResponseDTO {
  id: number;
  name: string;
  price: number;
  stock: number;
}
