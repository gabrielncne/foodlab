import { Link } from "react-router";
import { ArrowUpRight, Bike, Heart, Star } from "lucide-react";
import type { Restaurant } from "../types/restaurant";
import { money } from "../services/catalog";
import { FoodImage } from "./FoodImage";
export function RestaurantCard({
  restaurant: r,
  favorite,
  toggleFavorite,
}: {
  restaurant: Restaurant;
  favorite: boolean;
  toggleFavorite: (id: string) => void;
}) {
  return (
    <article className="restaurant-card">
      <Link
        to={`/restaurantes/${r.id}`}
        className="card-image-link"
        aria-label={`Ver cardápio de ${r.name}`}
      >
        <FoodImage
          src={r.image}
          alt={`Prato de ${r.category.toLowerCase()} do ${r.name}`}
        />
        {r.deliveryFee === 0 && (
          <span className="delivery-badge">
            <Bike size={14} /> Entrega grátis
          </span>
        )}
      </Link>
      <button
        className={`favorite-button ${favorite ? "is-favorite" : ""}`}
        onClick={() => toggleFavorite(r.id)}
        aria-label={`${favorite ? "Remover" : "Adicionar"} ${r.name} ${favorite ? "dos" : "aos"} favoritos`}
        aria-pressed={favorite}
      >
        <Heart size={18} fill={favorite ? "currentColor" : "none"} />
      </button>
      <Link className="card-content" to={`/restaurantes/${r.id}`}>
        <div className="flex items-center justify-between gap-2">
          <h3>{r.name}</h3>
          <span className="rating">
            <Star size={13} fill="currentColor" />{" "}
            {r.rating.toFixed(1).replace(".", ",")}
          </span>
        </div>
        <p>
          {r.category} <span>·</span>{" "}
          {r.distanceKm.toFixed(1).replace(".", ",")} km <span>·</span>{" "}
          {"$".repeat(r.averagePrice <= 30 ? 1 : r.averagePrice <= 60 ? 2 : 3)}
        </p>
        <div className="card-bottom">
          <span>
            {r.deliveryMin}–{r.deliveryMax} min <span>·</span>{" "}
            <span className={r.deliveryFee === 0 ? "free-text" : ""}>
              {r.deliveryFee === 0 ? "Grátis" : money(r.deliveryFee)}
            </span>
          </span>
          <ArrowUpRight size={17} />
        </div>
      </Link>
    </article>
  );
}
