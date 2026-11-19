"""Validated HTTP contracts. Restaurant field names match the existing catalog."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Category = Literal["Hambúrguer", "Pizza", "Japonesa", "Saudável", "Brasileira", "Italiana", "Doces", "Mexicana"]
Priority = Literal["relevance", "rating", "delivery"]


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", allow_inf_nan=False, str_strip_whitespace=True)


class Product(StrictModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    description: str
    price: float = Field(ge=0, strict=True)
    section: str = Field(min_length=1)


class Restaurant(StrictModel):
    id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    category: Category
    description: str = Field(min_length=1)
    image: str
    rating: float = Field(ge=0, le=5, strict=True)
    reviewCount: int = Field(ge=0, strict=True)
    deliveryMin: int = Field(ge=0, strict=True)
    deliveryMax: int = Field(ge=0, strict=True)
    deliveryFee: float = Field(ge=0, strict=True)
    averagePrice: float = Field(ge=0, strict=True)
    minimumOrder: float = Field(ge=0, strict=True)
    distanceKm: float = Field(ge=0, strict=True)
    tags: list[str]
    dietaryOptions: list[str]
    featured: bool
    products: list[Product]


class RecommendationRequest(StrictModel):
    category: Category | None = None
    budget: float | None = Field(default=60, gt=0, le=10000, strict=True)
    description: str = Field(default="", max_length=500)
    priority: Priority = "relevance"
    limit: int = Field(default=6, ge=1, le=12, strict=True)


class RecommendationItem(StrictModel):
    restaurant: Restaurant
    reason: str
    similarity: float = Field(ge=0, le=1)
    score: float = Field(ge=0, le=1)
    estimated_cost: float = Field(ge=0)
    matched_terms: list[str]


class RecommendationResponse(StrictModel):
    items: list[RecommendationItem]
    total_eligible: int
    mode: Literal["content", "fallback", "no_match"]
    message: str
    model: str = "tfidf-cosine-v1"
