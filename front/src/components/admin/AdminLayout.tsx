import { useState } from "react";
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
  Building2,
  Briefcase,
  UsersRound,
  Loader2,
} from "lucide-react";

/* ── Sidebar structure ── */
const pages = [
  {
    label: "Home Page",
    icon: Home,
    sections: [
      { to: "/admin/hero", label: "Hero", icon: Image, adminOnly: false },
      { to: "/admin/fields", label: "Fields", icon: Layers, adminOnly: false },
      { to: "/admin/tools", label: "Tools", icon: Wrench, adminOnly: false },
      { to: "/admin/partners", label: "Partners", icon: Handshake, adminOnly: false },
      { to: "/admin/socials", label: "Socials", icon: Share2, adminOnly: false },
    ],
  },
  {
    label: "News",
    icon: Newspaper,
    sections: [
      { to: "/admin/news", label: "Articles", icon: Newspaper, adminOnly: false },
    ],
  },
  {
    label: "Projects",
    icon: FolderKanban,
    sections: [
      { to: "/admin/departments", label: "Departments", icon: Building2, adminOnly: false },
      { to: "/admin/projects", label: "Projects", icon: Briefcase, adminOnly: false },
    ],
  },
  {
    label: "Team",
    icon: UsersRound,
    sections: [
      { to: "/admin/team", label: "Members", icon: UsersRound, adminOnly: false },
    ],
  },
];

const topItems = [
  { to: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

/* ── Collapsible page group ── */
function PageGroup({
  page,
  defaultOpen,
}: {
  page: (typeof pages)[number];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const location = useLocation();

  // Auto-expand if a child is active (includes sub-routes like /admin/fields/3)
  const hasActive = page.sections.some(
    (s) => !s.adminOnly && location.pathname.startsWith(s.to)
  );

  const expanded = open || hasActive;

  return (
    <div>
      <button
        onClick={() => setOpen(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-semibold text-ink/70 hover:bg-ink/5 transition-colors"
      >
        <span className="flex items-center gap-2.5">
          <page.icon className="w-4 h-4" />
          {page.label}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      {expanded && (
        <div className="ml-3 mt-1 space-y-1 border-l border-ink/10 pl-3">
          {page.sections.map((section) => (
            <NavLink
              key={section.to}
              to={section.to}
              className={({ isActive, isPending }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive || isPending
                    ? "bg-[#489e42]/10 text-[#489e42]"
                    : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                }`
              }
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Loading skeleton — keeps the sidebar visible during auth bootstrap ── */
function AdminLoading() {
  return (
    <div className="min-h-screen flex bg-[#FAFAF8]">
      <aside className="w-60 bg-white border-r border-ink/10 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink/10">
          <Shield className="w-6 h-6 text-[#489e42]" />
          <span className="text-lg font-bold text-ink">OSS Admin</span>
        </div>
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-3 py-2">
              <div className="h-4 w-24 bg-ink/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </aside>
      <main className="flex-1 ml-60 overflow-auto flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-ink/30 animate-spin" />
      </main>
    </div>
  );
}

/* ── Layout route ──
 * This is a *layout route* — it renders the sidebar + <Outlet/> and stays
 * mounted across all admin child routes. The auth gate is inline: during
 * AuthProvider.loading, we show the sidebar skeleton (not bare "Loading…"),
 * so the sidebar is visually stable across the loading → loaded transition.
 * If there's no token after loading resolves, we redirect to /login.
 */
export default function AdminLayout() {
  const { user, token, loading, logout } = useAuth();
  const navigate = useNavigate();

  // Auth gate — keep the sidebar visible during bootstrap
  if (loading) return <AdminLoading />;
  if (!token) return <Navigate to="/login" replace />;

  const visibleTopItems = topItems.filter(
    (item) => !item.adminOnly || user?.role === "admin"
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF8]">
      {/* Fixed sidebar */}
      <aside className="w-60 bg-white border-r border-ink/10 flex flex-col flex-shrink-0 fixed inset-y-0 left-0 z-30">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink/10">
          <Shield className="w-6 h-6 text-[#489e42]" />
          <span className="text-lg font-bold text-ink">OSS Admin</span>
        </div>

        {/* Navigation — scrollable if it overflows */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {/* Collapsible page groups */}
          {pages.map((page) => (
            <PageGroup key={page.label} page={page} defaultOpen={false} />
          ))}

          {/* Top-level items (Users etc.) */}
          {visibleTopItems.length > 0 && (
            <>
              <div className="h-px bg-ink/10 my-2" />
              {visibleTopItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#489e42]/10 text-[#489e42]"
                        : "text-ink/60 hover:bg-ink/5 hover:text-ink"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Footer — always at bottom */}
        <div className="border-t border-ink/10 p-4 space-y-3">
          <a
            href="/fr"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            View Site
          </a>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/40 truncate">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-ink/40 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content — offset by sidebar width */}
      <main className="flex-1 ml-60 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
