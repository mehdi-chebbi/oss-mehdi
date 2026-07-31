import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth";
import { LocaleProvider } from "./context/locale";
import AdminLayout from "./components/admin/AdminLayout";
import HomePage from "./HomePage";
import Login from "./pages/Login";
import AdminUsers from "./pages/admin/Users";
import AdminHero from "./pages/admin/Hero";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
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

function AppRoutes() {
  return (
    <Routes>
      {/* Public — locale in URL */}
      <Route path="/:lang" element={<PublicPage />} />
      <Route path="/" element={<Navigate to="/fr" replace />} />

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin — shared layout with sidebar */}
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminUsers />} />
        <Route path="hero" element={<AdminHero />} />
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
