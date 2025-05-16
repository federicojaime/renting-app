// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth-service';

export function ProtectedRoute({ children }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verificar autenticación
        const checkAuth = () => {
            const auth = authService.isAuthenticated();
            setIsAuthenticated(auth);
            setIsChecking(false);
        };
        
        checkAuth();
    }, []);

    if (isChecking) {
        // Mostrar un loader mientras se verifica la autenticación
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (!isAuthenticated) {
        // Redirigir al login si no está autenticado
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderizar los hijos
    return children;
}
