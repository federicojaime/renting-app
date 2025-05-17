// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Verificación directa del token sin usar authService
        const checkAuth = () => {
            // Comprobación directa del localStorage
            const token = localStorage.getItem('token');
            console.log('Token detectado en ruta protegida:', token);
            
            // Si hay token, estamos autenticados
            setIsAuthenticated(!!token);
            setIsChecking(false);
        };
        
        checkAuth();
    }, []);

    if (isChecking) {
        // Mostrar un loader mientras se verifica
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    if (!isAuthenticated) {
        console.log('No autenticado, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    console.log('Autenticado, mostrando contenido protegido');
    return children;
}