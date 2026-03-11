export interface UserResponseDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicDTO {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}
