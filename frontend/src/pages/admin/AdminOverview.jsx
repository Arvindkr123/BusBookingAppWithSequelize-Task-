import { Armchair, BusFront, CreditCard, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import LoadingScreen from "../../components/LoadingScreen";
import PageHeading from "../../components/admin/PageHeading";
import StatCard from "../../components/admin/StatCard";

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStats() {
    setError("");
    setLoading(true);
    try {
      const [buses, users, bookings, payments] = await Promise.all([
        api.buses.list(),
        api.users.list(),
        api.bookings.list(),
        api.payments.list(),
      ]);
      setStats({
        buses: buses.length,
        users: users.length,
        bookings: bookings.length,
        payments: payments.length,
        successfulPayments: payments.filter((payment) => payment.paymentStatus === "SUCCESS").length,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-7">
      <PageHeading
        description="A quick look at your bus booking activity."
        eyebrow="Overview"
        title="Dashboard"
      />
      {error && <Alert onRetry={loadStats}>{error}</Alert>}
      {loading ? (
        <LoadingScreen label="Loading dashboard…" />
      ) : !error && stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard detail="Active fleet inventory" icon={BusFront} label="Buses" value={stats.buses} />
            <StatCard detail="Registered accounts" icon={Users} label="Users" tone="blue" value={stats.users} />
            <StatCard detail="All-time reservations" icon={Armchair} label="Bookings" tone="amber" value={stats.bookings} />
            <StatCard detail={`${stats.successfulPayments} successful`} icon={CreditCard} label="Payments" value={stats.payments} />
          </div>
          <section className="rounded-2xl border border-stone-200/80 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">Quick links</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["/admin/buses", "Manage buses"],
                ["/admin/users", "View users"],
                ["/admin/bookings", "Review bookings"],
                ["/admin/payments", "View payments"],
              ].map(([to, label]) => (
                <Link
                  className="rounded-xl bg-[#f5f6f1] px-4 py-3 text-sm font-semibold text-ink transition hover:bg-[#eaf0e5] hover:text-forest"
                  key={to}
                  to={to}
                >
                  {label} <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
          <p className="text-xs leading-5 text-slate-400">
            Payment totals reflect records in the API; no payment gateway is connected to this project.
          </p>
        </>
      ) : null}
    </div>
  );
}
