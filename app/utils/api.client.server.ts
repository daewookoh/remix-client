/**
 * API Client for User App
 * Communicates with Backend API Server
 */

function getApiUrl() {
  return process.env.API_URL || "http://localhost:8080";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ApiOptions extends RequestInit {
  token?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiUrl()}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "API request failed",
      response.status,
      data
    );
  }

  return data;
}

// Auth API - User 전용
export const authApi = {
  async login(email: string, password: string) {
    return fetchApi<{
      token: string;
      user: {
        id: string;
        email: string;
        name: string | null;
        role: "user";
      };
    }>("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getMe(token: string) {
    return fetchApi<{
      user: {
        id: string;
        email: string;
        role: "user";
      };
    }>("/api/user/me", { token });
  },
};

// Product API - User 전용 (읽기만)
export const productApi = {
  async getAll(token?: string) {
    return fetchApi<{
      products: Array<{
        id: string;
        name: string;
        description: string | null;
        price: number;
        images: Array<{ id: string; url: string; publicId: string }>;
        admin: { id: string; name: string | null; email: string };
        createdAt: string;
        updatedAt: string;
      }>;
    }>("/api/user/products", { token });
  },

  async getById(id: string, token?: string) {
    return fetchApi<{
      product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        images: Array<{ id: string; url: string; publicId: string }>;
        admin: { id: string; name: string | null; email: string };
        createdAt: string;
        updatedAt: string;
      };
    }>(`/api/user/products/${id}`, { token });
  },
};
