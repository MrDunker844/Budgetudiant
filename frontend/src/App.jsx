import { useEffect, useState } from "react";
import { getHealth } from "./services/api";
import "./App.css";

function App() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  // Au chargement : on vérifie que l'API (et MySQL) répondent
  useEffect(() => {
    getHealth()
      .then(setStatus)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Budget Étudiant</h1>
      {error && <p style={{ color: "red" }}>API injoignable : {error}</p>}
      {status && (
        <ul>
          <li>API : {status.api}</li>
          <li>Base de données : {status.database}</li>
        </ul>
      )}
      {!status && !error && <p>Connexion à l'API…</p>}
    </main>
  );
}

export default App;
