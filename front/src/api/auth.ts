const API_BASE = "/api";

// ── In-memory access token (NOT in localStorage) ──
let _accessToken: string | null = null;

export function getAccessToken() {
  return _accessToken;
}

export function setAccessToken(token: string) {
  _accessToken = token;
}

export function clearAccessToken() {
  _accessToken = null;
}

// ── Refresh logic (coalesced — prevents storm on mount) ──

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // Coalesce concurrent refresh attempts (mount-storm safe)
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Browser sends the httpOnly cookie automatically
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // send cookies
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Refresh failed" }));
        _accessToken = null;

        // Reuse detection — propagate special error
        if (body.reason === "reuse_detected") {
          throw new Error("SESSION_REVOKED");
        }
        throw new Error(body.error || "Refresh failed");
      }

      const data = await res.json();
      _accessToken = data.accessToken;

      // Notify AuthProvider that the access token changed
      window.dispatchEvent(new CustomEvent("token-refreshed", { detail: data.accessToken }));

      return data.accessToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Request with 401 interceptor ──

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // send cookies on every request
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  // Auto-refresh on 401 (only if we might have a refresh cookie)
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      // Retry the original request with the new token
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
          Authorization: `Bearer ${newToken}`,
        },
      });
      if (!retryRes.ok) {
        const body = await retryRes.json().catch(() => ({ error: "Request failed" }));
        throw new Error(body.error || `Error ${retryRes.status}`);
      }
      return retryRes.json();
    } catch (err: any) {
      _accessToken = null;
      if (err.message === "SESSION_REVOKED") {
        window.dispatchEvent(new CustomEvent("session-revoked"));
      } else {
        window.dispatchEvent(new CustomEvent("session-expired"));
      }
      throw new Error(err.message === "SESSION_REVOKED" ? "SESSION_REVOKED" : "SESSION_EXPIRED");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// ── File Upload ──
export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export async function uploadFile(
  token: string,
  section: string,
  file: File,
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const doUpload = async (tok: string) => {
    const res = await fetch(`${API_BASE}/upload/${section}`, {
      method: "POST",
      credentials: "include",
      headers: authHeader(tok),
      body: formData,
    });
    return res;
  };

  let res = await doUpload(token);

  // Auto-refresh on 401 for uploads too
  if (res.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      res = await doUpload(newToken);
    } catch (err: any) {
      _accessToken = null;
      if (err.message === "SESSION_REVOKED") {
        window.dispatchEvent(new CustomEvent("session-revoked"));
      } else {
        window.dispatchEvent(new CustomEvent("session-expired"));
      }
      throw new Error(err.message === "SESSION_REVOKED" ? "SESSION_REVOKED" : "SESSION_EXPIRED");
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(body.error || `Error ${res.status}`);
  }
  return res.json();
}

// ── Auth ──

export async function login(email: string, password: string) {
  // Login response now only has { user, accessToken } — refresh token is set as httpOnly cookie
  return request<{ user: User; accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return request<{ user: User; accessToken: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/** Try to get a fresh access token via the refresh cookie (for mount/initial load) */
export async function tryRefresh(): Promise<string | null> {
  try {
    const token = await refreshAccessToken();
    return token;
  } catch {
    return null;
  }
}

export async function fetchMe(token: string) {
  return request<User>("/auth/me", { headers: authHeader(token) });
}

export async function logoutApi() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Best effort — clear client state regardless
  }
}

export async function logoutEverywhereApi(token: string) {
  return request<{ message: string }>("/auth/logout-everywhere", {
    method: "POST",
    headers: authHeader(token),
  });
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

// ── Fields CRUD ──
export interface FieldData {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  gradient_hue: number;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getPublishedFields() {
  return request<FieldData[]>("/fields");
}

export async function listFields(token: string) {
  return request<FieldData[]>("/fields/all", { headers: authHeader(token) });
}

export async function getField(token: string, id: number) {
  return request<FieldData>(`/fields/${id}`, { headers: authHeader(token) });
}

export async function createField(token: string, data: Partial<FieldData>) {
  return request<FieldData>("/fields", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updateField(
  token: string,
  id: number,
  data: Partial<FieldData>,
) {
  return request<FieldData>(`/fields/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deleteField(token: string, id: number) {
  return request<{ message: string }>(`/fields/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Tools CRUD ──
export interface ToolData {
  id: number;
  page_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  link: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getPublishedTools() {
  return request<ToolData[]>("/tools");
}

export async function listTools(token: string) {
  return request<ToolData[]>("/tools/all", { headers: authHeader(token) });
}

export async function getTool(token: string, id: number) {
  return request<ToolData>(`/tools/${id}`, { headers: authHeader(token) });
}

export async function createTool(token: string, data: Partial<ToolData>) {
  return request<ToolData>("/tools", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updateTool(
  token: string,
  id: number,
  data: Partial<ToolData>,
) {
  return request<ToolData>(`/tools/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deleteTool(token: string, id: number) {
  return request<{ message: string }>(`/tools/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Partners CRUD ──
export interface PartnerData {
  id: number;
  page_id: number;
  name: string;
  image: string;
  row_number: number;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getPublishedPartners() {
  return request<PartnerData[]>("/partners");
}

export async function listPartners(token: string) {
  return request<PartnerData[]>("/partners/all", { headers: authHeader(token) });
}

export async function getPartner(token: string, id: number) {
  return request<PartnerData>(`/partners/${id}`, { headers: authHeader(token) });
}

export async function createPartner(token: string, data: Partial<PartnerData>) {
  return request<PartnerData>("/partners", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updatePartner(
  token: string,
  id: number,
  data: Partial<PartnerData>,
) {
  return request<PartnerData>(`/partners/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deletePartner(token: string, id: number) {
  return request<{ message: string }>(`/partners/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Socials CRUD ──
export interface SocialData {
  id: number;
  platform: string;
  url: string;
  icon_svg: string;
  icon_file: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export async function getSocials() {
  return request<SocialData[]>("/socials");
}

export async function listSocials(token: string) {
  return request<SocialData[]>("/socials", { headers: authHeader(token) });
}

export async function getSocial(token: string, id: number) {
  return request<SocialData>(`/socials/${id}`, { headers: authHeader(token) });
}

export async function createSocial(token: string, data: Partial<SocialData>) {
  return request<SocialData>("/socials", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function updateSocial(
  token: string,
  id: number,
  data: Partial<SocialData>,
) {
  return request<SocialData>(`/socials/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

export async function deleteSocial(token: string, id: number) {
  return request<{ message: string }>(`/socials/${id}`, {
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
