import { ArrowRight, Check, LockKeyhole, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Alert from "./Alert";
import { openRazorpayCheckout } from "../utils/razorpay";

export default function BookingDialog({ bus, bookings, user, onClose }) {
  const navigate = useNavigate();
  const [seatNumber, setSeatNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fare, setFare] = useState(null);
  const occupiedSeats = useMemo(
    () =>
      new Set(
        bookings
          .filter((booking) => Number(booking.busId) === Number(bus.id))
          .map((booking) => Number(booking.seatNumber)),
      ),
    [bookings, bus.id],
  );
  const availableSeats = useMemo(
    () =>
      Array.from({ length: Number(bus.totalSeats) || 0 }, (_, index) => index + 1)
        .filter((seat) => !occupiedSeats.has(seat))
        .slice(0, Number(bus.availableSeats)),
    [bus.availableSeats, bus.totalSeats, occupiedSeats],
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    api.payments.fare()
      .then((result) => {
        if (active) setFare(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const checkout = await api.payments.checkout({
        busId: bus.id,
        seatNumber: Number(seatNumber),
      });
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
        onFailure: (message) => setError(message),
        onDismiss: () => setSubmitting(false),
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        aria-labelledby="booking-title"
        aria-modal="true"
        className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
        role="dialog"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest">
              Reserve your seat
            </p>
            <h2
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink"
              id="booking-title"
            >
              Bus {bus.busNumber}
            </h2>
          </div>
          <button
            aria-label="Close booking form"
            className="rounded-full p-2 text-slate-400 transition hover:bg-stone-100 hover:text-ink"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        {user ? (
          <div className="mt-7">
            <p className="text-sm text-slate-500">
              Booking as <span className="font-semibold text-ink">{user.name}</span>
            </p>
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Choose an available seat
                </span>
                <select
                  className="form-input"
                  onChange={(event) => setSeatNumber(event.target.value)}
                  required
                  value={seatNumber}
                >
                  <option value="">Select a seat</option>
                  {availableSeats.map((seat) => (
                    <option key={seat} value={seat}>
                      Seat {seat}
                    </option>
                  ))}
                </select>
              </label>
              {availableSeats.length === 0 && (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  No seats are currently available on this bus.
                </p>
              )}
              <div className="flex items-center justify-between rounded-xl bg-[#f5f6f1] px-4 py-3">
                <span className="text-sm text-slate-600">Price per seat</span>
                <span className="font-semibold text-ink">
                  {fare
                    ? new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: fare.currency,
                      maximumFractionDigits: 0,
                    }).format(fare.amount)
                    : "Loading…"}
                </span>
              </div>
              <p className="flex items-center gap-2 text-xs leading-5 text-slate-500">
                <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-forest" />
                Pay securely with the payment methods enabled on your Razorpay account.
              </p>
              <Alert>{error}</Alert>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-55"
                disabled={submitting || !fare || availableSeats.length === 0}
                type="submit"
              >
                {submitting ? "Opening secure checkout…" : "Reserve & pay"}
                {!submitting && <Check aria-hidden="true" className="h-4 w-4" />}
              </button>
            </form>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-[#f5f6f1] p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-semibold text-ink">Sign in to book this seat</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Your reservation will be attached securely to your account.
            </p>
            <div className="mt-5 flex gap-3">
              <Link
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
                state={{ from: { pathname: "/" }, busId: bus.id }}
                to="/login"
              >
                Sign in <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-forest"
                to="/signup"
                state={{ from: { pathname: "/" }, busId: bus.id }}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
