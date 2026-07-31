const API_BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── Auth ──
export async function login(email: string, password: string) {
  return request<{ user: User; accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchMe(token: string) {
  return request<User>("/auth/me", { headers: authHeader(token) });
}

// ── Users CRUD ──
export async function listUsers(token: string) {
  return request<User[]>("/users", { headers: authHeader(token) });
}

export async function createUser(
  token: string,
  data: { name: string; email: string; password: string; role: string },
) {
  return request<User>("/users", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  token: string,
  id: number,
  data: Partial<{ name: string; email: string; password: string; role: string }>,
) {
  return request<User>(`/users/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deleteUser(token: string, id: number) {
  return request<{ message: string }>(`/users/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Hero CRUD ──
export interface HeroData {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  subtitle_fr: string;
  subtitle_en: string;
  cta_primary_label_fr: string;
  cta_primary_label_en: string;
  cta_primary_link: string;
  cta_secondary_label_fr: string;
  cta_secondary_label_en: string;
  cta_secondary_link: string;
  background_image: string;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getPublishedHero() {
  return request<HeroData>("/hero");
}

export async function listHero(token: string) {
  return request<HeroData[]>("/hero/all", { headers: authHeader(token) });
}

export async function getHero(token: string, id: number) {
  return request<HeroData>(`/hero/${id}`, { headers: authHeader(token) });
}

export async function createHero(
  token: string,
  data: Partial<HeroData>,
) {
  return request<HeroData>("/hero", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updateHero(
  token: string,
  id: number,
  data: Partial<HeroData>,
) {
  return request<HeroData>(`/hero/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deleteHero(token: string, id: number) {
  return request<{ message: string }>(`/hero/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Types ──
export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
  created_at?: string;
  updated_at?: string;
}
