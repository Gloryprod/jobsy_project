import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Racine du back Laravel (.env.local : NEXT_PUBLIC_API_URL=https://api.jobsy.bj), sans /api :
// c'est la convention du reste du front (`${NEXT_PUBLIC_API_URL}/storage/...`). Un /api final est toléré.
export const API_ROOT = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "").replace(/\/api$/, "");
export const API_URL = `${API_ROOT}/api`;
// Fichiers publics (logos, CV, diplômes, contrats, leçons) servis par Laravel sous /storage
export const STORAGE_URL = `${API_ROOT}/storage`;

/**
 * Authentification par cookies httpOnly posés par l'API (access_token, refresh_token) :
 * le front ne lit ni ne stocke jamais les tokens, un script injecté ne peut donc pas les voler.
 * withCredentials envoie les cookies ; X-Requested-With est exigé par l'API pour les accepter (protection CSRF).
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json'
  },
});

// Anciennes versions : tokens stockés en localStorage. On les efface, ils ne servent plus.
if (typeof window !== "undefined") {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

// Une 401 sur ces routes est une vraie réponse (mauvais mot de passe...), pas une session expirée
const NO_REFRESH_PATHS = ["/login", "/register", "/refresh", "/forgot-password", "/reset-password", "/logout"];

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;

// Un seul appel /refresh à la fois : les requêtes en échec simultanées attendent le même renouvellement
const refreshSession = () => {
  refreshPromise ??= axios
    .post(`${API_URL}/refresh`, {}, {
      withCredentials: true,
      headers: { Accept: "application/json", 'X-Requested-With': 'XMLHttpRequest' },
    })
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;
    const path = originalRequest?.url ?? "";

    // ⛔ Session expirée : on renouvelle via le cookie refresh_token puis on rejoue la requête
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !NO_REFRESH_PATHS.some((p) => path.startsWith(p))
    ) {
      originalRequest._retry = true;

      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        // 🚪 Logout forcé
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
