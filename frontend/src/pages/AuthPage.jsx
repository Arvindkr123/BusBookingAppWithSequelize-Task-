import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Alert from "../components/Alert";
import Brand from "../components/Brand";
import { useAuth } from "../context/AuthContext";

export default function AuthPage({ mode }) {
  const isSignup = mode === "signup";
  const { user, login, signup, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isAdminLogin = !isSignup && searchParams.get("role") === "admin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("USER");
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isSignup) {
        await signup({
          name: name.trim(),
          email: email.trim(),
          password,
          role: accountType,
          adminCode: accountType === "ADMIN" ? adminCode : undefined,
        });
      } else {
        await login({ email: email.trim(), password });
      }

      const returnTo = location.state?.from?.pathname || "/";
      navigate(returnTo, {
        replace: true,
        state: location.state?.busId
          ? { openBusId: location.state.busId }
          : undefined,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_0.9fr]">
      <section className="flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <Brand />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          <Link
            className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-forest"
            to="/"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to home
          </Link>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-forest">
            {isSignup
              ? "Start your next journey"
              : isAdminLogin
                ? "Administrator access"
                : "Welcome back"}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {isSignup
              ? "Create your account"
              : isAdminLogin
                ? "Admin sign in"
                : "Sign in to Wayfare"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {isSignup
              ? "A few details and you're ready to reserve a seat."
              : isAdminLogin
                ? "Use the administrator email and password configured in the backend environment."
                : "Pick up right where your next trip begins."}
          </p>
          {(isSignup || isAdminLogin) && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-[#dfe8d8] bg-[#f5f8f2] p-4">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 h-5 w-5 shrink-0 text-forest"
              />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {isSignup ? "Admin signup needs an invitation" : "Protected administrator account"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isSignup
                    ? "Select Administrator above and enter the invitation code configured by the server owner. Without it, signup creates a passenger account only."
                    : "Only an account assigned the ADMIN role by the backend can open the admin dashboard."}
                </p>
                {isSignup && (
                  <Link
                    className="mt-2 inline-flex text-xs font-semibold text-forest hover:underline"
                    to="/login?role=admin"
                  >
                    Admin sign in
                  </Link>
                )}
              </div>
            </div>
          )}

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {isSignup && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Account type
                </span>
                <select
                  className="form-input"
                  onChange={(event) => {
                    setAccountType(event.target.value);
                    setAdminCode("");
                  }}
                  value={accountType}
                >
                  <option value="USER">Passenger account</option>
                  <option value="ADMIN">Administrator account</option>
                </select>
              </label>
            )}
            {isSignup && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full name
                </span>
                <span className="relative block">
                  <UserRound aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    autoComplete="name"
                    className="form-input form-input--icon"
                    maxLength={100}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Alex Morgan"
                    required
                    value={name}
                  />
                </span>
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Email address
              </span>
              <span className="relative block">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoComplete="email"
                  className="form-input form-input--icon"
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </span>
              <span className="relative block">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  className="form-input form-input--icon"
                  minLength={isSignup ? 12 : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={isSignup ? "At least 12 characters" : "Your password"}
                  required
                  type="password"
                  value={password}
                />
              </span>
            </label>
            {isSignup && accountType === "ADMIN" && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Admin invitation code
                </span>
                <span className="relative block">
                  <ShieldCheck
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    autoComplete="off"
                    className="form-input form-input--icon"
                    inputMode="numeric"
                    maxLength={6}
                    minLength={6}
                    onChange={(event) =>
                      setAdminCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))
                    }
                    pattern="[0-9]{6}"
                    placeholder="6-digit invitation code"
                    required
                    value={adminCode}
                  />
                </span>
              </label>
            )}
            {isSignup && (
              <p className="-mt-2 text-xs leading-5 text-slate-400">
                Use at least 12 characters. Passwords are securely hashed.
                {accountType === "ADMIN" &&
                  " Admin registration also requires a valid invitation code."}
              </p>
            )}
            <Alert>{error}</Alert>
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting || loading}
              type="submit"
            >
              {submitting
                ? isSignup
                  ? "Creating account…"
                  : "Signing in…"
                : isSignup
                  ? "Create account"
                  : "Sign in"}
              {!submitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {isSignup
              ? "Already have an account?"
              : isAdminLogin
                ? "Looking for traveler sign in?"
                : "New to Wayfare?"}{" "}
            <Link
              className="font-semibold text-forest hover:underline"
              to={isSignup ? "/login" : isAdminLogin ? "/login" : "/signup"}
              state={location.state}
            >
              {isSignup
                ? "Sign in"
                : isAdminLogin
                  ? "User sign in"
                  : "Create an account"}
            </Link>
          </p>
          {!isSignup && !isAdminLogin && (
            <p className="mt-3 text-center text-sm text-slate-500">
              Administrator?{" "}
              <Link
                className="font-semibold text-forest hover:underline"
                to="/login?role=admin"
              >
                Admin sign in
              </Link>
            </p>
          )}
          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Your account details are used to manage your reservations.
          </p>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-forest p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-36 -top-32 h-[34rem] w-[34rem] rounded-full border border-white/10" />
        <div className="absolute -right-16 -top-12 h-[25rem] w-[25rem] rounded-full border border-white/10" />
        <div className="relative max-w-lg">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">
            Travel at your own pace
          </span>
          <p className="mt-5 font-display text-5xl font-semibold leading-tight tracking-tight">
            Good trips begin with a simple plan.
          </p>
          <p className="mt-5 max-w-sm leading-7 text-white/70">
            Find the right ride, choose your seat, and make the journey yours.
          </p>
        </div>
        <p className="relative text-sm text-white/55">
          Wayfare — Here&apos;s to the journeys that stay with you.
        </p>
      </aside>
    </main>
  );
}
