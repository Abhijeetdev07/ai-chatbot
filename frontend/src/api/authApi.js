import axios from "axios";

const BASE_URL = "/api/auth";

// Helper: attach JWT token to headers
const authHeader = () => ({
    headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
});

// ─── Register ────────────────────────────────────────────────────────────────
/**
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export const register = async (name, email, password) => {
    const response = await axios.post(`${BASE_URL}/register`, {
        name,
        email,
        password,
    });
    return response.data;
};

// ─── Login ───────────────────────────────────────────────────────────────────
/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ access_token: string, user: object }>}
 */
export const login = async (email, password) => {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    return response.data;
};

// ─── Get Current User (me) ───────────────────────────────────────────────────
/**
 * Requires a valid token in localStorage.
 * @returns {Promise<{ id: string, name: string, email: string }>}
 */
export const getMe = async () => {
    const response = await axios.get(`${BASE_URL}/me`, authHeader());
    return response.data;
};
