export interface CompanyResponseDTO {
  id: number;
  name: string;
  cnpj: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompanyListResponseDTO {
  id: number;
  name: string;
  cnpj: string;
  description: string;
}

export interface CompanyDetailResponseDTO extends CompanyResponseDTO {
  users?: Array<{
    id: number;
    name: string;
    email: string;
    role: string;
  }>;
  products?: Array<{
    id: number;
    name: string;
    price: number;
    stock: number;
  }>;
}
