import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth";
import { LocaleProvider } from "./context/locale";
import AdminLayout from "./components/admin/AdminLayout";
import HomePage from "./HomePage";
import Login from "./pages/Login";
import AdminUsers from "./pages/admin/Users";
import AdminHero from "./pages/admin/Hero";
import AdminFields from "./pages/admin/Fields";
import FieldForm from "./pages/admin/FieldForm";
import AdminTools from "./pages/admin/Tools";
import ToolForm from "./pages/admin/ToolForm";
import AdminPartners from "./pages/admin/Partners";
import PartnerForm from "./pages/admin/PartnerForm";
import AdminSocials from "./pages/admin/Socials";
import SocialForm from "./pages/admin/SocialForm";
import AdminNews from "./pages/admin/News";
import NewsForm from "./pages/admin/NewsForm";
import NewsList from "./pages/NewsList";
import NewsArticle from "./pages/NewsArticle";
import ProjectsList from "./pages/ProjectsList";
import DepartmentDetail from "./pages/DepartmentDetail";
import ProjectDetail from "./pages/ProjectDetail";
import AdminDepartments from "./pages/admin/Departments";
import DepartmentForm from "./pages/admin/DepartmentForm";
import AdminProjects from "./pages/admin/Projects";
import ProjectForm from "./pages/admin/ProjectForm";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminIndexRedirect() {
  const { user } = useAuth();
  return <Navigate to={user?.role === "admin" ? "/admin" : "/admin/hero"} replace />;
}

function AdminShell() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    </ProtectedRoute>
  );
}

function PublicPage() {
  return (
    <LocaleProvider>
      <HomePage />
    </LocaleProvider>
  );
}

function PublicNewsList() {
  return (
    <LocaleProvider>
      <NewsList />
    </LocaleProvider>
  );
}

function PublicNewsArticle() {
  return (
    <LocaleProvider>
      <NewsArticle />
    </LocaleProvider>
  );
}

function PublicProjectsList() {
  return (
    <LocaleProvider>
      <ProjectsList />
    </LocaleProvider>
  );
}

function PublicDepartmentDetail() {
  return (
    <LocaleProvider>
      <DepartmentDetail />
    </LocaleProvider>
  );
}

function PublicProjectDetail() {
  return (
    <LocaleProvider>
      <ProjectDetail />
    </LocaleProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — locale in URL */}
      <Route path="/:lang" element={<PublicPage />} />
      <Route path="/:lang/news" element={<PublicNewsList />} />
      <Route path="/:lang/news/:slug" element={<PublicNewsArticle />} />
      <Route path="/:lang/projects" element={<PublicProjectsList />} />
      <Route path="/:lang/projects/:deptSlug" element={<PublicDepartmentDetail />} />
      <Route path="/:lang/projects/:deptSlug/:projectSlug" element={<PublicProjectDetail />} />
      <Route path="/" element={<Navigate to="/fr" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin — shared layout with sidebar */}
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminIndexRedirect />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="hero" element={<AdminHero />} />

        {/* Fields — list + add/edit */}
        <Route path="fields" element={<AdminFields />} />
        <Route path="fields/new" element={<FieldForm />} />
        <Route path="fields/:id" element={<FieldForm />} />

        {/* Tools — list + add/edit */}
        <Route path="tools" element={<AdminTools />} />
        <Route path="tools/new" element={<ToolForm />} />
        <Route path="tools/:id" element={<ToolForm />} />

        {/* Partners — list + add/edit */}
        <Route path="partners" element={<AdminPartners />} />
        <Route path="partners/new" element={<PartnerForm />} />
        <Route path="partners/:id" element={<PartnerForm />} />

        {/* Socials — list + add/edit */}
        <Route path="socials" element={<AdminSocials />} />
        <Route path="socials/new" element={<SocialForm />} />
        <Route path="socials/:id" element={<SocialForm />} />

        {/* News — list + add/edit */}
        <Route path="news" element={<AdminNews />} />
        <Route path="news/new" element={<NewsForm />} />
        <Route path="news/:id" element={<NewsForm />} />

        {/* Departments — list + add/edit */}
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="departments/new" element={<DepartmentForm />} />
        <Route path="departments/:id" element={<DepartmentForm />} />

        {/* Projects — list (dept selector) + add/edit */}
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/new" element={<ProjectForm />} />
        <Route path="projects/:id" element={<ProjectForm />} />
      </Route>

      <Route path="*" element={<Navigate to="/fr" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
