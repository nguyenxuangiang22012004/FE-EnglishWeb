// Type definitions for authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'teacher';
  avatar?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
