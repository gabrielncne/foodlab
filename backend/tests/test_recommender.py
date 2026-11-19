from decimal import Decimal

import pytest

from backend.catalog import load_catalog
from backend.recommender import Recommender, estimated_cost
from backend.schemas import RecommendationRequest


@pytest.fixture(scope="module")
def model():
    return Recommender(load_catalog())


@pytest.mark.parametrize("budget, count", [(40, 0), (48, 1), (60, 1), (70.9, 2), (100, 2)])
def test_japanese_budget_and_boundary(model, budget, count):
    result = model.recommend(RecommendationRequest(category="Japonesa", budget=budget))
    assert len(result.items) == count
    for item in result.items:
        assert item.restaurant.category == "Japonesa"
        assert estimated_cost(item.restaurant) <= Decimal(str(budget))


def test_unknown_words_use_explicit_fallback(model):
    result = model.recommend(RecommendationRequest(description="zxqvbnm", budget=None))
    assert result.mode == "fallback"
    assert result.items
    assert all(item.similarity == 0 and not item.matched_terms for item in result.items)
    assert "Não há termos reconhecidos" in result.message


def test_no_text_discloses_fallback(model):
    assert model.recommend(RecommendationRequest(budget=None)).mode == "fallback"


def test_known_text_without_overlap_in_filtered_subset_returns_no_match(model):
    result = model.recommend(RecommendationRequest(category="Japonesa", description="pizza", budget=None))
    assert result.mode == "no_match"
    assert result.items == []
    assert result.total_eligible == 2


@pytest.mark.parametrize("query", ["salmão sushi", "SALMAO SUSHI"])
def test_content_match_is_accent_and_case_insensitive(model, query):
    result = model.recommend(RecommendationRequest(description=query, budget=None, limit=2))
    assert result.mode == "content"
    assert {item.restaurant.category for item in result.items} == {"Japonesa"}
    assert all(item.similarity > 0 and item.matched_terms for item in result.items)


def test_priorities_change_ranking_with_no_text(model):
    rating = model.recommend(RecommendationRequest(description="zzqx", budget=None, priority="rating"))
    delivery = model.recommend(RecommendationRequest(description="zzqx", budget=None, priority="delivery"))
    assert rating.items[0].restaurant.id != delivery.items[0].restaurant.id
    assert delivery.items[0].restaurant.deliveryMax <= rating.items[0].restaurant.deliveryMax


def test_limit_determinism_and_no_catalog_mutation(model):
    original = [r.model_dump() for r in model.restaurants]
    request = RecommendationRequest(description="queijo", budget=None, limit=1)
    a, b = model.recommend(request), model.recommend(request)
    assert a == b
    assert len(a.items) == 1
    assert [r.model_dump() for r in model.restaurants] == original


def test_vocabulary_not_refitted_on_queries(model):
    vocabulary = model.vectorizer.vocabulary_.copy()
    model.recommend(RecommendationRequest(description="inventandopalavras", budget=None))
    assert model.vectorizer.vocabulary_ == vocabulary


def test_estimated_cost_decimal_boundary():
    restaurant = load_catalog()[0].model_copy(update={"averagePrice": 0.1, "deliveryFee": 0.2})
    assert estimated_cost(restaurant) == Decimal("0.3")


def test_reason_facts_and_bounds(model):
    result = model.recommend(RecommendationRequest(category="Japonesa", budget=60, priority="delivery"))
    item = result.items[0]
    assert "R$ 48,00" in item.reason
    assert "35–50 min" in item.reason
    assert 0 <= item.similarity <= 1 and 0 <= item.score <= 1
