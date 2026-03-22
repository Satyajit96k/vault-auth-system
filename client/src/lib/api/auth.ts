import apiClient from './client';
import type { LoginInput, RegisterInput, AuthResponse, RefreshResponse, ApiResponse, User } from '@/types';

export const authApi = {
  register: (data: Omit<RegisterInput, 'confirmPassword'>) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data),

  login: (data: LoginInput) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  refresh: () =>
    apiClient.post<RefreshResponse>('/auth/refresh'),

  getMe: () =>
    apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),

  logout: () =>
    apiClient.post<ApiResponse>('/auth/logout'),

  logoutAll: () =>
    apiClient.post<ApiResponse>('/auth/logout-all'),
};
