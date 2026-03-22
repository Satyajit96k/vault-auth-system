export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  lastLoginAt: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  status: 'success';
  message: string;
  data: {
    user: User;
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

export interface RefreshResponse {
  status: 'success';
  data: {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
  };
}

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Array<{ field: string; message: string }>;
  retryAfter?: number;
}
