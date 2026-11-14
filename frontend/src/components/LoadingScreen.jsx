export default function LoadingScreen({ label = "Loading…" }) {
  return (
    <div
      aria-live="polite"
      className="flex min-h-[50vh] items-center justify-center gap-3 text-sm text-slate-500"
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-forest" />
      {label}
    </div>
  );
}
