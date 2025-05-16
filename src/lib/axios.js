// src/lib/axios.js
import axios from 'axios';
import { authService } from '../services/auth-service';

// Crear una instancia de axios con configuración base
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api-rentingall',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token de autenticación a todas las solicitudes
api.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores comunes
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Manejar errores comunes como token expirado (401)
        if (error.response && error.response.status === 401) {
            // Token expirado o inválido
            authService.logout();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);