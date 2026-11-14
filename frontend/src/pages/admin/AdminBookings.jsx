import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import EmptyState from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import PageHeading from "../../components/admin/PageHeading";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBookings() {
    setError("");
    setLoading(true);
    try {
      const [bookingData, userData, busData] = await Promise.all([
        api.bookings.list(),
        api.users.list(),
        api.buses.list(),
      ]);
      setBookings(bookingData);
      setUsers(userData);
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

  const userById = new Map(users.map((user) => [Number(user.id), user]));
  const busById = new Map(buses.map((bus) => [Number(bus.id), bus]));

  return (
    <div className="space-y-7">
      <PageHeading
        description="Review seat reservations across your fleet."
        eyebrow="Reservations"
        title="Bookings"
      />
      {error && <Alert onRetry={loadBookings}>{error}</Alert>}
      {loading ? (
        <LoadingScreen label="Loading bookings…" />
      ) : !error && bookings.length === 0 ? (
        <EmptyState title="No bookings yet">
          Reservations will show up here once travelers book a seat.
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-[#f8f8f4] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Booking</th>
                  <th className="px-5 py-3.5 font-semibold">Passenger</th>
                  <th className="px-5 py-3.5 font-semibold">Bus</th>
                  <th className="px-5 py-3.5 font-semibold">Seat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((booking) => (
                  <tr className="text-slate-600" key={booking.id}>
                    <td className="px-5 py-4 font-semibold text-ink">#{booking.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">
                        {userById.get(Number(booking.userId))?.name || "Unknown user"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {userById.get(Number(booking.userId))?.email || `User ${booking.userId}`}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {busById.get(Number(booking.busId))?.busNumber || `Bus ${booking.busId}`}
                    </td>
                    <td className="px-5 py-4">{booking.seatNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
