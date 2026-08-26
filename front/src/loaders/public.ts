/**
 * Route loaders for all public pages.
 *
 * Each loader runs BEFORE the route renders. React Router keeps the old page
 * visible (with a top progress bar) while the loader resolves, then swaps in
 * the new page with data already in hand. This eliminates the "navbar +
 * footer but no content" flash entirely.
 *
 * Loaders use the existing API functions from `@/api/auth` — they're just
 * called here (server-side, before render) instead of inside `useEffect`
 * (client-side, after render).
 */
import type { LoaderFunctionArgs } from "react-router-dom";
import {
  getPageHero,
  getPageFields,
  getLatestNews,
  getPageTools,
  getPagePartners,
  listPublicNews,
  getNewsYears,
  getNewsBySlug,
  getPublicDepartments,
  getDepartmentBySlug,
  getPublicProjectsByDept,
  getProjectBySlug,
  listPublicResources,
  getResourceYears,
  NEWS_CATEGORIES,
  RESOURCE_DOCUMENT_TYPES,
  RESOURCE_FIELDS,
  type HeroData,
  type FieldData,
  type NewsData,
  type NewsListResponse,
  type NewsCategory,
  type ToolData,
  type PartnerData,
  type DepartmentData,
  type ProjectData,
  type ResourceListResponse,
  type ResourceDocumentType,
  type ResourceField,
  type ResourceLanguage,
} from "@/api/auth";

// ── Home page ──
// Fetches all section data in parallel. Each fetch has an individual
// `.catch()` so one failing endpoint (e.g. no tools configured yet) doesn't
// nuke the entire home page — the corresponding section just gets empty data
// and renders nothing (each section checks `length === 0` and returns null).

export interface HomeLoaderData {
  hero: HeroData | null;
  fields: FieldData[];
  latestNews: NewsData[];
  tools: ToolData[];
  partners: PartnerData[];
}

export async function homeLoader(): Promise<HomeLoaderData> {
  const [hero, fields, latestNews, tools, partners] = await Promise.all([
    getPageHero().catch(() => null),
    getPageFields().catch(() => []),
    getLatestNews(4).catch(() => []),
    getPageTools().catch(() => []),
    getPagePartners().catch(() => []),
  ]);

  return { hero, fields, latestNews, tools, partners };
}

// ── News list ──
// Reads filter/pagination state from the URL search params. When the user
// changes filters (year, search, page), the URL changes → the loader re-runs
// → the page re-renders with fresh data. Old data stays visible during the
// reload (no flash).

const NEWS_PAGE_SIZE = 9;

export interface NewsListLoaderData {
  data: NewsListResponse;
  years: number[];
  page: number;
  year: number | undefined;
  category: NewsCategory | undefined;
  q: string;
}

export async function newsListLoader({
  request,
}: LoaderFunctionArgs): Promise<NewsListLoaderData> {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const year = url.searchParams.get("year")
    ? Number(url.searchParams.get("year"))
    : undefined;
  const categoryParam = url.searchParams.get("category");
  const category = NEWS_CATEGORIES.includes(categoryParam as NewsCategory)
    ? (categoryParam as NewsCategory)
    : undefined;
  const q = url.searchParams.get("q") || "";

  const [data, years] = await Promise.all([
    listPublicNews({ page, limit: NEWS_PAGE_SIZE, year, category, q: q || undefined }),
    getNewsYears(),
  ]);

  return { data, years, page, year, category, q };
}

// ── News article ──

export interface NewsArticleLoaderData {
  article: NewsData | null;
}

export async function newsArticleLoader({
  params,
}: LoaderFunctionArgs): Promise<NewsArticleLoaderData> {
  if (!params.slug) return { article: null };
  try {
    const article = await getNewsBySlug(params.slug);
    return { article };
  } catch {
    return { article: null };
  }
}

// ── Projects list (departments with nested projects) ──

export interface DeptWithProjects {
  dept: DepartmentData;
  projects: ProjectData[];
}

