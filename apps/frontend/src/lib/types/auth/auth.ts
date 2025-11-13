// lib/types/auth.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'store_admin' | 'super_admin';
  is_verified: boolean;
  profile_image?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}