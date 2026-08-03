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
  getPublishedHero,
  getPublishedFields,
  getLatestNews,
  getPublishedTools,
  getPublishedPartners,
  listPublishedNews,
  getNewsYears,
  getNewsBySlug,
  getPublishedDepartments,
  getDepartmentBySlug,
  getPublishedProjectsByDept,
  getProjectBySlug,
  type HeroData,
  type FieldData,
  type NewsData,
  type NewsListResponse,
  type ToolData,
  type PartnerData,
  type DepartmentData,
  type ProjectData,
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
    getPublishedHero().catch(() => null),
    getPublishedFields().catch(() => []),
    getLatestNews(4).catch(() => []),
    getPublishedTools().catch(() => []),
    getPublishedPartners().catch(() => []),
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
  const q = url.searchParams.get("q") || "";

  const [data, years] = await Promise.all([
    listPublishedNews({ page, limit: NEWS_PAGE_SIZE, year, q: q || undefined }),
    getNewsYears(),
  ]);

  return { data, years, page, year, q };
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

// ── Projects list (departments) ──

export interface ProjectsListLoaderData {
  departments: DepartmentData[];
}

export async function projectsListLoader(): Promise<ProjectsListLoaderData> {
  const departments = await getPublishedDepartments().catch(() => []);
  return { departments };
}

// ── Department detail ──

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
      getPublishedProjectsByDept(params.deptSlug),
    ]);
    return { dept, projects };
  } catch {
    return { dept: null, projects: [] };
  }
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
