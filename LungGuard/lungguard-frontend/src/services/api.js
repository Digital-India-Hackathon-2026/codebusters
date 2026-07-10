import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Request interceptor to dynamically inject the JWT bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry and unauthenticated errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Received 401 Unauthorized. Clearing storage and redirecting.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Prevent redirect loop if already on login page
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default API;