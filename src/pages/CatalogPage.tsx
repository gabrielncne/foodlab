import { useRef } from "react";
import { Link, useSearchParams } from "react-router";
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Heart,
  ArrowUpRight,
} from "lucide-react";
import { restaurants, searchCatalog } from "../services/catalog";
import { RestaurantCard } from "../components/RestaurantCard";
import { FoodImage } from "../components/FoodImage";
const categories = [
  { name: "Todas", icon: "🍽️" },
  { name: "Hambúrguer", icon: "🍔" },
  { name: "Pizza", icon: "🍕" },
  { name: "Japonesa", icon: "🍣" },
  { name: "Saudável", icon: "🥗" },
  { name: "Brasileira", icon: "🍲" },
  { name: "Italiana", icon: "🍝" },
  { name: "Doces", icon: "🍰" },
  { name: "Mexicana", icon: "🌮" },
];
export function CatalogPage({
  mode = "home",
  favorites,
  toggleFavorite,
}: {
  mode?: "home" | "all" | "favorites";
  favorites: string[];
  toggleFavorite: (id: string) => void;
}) {
  const [params, setParams] = useSearchParams();
  const query = params.get("busca") ?? "";
  const category = params.get("categoria") ?? "Todas";
  const sort = params.get("ordem") ?? "padrao";
  const free = params.get("gratis") === "sim";
  const resultsRef = useRef<HTMLElement>(null);
  function update(key: string, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  let filtered = searchCatalog(query, category).filter(
    (r) =>
      (!free || r.deliveryFee === 0) &&
      (mode !== "favorites" || favorites.includes(r.id)),
  );
  if (sort === "avaliacao")
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sort === "tempo")
    filtered = [...filtered].sort((a, b) => a.deliveryMax - b.deliveryMax);
  if (sort === "preco")
    filtered = [...filtered].sort((a, b) => a.averagePrice - b.averagePrice);
  return (
    <div className="page-container">
      {mode === "home" && (
        <>
          <section className="welcome">
            <div>
              <span className="eyebrow">
                <span className="live-dot" /> O BOM DA VIDA ESTÁ NO PRATO
              </span>
              <h1>
                Seu próximo sabor
                <br />
                favorito está <em>aqui.</em>
              </h1>
              <p>
                Dos clássicos de sempre às novas descobertas.
                <br className="hidden sm:block" /> Encontre o que combina com a
                sua fome.
              </p>
            </div>
            <div className="welcome-note">
              <span className="tiny-stars">✳</span>
              <span>
                Boa comida.
                <br />
                <strong>Novas histórias.</strong>
              </span>
              <span className="note-line" />
            </div>
          </section>
          <div className="hero-grid">
            <section className="main-hero">
              <FoodImage
                src="/images/burger.jpg"
                alt="Hambúrguer artesanal com queijo e vegetais"
                eager
              />
              <div className="hero-shade" />
              <div className="hero-copy">
                <span className="hero-tag">SEU MOMENTO, SEU SABOR</span>
                <h2>
                  Hoje pede um
                  <br />
                  bom hambúrguer.
                </h2>
                <p>Pão macio, queijo derretido e zero pressa.</p>
                <Link
                  to="/restaurantes?categoria=Hamb%C3%BArguer"
                  className="white-button"
                >
                  Explorar hamburguerias <ArrowUpRight size={17} />
                </Link>
              </div>
              <span className="hero-number">FEITO NA BRASA</span>
            </section>
            <section className="ai-banner">
              <div className="flex items-start justify-between">
                <span className="ai-icon">
                  <Sparkles size={24} />
                </span>
                <span className="coming-pill">EXPERIMENTE</span>
              </div>
              <div>
                <h2>
                  Menos dúvida.
                  <br /> Mais <span>match.</span>
                </h2>
                <p>
                  Conte seus gostos e descubra restaurantes que combinam com sua
                  vontade e seu orçamento estimado.
                </p>
              </div>
              <div className="ai-bottom">
                <span>
                  FoodMatch <strong>AI</strong> <Sparkles size={14} />
                </span>
                <Link to="/foodmatch" className="ai-preview-link">
                  Escolher preferências <ArrowRight size={16} />
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
      {mode !== "home" && (
        <section className="secondary-heading">
          <span className="eyebrow">
            {mode === "favorites"
              ? "SUA LISTA, SEU GOSTO"
              : "UMA CIDADE DE SABORES"}
          </span>
          <h1>
            {mode === "favorites"
              ? "Seus favoritos."
              : "Explore os restaurantes."}
          </h1>
          <p>
            {mode === "favorites"
              ? "Os lugares que você guardou para a próxima fome."
              : "Uma boa descoberta começa por aqui."}
          </p>
        </section>
      )}
      <section
        className="explore-section"
        aria-label="Buscar e filtrar restaurantes"
      >
        <div className="section-heading">
          <h2>Qual é a sua vontade?</h2>
          <span className="muted hidden sm:block">
            Tem sempre um sabor para cada momento.
          </span>
        </div>
        <div className="search-row">
          <label className="search-box">
            <Search size={20} />
            <input
              type="search"
              placeholder="Busque por restaurante ou categoria"
              aria-label="Buscar por restaurante ou categoria"
              value={query}
              onChange={(e) => update("busca", e.target.value)}
            />
            {query && (
              <button
                aria-label="Limpar busca"
                onClick={() => update("busca", "")}
              >
                <X size={17} />
              </button>
            )}
          </label>
          <label className="sort-control">
            <SlidersHorizontal size={17} />
            <select
              aria-label="Ordenar restaurantes"
              value={sort}
              onChange={(e) => update("ordem", e.target.value)}
            >
              <option value="padrao">Ordenar por</option>
              <option value="avaliacao">Melhor avaliação</option>
              <option value="tempo">Menor tempo</option>
              <option value="preco">Menor preço médio</option>
            </select>
          </label>
        </div>
        <div className="categories">
          {categories.map((c) => (
            <button
              key={c.name}
              className={`category ${category === c.name ? "selected" : ""}`}
              aria-pressed={category === c.name}
              onClick={() =>
                update("categoria", c.name === "Todas" ? "" : c.name)
              }
            >
              <span>{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>
      </section>
      {mode === "home" && !query && category === "Todas" && !free && (
        <section className="featured-strip">
          <div className="featured-label">
            <span className="eyebrow">VALE A DESCOBERTA</span>
            <h2>
              Queridinhos
              <br />
              da vizinhança <span>↗</span>
            </h2>
          </div>
          {restaurants
            .filter((r) => r.featured)
            .slice(0, 3)
            .map((r) => (
              <Link
                key={r.id}
                to={`/restaurantes/${r.id}`}
                className="mini-restaurant"
              >
                <FoodImage src={r.image} alt={r.name} />
                <div>
                  <h3>{r.name}</h3>
                  <p>
                    ★ {r.rating.toFixed(1).replace(".", ",")}{" "}
                    <span>· {r.category}</span>
                  </p>
                </div>
                <ArrowUpRight size={16} />
              </Link>
            ))}
        </section>
      )}
      <section className="results-section" ref={resultsRef}>
        <div className="section-heading results-heading">
          <div>
            <span className="eyebrow">ESCOLHA. DESCUBRA. APROVEITE.</span>
            <h2>
              {mode === "favorites"
                ? "Salvos por você"
                : category === "Todas"
                  ? "Restaurantes para explorar"
                  : category}{" "}
              <span className="count">{filtered.length}</span>
            </h2>
          </div>
          <button
            className={`filter-chip ${free ? "active" : ""}`}
            aria-pressed={free}
            onClick={() => update("gratis", free ? "" : "sim")}
          >
            Entrega grátis {free && <X size={13} />}
          </button>
        </div>
        <p className="results-status" role="status">
          {query
            ? `${filtered.length} resultado(s) para “${query}”`
            : "Restaurantes e valores fictícios para você explorar."}
        </p>
        {filtered.length ? (
          <div className="restaurant-grid">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                favorite={favorites.includes(r.id)}
                toggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {mode === "favorites" ? <Heart size={32} /> : <Search size={32} />}
            <h3>
              {mode === "favorites" && !favorites.length
                ? "Seus favoritos começam aqui"
                : "Nenhum restaurante por aqui"}
            </h3>
            <p>
              {mode === "favorites" && !favorites.length
                ? "Toque no coração de um restaurante para guardar sua próxima descoberta."
                : "Tente outro nome, categoria ou remova os filtros."}
            </p>
            <button className="primary-button" onClick={() => setParams({})}>
              Limpar filtros
            </button>
            {mode === "favorites" && (
              <Link to="/restaurantes">
                Explorar restaurantes <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}
      </section>
      <div className="closing-note">
        <span>
          Um laboratório de sabores <Sparkles size={16} />
        </span>
        <p>Explore sem pressa. Seu próximo favorito pode estar a um clique.</p>
      </div>
    </div>
  );
}
