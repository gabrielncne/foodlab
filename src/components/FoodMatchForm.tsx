import type { FormEvent } from "react";
import { ArrowRight, Clock3, Compass, Sparkles, Star } from "lucide-react";
import type { Category } from "../types/restaurant";
import type { FoodMatchPreferences } from "../types/foodmatch";

const cuisines: { value: Category | null; label: string; emoji: string }[] = [
  { value: null, label: "Quero descobrir", emoji: "✨" },
  { value: "Hambúrguer", label: "Hambúrguer", emoji: "🍔" },
  { value: "Pizza", label: "Pizza", emoji: "🍕" },
  { value: "Japonesa", label: "Japonesa", emoji: "🍣" },
  { value: "Saudável", label: "Saudável", emoji: "🥗" },
  { value: "Brasileira", label: "Brasileira", emoji: "🍲" },
  { value: "Italiana", label: "Italiana", emoji: "🍝" },
  { value: "Doces", label: "Doces", emoji: "🍰" },
  { value: "Mexicana", label: "Mexicana", emoji: "🌮" },
];
const budgets = [40, 60, 100, null];
const priorities = [
  {
    value: "relevance",
    label: "Combinar com meu gosto",
    detail: "Afinidade com o que você procura.",
    icon: Compass,
  },
  {
    value: "rating",
    label: "Melhor avaliação",
    detail: "Valorizar as notas dos restaurantes.",
    icon: Star,
  },
  {
    value: "delivery",
    label: "Entrega mais rápida",
    detail: "Dar prioridade a um prazo menor.",
    icon: Clock3,
  },
] as const;

interface Props {
  value: FoodMatchPreferences;
  onChange: (value: FoodMatchPreferences) => void;
  onSubmit: (value: FoodMatchPreferences) => void;
  onReset: () => void;
}

export function FoodMatchForm({ value, onChange, onSubmit, onReset }: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({ ...value, description: value.description.trim() });
  }

  return (
    <form className="match-form" onSubmit={submit}>
      <div className="match-form-intro">
        <span className="eyebrow">DO SEU JEITO</span>
        <h2>O que combina com sua fome?</h2>
        <p>Escolha uma opção em cada grupo. Você pode mudar de ideia depois.</p>
      </div>
      <fieldset className="match-fieldset">
        <legend>
          <span>01</span> Qual é a sua vontade?
        </legend>
        <div className="match-cuisines">
          {cuisines.map((cuisine) => (
            <label key={cuisine.label} className="match-choice">
              <input
                type="radio"
                name="cuisine"
                value={cuisine.value ?? "any"}
                checked={value.category === cuisine.value}
                onChange={() => onChange({ ...value, category: cuisine.value })}
              />
              <span>
                <span aria-hidden="true">{cuisine.emoji}</span>
                {cuisine.label}
              </span>
            </label>
          ))}
        </div>
        <p className="match-help">
          A culinária escolhida limita os resultados. “Quero descobrir” permite
          todas as categorias.
        </p>
      </fieldset>
      <fieldset className="match-fieldset" aria-describedby="match-budget-help">
        <legend>
          <span>02</span> Qual é o seu orçamento?
        </legend>
        <div className="match-budgets">
          {budgets.map((budget) => (
            <label key={budget ?? "unlimited"} className="match-choice">
              <input
                type="radio"
                name="budget"
                value={budget ?? "unlimited"}
                checked={value.budget === budget}
                onChange={() => onChange({ ...value, budget })}
              />
              <span>{budget === null ? "Sem limite" : `Até R$ ${budget}`}</span>
            </label>
          ))}
        </div>
        <p id="match-budget-help" className="match-help">
          Estimativa por pessoa: preço médio do restaurante + entrega. O valor
          final depende dos pratos escolhidos.
        </p>
      </fieldset>
      <fieldset className="match-fieldset">
        <legend>
          <span>03</span> O que pesa mais na sua escolha?
        </legend>
        <div className="match-priorities">
          {priorities.map(({ value: priority, label, detail, icon: Icon }) => (
            <label key={priority} className="match-priority">
              <input
                type="radio"
                name="priority"
                value={priority}
                checked={value.priority === priority}
                onChange={() => onChange({ ...value, priority })}
              />
              <span className="match-priority-content">
                <Icon size={20} aria-hidden="true" />
                <span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
                <span className="match-radio-dot" aria-hidden="true" />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="match-fieldset">
        <label className="match-text-label" htmlFor="match-description">
          <span>04</span> Mais alguma vontade? <small>Opcional</small>
        </label>
        <textarea
          id="match-description"
          value={value.description}
          onChange={(event) =>
            onChange({ ...value, description: event.target.value })
          }
          placeholder="Ex.: algo leve, com legumes e um toque de pimenta…"
          maxLength={500}
          rows={3}
          aria-describedby="match-description-help"
        />
        <p id="match-description-help" className="match-help">
          Conte os sabores e ingredientes que você procura.{" "}
          <span>{value.description.length}/500</span>
        </p>
      </div>
      <div className="match-form-actions">
        <button className="match-submit" type="submit">
          Ver recomendações <Sparkles size={17} aria-hidden="true" />
          <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button className="match-text-button" type="button" onClick={onReset}>
          Restaurar preferências
        </button>
      </div>
      <p className="match-development-note">
        Descreva sabores desejados. Restrições alimentares e alergias não são
        avaliadas pelo recomendador.
      </p>
    </form>
  );
}
