import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/auth";
import PublicLayout from "./components/shared/PublicLayout";
import RouteProgress from "./components/shared/RouteProgress";
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
import About from "./pages/About";
import Members from "./pages/Members";
import Governance from "./pages/Governance";
import Team from "./pages/Team";
import Report from "./pages/Report";
import Biodiversity from "./pages/Biodiversity";
import Climate from "./pages/Climate";
import Water from "./pages/Water";
import Land from "./pages/Land";
import Integrity from "./pages/Integrity";
import KnowledgeSharing from "./pages/KnowledgeSharing";
import ThematicDetail from "./pages/ThematicDetail";
import ProjectDetail from "./pages/ProjectDetail";
import AdminThematics from "./pages/admin/Thematics";
import ThematicForm from "./pages/admin/ThematicForm";
import AdminProjects from "./pages/admin/Projects";
import ProjectForm from "./pages/admin/ProjectForm";
import AdminTeam from "./pages/admin/Team";
import TeamForm from "./pages/admin/TeamForm";
import AdminReports from "./pages/admin/Reports";
import AdminResources from "./pages/admin/Resources";
import ResourceForm from "./pages/admin/ResourceForm";
import AdminDashboard from "./pages/admin/Dashboard";
import Search from "./pages/Search";
import ContactPage from "./components/home/Contact";
import {
  homeLoader,
  newsListLoader,
  newsArticleLoader,
  projectsListLoader,
  thematicDetailLoader,
  projectDetailLoader,
  biodiversityLoader,
  climateLoader,
  waterLoader,
  landLoader,
  knowledgeSharingLoader,
} from "./loaders/public";

/** Redirect /admin to the shared operational dashboard. */
function AdminIndexRedirect() {
  return <Navigate to="/admin/dashboard" replace />;
}

/**
 * Root layout — wraps every route with the top progress bar.
 * Must be inside <RouterProvider> (uses useNavigation) and inside
 * <AuthProvider> (child routes use useAuth).
 */
function RootLayout() {
  return (
    <>
      <RouteProgress />
      <Outlet />
    </>
  );
}

// ── Router ──
// Layout routes: <PublicLayout> and <AdminLayout> stay mounted across all
// their child routes. Only the <Outlet/> (page content) swaps. Loaders run
// before the route renders, so pages get data on first paint (no flash).

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <PublicLayout />,
        children: [
          { index: true, element: <Navigate to="/fr" replace /> },
          {
            path: ":lang",
            children: [
              { index: true, loader: homeLoader, element: <HomePage /> },
              { path: "news", loader: newsListLoader, element: <NewsList /> },
              { path: "news/:slug", loader: newsArticleLoader, element: <NewsArticle /> },
              { path: "projects", loader: projectsListLoader, element: <ProjectsList /> },
              { path: "projects/:thematicSlug", loader: thematicDetailLoader, element: <ThematicDetail /> },
              { path: "projects/:thematicSlug/:projectSlug", loader: projectDetailLoader, element: <ProjectDetail /> },
              { path: "about", element: <About /> },
              { path: "members", element: <Members /> },
              { path: "governance", element: <Governance /> },
              { path: "team", element: <Team /> },
              { path: "report", element: <Report /> },
              { path: "domains/biodiversity", loader: biodiversityLoader, element: <Biodiversity /> },
              { path: "domains/climate", loader: climateLoader, element: <Climate /> },
              { path: "domains/water", loader: waterLoader, element: <Water /> },
              { path: "domains/land", loader: landLoader, element: <Land /> },
              { path: "knowledge-sharing", loader: knowledgeSharingLoader, element: <KnowledgeSharing /> },
              { path: "integrity", element: <Integrity /> },
              { path: "search", element: <Search /> },
              { path: "contact", element: <ContactPage /> },
            ],
          },
        ],
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminIndexRedirect /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <AdminUsers /> },
          { path: "hero", element: <AdminHero /> },

          // Fields
          { path: "fields", element: <AdminFields /> },
          { path: "fields/new", element: <FieldForm /> },
          { path: "fields/:id", element: <FieldForm /> },

          // Tools
          { path: "tools", element: <AdminTools /> },
          { path: "tools/new", element: <ToolForm /> },
          { path: "tools/:id", element: <ToolForm /> },

          // Partners
          { path: "partners", element: <AdminPartners /> },
          { path: "partners/new", element: <PartnerForm /> },
          { path: "partners/:id", element: <PartnerForm /> },

          // Socials
          { path: "socials", element: <AdminSocials /> },
          { path: "socials/new", element: <SocialForm /> },
          { path: "socials/:id", element: <SocialForm /> },

          // News
          { path: "news", element: <AdminNews /> },
          { path: "news/new", element: <NewsForm /> },
          { path: "news/:id", element: <NewsForm /> },

          // Thematic areas
          { path: "thematics", element: <AdminThematics /> },
          { path: "thematics/new", element: <ThematicForm /> },
          { path: "thematics/:id", element: <ThematicForm /> },

          // Projects
          { path: "projects", element: <AdminProjects /> },
          { path: "projects/new", element: <ProjectForm /> },
          { path: "projects/:id", element: <ProjectForm /> },

          // Team
          { path: "team", element: <AdminTeam /> },
          { path: "team/new", element: <TeamForm /> },
          { path: "team/:id", element: <TeamForm /> },
          { path: "reports", element: <AdminReports /> },

          // Knowledge resources
          { path: "resources", element: <AdminResources /> },
          { path: "resources/:id", element: <ResourceForm /> },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/fr" replace />,
      },
    ],
  },
]);

/**
 * Default export — wraps the router with AuthProvider.
 * Rendered by main.tsx inside <QueryClientProvider>.
 *
 * AuthProvider sits OUTSIDE RouterProvider so that admin routes (which use
 * useAuth) can access the context. AuthProvider's mount-time tryRefresh()
 * runs once on app boot, independent of the router.
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
