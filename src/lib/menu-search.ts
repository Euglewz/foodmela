import { formatTk } from "@/lib/currency";
import type { SearchSuggestion } from "@/components/menu/SearchBar";
import type { MenuItemDTO } from "@/lib/menu-types";

export function matchesQuery(item: MenuItemDTO, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [item.name, item.description, item.category].some((field) => field?.toLowerCase().includes(needle));
}

// Name matches rank above description matches, and a name starting with the query ranks highest.
export function menuSuggestions(items: MenuItemDTO[], query: string, limit = 6): SearchSuggestion[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return items
    .filter((item) => matchesQuery(item, needle))
    .map((item) => {
      const name = item.name.toLowerCase();
      return { item, rank: name.startsWith(needle) ? 0 : name.includes(needle) ? 1 : 2 };
    })
    .sort((a, b) => a.rank - b.rank || a.item.name.localeCompare(b.item.name))
    .slice(0, limit)
    .map(({ item }) => ({
      id: item.id,
      label: item.name,
      detail: item.price !== null ? formatTk(item.price) : "Market Price",
    }));
}
