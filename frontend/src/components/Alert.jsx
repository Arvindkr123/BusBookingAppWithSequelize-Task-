import { AlertCircle } from "lucide-react";

export default function Alert({ children, onRetry }) {
  if (!children) return null;

  return (
    <div
      aria-live="polite"
      className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      role="alert"
    >
      <span className="inline-flex items-start gap-2">
        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        {children}
      </span>
      {onRetry && (
        <button
          className="self-start font-semibold hover:underline sm:self-auto"
          onClick={onRetry}
          type="button"
        >
          Try again
        </button>
      )}
    </div>
  );
}
