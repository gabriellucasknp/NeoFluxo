const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

export interface LoginResponse {
  token: string;
  user: ApiUser;
}

/**
 * Wrapper centralizado para chamadas à API do backend Spring Boot.
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  /*
   * Token inválido ou expirado.
   *
   * Não redirecionamos aqui para evitar que o service
   * fique acoplado ao React Router.
   */
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    throw new Error('Sessão expirada. Faça login novamente.');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');

    throw new Error(
      `API Error ${response.status}: ${
        errorBody || response.statusText
      }`,
    );
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// =====================================================
// AUTH
// =====================================================

export const authService = {
  login: (email: string, password: string) =>
    fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
      }),
    }),
};

// =====================================================
// PROJECTS
// =====================================================

export const projectService = {
  getAll: () =>
    fetchApi<any[]>('/projects'),

  getById: (id: string) =>
    fetchApi<any>(`/projects/${id}`),

  create: (data: any) =>
    fetchApi<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  submit: (id: string) =>
    fetchApi<any>(`/projects/${id}/submit`, {
      method: 'POST',
    }),

  approve: (id: string) =>
    fetchApi<any>(`/projects/${id}/approve`, {
      method: 'POST',
    }),

  reject: (
    id: string,
    reason: string,
    observations: string,
  ) =>
    fetchApi<any>(`/projects/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({
        reason,
        observations,
      }),
    }),
};

// =====================================================
// USERS
// =====================================================

export const userService = {
  getAll: () =>
    fetchApi<any[]>('/users'),

  getById: (id: string) =>
    fetchApi<any>(`/users/${id}`),

  create: (data: any) =>
    fetchApi<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// =====================================================
// DEMAND FACTORS
// =====================================================

export const demandFactorService = {
  getAll: () =>
    fetchApi<any[]>('/demand-factors'),

  update: (id: string, data: any) =>
    fetchApi<any>(`/demand-factors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// =====================================================
// TRANSFORMERS
// =====================================================

export const transformerService = {
  getAll: () =>
    fetchApi<any[]>('/transformers'),

  create: (data: any) =>
    fetchApi<any>('/transformers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    fetchApi<any>(`/transformers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// =====================================================
// CERTIFICATES
// =====================================================

export const certificateService = {
  validate: (code: string) =>
    fetchApi<any>(`/certificates/validate/${code}`),
};