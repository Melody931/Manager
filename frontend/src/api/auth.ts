import { apiRequest } from "./client";

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "CAJERO";
}

export interface AuthBusiness {
  id: number;
  nombre: string;
  tipo: string;
  moneda: string;
  zonaHoraria: string;
  configuracion: unknown;
}

export interface AuthSession {
  usuario: AuthUser;
  negocio: AuthBusiness;
  plan: string;
}

interface AuthTokenResponse {
  data: {
    usuario: AuthUser;
    token: string;
  };
}

interface AuthSessionResponse {
  data: AuthSession;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  negocioNombre: string;
  negocioTipo: string;
  nombre: string;
}

// Inicia sesión y devuelve el token emitido por el backend.
export async function loginRequest(input: LoginInput): Promise<string> {
  const response = await apiRequest<AuthTokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.token;
}

// Registra el negocio y su primer usuario administrador.
export async function registerRequest(input: RegisterInput): Promise<string> {
  const response = await apiRequest<AuthTokenResponse>("/auth/registro", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.data.token;
}

// Recupera los datos de la sesión usando el token guardado.
export async function getCurrentSession(): Promise<AuthSession> {
  const response = await apiRequest<AuthSessionResponse>("/auth/me");
  return response.data;
}
