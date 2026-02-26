// AuthContext.jsx — Global auth state (user, token, login, logout)
import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/authApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);       // logged-in user object
    const [token, setToken] = useState(null);     // JWT string
    const [loading, setLoading] = useState(true); // waiting for token check

    // On app start: check if a token exists in localStorage and validate it
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setToken(savedToken);
            getMe()
                .then((userData) => setUser(userData))
                .catch(() => {
                    // Token invalid/expired — clear it
                    localStorage.removeItem("token");
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    // Called after successful login or register
    const saveAuth = (accessToken, userData) => {
        localStorage.setItem("token", accessToken);
        setToken(accessToken);
        setUser(userData);
    };

    // Called on logout
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, saveAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
