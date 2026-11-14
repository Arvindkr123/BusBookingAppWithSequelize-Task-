import {
  Armchair,
  BusFront,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import Brand from "../Brand";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/buses", label: "Buses", icon: BusFront },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: Armchair },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6f1] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-stone-200 bg-white px-5 py-6 lg:flex lg:flex-col">
        <Brand />
        <p className="mb-3 mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#eaf0e5] text-forest"
                    : "text-slate-600 hover:bg-stone-50 hover:text-ink"
                }`
              }
              end={end}
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-stone-100 pt-4">
          <p className="truncate px-3 text-xs text-slate-400">{user?.email}</p>
          <button
            className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            type="button"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="flex items-center justify-between lg:hidden">
            <Brand />
            <button
              className="flex items-center gap-2 text-sm font-medium text-slate-600"
              onClick={handleLogout}
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" /> Sign out
            </button>
          </div>
          <div className="hidden items-center justify-between lg:flex">
            <div>
              <p className="text-xs font-medium text-slate-400">Admin workspace</p>
              <p className="mt-0.5 text-sm font-semibold text-ink">
                Good to see you, {user?.name}
              </p>
            </div>
            <span className="rounded-full bg-[#eaf0e5] px-3 py-1.5 text-xs font-semibold text-forest">
              Administrator
            </span>
          </div>
          <nav aria-label="Admin navigation" className="mt-4 flex gap-1 overflow-x-auto lg:hidden">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    isActive ? "bg-[#eaf0e5] text-forest" : "text-slate-500"
                  }`
                }
                end={end}
                key={to}
                to={to}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        {error && (
          <p className="mx-5 mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 sm:mx-8">
            {error}
          </p>
        )}
        <main className="mx-auto max-w-7xl p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
