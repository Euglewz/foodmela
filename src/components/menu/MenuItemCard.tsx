import { formatTk } from "@/lib/currency";

type MenuItemCardProps = {
  name: string;
  description?: string;
  price: number | null;
  qty: number;
  available: boolean;
  /** Always-shown info text, e.g. "Available Saturday" or "Available 11:00 AM – 5:00 PM". */
  scheduleLabel?: string;
  imageUrl?: string | null;
  onOpen: () => void;
};

function PlaceholderThumbnail() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-xl border border-maroon/15 bg-maroon/5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-7 w-7 text-maroon/25"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m3 16 5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function MenuItemCard({
  name,
  description,
  price,
  qty,
  available,
  scheduleLabel,
  imageUrl,
  onOpen,
}: MenuItemCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-start gap-3 rounded-xl border border-maroon/15 bg-white/50 p-3 text-left transition-colors hover:border-maroon/40 hover:bg-white/90 ${
        !available ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="text-sm font-semibold text-ink">{name}</h3>
        {price !== null ? (
          <p className="mt-1 text-sm font-medium text-maroon">{formatTk(price)}</p>
        ) : (
          <p className="mt-1 text-sm font-medium text-maroon/70">Market Price</p>
        )}
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-ink/60">{description}</p>
        )}
        {scheduleLabel && (
          <p className="mt-2 text-xs font-medium text-maroon/50">{scheduleLabel}</p>
        )}
        {!available && (
          <p className="mt-1 text-xs font-semibold text-maroon/70">Currently unavailable</p>
        )}
      </div>

      <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full rounded-xl border border-maroon/15 object-cover"
          />
        ) : (
          <PlaceholderThumbnail />
        )}

        {price === null ? (
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-maroon/20 bg-cream px-2 py-1 text-[10px] font-medium text-ink/50">
            Call to order
          </span>
        ) : (
          qty > 0 && (
            <span className="absolute -right-2 -bottom-2 flex h-7 min-w-7 items-center justify-center rounded-full bg-maroon px-2 text-xs font-semibold text-cream shadow">
              {qty}
            </span>
          )
        )}
      </div>
    </button>
  );
}
