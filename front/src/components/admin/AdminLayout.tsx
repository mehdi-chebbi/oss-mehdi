import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import {
  Shield,
  LogOut,
  Users,
  Image,
  LayoutDashboard,
  ChevronDown,
  Home,
  Layers,
  Wrench,
  Handshake,
  Share2,
  Newspaper,
  FolderKanban,
  Tags,
  Briefcase,
  UsersRound,
  Loader2,
  AlertCircle,
  Library,
  Menu,
  X,
  ExternalLink,
  Video,
  BookOpen,
} from "lucide-react";

/* Sidebar structure */
const pages = [
  {
    label: "Page d’accueil",
    icon: Home,
    sections: [
      { to: "/admin/hero", label: "Bannière", icon: Image, adminOnly: false },
      { to: "/admin/homepage-publication", label: "Publication récente", icon: BookOpen, adminOnly: false },
      { to: "/admin/homepage-video", label: "Vidéo", icon: Video, adminOnly: false },
      { to: "/admin/fields", label: "Domaines", icon: Layers, adminOnly: false },
      { to: "/admin/tools", label: "Outils", icon: Wrench, adminOnly: false },
      { to: "/admin/partners", label: "Partenaires", icon: Handshake, adminOnly: false },
      { to: "/admin/socials", label: "Réseaux sociaux", icon: Share2, adminOnly: false },
    ],
  },
  {
    label: "Actualités",
    icon: Newspaper,
    sections: [
      { to: "/admin/news", label: "Articles", icon: Newspaper, adminOnly: false },
    ],
  },
  {
    label: "Projets",
    icon: FolderKanban,
    sections: [
      { to: "/admin/thematics", label: "Thématiques", icon: Tags, adminOnly: false },
      { to: "/admin/projects", label: "Projets", icon: Briefcase, adminOnly: false },
    ],
  },
  {
    label: "Équipe",
    icon: UsersRound,
    sections: [
      { to: "/admin/team", label: "Membres", icon: UsersRound, adminOnly: false },
    ],
  },
  {
    label: "Partage des connaissances",
    icon: Library,
    sections: [
      { to: "/admin/resources", label: "Ressources", icon: Library, adminOnly: false },
    ],
  },
];

const topItems = [
  { to: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard, adminOnly: false },
  { to: "/admin/users", label: "Utilisateurs", icon: Users, adminOnly: true },
  { to: "/admin/reports", label: "Signalements", icon: AlertCircle, adminOnly: false },
];

/* Collapsible page group */
function PageGroup({
  page,
  defaultOpen,
  onNavigate,
}: {
  page: (typeof pages)[number];
  defaultOpen: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();

  // Auto-expand if a child is active (includes sub-routes like /admin/fields/3)
  const hasActive = page.sections.some(
    (s) => !s.adminOnly && location.pathname.startsWith(s.to)
  );

  const expanded = open || hasActive;

  return (
    <div className="admin-nav-group">
      <button
        type="button"
        onClick={() => setOpen(!expanded)}
        className={`admin-nav-group-button ${hasActive ? "is-active" : ""}`}
      >
        <span className="flex items-center gap-2.5">
          <page.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {page.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="admin-nav-children">
          {page.sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              onClick={onNavigate}
              className={({ isActive, isPending }) =>
                `admin-nav-link ${isActive || isPending ? "is-active" : ""}`
              }
            >
              <section.icon className="h-4 w-4" strokeWidth={1.8} />
              {section.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* Loading skeleton keeps the sidebar visible during auth bootstrap. */
function AdminLoading() {
  return (
    <div className="admin-shell min-h-[100dvh]">
      <aside className="admin-sidebar hidden lg:flex">
        <div className="admin-brand">
          <span className="admin-brand-mark"><Shield className="h-5 w-5" strokeWidth={1.8} /></span>
          <span><strong>OSS</strong><small>Administration</small></span>
        </div>
        <div className="flex-1 space-y-3 overflow-hidden px-4 py-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-white/[0.06] px-4 py-3">
              <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
            </div>
          ))}
        </div>
      </aside>
      <main className="admin-main lg:ml-72">
        <div className="admin-topbar" />
        <div className="flex min-h-[70dvh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0079bc]" />
        </div>
      </main>
    </div>
  );
}

/* Layout route
 * This is a layout route. It renders the sidebar + <Outlet/> and stays
 * mounted across all admin child routes. The auth gate is inline: during
 * AuthProvider.loading, we show the sidebar skeleton (not bare "Loading…"),
 * so the sidebar is visually stable across the loading → loaded transition.
 * If there's no token after loading resolves, we redirect to /login.
 */
export default function AdminLayout() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Auth gate keeps the sidebar visible during bootstrap.
  if (loading) return <AdminLoading />;
  if (!token) return <Navigate to="/login" replace />;

  const visibleTopItems = topItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const allSections = [...pages.flatMap((page) => page.sections), ...topItems];
  const currentSection = allSections.find((item) => location.pathname.startsWith(item.to));
  const currentGroup = pages.find((page) => page.sections.some((item) => location.pathname.startsWith(item.to)));

  const sidebar = (
    <>
      <div className="admin-brand">
        <span className="admin-brand-mark"><Shield className="h-5 w-5" strokeWidth={1.8} /></span>
        <span className="min-w-0 flex-1">
          <strong>OSS</strong>
          <small>Administration</small>
        </span>
        <button type="button" onClick={() => setMobileOpen(false)} className="admin-sidebar-close lg:hidden" aria-label="Fermer la navigation">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="admin-navigation">
        <p className="admin-nav-label">Gestion du contenu</p>
        {pages.map((page) => (
          <PageGroup key={page.label} page={page} defaultOpen={false} onNavigate={() => setMobileOpen(false)} />
        ))}

        {visibleTopItems.length > 0 && (
          <div className="admin-system-links">
            <p className="admin-nav-label">Administration</p>
            {visibleTopItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `admin-nav-link admin-nav-link-root ${isActive ? "is-active" : ""}`}
              >
                <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="admin-sidebar-footer">
        <a href="/fr" target="_blank" rel="noopener noreferrer" className="admin-view-site">
          <LayoutDashboard className="h-4 w-4" strokeWidth={1.8} />
          Voir le site public
          <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-55" />
        </a>
        <div className="admin-account">
          <span className="admin-account-avatar">{user?.name?.charAt(0).toUpperCase() || "O"}</span>
          <span className="min-w-0 flex-1">
            <strong>{user?.name || "Utilisateur OSS"}</strong>
            <small>{user?.email}</small>
          </span>
          <button type="button" onClick={handleLogout} className="admin-logout" title="Déconnexion" aria-label="Déconnexion">
            <LogOut className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-shell min-h-[100dvh]">
      {mobileOpen && <button type="button" className="admin-sidebar-backdrop lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Fermer la navigation" />}

      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        {sidebar}
      </aside>

      <main className="admin-main lg:ml-72">
        <header className="admin-topbar">
          <button type="button" onClick={() => setMobileOpen(true)} className="admin-menu-button lg:hidden" aria-label="Ouvrir la navigation">
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p>{currentGroup?.label || "Administration"}</p>
            <h1>{currentSection?.label || "Espace OSS"}</h1>
          </div>
          <span className="admin-role-badge">{user?.role === "admin" ? "Administrateur" : "Éditeur"}</span>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
