import { Armchair, CreditCard, TicketCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";
import EmptyState from "../components/EmptyState";
import LoadingScreen from "../components/LoadingScreen";
import SiteHeader from "../components/SiteHeader";
import { useAuth } from "../context/AuthContext";
import { openRazorpayCheckout } from "../utils/razorpay";

export default function MyBookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [buses, setBuses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutId, setCheckoutId] = useState(null);

  async function loadBookings() {
    setLoading(true);
    setError("");
    try {
      const [bookingData, busData, paymentData, fareData] = await Promise.all([
        api.bookings.mine(),
        api.buses.list(),
        api.payments.mine(),
        api.payments.fare(),
      ]);
      setBookings(bookingData);
      setBuses(busData);
      setPayments(paymentData);
      setFare(fareData);
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
  const paymentByBookingId = new Map(
    payments.map((payment) => [Number(payment.bookingId), payment]),
  );
  const formatFare = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: fare?.currency || "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount));

  async function continueCheckout(bookingId) {
    setCheckoutError("");
    setCheckoutId(bookingId);
    try {
      const checkout = await api.payments.checkout({ bookingId });
      if (checkout.paid || checkout.processing) {
        navigate(`/payment/return?order_id=${encodeURIComponent(checkout.orderId)}`);
        return;
      }
      await openRazorpayCheckout({
        order: checkout,
        user,
        onSuccess: async (response) => {
          let verificationFailed = false;
          try {
            await api.payments.verify(response);
          } catch {
            verificationFailed = true;
          }
          navigate(
            `/payment/return?order_id=${encodeURIComponent(checkout.orderId)}${verificationFailed ? "&verification_error=1" : ""}`,
          );
        },
        onFailure: setCheckoutError,
        onDismiss: () => setCheckoutId(null),
      });
    } catch (requestError) {
      setCheckoutError(requestError.message);
    } finally {
      setCheckoutId(null);
    }
  }

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
          Your reservations and payment status, all in one place.
        </p>

        <div className="mt-8">
          {error && <Alert onRetry={loadBookings}>{error}</Alert>}
          {checkoutError && <div className="mb-4"><Alert>{checkoutError}</Alert></div>}
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
                const payment = paymentByBookingId.get(Number(booking.id));
                const isCancelled = booking.status === "CANCELLED";
                const isPending = booking.status === "PENDING_PAYMENT";
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
                    <div className="flex flex-col gap-2 sm:items-end">
                      <p className={`text-sm font-semibold ${
                        payment?.paymentStatus === "SUCCESS"
                          ? "text-forest"
                          : isCancelled
                            ? "text-slate-500"
                            : "text-amber-700"
                      }`}>
                        {payment?.paymentStatus === "SUCCESS"
                          ? `Paid ${formatFare(payment.amountPaid)}`
                          : isCancelled
                            ? "Reservation released"
                            : payment?.paymentStatus === "FAILED"
                              ? "Payment failed"
                              : isPending
                                ? `Payment due ${fare ? formatFare(fare.amount) : ""}`
                                : "Reservation confirmed"}
                      </p>
                      {isPending && (
                        <button
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-forest px-4 py-2 text-xs font-semibold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-55"
                          disabled={checkoutId === booking.id}
                          onClick={() => continueCheckout(booking.id)}
                          type="button"
                        >
                          <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />
                          {checkoutId === booking.id ? "Opening checkout…" : "Pay now"}
                        </button>
                      )}
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
