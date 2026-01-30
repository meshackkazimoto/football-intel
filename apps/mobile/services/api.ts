import axios from 'axios';

const API_BASE_URL =
  (typeof process !== 'undefined' &&
    (process as unknown as { env?: { EXPO_PUBLIC_API_URL?: string } }).env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
