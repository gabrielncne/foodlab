import { useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import {
  ArrowLeft,
  Check,
  Heart,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { FoodMatchForm } from "../components/FoodMatchForm";
import { FoodMatchResults } from "../components/FoodMatchResults";
import { requestRecommendations } from "../services/recommendations";
import { initialFoodMatchPreferences } from "../types/foodmatch";
import type {
  FoodMatchPreferences,
  FoodMatchResultState,
} from "../types/foodmatch";
import "./foodmatch.css";

const priorityLabels = {
  relevance: "Combinar com meu gosto",
  rating: "Melhor avaliação",
  delivery: "Entrega mais rápida",
};

export function FoodMatchPage({
  favorites,
  toggleFavorite,
}: {
  favorites: string[];
  toggleFavorite: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const activeRequest = useRef<AbortController | null>(null);
  const requestNumber = useRef(0);
  const [preferences, setPreferences] = useState<FoodMatchPreferences>({
    ...initialFoodMatchPreferences,
  });
  const [submitted, setSubmitted] = useState<FoodMatchPreferences | null>(null);
  const [resultState, setResultState] = useState<FoodMatchResultState>({
    status: "idle",
  });

  function cancelRequest() {
    requestNumber.current += 1;
    activeRequest.current?.abort();
    activeRequest.current = null;
  }

  useEffect(() => () => cancelRequest(), []);
  useEffect(() => {
    if (!pathname.endsWith("/resultados")) {
      cancelRequest();
      setResultState({ status: "idle" });
    }
  }, [pathname]);

  async function handleSubmit(value: FoodMatchPreferences) {
    cancelRequest();
    const sequence = requestNumber.current;
    const controller = new AbortController();
    activeRequest.current = controller;
    let timedOut = false;
    setPreferences(value);
    setSubmitted(value);
    setResultState({ status: "loading" });
    navigate("/foodmatch/resultados");
    const timer = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 12000);
    try {
      const response = await requestRecommendations(value, controller.signal);
      if (sequence !== requestNumber.current) return;
      setResultState({
        status: "success",
        items: response.items,
        message: response.message,
        mode: response.mode,
      });
    } catch (error) {
      if (
        sequence !== requestNumber.current ||
        (controller.signal.aborted && !timedOut)
      )
        return;
      setResultState({
        status: "error",
        message: timedOut
          ? "A consulta demorou mais que o esperado. Tente novamente."
          : error instanceof TypeError || error instanceof SyntaxError
            ? "Não foi possível conectar ao recomendador. Confira se o backend está em execução e tente novamente."
            : error instanceof Error
              ? error.message
              : "Não foi possível concluir a consulta.",
      });
    } finally {
      window.clearTimeout(timer);
      if (sequence === requestNumber.current) activeRequest.current = null;
    }
  }

  function editPreferences() {
    cancelRequest();
    setResultState({ status: "idle" });
    navigate("/foodmatch");
  }

  return (
    <div className="page-container match-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar ao início
      </Link>
      <header className="match-page-heading">
        <div>
          <span className="match-brand">
            <Sparkles size={17} aria-hidden="true" /> FoodMatch{" "}
            <strong>AI</strong>
          </span>
          <h1>
            Seu gosto.
            <br />
            Novas <em>descobertas.</em>
          </h1>
          <p>
            A próxima boa escolha começa pelo que você tem vontade de comer.
          </p>
        </div>
        <span className="match-beta-badge">FEITO PARA O SEU GOSTO</span>
      </header>
      <Routes>
        <Route
          index
          element={
            <div className="match-layout">
              <FoodMatchForm
                value={preferences}
                onChange={setPreferences}
                onSubmit={handleSubmit}
                onReset={() =>
                  setPreferences({ ...initialFoodMatchPreferences })
                }
              />
              <aside className="match-sidebar">
                <div className="match-sidebar-art" aria-hidden="true">
                  <span>🍣</span>
                  <span className="match-art-core">
                    <Sparkles size={32} />
                  </span>
                  <span>🥗</span>
                  <span>🍕</span>
                </div>
                <span className="eyebrow">UM MATCH COMEÇA COM VOCÊ</span>
                <h2>
                  Menos indecisão.
                  <br />
                  Mais descoberta.
                </h2>
                <p>
                  Seus gostos e seu momento ajudam a definir o que faz uma boa
                  escolha para você.
                </p>
                <ol>
                  <li>
                    <SlidersHorizontal size={17} aria-hidden="true" />
                    <span>
                      <strong>Escolha suas preferências</strong>
                      <small>Culinária, orçamento e prioridade.</small>
                    </span>
                  </li>
                  <li>
                    <Sparkles size={17} aria-hidden="true" />
                    <span>
                      <strong>Descubra novos lugares</strong>
                      <small>
                        Restaurantes com afinidade e dentro do seu orçamento
                        estimado.
                      </small>
                    </span>
                  </li>
                  <li>
                    <Heart size={17} aria-hidden="true" />
                    <span>
                      <strong>Guarde seus favoritos</strong>
                      <small>Um novo sabor para cada momento.</small>
                    </span>
                  </li>
                </ol>
                <div className="match-sidebar-footer">
                  <Check size={15} aria-hidden="true" /> Você pode editar suas
                  escolhas depois.
                </div>
              </aside>
            </div>
          }
        />
        <Route
          path="resultados"
          element={
            <>
              {submitted && (
                <section
                  className="match-summary"
                  aria-label="Preferências selecionadas"
                >
                  <span className="match-summary-title">
                    <SlidersHorizontal size={17} aria-hidden="true" /> Suas
                    escolhas
                  </span>
                  <span>{submitted.category ?? "Quero descobrir"}</span>
                  <span>
                    {submitted.budget === null
                      ? "Sem limite de orçamento"
                      : `Até R$ ${submitted.budget}`}
                  </span>
                  <span>{priorityLabels[submitted.priority]}</span>
                  {submitted.description && <p>“{submitted.description}”</p>}
                </section>
              )}
              <FoodMatchResults
                state={resultState}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                onEdit={editPreferences}
                onRetry={
                  submitted
                    ? () => {
                        void handleSubmit(submitted);
                      }
                    : undefined
                }
              />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/foodmatch" replace />} />
      </Routes>
    </div>
  );
}
