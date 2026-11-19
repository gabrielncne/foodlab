import type { Category, Restaurant } from "./restaurant";

// Fields shared with the validated FastAPI request (backend/schemas.py).
export interface FoodMatchPreferences {
  category: Category | null;
  budget: number | null;
  description: string;
  priority: "relevance" | "rating" | "delivery";
}

// The future integration supplies restaurants in the order chosen by the backend.
export interface FoodMatchItem {
  restaurant: Restaurant;
  reason: string;
  similarity: number;
  score: number;
  estimated_cost: number;
  matched_terms: string[];
}

export interface FoodMatchResponse {
  items: FoodMatchItem[];
  total_eligible: number;
  mode: "content" | "fallback" | "no_match";
  message: string;
  model: string;
}

export type FoodMatchResultState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "success";
      items: FoodMatchItem[];
      message: string;
      mode: FoodMatchResponse["mode"];
    };

export const initialFoodMatchPreferences: FoodMatchPreferences = {
  category: null,
  budget: 60,
  description: "",
  priority: "relevance",
};
