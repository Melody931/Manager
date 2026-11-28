const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Error personalizado para manejar las respuestas de la API.
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Función central para realizar solicitudes HTTP.
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  // Recuperamos el token guardado durante el inicio de sesión.
  const token = localStorage.getItem("manager_token");

  // Preparamos los encabezados HTTP.
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Si existe un token, lo enviamos para autenticar la petición.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Enviamos la solicitud al backend.
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // Convertimos la respuesta a JSON.
  const payload: unknown = await response.json().catch(() => null);

  // Si el servidor devuelve un error, lo convertimos en ApiError.
  if (!response.ok) {
    const errorData = payload as {
      error?: {
        mensaje?: string;
        codigo?: string;
      };
    } | null;

    throw new ApiError(
      errorData?.error?.mensaje || "Ocurrió un error en el servidor.",
      response.status,
      errorData?.error?.codigo,
    );
  }

  // Devolvemos los datos con el tipo indicado por quien llama.
  return payload as T;
}
