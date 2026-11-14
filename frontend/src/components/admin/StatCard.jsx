export default function StatCard({ label, value, detail, icon: Icon, tone = "green" }) {
  const iconTone =
    tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "blue"
        ? "bg-blue-50 text-blue-700"
        : "bg-[#eaf0e5] text-forest";

  return (
    <article className="rounded-2xl border border-stone-200/80 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      {detail && <p className="mt-3 text-xs text-slate-400">{detail}</p>}
    </article>
  );
}
