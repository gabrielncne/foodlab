import { useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router";
import { Layout } from "./components/Layout";
import { CatalogPage } from "./pages/CatalogPage";
import { RestaurantPage } from "./pages/RestaurantPage";
import { FoodMatchPage } from "./pages/FoodMatchPage";
import { restaurants } from "./services/catalog";
const storageKey = "foodlab:favorites:v1";
function readFavorites(): string[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(data)
      ? data.filter(
          (id): id is string =>
            typeof id === "string" && restaurants.some((r) => r.id === id),
        )
      : [];
  } catch {
    return [];
  }
}
export default function App() {
  const [favorites, setFavorites] = useState<string[]>(readFavorites);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = pathname.startsWith("/foodmatch")
      ? "FoodMatch AI — Suas próximas descobertas | FoodLab"
      : pathname === "/"
        ? "FoodLab — Seu próximo sabor favorito"
        : "Explore sabores | FoodLab";
  }, [pathname]);
  function toggleFavorite(id: string) {
    setFavorites((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        /* Favorites remain usable in memory if storage is unavailable. */
      }
      return next;
    });
  }
  const props = { favorites, toggleFavorite };
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<CatalogPage {...props} />} />
        <Route path="foodmatch/*" element={<FoodMatchPage {...props} />} />
        <Route
          path="restaurantes"
          element={<CatalogPage mode="all" {...props} />}
        />
        <Route
          path="favoritos"
          element={<CatalogPage mode="favorites" {...props} />}
        />
        <Route
          path="restaurantes/:id"
          element={<RestaurantPage {...props} />}
        />
        <Route
          path="*"
          element={
            <div className="page-container empty-state">
              <h1>Esse caminho não está no cardápio.</h1>
              <Link to="/" className="primary-button">
                Voltar ao início
              </Link>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
