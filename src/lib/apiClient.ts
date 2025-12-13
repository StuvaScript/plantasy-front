let _token: string | null = null;

//todo ``** Go through this whole file and ask about all the weird TS like "unknown" and "never" and the built-in TS like HeadersInit, AbortSignal, RequestInit, etc

export function setToken(token: string | null): void {
  _token = token;
  try {
    if (token) localStorage.setItem("auth.token", token);
    else localStorage.removeItem("auth.token");
  } catch {}
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem("auth.token");
  } catch {
    return null;
  }
}

export function clearToken(): void {
  setToken(null);
}

const API_URL: string | undefined =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

type RequestOptions<TBody = unknown> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function request<TResponse, Tbody = unknown>(
  path: string,
  options: RequestOptions<Tbody> = {}
): Promise<TResponse> {
  if (!API_URL) {
    throw new Error(
      "VITE_API_URL is not set. Please configure your .env.local"
    );
  }

  const { method = "GET", body, headers = {}, signal } = options;

  const url = `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const hasBody = body !== undefined && body !== null;
  const isFormData = body instanceof FormData;

  const init: RequestInit = {
    method,
    headers: {
      // Don't set Content-Type for FormData - let browser set it with boundary
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(headers || {}),
    },
    ...(hasBody
      ? {
          body:
            isFormData || typeof body === "string"
              ? body
              : JSON.stringify(body),
        }
      : {}),
    ...(signal ? { signal } : {}),
  };

  // Attach auth header if we have a token
  const token = _token ?? getStoredToken();
  if (token) {
    init.headers = {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    };
  }

  const res = await fetch(url, init);
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json().catch(() => null) : null;

  type ApiError = Error & {
    status?: number;
    payload?: unknown;
  };

  if (!res.ok) {
    const message =
      data?.msg || data?.error || res.statusText || "Request failed";
    const error: ApiError = new Error(message);
    error.status = res.status;
    error.payload = data;
    if (res.status === 401) {
      try {
        localStorage.removeItem("auth.token");
      } catch {}
    }
    throw error;
  }

  return data as TResponse;
}

const api = {
  get: <TResponse>(path: string, opts?: RequestOptions<never>) =>
    request<TResponse>(path, { ...opts, method: "GET" }),

  post: <Tbody, TResponse>(
    path: string,
    body: Tbody,
    opts?: RequestOptions<Tbody>
  ) => request<TResponse, Tbody>(path, { ...opts, method: "POST", body }),

  put: <Tbody, TResponse>(
    path: string,
    body: Tbody,
    opts?: RequestOptions<Tbody>
  ) => request<TResponse, Tbody>(path, { ...opts, method: "PUT", body }),

  patch: <Tbody, TResponse>(
    path: string,
    body: Tbody,
    opts?: RequestOptions<Tbody>
  ) => request<TResponse, Tbody>(path, { ...opts, method: "PATCH", body }),

  delete: <TResponse>(path: string, opts?: RequestOptions<never>) =>
    request<TResponse>(path, { ...opts, method: "DELETE" }),
};

export default api;
