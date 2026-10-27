import { useEffect, useState } from "react";
import { getUser, updateUser } from "./services/api";
import "./App.css";

function App() {
  const userId = 1;
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ us_name: "", us_email: "", us_monthly_budget: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getUser(userId)
      .then((data) => {
        setUser(data);
        setForm({
          us_name: data.us_name,
          us_email: data.us_email,
          us_monthly_budget: data.us_monthly_budget ?? "",
        });
      })
      .catch((err) => setError(err.message));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const updated = await updateUser(userId, {
        us_name: form.us_name,
        us_email: form.us_email,
        us_monthly_budget: Number(form.us_monthly_budget),
      });
      setUser(updated);
      setForm({
        us_name: updated.us_name,
        us_email: updated.us_email,
        us_monthly_budget: updated.us_monthly_budget ?? "",
      });
      setMessage("Profil et budget enregistrés.");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <header className="app-header">
        <strong>Budget Étudiant</strong>
        <nav>
          <a href="/">Tableau de bord</a>
          <a className="account-link" href="#profil">Compte</a>
        </nav>
      </header>
      <main className="profile-page" id="profil">
        <p className="eyebrow">Mon compte</p>
        <h1>Mon profil</h1>
        <p className="intro">Modifie tes informations et initialise ton budget mensuel.</p>
        {error && <p className="feedback error">{error}</p>}
        {message && <p className="feedback success">{message}</p>}
        {user ? (
          <form className="profile-card" onSubmit={handleSubmit}>
            <label>
              Nom
              <input name="us_name" value={form.us_name} onChange={handleChange} required />
            </label>
            <label>
              Adresse e-mail
              <input name="us_email" type="email" value={form.us_email} onChange={handleChange} required />
            </label>
            <label>
              Budget mensuel disponible (€)
              <input
                name="us_monthly_budget"
                type="number"
                min="0.01"
                step="0.01"
                value={form.us_monthly_budget}
                onChange={handleChange}
                required
              />
            </label>
            <button type="submit">Enregistrer</button>
          </form>
        ) : !error ? (
          <p>Chargement du profil…</p>
        ) : null}
      </main>
    </>
  );
}

export default App;
