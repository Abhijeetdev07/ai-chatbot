// ProtectedRoute.jsx — Redirects unauthenticated users to /login
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // While we are checking localStorage token validity, show a spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <AiOutlineLoading3Quarters className="text-indigo-400 text-4xl animate-spin" />
            </div>
        );
    }

    // Not logged in → redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Logged in → render the protected page
    return children;
};

export default ProtectedRoute;
