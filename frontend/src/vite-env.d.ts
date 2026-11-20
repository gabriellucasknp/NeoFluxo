/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "1" no build da demonstração: o fetchApi responde do back em memória (services/mock) */
  readonly VITE_MOCK?: string;
}
