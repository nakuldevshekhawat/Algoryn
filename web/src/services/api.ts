import axios from "axios";

/**
 * Pre-configured Axios instance.
 *
 * Uses the Vite proxy (see vite.config.ts) — requests to /api/* are
 * forwarded to the FastAPI backend at localhost:8000.
 */
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Response interceptor — unwrap data, handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    console.error("[API Error]", message);
    return Promise.reject(new Error(message));
  }
);

export default api;
