// @ts-ignore
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ||'localhost:8000';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('auth_token');

  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
