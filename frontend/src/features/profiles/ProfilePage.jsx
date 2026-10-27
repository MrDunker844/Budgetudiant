import { useId, useState } from "react";
import { ArrowLeft } from "lucide-react";

import Button from "../../shared/ui/Button/Button.jsx";
import Card from "../../shared/ui/Card/Card.jsx";
import FormField from "../../shared/ui/FormField/FormField.jsx";
import Input from "../../shared/ui/Input/Input.jsx";
import { changePassword, updateUser } from "../../services/api.js";
import { getNameInitials } from "../dashboard/utils/dashboardFormatters.js";
import "./ProfilePage.css";

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_LENGTH = 128;

// Message de succès ou d'erreur affiché sous un formulaire
function FormMessage({ error, success }) {
  if (error) {
    return (
      <p className="profile-message profile-message--error" role="alert">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p className="profile-message profile-message--success" role="status">
        {success}
      </p>
    );
  }
  return null;
}

// Formulaire 1 : nom, e-mail et revenu mensuel (R2, R3, R11)
function ProfileInfoForm({ user, onUserUpdated }) {
  // useId fabrique un identifiant unique pour relier chaque <label> à son champ
  const fieldId = useId();
  const [name, setName] = useState(user.us_name);
  const [email, setEmail] = useState(user.us_email);
  // Un <input type="number"> manipule du texte : "" veut dire « pas de revenu défini »
  const [income, setIncome] = useState(
    user.us_monthly_budget == null ? "" : String(user.us_monthly_budget)
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const monthlyIncome = income.trim() === "" ? null : Number(income);
    if (monthlyIncome !== null && !(monthlyIncome > 0)) {
      setError("Le revenu mensuel doit être supérieur à zéro.");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await updateUser(user.us_id, {
        us_name: name.trim(),
        us_email: email.trim(),
        us_monthly_budget: monthlyIncome,
      });
      onUserUpdated(updatedUser);
      setSuccess("Tes informations ont été enregistrées.");
    } catch (submissionError) {
      setError(submissionError.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card aria-labelledby={`${fieldId}-title`}>
      <h2 id={`${fieldId}-title`} className="profile-card__title">
        Mes informations
      </h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <FormField label="Nom et prénom" htmlFor={`${fieldId}-name`}>
          <Input
            id={`${fieldId}-name`}
            autoComplete="name"
            maxLength={100}
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>

        <FormField label="Adresse e-mail" htmlFor={`${fieldId}-email`}>
          <Input
            id={`${fieldId}-email`}
            autoComplete="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <FormField
          label="Revenu mensuel (€)"
          htmlFor={`${fieldId}-income`}
          hint="L’argent dont tu disposes chaque mois. Il s’ajoute aux revenus du mois sur le tableau de bord. Laisse vide si tu ne veux pas le renseigner."
        >
          <Input
            id={`${fieldId}-income`}
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="Ex. 850"
            value={income}
            onChange={(event) => setIncome(event.target.value)}
          />
        </FormField>

        <FormMessage error={error} success={success} />

        <Button type="submit" className="profile-form__submit" disabled={isSubmitting}>
          {isSubmitting ? "Patiente…" : "Enregistrer mes informations"}
        </Button>
      </form>
    </Card>
  );
}

// Formulaire 2 : mot de passe (R8, R11)
function PasswordForm() {
  const fieldId = useId();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Le nouveau mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`
      );
      return;
    }
    if (newPassword !== confirmation) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setSuccess("Ton mot de passe a été modifié.");
    } catch (submissionError) {
      setError(submissionError.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card aria-labelledby={`${fieldId}-title`}>
      <h2 id={`${fieldId}-title`} className="profile-card__title">
        Changer mon mot de passe
      </h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <FormField label="Ancien mot de passe" htmlFor={`${fieldId}-current`}>
          <Input
            id={`${fieldId}-current`}
            autoComplete="current-password"
            type="password"
            required
            maxLength={MAX_PASSWORD_LENGTH}
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </FormField>

        <FormField
          label="Nouveau mot de passe"
          htmlFor={`${fieldId}-new`}
          hint={`Au moins ${MIN_PASSWORD_LENGTH} caractères.`}
        >
          <Input
            id={`${fieldId}-new`}
            autoComplete="new-password"
            type="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            maxLength={MAX_PASSWORD_LENGTH}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
        </FormField>

        <FormField label="Confirmer le nouveau mot de passe" htmlFor={`${fieldId}-confirm`}>
          <Input
            id={`${fieldId}-confirm`}
            autoComplete="new-password"
            type="password"
            required
            maxLength={MAX_PASSWORD_LENGTH}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </FormField>

        <FormMessage error={error} success={success} />

        <Button type="submit" className="profile-form__submit" disabled={isSubmitting}>
          {isSubmitting ? "Patiente…" : "Changer mon mot de passe"}
        </Button>
      </form>
    </Card>
  );
}

export default function ProfilePage({ user, onUserUpdated, onBack }) {
  return (
    <main className="profile-page">
      <div className="profile-page__inner">
        <Button
          variant="secondary"
          size="sm"
          className="profile-page__back"
          onClick={onBack}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Retour au tableau de bord
        </Button>

        <header className="profile-page__header">
          <span className="profile-page__avatar" aria-hidden="true">
            {getNameInitials(user.us_name)}
          </span>
          <div>
            <h1>Mon profil</h1>
            <p>{user.us_name}</p>
          </div>
        </header>

        <ProfileInfoForm user={user} onUserUpdated={onUserUpdated} />
        <PasswordForm />
      </div>
    </main>
  );
}