export interface ProjectsListLoaderData {
  departments: DeptWithProjects[];
}

export async function projectsListLoader(): Promise<ProjectsListLoaderData> {
  const departments = await getPublicDepartments().catch(() => []);
  // Fetch projects for each department in parallel
  const withProjects = await Promise.all(
    departments.map(async (dept) => {
      const projects = await getPublicProjectsByDept(dept.slug).catch(() => []);
      return { dept, projects };
    }),
  );
  return { departments: withProjects };
}

// ── Department detail (kept for direct URL access / backward compat) ──

export interface DepartmentDetailLoaderData {
  dept: DepartmentData | null;
  projects: ProjectData[];
}

export async function departmentDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<DepartmentDetailLoaderData> {
  if (!params.deptSlug) return { dept: null, projects: [] };
  try {
    const [dept, projects] = await Promise.all([
      getDepartmentBySlug(params.deptSlug),
      getPublicProjectsByDept(params.deptSlug),
    ]);
    return { dept, projects };
  } catch {
    return { dept: null, projects: [] };
  }
}

// ── Biodiversity domain ──

export interface DomainProjectsLoaderData {
  projects: ProjectData[];
}

async function latestDepartmentProjects(departmentSlug: string): Promise<DomainProjectsLoaderData> {
  const projects = await getPublicProjectsByDept(departmentSlug).catch(() => []);

  return {
    projects: [...projects].sort((a, b) => b.id - a.id).slice(0, 3),
  };
}

export function biodiversityLoader() {
  return latestDepartmentProjects('land-biodiversity-department');
}

export function climateLoader() {
  return latestDepartmentProjects('climate-department');
}

export function waterLoader() {
  return latestDepartmentProjects('water-department');
}

export function landLoader() {
  return latestDepartmentProjects('land-biodiversity-department');
}

// ── Knowledge sharing resource library ──

const RESOURCE_PAGE_SIZE = 9;

export interface KnowledgeSharingLoaderData {
  data: ResourceListResponse;
  years: number[];
  page: number;
  type: ResourceDocumentType | undefined;
  field: ResourceField | undefined;
  year: number | undefined;
  language: ResourceLanguage | undefined;
  q: string;
}

export async function knowledgeSharingLoader({
  request,
}: LoaderFunctionArgs): Promise<KnowledgeSharingLoaderData> {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const typeParam = url.searchParams.get("type");
  const fieldParam = url.searchParams.get("field");
  const languageParam = url.searchParams.get("language");
  const year = url.searchParams.get("year")
    ? Number(url.searchParams.get("year"))
    : undefined;
  const type = RESOURCE_DOCUMENT_TYPES.includes(typeParam as ResourceDocumentType)
    ? typeParam as ResourceDocumentType
    : undefined;
  const field = RESOURCE_FIELDS.includes(fieldParam as ResourceField)
    ? fieldParam as ResourceField
    : undefined;
  const language = languageParam === "fr" || languageParam === "en"
    ? languageParam
    : undefined;
  const q = url.searchParams.get("q") || "";

  const [data, years] = await Promise.all([
    listPublicResources({
      page,
      limit: RESOURCE_PAGE_SIZE,
      type,
      field,
      year,
      language,
      q: q || undefined,
    }),
    getResourceYears(),
  ]);

  return { data, years, page, type, field, year, language, q };
}

// ── Project detail ──

export interface ProjectDetailLoaderData {
  project: ProjectData | null;
}

export async function projectDetailLoader({
  params,
}: LoaderFunctionArgs): Promise<ProjectDetailLoaderData> {
  if (!params.projectSlug) return { project: null };
  try {
    const project = await getProjectBySlug(params.projectSlug);
    // If the project's department slug doesn't match the URL, treat as 404
    if (
      project &&
      params.deptSlug &&
      project.department_slug &&
      project.department_slug !== params.deptSlug
    ) {
      return { project: null };
    }
    return { project };
  } catch {
    return { project: null };
  }
}
