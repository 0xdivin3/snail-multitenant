// src/api/client.js
import axios from "axios";

// If frontend & backend are deployed as SEPARATE Vercel projects, set VITE_API_URL
// in the frontend's Vercel env vars to the backend's full URL (e.g. https://snail-server.vercel.app).
// Locally, this is left blank and Vite's dev proxy (vite.config.js) handles /api routing instead.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("snail_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("snail_token");
      localStorage.removeItem("snail_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
