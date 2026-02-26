import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import CommandPalette from "../CommandPalette";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

    return user ? (
        <>
            <CommandPalette />
            <Outlet />
        </>
    ) : <Navigate to="/x7k9m2p4q/login" />;
};

export default ProtectedRoute;
