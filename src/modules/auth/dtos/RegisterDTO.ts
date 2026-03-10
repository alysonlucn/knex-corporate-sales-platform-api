export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'collaborator';
  companyId?: string;
}
