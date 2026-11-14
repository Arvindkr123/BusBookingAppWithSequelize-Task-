import { CreditCard, CircleDollarSign, Clock3, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Alert from "../../components/Alert";
import EmptyState from "../../components/EmptyState";
import LoadingScreen from "../../components/LoadingScreen";
import PageHeading from "../../components/admin/PageHeading";
import StatCard from "../../components/admin/StatCard";

function formatAmount(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPayments() {
    setError("");
    setLoading(true);
    try {
      const [paymentData, bookingData] = await Promise.all([
        api.payments.list(),
        api.bookings.list(),
      ]);
      setPayments(paymentData);
      setBookings(bookingData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const bookingById = new Map(bookings.map((booking) => [Number(booking.id), booking]));
  const successful = payments.filter((payment) => payment.paymentStatus === "SUCCESS");
  const pending = payments.filter((payment) => payment.paymentStatus === "PENDING");
  const successfulTotal = successful.reduce(
    (sum, payment) => sum + (Number(payment.amountPaid) || 0),
    0,
  );

  return (
    <div className="space-y-7">
      <PageHeading
        description="Payment records created by the booking API."
        eyebrow="Transactions"
        title="Payments"
      />
      {error && <Alert onRetry={loadPayments}>{error}</Alert>}
      {loading ? (
        <LoadingScreen label="Loading payments…" />
      ) : !error ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              detail="Payment records"
              icon={CreditCard}
              label="Total payments"
              value={payments.length}
            />
            <StatCard
              detail="Marked SUCCESS"
              icon={CircleCheck}
              label="Completed"
              value={successful.length}
            />
            <StatCard
              detail={`${pending.length} pending`}
              icon={CircleDollarSign}
              label="Successful amount"
              tone="blue"
              value={formatAmount(successfulTotal)}
            />
          </div>
          {payments.length === 0 ? (
            <EmptyState title="No payment records">
              Payment records will appear here when they are created in the API.
            </EmptyState>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-[#f8f8f4] text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3.5 font-semibold">Payment</th>
                      <th className="px-5 py-3.5 font-semibold">Booking</th>
                      <th className="px-5 py-3.5 font-semibold">Amount</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {payments.map((payment) => (
                      <tr className="text-slate-600" key={payment.id}>
                        <td className="px-5 py-4 font-semibold text-ink">#{payment.id}</td>
                        <td className="px-5 py-4">
                          #{payment.bookingId}
                          {bookingById.has(Number(payment.bookingId)) && (
                            <span className="ml-1 text-xs text-slate-400">
                              · Seat {bookingById.get(Number(payment.bookingId)).seatNumber}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-medium text-ink">
                          {formatAmount(payment.amountPaid)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              payment.paymentStatus === "SUCCESS"
                                ? "bg-[#eff4eb] text-forest"
                                : payment.paymentStatus === "PENDING"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-red-50 text-red-700"
                            }`}
                          >
                            {payment.paymentStatus === "PENDING" && (
                              <Clock3 aria-hidden="true" className="h-3 w-3" />
                            )}
                            {payment.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <p className="text-xs leading-5 text-slate-400">
            Payment statuses and amounts are read from the API. This application does not currently connect to a payment provider.
          </p>
        </>
      ) : null}
    </div>
  );
}
