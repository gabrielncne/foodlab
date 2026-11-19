import type {
  FoodMatchPreferences,
  FoodMatchResponse,
} from "../types/foodmatch";
import { restaurants } from "./catalog";

export async function requestRecommendations(
  preferences: FoodMatchPreferences,
  signal: AbortSignal,
): Promise<FoodMatchResponse> {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...preferences, limit: 6 }),
    signal,
  });
  if (!response.ok) {
    throw new Error(
      response.status === 422
        ? "As preferências não foram aceitas. Revise os campos e tente novamente."
        : "O serviço de recomendações não respondeu como esperado. Tente novamente.",
    );
  }
  const data: unknown = await response.json();
  if (!isResponse(data))
    throw new Error("O serviço retornou dados inválidos. Tente novamente.");
  return data;
}

// Check the wire format before using it in JSX. Reuse the local catalog's IDs
// and fields so invalid or stale backend objects cannot break the cards.
function isResponse(value: unknown): value is FoodMatchResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  if (
    !Array.isArray(data.items) ||
    typeof data.message !== "string" ||
    !["content", "fallback", "no_match"].includes(String(data.mode)) ||
    typeof data.total_eligible !== "number" ||
    typeof data.model !== "string"
  )
    return false;
  const ids = new Set<string>();
  return data.items.every((item: unknown) => {
    if (!item || typeof item !== "object") return false;
    const entry = item as Record<string, unknown>;
    const r = entry.restaurant as Record<string, unknown> | undefined;
    if (
      !r ||
      typeof r.id !== "string" ||
      !restaurants.some((known) => known.id === r.id) ||
      ids.has(r.id) ||
      typeof entry.reason !== "string" ||
      typeof entry.similarity !== "number" ||
      typeof entry.score !== "number" ||
      typeof entry.estimated_cost !== "number" ||
      !Array.isArray(entry.matched_terms) ||
      !entry.matched_terms.every((term) => typeof term === "string")
    )
      return false;
    ids.add(r.id);
    return (
      ["name", "category", "image", "description"].every(
        (key) => typeof r[key] === "string",
      ) &&
      [
        "rating",
        "distanceKm",
        "averagePrice",
        "deliveryMin",
        "deliveryMax",
        "deliveryFee",
      ].every((key) => typeof r[key] === "number" && Number.isFinite(r[key]))
    );
  });
}
