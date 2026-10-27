import { useState } from "react";

import Button from "../../shared/ui/Button/Button.jsx";
import {
  login,
  register,
  setFirstPassword,
} from "../../services/api.js";
import "./AuthPage.css";

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;
const REGISTER_MODE = "register";
const SETUP_MODE = "setup";

function getPageContent(mode) {
  if (mode === REGISTER_MODE) {
    return {
      title: "Créer un compte",
      description: "Inscris-toi pour accéder à ton espace étudiant.",
      submit: "Créer mon compte",
    };
  }
  if (mode === SETUP_MODE) {
    return {
      title: "Définir mon mot de passe",
      description: "Choisis un mot de passe pour activer ton compte existant.",
      submit: "Activer mon compte",
    };
  }
  return {
    title: "Se connecter",
    description: "Retrouve ton espace et tes données personnelles.",
    submit: "Se connecter",
  };
}

export default function AuthPage({ mode, onNavigate, onAuthenticated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setupToken = new URLSearchParams(window.location.search).get("token");
  const content = getPageContent(mode);
  const isRegister = mode === REGISTER_MODE;
  const isSetup = mode === SETUP_MODE;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSetup) {
        if (!setupToken) {
          throw new Error("Le lien d’activation est incomplet ou expiré.");
        }
        await setFirstPassword({
          setup_token: setupToken,
          password,
        });
      } else if (isRegister) {
        await register({
          us_name: name.trim(),
          us_email: email.trim(),
          password,
        });
      } else {
        await login({
          us_email: email.trim(),
          password,
        });
      }
      onAuthenticated();
    } catch (submissionError) {
      setError(submissionError.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <a className="auth-page__brand" href="/" aria-label="Retour à l’accueil">
        <span className="homepage-brand__icon" aria-hidden="true">B.</span>
        <span>BudgÉtudiant</span>
      </a>

      <section className="auth-card">
        <h1>{content.title}</h1>
        <p>{content.description}</p>

        {isSetup && !setupToken ? (
          <div className="auth-message auth-message--error" role="alert">
            Le lien d’activation est incomplet. Demande un nouveau lien à l’administrateur.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Nom et prénom
                <input
                  autoComplete="name"
                  maxLength={100}
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
            )}

            {!isSetup && (
              <label>
                Adresse e-mail
                <input
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
            )}

            <label>
              Mot de passe
              <input
                autoComplete={isRegister || isSetup ? "new-password" : "current-password"}
                minLength={MIN_PASSWORD_LENGTH}
                maxLength={MAX_PASSWORD_LENGTH}
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && (
              <div className="auth-message auth-message--error" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Patiente…" : content.submit}
            </Button>
          </form>
        )}

        {mode !== SETUP_MODE && (
          <p className="auth-card__switch">
            {isRegister ? "Tu as déjà un compte ?" : "Pas encore de compte ?"}{" "}
            <button
              type="button"
              onClick={() => onNavigate(isRegister ? "/login" : "/register")}
            >
              {isRegister ? "Se connecter" : "Créer un compte"}
            </button>
          </p>
        )}

        <a className="auth-card__home-link" href="/">
          Retour à l’accueil
        </a>
      </section>
    </main>
  );
}
