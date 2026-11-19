import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import type { FoodMatchResultState } from "../types/foodmatch";
import { RestaurantCard } from "./RestaurantCard";

interface Props {
  state: FoodMatchResultState;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onEdit: () => void;
  onRetry?: () => void;
}

// Presentation only: no fetch, filtering, ranking or generated explanations here.
export function FoodMatchResults({
  state,
  favorites,
  toggleFavorite,
  onEdit,
  onRetry,
}: Props) {
  if (state.status === "loading") {
    return (
      <section
        className="match-state-panel"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="match-orbit">
          <Sparkles size={36} aria-hidden="true" />
        </div>
        <h2>Buscando seus próximos favoritos</h2>
        <p>Estamos consultando as opções para suas preferências.</p>
        <span className="match-loading-line" aria-hidden="true" />
      </section>
    );
  }

  if (state.status === "success" && state.items.length > 0) {
    return (
      <section className="match-success" aria-labelledby="match-results-title">
        <div className="match-results-heading">
          <div>
            <span className="eyebrow">NOVOS SABORES À VISTA</span>
            <h2 id="match-results-title">Aqui estão suas recomendações</h2>
            <p role="status">
              {state.items.length}{" "}
              {state.items.length === 1
                ? "restaurante para explorar"
                : "restaurantes para explorar"}
              .
            </p>
            <p className="match-result-notice">{state.message}</p>
          </div>
          <button className="match-edit-button" onClick={onEdit}>
            <ArrowLeft size={15} /> Editar preferências
          </button>
        </div>
        <div className="match-result-grid">
          {state.items.map((item, index) => (
            <div className="match-result-item" key={item.restaurant.id}>
              <span className="match-position">
                {String(index + 1).padStart(2, "0")}
              </span>
              <RestaurantCard
                restaurant={item.restaurant}
                favorite={favorites.includes(item.restaurant.id)}
                toggleFavorite={toggleFavorite}
              />
              {item.reason && (
                <div className="match-reason">
                  <Sparkles size={16} aria-hidden="true" />
                  <div>
                    <strong>Por que este restaurante?</strong>
                    <p>{item.reason}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  const content =
    state.status === "error"
      ? {
          icon: AlertCircle,
          title: "Não foi possível buscar agora",
          description: state.message,
          label: "TENTE NOVAMENTE",
        }
      : state.status === "success"
        ? {
            icon: Search,
            title: "Ainda não encontramos esse match",
            description: state.message,
            label: "NOVAS POSSIBILIDADES",
          }
        : {
            icon: Sparkles,
            title: "Vamos encontrar seu próximo sabor?",
            description:
              "Conte o que você procura para começar pelas suas preferências.",
            label: "SEU GOSTO É O COMEÇO",
          };
  const Icon = content.icon;
  return (
    <section
      className="match-state-panel"
      role={state.status === "error" ? "alert" : undefined}
    >
      <span className="match-state-icon">
        <Icon size={30} aria-hidden="true" />
      </span>
      <span className="eyebrow">{content.label}</span>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <div className="match-state-actions">
        {state.status === "error" && onRetry && (
          <button className="match-submit" onClick={onRetry}>
            Tentar novamente <ArrowRight size={16} />
          </button>
        )}
        <button
          className={
            state.status === "idle" ? "match-submit" : "match-edit-button"
          }
          onClick={onEdit}
        >
          {state.status === "idle"
            ? "Escolher preferências"
            : "Editar preferências"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <Link to="/restaurantes" className="match-text-button">
          Explorar restaurantes
        </Link>
      </div>
    </section>
  );
}
