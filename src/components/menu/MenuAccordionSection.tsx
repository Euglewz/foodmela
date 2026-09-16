import type { ReactNode } from "react";

type MenuAccordionSectionProps = {
  label: string;
  itemCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
};

export default function MenuAccordionSection({
  label,
  itemCount,
  isOpen,
  onToggle,
  children,
}: MenuAccordionSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-maroon/15 bg-white/40">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left"
      >
        <span className="text-sm font-semibold text-ink">
          {label} <span className="font-normal text-ink/50">({itemCount})</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`h-4 w-4 shrink-0 text-maroon transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 gap-3 border-t border-maroon/15 p-4 sm:grid-cols-2">
          {children}
        </div>
      )}
    </div>
  );
}
