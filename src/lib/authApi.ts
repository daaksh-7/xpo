export type AuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type AuthResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type SessionResponse = {
  user: AuthUser;
};

export class AuthApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

const parseResponse = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const requestJson = async <T>(
  url: string,
  options: {
    method: "GET" | "POST";
    payload?: unknown;
    token?: string;
  }
): Promise<T> => {
  const headers: Record<string, string> = {};

  if (options.payload !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : "Request failed. Please try again.";

    throw new AuthApiError(message, response.status);
  }

  return data as T;
};

export const signupUser = (payload: SignupPayload) =>
  requestJson<AuthResponse>("/api/auth/signup", { method: "POST", payload });

export const loginUser = (payload: LoginPayload) =>
  requestJson<AuthResponse>("/api/auth/login", { method: "POST", payload });

export const fetchCurrentUser = (token: string) =>
  requestJson<SessionResponse>("/api/auth/me", { method: "GET", token });

export const isAuthApiError = (error: unknown): error is AuthApiError =>
  error instanceof AuthApiError;
