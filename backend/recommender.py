"""TF-IDF + cosine similarity, hard constraints and explicit ranking priorities.

No model download, LLM, interaction history or external inference service is used.
"""

from decimal import Decimal

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .schemas import RecommendationItem, RecommendationRequest, RecommendationResponse, Restaurant

# A small, explicit Portuguese list: normalized to match strip_accents='unicode'.
# Negation is not understood; this model must not be used as an allergy filter.
STOP_WORDS = ["a", "ao", "aos", "as", "com", "da", "das", "de", "do", "dos", "e", "em", "eu", "na", "nas", "no", "nos", "o", "os", "ou", "para", "por", "que", "quero", "um", "uma", "uns", "umas"]
WEIGHTS = {
    "relevance": (0.85, 0.10, 0.05),
    "rating": (0.60, 0.35, 0.05),
    "delivery": (0.60, 0.05, 0.35),
}


def restaurant_text(restaurant: Restaurant) -> str:
    return " ".join([restaurant.category, restaurant.description, *restaurant.tags])


def estimated_cost(restaurant: Restaurant) -> Decimal:
    # Decimal prevents a boundary such as 0.1 + 0.2 from rejecting a 0.3 budget.
    return Decimal(str(restaurant.averagePrice)) + Decimal(str(restaurant.deliveryFee))


def brl(value: Decimal) -> str:
    return f"R$ {value:.2f}".replace(".", ",")


class Recommender:
    def __init__(self, restaurants: tuple[Restaurant, ...]):
        self.restaurants = restaurants
        self.vectorizer = TfidfVectorizer(
            strip_accents="unicode", lowercase=True, ngram_range=(1, 2),
            stop_words=STOP_WORDS, sublinear_tf=True,
        )
        # Fit on the full catalog once, never on the user query or filtered subset.
        self.matrix = self.vectorizer.fit_transform([restaurant_text(r) for r in restaurants])
        self.features = self.vectorizer.get_feature_names_out()

    def recommend(self, request: RecommendationRequest) -> RecommendationResponse:
        budget = Decimal(str(request.budget)) if request.budget is not None else None
        eligible = [
            index for index, r in enumerate(self.restaurants)
            if (request.category is None or r.category == request.category)
            and (budget is None or estimated_cost(r) <= budget)
        ]
        if not eligible:
            return RecommendationResponse(items=[], total_eligible=0, mode="no_match", message="Nenhum restaurante atende à categoria e ao orçamento. Edite seus critérios para tentar novamente.")

        # Explicit free text takes precedence. Category is used as text only when
        # no description was provided, while always remaining a hard constraint.
        query = request.description or request.category or ""
        query_vector = self.vectorizer.transform([query])
        has_vocabulary = query_vector.nnz > 0
        similarities = cosine_similarity(query_vector, self.matrix).ravel() if has_vocabulary else np.zeros(len(self.restaurants))
        ranked: list[tuple[float, float, Restaurant, int]] = []
        for index in eligible:
            r = self.restaurants[index]
            similarity = float(np.clip(similarities[index], 0, 1))
            if has_vocabulary and similarity <= 1e-12:
                continue  # Don't label zero-overlap documents as text matches.
            rating = r.rating / 5
            speed = 1 - min(r.deliveryMax, 90) / 90
            if has_vocabulary:
                content_weight, rating_weight, speed_weight = WEIGHTS[request.priority]
                score = content_weight * similarity + rating_weight * rating + speed_weight * speed
            else:
                score = 0.8 * speed + 0.2 * rating if request.priority == "delivery" else 0.8 * rating + 0.2 * speed
            ranked.append((score, similarity, r, index))
        ranked.sort(key=lambda item: (-item[0], -item[1], -item[2].rating, item[2].deliveryMax, item[2].id))
        if not ranked:
            return RecommendationResponse(items=[], total_eligible=len(eligible), mode="no_match", message="Seu texto não encontrou afinidade entre as opções dentro dos filtros. Tente outros sabores ou ajuste os critérios.")

        items = []
        for score, similarity, restaurant, index in ranked[:request.limit]:
            overlap = query_vector.multiply(self.matrix[index]).tocoo()
            contributions = sorted(zip(overlap.col, overlap.data), key=lambda pair: (-pair[1], str(self.features[pair[0]])))
            terms = [str(self.features[column]) for column, _ in contributions if " " not in str(self.features[column])][:3]
            facts = [f"Culinária {restaurant.category.lower()}.", f"Estimativa de {brl(estimated_cost(restaurant))} com entrega."]
            if terms:
                facts.append(f"Termos em comum: {', '.join(terms)}.")
            if request.priority == "rating":
                formatted_rating = f"{restaurant.rating:.1f}".replace(".", ",")
                facts.append(f"Avaliação {formatted_rating} valorizada na ordenação.")
            elif request.priority == "delivery":
                facts.append(f"Prazo de {restaurant.deliveryMin}–{restaurant.deliveryMax} min valorizado na ordenação.")
            if not has_vocabulary:
                facts.append("Ordenação alternativa por avaliação e prazo, sem afinidade textual calculada.")
            items.append(RecommendationItem(restaurant=restaurant, reason=" ".join(facts), similarity=round(similarity, 6), score=round(float(score), 6), estimated_cost=float(estimated_cost(restaurant)), matched_terms=terms))
        return RecommendationResponse(
            items=items, total_eligible=len(eligible), mode="content" if has_vocabulary else "fallback",
            message="Resultados por afinidade textual e prioridade escolhida." if has_vocabulary else "Não há termos reconhecidos para calcular afinidade. As opções abaixo respeitam os filtros e foram ordenadas por avaliação e prazo.",
        )
