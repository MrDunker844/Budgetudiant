export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = response.headers
      .get("content-type")
      ?.includes("application/json")
      ? await response.json()
      : { detail: await response.text() };
    const detail =
      typeof body.detail === "string"
        ? body.detail
        : JSON.stringify(body.detail ?? body);
    const error = new Error(detail || `Erreur API ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? null : response.json();
}

export function getHealth() {
  return request("/api/health");
}

export function getCurrentUser(options) {
  return request("/api/auth/me", options);
}

export function login(credentials) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function register(account) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(account),
  });
}

export function setFirstPassword(credentials) {
  return request("/api/auth/first-password", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function logout() {
  return request("/api/auth/logout", { method: "POST" });
}

export function changePassword(passwords) {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(passwords),
  });
}

export function updateUser(userId, user) {
  return request(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

export function getCategories(options) {
  return request("/api/categories/", options);
}

export function getExpenses(userId, month, options) {
  const query = new URLSearchParams({
    user_id: String(userId),
    month,
  });
  return request(`/api/expenses/?${query}`, options);
}

export function getIncomes(userId, month, options) {
  const query = new URLSearchParams({
    user_id: String(userId),
    month,
  });
  return request(`/api/incomes/?${query}`, options);
}

export function getUserSummary(userId, month, options) {
  const query = new URLSearchParams({ month });
  return request(`/api/users/${userId}/summary?${query}`, options);
}

export function createExpense(expense) {
  return request("/api/expenses/", {
    method: "POST",
    body: JSON.stringify(expense),
  });
}
