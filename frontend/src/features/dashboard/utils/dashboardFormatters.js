
import { DASHBOARD_CONFIG } from "../dashboard.js";

const currencyFormatter = new Intl.NumberFormat(
  DASHBOARD_CONFIG.locale,
  {
    style: "currency",
    currency: DASHBOARD_CONFIG.currency,
  }
);

const dateFormatter = new Intl.DateTimeFormat(DASHBOARD_CONFIG.locale, {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount);
}

export function formatDate(date) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

export function getInitials(firstname, lastname) {
  const firstInitial = firstname?.trim().charAt(0) ?? "";
  const lastInitial = lastname?.trim().charAt(0) ?? "";

  return (
    `${firstInitial}${lastInitial}`.toLocaleUpperCase(
      DASHBOARD_CONFIG.locale
    ) || "É"
  );
}

export function getDisplayName(firstname) {
  return firstname?.trim() || "étudiant";
}
