import { Link, useParams } from "react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Bike,
  Clock3,
  Heart,
  MapPin,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { money, restaurants } from "../services/catalog";
import { FoodImage } from "../components/FoodImage";
export function RestaurantPage({
  favorites,
  toggleFavorite,
}: {
  favorites: string[];
  toggleFavorite: (id: string) => void;
}) {
  const { id } = useParams();
  const r = restaurants.find((item) => item.id === id);
  if (!r)
    return (
      <div className="page-container empty-state">
        <UtensilsCrossed size={38} />
        <h1>Restaurante não encontrado</h1>
        <p>Esse sabor ainda não faz parte do nosso catálogo.</p>
        <Link className="primary-button" to="/restaurantes">
          Explorar restaurantes
        </Link>
      </div>
    );
  const sections = [...new Set(r.products.map((p) => p.section))];
  return (
    <div className="page-container detail-page">
      <Link to="/restaurantes" className="back-link">
        <ArrowLeft size={17} /> Todos os restaurantes
      </Link>
      <div className="restaurant-cover">
        <FoodImage src={r.image} alt={`Especialidade do ${r.name}`} eager />
        <span className="cover-label">BONS SABORES, BOAS DESCOBERTAS.</span>
        <button
          className={`cover-favorite ${favorites.includes(r.id) ? "is-favorite" : ""}`}
          aria-label={`${favorites.includes(r.id) ? "Remover dos" : "Adicionar aos"} favoritos`}
          aria-pressed={favorites.includes(r.id)}
          onClick={() => toggleFavorite(r.id)}
        >
          <Heart
            size={21}
            fill={favorites.includes(r.id) ? "currentColor" : "none"}
          />
        </button>
      </div>
      <section className="restaurant-summary">
        <div>
          <span className="eyebrow">{r.category.toUpperCase()} · CAMPINAS</span>
          <h1>
            {r.name}
            <span className="restaurant-mark">
              <UtensilsCrossed size={23} />
            </span>
          </h1>
          <p>{r.description}</p>
          <div className="restaurant-tags">
            {r.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
            {r.dietaryOptions.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
        <div className="restaurant-facts">
          <span>
            <Star size={17} className="star" fill="currentColor" />
            <strong>{r.rating.toFixed(1).replace(".", ",")}</strong> (
            {r.reviewCount} avaliações fictícias)
          </span>
          <span>
            <Clock3 size={17} />
            {r.deliveryMin}–{r.deliveryMax} min <span>·</span>
            <MapPin size={15} />
            {r.distanceKm.toFixed(1).replace(".", ",")} km
          </span>
          <span>
            <Bike size={17} />
            {r.deliveryFee === 0
              ? "Entrega grátis"
              : `Entrega ${money(r.deliveryFee)}`}
          </span>
          <span>
            <UtensilsCrossed size={17} />
            Pedido mínimo {money(r.minimumOrder)}
          </span>
        </div>
      </section>
      <div className="menu-layout">
        <div>
          <nav className="menu-tabs" aria-label="Seções do cardápio">
            {sections.map((s) => (
              <a key={s} href={`#${encodeURIComponent(s)}`}>
                {s}
              </a>
            ))}
          </nav>
          {sections.map((section) => (
            <section className="menu-section" key={section} id={section}>
              <div className="section-heading">
                <h2>{section}</h2>
                <span className="muted">Feito para dar vontade.</span>
              </div>
              <div className="product-grid">
                {r.products
                  .filter((p) => p.section === section)
                  .map((p) => (
                    <article className="product-card" key={p.id}>
                      <div>
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <strong>{money(p.price)}</strong>
                      </div>
                      <div className="product-decoration" aria-hidden="true">
                        {section === "Bebidas" ? (
                          "🥤"
                        ) : section === "Sobremesas" ? (
                          "🍮"
                        ) : (
                          <FoodImage src={r.image} alt="" />
                        )}
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="menu-aside">
          <span className="ai-icon">
            <UtensilsCrossed size={22} />
          </span>
          <h3>
            O cardápio é fictício.
            <br />A vontade é real.
          </h3>
          <p>
            Este é um projeto de portfólio. Explore os pratos e os sabores; não
            há compra ou entrega disponível.
          </p>
          <Link to="/restaurantes">
            Descobrir outros lugares <ArrowUpRight size={17} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
