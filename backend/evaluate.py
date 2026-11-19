"""Small, explicitly synthetic category-based benchmark; not a user study."""

import json

from .catalog import load_catalog
from .recommender import Recommender
from .schemas import RecommendationRequest

SCENARIOS = [
    ("sushi salmão", "Japonesa"),
    ("pizza massa", "Pizza"),
    ("burger hambúrguer", "Hambúrguer"),
    ("salada bowl", "Saudável"),
]


def evaluate() -> dict:
    restaurants = load_catalog()
    model = Recommender(restaurants)
    baseline = sorted(restaurants, key=lambda r: (-r.rating, r.id))[:2]
    rows = []
    for query, category in SCENARIOS:
        relevant = {r.id for r in restaurants if r.category == category}
        recommended = model.recommend(RecommendationRequest(description=query, budget=None, limit=2)).items
        hits = len({item.restaurant.id for item in recommended} & relevant)
        baseline_hits = len({r.id for r in baseline} & relevant)
        rows.append({"query": query, "relevance_rule": f"category={category}", "recommended_ids": [item.restaurant.id for item in recommended], "precision_at_2": hits / 2, "baseline_precision_at_2": baseline_hits / 2})
    return {"label": "Synthetic category-based sanity check, not real-world quality", "k": 2, "scenarios": rows, "mean_precision_at_2": sum(row["precision_at_2"] for row in rows) / len(rows), "baseline_mean_precision_at_2": sum(row["baseline_precision_at_2"] for row in rows) / len(rows)}


if __name__ == "__main__":
    print(json.dumps(evaluate(), ensure_ascii=False, indent=2))
