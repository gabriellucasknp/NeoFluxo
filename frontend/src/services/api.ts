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

  // Modo demonstração (build com VITE_MOCK=1): responde do back em memória, sem rede.
  // Sem VITE_MOCK o Vite troca a condição por false e o mock nem entra no bundle.
  const response = import.meta.env.VITE_MOCK
    ? await (await import('./mock/backend')).mockFetch(endpoint, { ...options, headers })
    : await fetch(url, {
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
    // No login, 401 é senha/e-mail errado (ou conta inativa) — não é sessão expirada.
    if (endpoint.startsWith('/auth/login')) {
      const body = await response.json().catch(() => null);
      const message = body?.message && body.message !== 'Credenciais inválidas' ? body.message : 'E-mail ou senha inválidos.';
      throw new Error(message);
    }

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
  me: () => fetchApi<LoginResponse['user']>('/auth/me'),
  register: (data: { name: string; email: string; password: string; role?: string; department?: string }) =>
    fetchApi<LoginResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ ...data, role: data.role?.toUpperCase() }) }),
  forgotPassword: (email: string) =>
    fetchApi<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyGoogleAuth: (_data: any): Promise<any> => Promise.reject(new Error('Login com Google indisponível no back Java')),
  completeGoogleProfile: (_data: any): Promise<any> => Promise.reject(new Error('Login com Google indisponível no back Java')),
};

// =====================================================
// PROJECTS
// =====================================================

export const projectService = {
  saveStep: (id: string, step: number, data: any) =>
    fetchApi<any>(`/projects/${id}/steps/${step}`, { method: 'PUT', body: JSON.stringify(data) }),

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
// Usado pela ConfiguracoesPage (status da integração Firebase)
export const firebaseBackendService = {
  getStatus: () => fetchApi<any>('/firebase/status'),
};
