export interface CompanyCreateDTO {
  name: string;
  cnpj: string;
  description: string;
}

export interface CompanyUpdateDTO {
  name?: string;
  cnpj?: string;
  description?: string;
}
