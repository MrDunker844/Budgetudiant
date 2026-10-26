
import { HOMEPAGE_CONTENT as content } from "./homepage.js";
import Button from "../../shared/ui/Button/Button.jsx";
import Card from "../../shared/ui/Card/Card.jsx";
import "./HomePage.css";

const CURRENCY_FORMATTER = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

function formatCurrency(amount) {
  return CURRENCY_FORMATTER.format(amount);
}

function Header({ onLogin, onDashboard }) {
  return (
    <header className="homepage-header">
      <a className="homepage-brand" href="#accueil" aria-label="BudgÉtudiant, accueil">
        <span className="homepage-brand__icon" aria-hidden="true">B.</span>
        <span>BudgÉtudiant</span>
      </a>

      <nav className="homepage-nav" aria-label="Navigation principale">
        {content.navigation.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="homepage-header__actions">
        <Button variant="secondary" onClick={onLogin}>
          Se connecter
        </Button>
        <Button onClick={onRegister}>
          Créer un compte
        </Button>
      </div>
    </header>
  );
}

function BudgetPreview() {
  const { preview } = content;
  const remaining = preview.budget - preview.expenses;
  const spendingPercentage = Math.min(
    (preview.expenses / preview.budget) * 100,
    100
  );

  return (
    <Card>
      <div className="budget-preview">
        <div className="budget-preview__heading">
          <div>
            <span className="homepage-eyebrow">{preview.label}</span>
            <h2>{preview.title}</h2>
          </div>
          <span className="budget-preview__period">{preview.period}</span>
        </div>

        <div className="budget-preview__remaining">
          <span>{preview.remainingLabel}</span>
          <strong>{formatCurrency(remaining)}</strong>
          <div
            className="budget-preview__progress"
            role="progressbar"
            aria-label="Part du budget dépensée"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(spendingPercentage)}
          >
            <span style={{ width: `${spendingPercentage}%` }} />
          </div>
          <small>
            {Math.round(spendingPercentage)} % de ton budget utilisé
          </small>
        </div>

        <div className="budget-preview__stats">
          <div>
            <span>{preview.budgetLabel}</span>
            <strong>{formatCurrency(preview.budget)}</strong>
          </div>
          <div>
            <span>{preview.expensesLabel}</span>
            <strong>{formatCurrency(preview.expenses)}</strong>
          </div>
        </div>

        <div className="budget-preview__categories">
          <h3>{preview.categoriesTitle}</h3>
          {preview.categories.map((category) => (
            <div className="budget-category" key={category.id}>
              <div className="budget-category__details">
                <span>{category.label}</span>
                <strong>{formatCurrency(category.amount)}</strong>
              </div>
              <div className="budget-category__track">
                <span style={{ width: `${category.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="budget-preview__notice">
          Exemple de budget : tes données seront personnalisées dans ton espace.
        </p>
      </div>
    </Card>
  );
}

function Hero({ onDashboard }) {
  const { hero } = content;

  return (
    <section className="homepage-hero" id="accueil">
      <div className="homepage-hero__content">
        <span className="homepage-eyebrow">
          <span className="homepage-eyebrow__dot" />
          {hero.eyebrow}
        </span>

        <h1>{hero.title}</h1>
        <p className="homepage-hero__description">{hero.description}</p>

        <div className="homepage-hero__actions">
          <Button onClick={onDashboard}>{hero.primaryAction}</Button>
          <a className="homepage-text-link" href="#fonctionnalites">
            {hero.secondaryAction} <span aria-hidden="true">→</span>
          </a>
        </div>

        <p className="homepage-hero__reassurance">
          <span aria-hidden="true">✓</span> {hero.reassurance}
        </p>
      </div>

      <div className="homepage-hero__preview">
        <span className="homepage-decoration homepage-decoration--one" />
        <span className="homepage-decoration homepage-decoration--two" />
        <BudgetPreview />
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="homepage-features" id="fonctionnalites">
      <div className="homepage-section-heading">
        <span className="homepage-eyebrow">TOUT AU MÊME ENDROIT</span>
        <h2>Ton budget, plus facile à gérer.</h2>
        <p>Les bons outils pour garder le contrôle, sans sacrifier ta vie étudiante.</p>
      </div>

      <div className="homepage-features__grid">
        {content.features.map((feature) => (
          <Card key={feature.id}>
            <article className="homepage-feature">
              <span className="homepage-feature__icon" aria-hidden="true">
                {feature.icon}
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Approach() {
  const { approach } = content;

  return (
    <section className="homepage-approach" id="approche">
      <div className="homepage-approach__mark" aria-hidden="true">B.</div>
      <div>
        <span className="homepage-eyebrow">{approach.eyebrow}</span>
        <h2>{approach.title}</h2>
        <p>{approach.description}</p>
      </div>
    </section>
  );
}

export default function HomePage({ onLogin = () => {}, onDashboard = () => {} }) {
  return (
    <div className="homepage">
      <Header onLogin={onLogin} onDashboard={onDashboard} />

      <main>
        <Hero onDashboard={onDashboard} />
        <Features />
        <Approach />
      </main>

      <footer className="homepage-footer">
        <a className="homepage-brand" href="#accueil">
          <span className="homepage-brand__icon" aria-hidden="true">B.</span>
          <span>{content.brand}</span>
        </a>
        <p>{content.footer.tagline}</p>
        <small>{content.footer.copyright}</small>
      </footer>
    </div>
  );
}
