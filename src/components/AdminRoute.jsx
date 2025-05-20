// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, isAdmin, loading } = useAuth();
    
    // Mostrar um indicador de carregamento enquanto verifica o perfil
    if (loading) {
        return (
            <div className="d-flex justify-content-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }
    
    if (!user) return <Navigate to="/login" replace />;
    return isAdmin ? children : <Navigate to="/" replace />;
};

export default AdminRoute;