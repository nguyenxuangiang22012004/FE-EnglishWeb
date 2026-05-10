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

/** Payload POST /auth/register — field `name` khớp User.name trên backend */
export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
