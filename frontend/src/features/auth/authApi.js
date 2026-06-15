import apiClient from '../../shared/api/client.js';
import { API_PATHS } from '../../shared/api/paths.js';

export function login(credentials) {
  return apiClient.post(API_PATHS.auth.login, {
    email: credentials.email,
    password: credentials.password,
  });
}

export function register(data) {
  return apiClient.post(API_PATHS.auth.register, {
    email: data.email,
    password: data.password,
  });
}

export function refreshToken(refreshTokenValue) {
  return apiClient.post(API_PATHS.auth.refresh, {
    refreshToken: refreshTokenValue,
  });
}

export function logout(refreshTokenValue) {
  return apiClient.post(API_PATHS.auth.logout, {
    refreshToken: refreshTokenValue,
  });
}

export function getCurrentAccount() {
  return apiClient.get(API_PATHS.auth.me);
}
