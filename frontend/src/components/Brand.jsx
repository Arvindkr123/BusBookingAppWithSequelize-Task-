import { BusFront } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ light = false }) {
  return (
    <Link aria-label="Wayfare home" className="flex items-center gap-2.5" to="/">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white">
        <BusFront aria-hidden="true" className="h-5 w-5" />
      </span>
      <span
        className={`font-display text-xl font-bold tracking-tight ${
          light ? "text-white" : "text-ink"
        }`}
      >
        wayfare<span className="text-leaf">.</span>
      </span>
    </Link>
  );
}
