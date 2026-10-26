import { useEffect, useState } from "react";
import { getHealth } from "./services/api";
import HomePage from "./features/homepage/HomePage.jsx";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    getHealth()
      .then(setApiStatus)
      .catch((error) => setApiError(error.message));
  }, []);

  function handleLogin() {
    window.location.href = "/login";
  }

  function handleDashboard() {
    window.location.href = "/dashboard";
  }

  return (
    <>
      <HomePage
        onLogin={handleLogin}
        onDashboard={handleDashboard}
      />

      {apiError && (
        <p className="api-status api-status--error" role="status">
          API indisponible : {apiError}
        </p>
      )}

      {apiStatus && (
        <p className="api-status" role="status">
          API : {apiStatus.api} — Base de données : {apiStatus.database}
        </p>
      )}
    </>
  );
}

export default App;
