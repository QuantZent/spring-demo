import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestHeaders,
  InternalAxiosRequestConfig,
} from "axios";
import { logError, logInfo } from "../logger/logger";
import { API_BASE_URL } from "../../utils/constants";

// Centralized logger (defined later)

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL, // Your base URL
  timeout: 30000, // Global timeout
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Add auth tokens, log requests
// Request Interceptor: Add auth tokens, log requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Ensure headers object exists with proper type
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    logInfo(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    logError("Request Error:", error);
    return Promise.reject(error);
  },
);

// Response Interceptor: Handle global errors, log responses
api.interceptors.response.use(
  (response) => {
    logInfo(`Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    logError("Response Error:", error);
    // Centralized error handling: e.g., redirect on 401
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout)
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
