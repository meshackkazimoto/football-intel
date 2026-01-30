export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
}

export interface MeResponse {
  user: User | null;
}
