import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 font-display font-bold text-xl ${className}`}>
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-leaf shadow-pop">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path d="M9 11.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 1 0-5-5l-1 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary-foreground" />
          <path d="M15 12.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 1 0 5 5l1-1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="text-primary-foreground" />
        </svg>
      </span>
      <span>linkly</span>
    </Link>
  );
}
