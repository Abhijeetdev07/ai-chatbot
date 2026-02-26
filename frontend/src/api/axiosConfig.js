// axiosConfig.js — Global axios interceptor to auto-attach Bearer token
import axios from "axios";

// Request interceptor: add Authorization header to every request if token exists
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally (token expired)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear storage and force login
            localStorage.removeItem("token");
            // Only redirect if not already on login/register page
            if (!window.location.pathname.startsWith("/login") &&
                !window.location.pathname.startsWith("/register")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);
