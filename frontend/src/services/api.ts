const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Wrapper centralizado para chamadas à API do backend Spring Boot.
 * Basta trocar os mocks por chamadas a fetchApi quando o endpoint estiver pronto.
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Aqui voce pode injetar o token JWT quando implementar autenticacao:
  // const token = localStorage.getItem('token');
  // if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`API Error ${response.status}: ${errorBody || response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  return response.json();
}

// ===================== SERVICOS =====================
// Use esses metodos quando os endpoints do Spring estiverem prontos.
// Exemplo: em vez de usar mockData, chame projectService.getAll()

export const authService = {
  login: (email: string, password: string) =>
    fetchApi<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const projectService = {
  getAll: () => fetchApi<any[]>('/projects'),
  getById: (id: string) => fetchApi<any>(`/projects/${id}`),
  create: (data: any) =>
    fetchApi<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    fetchApi<void>(`/projects/${id}`, { method: 'DELETE' }),
  submit: (id: string) =>
    fetchApi<any>(`/projects/${id}/submit`, { method: 'POST' }),
  approve: (id: string) =>
    fetchApi<any>(`/projects/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string, observations: string) =>
    fetchApi<any>(`/projects/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason, observations }),
    }),
};

export const userService = {
  getAll: () => fetchApi<any[]>('/users'),
  getById: (id: string) => fetchApi<any>(`/users/${id}`),
  create: (data: any) =>
    fetchApi<any>('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const demandFactorService = {
  getAll: () => fetchApi<any[]>('/demand-factors'),
  update: (id: string, data: any) =>
    fetchApi<any>(`/demand-factors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const transformerService = {
  getAll: () => fetchApi<any[]>('/transformers'),
  create: (data: any) =>
    fetchApi<any>('/transformers', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    fetchApi<any>(`/transformers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const certificateService = {
  validate: (code: string) => fetchApi<any>(`/certificates/validate/${code}`),
};
