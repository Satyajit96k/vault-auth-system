import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Sends HttpOnly cookies with every request
  headers: { 'Content-Type': 'application/json' },
});

// --- Token refresh queue pattern ---
// Prevents multiple simultaneous refresh calls when several requests
// fail with 401 at the same time.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

// REQUEST INTERCEPTOR: Attach access token from Zustand store
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Not a 401 — pass through
    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // 401 on the refresh endpoint itself — refresh token is invalid/expired
    // Clear auth state and redirect to login. Do NOT retry.
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Already retried this request — don't loop
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    // Start refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Call refresh endpoint — browser sends HttpOnly cookie automatically
      const { data } = await apiClient.post('/auth/refresh');
      const newToken = data.data.accessToken;

      // Update Zustand store with new access token
      useAuthStore.getState().updateAccessToken(newToken);

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      // Process any queued requests that failed during refresh
      processQueue(null, newToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear auth and redirect
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
