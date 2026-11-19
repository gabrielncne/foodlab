"""Load and validate one shared JSON; never resolve paths from terminal cwd."""

import json
import os
from pathlib import Path

from .schemas import Restaurant

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CATALOG = PROJECT_ROOT / "src" / "data" / "restaurants.json"


def load_catalog(path: Path | None = None) -> tuple[Restaurant, ...]:
    source = path or Path(os.environ.get("FOODLAB_CATALOG_PATH", DEFAULT_CATALOG))
    with source.open(encoding="utf-8") as file:
        raw = json.load(file)
    if not isinstance(raw, list) or not raw:
        raise ValueError("O catálogo deve ser uma lista não vazia.")
    restaurants = tuple(Restaurant.model_validate(item) for item in raw)
    if len({r.id for r in restaurants}) != len(restaurants):
        raise ValueError("Há IDs duplicados no catálogo.")
    for restaurant in restaurants:
        if restaurant.deliveryMin > restaurant.deliveryMax:
            raise ValueError(f"Intervalo de entrega inválido: {restaurant.id}")
        if len({p.id for p in restaurant.products}) != len(restaurant.products):
            raise ValueError(f"Há IDs de produtos duplicados: {restaurant.id}")
    return restaurants
