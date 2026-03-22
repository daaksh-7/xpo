export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "member";
  createdAt?: string;
};

export type AuthSession = {
  token: string;
  user: AuthUser;
};

const AUTH_KEY = "xops_auth";

export function getAuthSession(): AuthSession | null {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAdmin(): boolean {
  const session = getAuthSession();
  return session?.user.role === "admin";
}
