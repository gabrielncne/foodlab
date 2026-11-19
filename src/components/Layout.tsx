import { NavLink, Link, Outlet } from "react-router";
import {
  FlaskConical,
  MapPin,
  ChevronDown,
  Home,
  Heart,
  UtensilsCrossed,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
export function Layout() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="FoodLab início">
            <span className="brand-icon">
              <FlaskConical size={23} />
            </span>
            foodlab<span className="brand-dot">.</span>
          </Link>
          <nav className="desktop-nav" aria-label="Navegação principal">
            <NavLink to="/" end>
              Início
            </NavLink>
            <NavLink to="/restaurantes">Restaurantes</NavLink>
            <NavLink to="/foodmatch">FoodMatch AI</NavLink>
            <NavLink to="/favoritos">Favoritos</NavLink>
          </nav>
          <div className="location">
            <MapPin size={19} />
            <div>
              <small>EXPLORANDO EM</small>
              <strong>
                Campinas, SP <ChevronDown size={13} />
              </strong>
            </div>
          </div>
          <span className="demo-label">
            Projeto de portfólio <ArrowUpRight size={14} />
          </span>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <Link to="/" className="brand">
          <FlaskConical size={20} /> foodlab.
        </Link>
        <p>Feito para explorar sabores. E possibilidades.</p>
        <span>Experiência fictícia · Sem pedidos reais</span>
      </footer>
      <nav className="mobile-nav" aria-label="Navegação mobile">
        <NavLink to="/" end>
          <Home size={21} />
          Início
        </NavLink>
        <NavLink to="/restaurantes">
          <UtensilsCrossed size={21} />
          Explorar
        </NavLink>
        <NavLink to="/favoritos">
          <Heart size={21} />
          Favoritos
        </NavLink>
        <NavLink to="/foodmatch">
          <Sparkles size={21} />
          FoodMatch
        </NavLink>
      </nav>
    </>
  );
}
