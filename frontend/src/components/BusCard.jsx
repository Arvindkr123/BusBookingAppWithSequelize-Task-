import { ArrowUpRight, BusFront } from "lucide-react";

export default function BusCard({ bus, onSelect }) {
  const available = Number(bus.availableSeats);
  const total = Number(bus.totalSeats);
  const availablePercent = total > 0 ? (available / total) * 100 : 0;

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-leaf/40 hover:shadow-lg hover:shadow-ink/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf0e5] text-forest">
            <BusFront aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-medium text-slate-400">Bus number</p>
            <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">
              {bus.busNumber}
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-[#eff4eb] px-3 py-1.5 text-xs font-semibold text-forest">
          {available} {available === 1 ? "seat" : "seats"} left
        </span>
      </div>
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Seat availability</span>
          <span>{Math.max(total - available, 0)} / {total} reserved</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            aria-hidden="true"
            className="h-full rounded-full bg-leaf transition-all"
            style={{ width: `${Math.min(availablePercent, 100)}%` }}
          />
        </div>
      </div>
      <button
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f6f7f2] px-4 py-3 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#f6f7f2] disabled:hover:text-forest"
        disabled={available < 1}
        onClick={() => onSelect(bus)}
        type="button"
      >
        {available < 1 ? "Fully booked" : "Choose this bus"}
        {available > 0 && <ArrowUpRight aria-hidden="true" className="h-4 w-4" />}
      </button>
    </article>
  );
}
