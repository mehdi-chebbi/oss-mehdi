import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { Shield, LogOut, Users, Image, LayoutDashboard } from "lucide-react";

const navItems = [
  { to: "/admin", label: "Users", icon: Users },
  { to: "/admin/hero", label: "Hero", icon: Image },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAF8]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-ink/10 flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-ink/10">
          <Shield className="w-6 h-6 text-[#489e42]" />
          <span className="text-lg font-bold text-ink">OSS Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          <p className="text-[11px] font-semibold text-ink/40 uppercase tracking-wider px-3 mb-2">
            Home Page
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
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
        </nav>

        {/* Footer */}
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

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
