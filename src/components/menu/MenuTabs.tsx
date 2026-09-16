type MenuTabsProps<T extends string> = {
  tabs: readonly T[];
  active: T;
  onChange: (tab: T) => void;
  labelFor?: (tab: T) => string;
};

export default function MenuTabs<T extends string>({
  tabs,
  active,
  onChange,
  labelFor,
}: MenuTabsProps<T>) {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-maroon/15 pb-px">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "border-maroon text-maroon"
                : "border-transparent text-ink/60 hover:text-maroon"
            }`}
          >
            {labelFor ? labelFor(tab) : tab}
          </button>
        );
      })}
    </div>
  );
}
