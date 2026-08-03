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
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
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

      // 204 = no session (no cookie sent) — not an error, just nothing to refresh.
      // This is the normal state on public pages; stays silent in the console.
      if (res.status === 204) {
        _accessToken = null;
        return null;
      }

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
      // No session (refresh returned 204) — can't retry, treat as expired
      if (!newToken) {
        throw new Error("SESSION_EXPIRED");
      }
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
      if (!newToken) {
        throw new Error("SESSION_EXPIRED");
      }
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

// NOTE: login/register use a RAW fetch (not the `request` helper) because they are
// public endpoints. A 401 here means "invalid credentials", NOT "access token
// expired" — routing them through the 401-refresh interceptor would turn a wrong
// password into a spurious "SESSION_EXPIRED". They also carry the optional
// CAPTCHA token once the account is flagged for too many failures (login) or
// on every registration (register).

export async function login(
  email: string,
  password: string,
  captchaToken?: string,
) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send/receive the refresh cookie
    body: JSON.stringify({ email, password, captchaToken }),
  });
  const body = await res.json().catch(() => ({ error: "Login failed" }));
  if (!res.ok) {
    throw new Error(body.error || `Error ${res.status}`);
  }
  return body as { user: User; accessToken: string };
}

export async function register(
  name: string,
  email: string,
  password: string,
  captchaToken?: string,
) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, email, password, captchaToken }),
  });
  const body = await res.json().catch(() => ({ error: "Registration failed" }));
  if (!res.ok) {
    throw new Error(body.error || `Error ${res.status}`);
  }
  return body as { user: User; accessToken: string };
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

