import axios from "axios";

// API base URL from environment variables or default to localhost
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

/**
 * Axios instance with base configuration
 * Includes automatic token attachment and response interceptors
 */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Request interceptor to attach authentication token
 * Automatically adds Bearer token to all requests if available
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle authentication errors
 * Automatically redirects to login on 401 errors and cleans up invalid tokens
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove invalid token
      localStorage.removeItem("token");

      // Redirect to login if not already on auth pages
      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
