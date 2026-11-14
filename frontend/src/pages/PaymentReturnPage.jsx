import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import Alert from "../components/Alert";
import SiteHeader from "../components/SiteHeader";

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const verificationError = searchParams.get("verification_error") === "1";
  const [status, setStatus] = useState("CHECKING");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setStatus("ERROR");
      setError("This payment return link is incomplete. Check your bookings for the latest status.");
      return undefined;
    }

    let active = true;
    async function checkPayment() {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        try {
          const payment = await api.payments.order(orderId);
          if (!active) return;
          if (payment.paymentStatus !== "PENDING") {
            setStatus(payment.paymentStatus);
            return;
          }
        } catch (requestError) {
          if (!active) return;
          setStatus("ERROR");
          setError(requestError.message);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
        if (!active) return;
      }
      if (active) setStatus("PENDING");
    }

    checkPayment();
    return () => {
      active = false;
    };
  }, [orderId]);

  const successful = status === "SUCCESS";
  const failed = status === "FAILED";
  const checking = status === "CHECKING";

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <section className="rounded-3xl border border-stone-200/80 bg-white p-7 text-center shadow-sm sm:p-10">
          {successful ? (
            <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-forest" />
          ) : failed ? (
            <XCircle aria-hidden="true" className="mx-auto h-12 w-12 text-red-500" />
          ) : (
            <Clock3 aria-hidden="true" className="mx-auto h-12 w-12 text-amber-500" />
          )}
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
            {successful
              ? "Payment successful"
              : failed
                ? "Payment could not be completed"
              : checking
                ? "Verifying your payment"
                : status === "PENDING"
                  ? "Payment is processing"
                  : "Payment status unavailable"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {successful
              ? "Your seat is confirmed. You can see the reservation in your bookings."
              : failed
              ? "The payment did not complete. Your reservation is still available to retry from your bookings."
              : checking
                ? verificationError
                  ? "We could not verify the checkout response yet. We are checking the payment status with the server."
                  : "We are verifying the payment securely with Razorpay."
                : status === "PENDING"
                  ? "Razorpay has not sent a final confirmation yet. Check your bookings again in a moment."
                  : "Your payment could not be verified. Your bookings page shows the latest server-side status."}
          </p>
          {error && <div className="mt-5 text-left"><Alert>{error}</Alert></div>}
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-dark"
              to="/account/bookings"
            >
              View my bookings
            </Link>
            <Link
              className="rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold text-ink hover:border-forest"
              to="/"
            >
              Browse buses
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