// ── News CRUD ──
export interface NewsData {
  id: number;
  title_fr: string;
  title_en: string;
  body_fr: string;
  body_en: string;
  images: string[];        // array of image URL strings
  thumbnail_index: number; // which image is the card thumbnail
  date: string;
  slug: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Helper: get the thumbnail URL for an article (the one selected by the admin,
// falling back to the first image if the index is out of range, then "").
export function getThumbnail(article: Pick<NewsData, "images" | "thumbnail_index">): string {
  const imgs = article.images || [];
  if (imgs.length === 0) return "";
  const idx = Math.min(Math.max(0, article.thumbnail_index || 0), imgs.length - 1);
  return imgs[idx] || "";
}

export interface NewsListResponse {
  items: NewsData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Public: latest published news (for the home page)
export async function getLatestNews(limit = 4) {
  return request<NewsData[]>(`/news/latest?limit=${limit}`);
}

// Public: paginated list with optional year + keyword filter
export async function listPublishedNews(opts?: {
  page?: number;
  limit?: number;
  year?: number;
  q?: string;
}) {
  const params = new URLSearchParams();
  if (opts?.page) params.set("page", String(opts.page));
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.year) params.set("year", String(opts.year));
  if (opts?.q) params.set("q", opts.q);
  const qs = params.toString();
  return request<NewsListResponse>(`/news${qs ? `?${qs}` : ""}`);
}

// Public: distinct years with published articles
export async function getNewsYears() {
  return request<number[]>(`/news/years`);
}

// Public: single article by slug
export async function getNewsBySlug(slug: string) {
  return request<NewsData>(`/news/slug/${encodeURIComponent(slug)}`);
}

// Authenticated: list all news (including drafts)
export async function listAllNews(token: string) {
  return request<NewsData[]>("/news/all", { headers: authHeader(token) });
}

// Authenticated: get single news for editing
export async function getNews(token: string, id: number) {
  return request<NewsData>(`/news/${id}`, { headers: authHeader(token) });
}

// Authenticated: create news
export async function createNews(
  token: string,
  data: Partial<NewsData>,
) {
  return request<NewsData>("/news", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: update news
export async function updateNews(
  token: string,
  id: number,
  data: Partial<NewsData>,
) {
  return request<NewsData>(`/news/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: delete news
export async function deleteNews(token: string, id: number) {
  return request<{ message: string }>(`/news/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Departments CRUD ──
export interface DepartmentData {
  id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  slug: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

// Public: all published departments (for the /projects landing page later)
export async function getPublishedDepartments() {
  return request<DepartmentData[]>("/departments");
}

// Public: single department by slug
export async function getDepartmentBySlug(slug: string) {
  return request<DepartmentData>(`/departments/slug/${encodeURIComponent(slug)}`);
}

// Authenticated: list all departments (including drafts)
export async function listAllDepartments(token: string) {
  return request<DepartmentData[]>("/departments/all", { headers: authHeader(token) });
}

// Authenticated: get single department for editing
export async function getDepartment(token: string, id: number) {
  return request<DepartmentData>(`/departments/${id}`, { headers: authHeader(token) });
}

// Authenticated: create department
export async function createDepartment(
  token: string,
  data: Partial<DepartmentData>,
) {
  return request<DepartmentData>("/departments", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: update department
export async function updateDepartment(
  token: string,
  id: number,
  data: Partial<DepartmentData>,
) {
  return request<DepartmentData>(`/departments/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: delete department
export async function deleteDepartment(token: string, id: number) {
  return request<{ message: string }>(`/departments/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Projects CRUD ──
export type ProjectStatus = "en_cours" | "cloture";

export interface ProjectData {
  id: number;
  department_id: number;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  image: string;
  year_start: number | null;
  year_end: number | null;
  status: ProjectStatus;
  budget: string;
  slug: string;
  sort_order: number;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined from departments (public endpoints only)
  department_slug?: string;
  department_title_fr?: string;
  department_title_en?: string;
}

// Status label helper (bilingual)
export function statusLabel(status: ProjectStatus, locale: "fr" | "en"): string {
  if (status === "cloture") return locale === "fr" ? "Clôturé" : "Closed";
  return locale === "fr" ? "En cours" : "In progress";
}

// Year range helper: "2020 – 2023", "2020 – présent", "2020"
export function yearRange(start: number | null, end: number | null, locale: "fr" | "en"): string {
  const s = start ?? null;
  if (s === null) return "";
  if (end === null || end === undefined) {
    return `${s} – ${locale === "fr" ? "présent" : "present"}`;
  }
  return s === end ? `${s}` : `${s} – ${end}`;
}

// Public: published projects for a department (by dept slug)
export async function getPublishedProjectsByDept(deptSlug: string) {
  return request<ProjectData[]>(`/projects/dept/${encodeURIComponent(deptSlug)}`);
}

// Public: single project by slug
export async function getProjectBySlug(slug: string) {
  return request<ProjectData>(`/projects/slug/${encodeURIComponent(slug)}`);
}

// Authenticated: list all projects for a department (including drafts)
export async function listAllProjectsByDept(token: string, deptId: number) {
  return request<ProjectData[]>(`/projects/all/${deptId}`, { headers: authHeader(token) });
}

// Authenticated: get single project for editing
export async function getProject(token: string, id: number) {
  return request<ProjectData>(`/projects/${id}`, { headers: authHeader(token) });
}

// Authenticated: create project
export async function createProject(
  token: string,
  data: Partial<ProjectData>,
) {
  return request<ProjectData>("/projects", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: update project
export async function updateProject(
  token: string,
  id: number,
  data: Partial<ProjectData>,
) {
  return request<ProjectData>(`/projects/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: delete project
export async function deleteProject(token: string, id: number) {
  return request<{ message: string }>(`/projects/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
}

// ── Team CRUD ──
export interface TeamMemberData {
  id: number;
  name: string;
  title_fr: string;
  title_en: string;
  diplomas_fr: string;
  diplomas_en: string;
  nationality_fr: string;
  nationality_en: string;
  image: string;
  department: string;
}

// Public: team members (optionally filtered by department)
export async function getPublishedTeam(department?: string) {
  const params = department ? `?department=${encodeURIComponent(department)}` : "";
  return request<TeamMemberData[]>(`/team${params}`);
}

// Authenticated: list all team members
export async function listAllTeam(token: string, department?: string) {
  const params = department ? `?department=${encodeURIComponent(department)}` : "";
  return request<TeamMemberData[]>(`/team/all${params}`, { headers: authHeader(token) });
}

// Authenticated: get single team member
export async function getTeamMember(token: string, id: number) {
  return request<TeamMemberData>(`/team/${id}`, { headers: authHeader(token) });
}

// Authenticated: create team member
export async function createTeamMember(
  token: string,
  data: Partial<TeamMemberData>,
) {
  return request<TeamMemberData>("/team", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: update team member
export async function updateTeamMember(
  token: string,
  id: number,
  data: Partial<TeamMemberData>,
) {
  return request<TeamMemberData>(`/team/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(data),
  });
}

// Authenticated: delete team member
export async function deleteTeamMember(token: string, id: number) {
  return request<{ message: string }>(`/team/${id}`, {
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
