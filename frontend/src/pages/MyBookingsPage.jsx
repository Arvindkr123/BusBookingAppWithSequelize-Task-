import { Armchair, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import SiteHeader from "../components/SiteHeader";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const [bookingData, busData] = await Promise.all([
        api.bookings.mine(),
        api.buses.list(),
      ]);
      setBookings(bookingData);
      setBuses(busData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const busById = new Map(buses.map((bus) => [Number(bus.id), bus]));

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-10 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-forest">
          Your Wayfare account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          My bookings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Your reserved seats, all in one place.
        </p>

        <div className="mt-8">
          {error && <Alert onRetry={loadBookings}>{error}</Alert>}
          {loading ? (
            <LoadingScreen label="Loading your bookings…" />
          ) : !error && bookings.length === 0 ? (
            <EmptyState title="No bookings yet">
              When you reserve a seat, you&apos;ll find the details here.
            </EmptyState>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const bus = busById.get(Number(booking.busId));
                return (
                  <article
                    className="flex flex-col gap-4 rounded-2xl border border-stone-200/80 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    key={booking.id}
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf0e5] text-forest">
                        <TicketCheck aria-hidden="true" className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-ink">
                          Bus {bus?.busNumber || booking.busId}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Reservation #{booking.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Armchair aria-hidden="true" className="h-4 w-4 text-slate-400" />
                      Seat {booking.seatNumber}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
