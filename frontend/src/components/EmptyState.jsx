import { BusFront } from "lucide-react";

export default function EmptyState({ title, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf0e5] text-forest">
        <BusFront aria-hidden="true" className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      {children && (
        <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
          {children}
        </p>
      )}
    </div>
  );
}
