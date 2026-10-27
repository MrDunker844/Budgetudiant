// Adresse de l'API FastAPI (modifiable via frontend/.env -> VITE_API_URL)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Petit helper : appelle l'API et renvoie le JSON (ou lève une erreur)
export async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Erreur API ${res.status}`);
  return res.status === 204 ? null : res.json();
}

export function getHealth() {
  return request("/api/health");
}

export function getUser(userId) {
  return request(`/api/users/${userId}`);
}

export function updateUser(userId, user) {
  return request(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}
