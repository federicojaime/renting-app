// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth-service';

export function ProtectedRoute({ children }) {
    if (!authService.isAuthenticated()) {
        return <Navigate to="/login" />;
    }

    return children;
}