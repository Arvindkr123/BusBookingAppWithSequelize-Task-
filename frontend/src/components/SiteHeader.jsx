import { LogOut, TicketCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Brand from "./Brand";

export default function SiteHeader() {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <>
      {error && (
        <p aria-live="polite" className="bg-red-50 px-5 py-2 text-center text-sm text-red-700">
          {error}
        </p>
      )}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Brand />
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 sm:flex">
          <Link className="transition hover:text-forest" to="/#buses">
            Find a bus
          </Link>
          <Link className="transition hover:text-forest" to="/#how-it-works">
            How it works
          </Link>
        </nav>
        {user ? (
          <div className="flex items-center gap-2">
            {user.role === "ADMIN" ? (
              <Link
                className="rounded-full border border-stone-200 px-4 py-2 text-sm font-semibold text-ink transition hover:border-forest hover:text-forest"
                to="/admin"
              >
                Admin dashboard
              </Link>
            ) : (
              <Link
                aria-label="My bookings"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-ink transition hover:border-forest hover:text-forest"
                title="My bookings"
                to="/account/bookings"
              >
                <TicketCheck aria-hidden="true" className="h-4 w-4" />
              </Link>
            )}
            <button
              aria-label="Sign out"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-ink transition hover:border-red-300 hover:text-red-600"
              onClick={handleLogout}
              title="Sign out"
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              className="rounded-full px-3 py-2 text-sm font-semibold text-ink transition hover:text-forest"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white transition hover:bg-forest-dark"
              to="/signup"
            >
              Create account
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
