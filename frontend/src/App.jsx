import { useEffect, useState } from "react";

import "./App.css";
import { getCurrentUser, logout } from "./services/api.js";
import AuthPage from "./features/auth/AuthPage.jsx";
import DashboardPage from "./features/dashboard/DashboardPage.jsx";
import HomePage from "./features/homepage/HomePage.jsx";

const HOME_PATH = "/";
const LOGIN_PATH = "/login";
const REGISTER_PATH = "/register";
const DASHBOARD_PATH = "/dashboard";
const FIRST_PASSWORD_PATH = "/setup-password";
const KNOWN_PATHS = [
  HOME_PATH,
  LOGIN_PATH,
  REGISTER_PATH,
  DASHBOARD_PATH,
  FIRST_PASSWORD_PATH,
];

function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function ProtectedDashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getCurrentUser()
      .then((authenticatedUser) => {
        if (active) {
          setUser(authenticatedUser);
        }
      })
      .catch((requestError) => {
        if (!active) {
          return;
        }
        if (requestError.status === 401) {
          navigateTo(LOGIN_PATH);
        } else {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLogoutError("");
    try {
      await logout();
      navigateTo(LOGIN_PATH);
    } catch (requestError) {
      if (requestError.status === 401) {
        navigateTo(LOGIN_PATH);
      } else {
        setLogoutError(requestError.message);
      }
    }
  }

  if (isLoading) {
    return <p className="app-status" role="status">Vérification de la session…</p>;
  }
  if (error) {
    return (
      <main className="app-error">
        <p role="alert">Impossible de vérifier la session : {error}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Réessayer
        </button>
      </main>
    );
  }
  if (!user) {
    return null;
  }

  return (
    <DashboardPage
      user={user}
      onLogout={handleLogout}
      logoutError={logoutError}
    />
  );
}

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!KNOWN_PATHS.includes(pathname)) {
      window.history.replaceState({}, "", HOME_PATH);
    }
  }, [pathname]);

  if (pathname === DASHBOARD_PATH) {
    return <ProtectedDashboard />;
  }

  if (pathname === LOGIN_PATH || pathname === REGISTER_PATH) {
    return (
      <AuthPage
        mode={pathname === REGISTER_PATH ? "register" : "login"}
        onNavigate={navigateTo}
        onAuthenticated={() => navigateTo(DASHBOARD_PATH)}
      />
    );
  }

  if (pathname === FIRST_PASSWORD_PATH) {
    return (
      <AuthPage
        mode="setup"
        onNavigate={navigateTo}
        onAuthenticated={() => navigateTo(DASHBOARD_PATH)}
      />
    );
  }

  return (
    <HomePage
      onLogin={() => navigateTo(LOGIN_PATH)}
      onRegister={() => navigateTo(REGISTER_PATH)}
      onDashboard={() => navigateTo(DASHBOARD_PATH)}
    />
  );
}

export default App;