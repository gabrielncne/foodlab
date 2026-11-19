import data from "../data/restaurants.json";
import type { Restaurant } from "../types/restaurant";

// Catalog only. Future recommendation API integration should live in its own service.
export const restaurants: Restaurant[] = data as Restaurant[];
export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );
export function searchCatalog(query: string, category: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return restaurants.filter(
    (r) =>
      (category === "Todas" || r.category === category) &&
      terms.every((term) =>
        normalize(`${r.name} ${r.category} ${r.tags.join(" ")}`).includes(term),
      ),
  );
}
