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
        console.error('Error en solicitud API:', error.message);
        
        // Crear un objeto de respuesta estructurado que los servicios puedan usar
        const errorResponse = {
            ok: false,
            msg: error.message || 'Error desconocido',
            data: null,
        };
        
        if (error.response) {
            console.error(`Error ${error.response.status}:`, error.response.data);
            
            // Personalizar mensaje según el código de error
            if (error.response.status === 404) {
                errorResponse.msg = 'Recurso no encontrado en la API';
            } else if (error.response.status === 401) {
                errorResponse.msg = 'Sesión expirada o no autorizada';
                // Manejar sesión expirada (solo si no estamos ya en la página de login)
                if (window.location.pathname !== '/login') {
                    console.log('Token expirado o inválido, redirigiendo al login');
                    authService.logout();
                    window.location.href = '/login';
                }
            }
            
            // Incorporar detalles de error de la API si están disponibles
            if (error.response.data) {
                if (typeof error.response.data === 'object') {
                    errorResponse.msg = error.response.data.message || error.response.data.msg || errorResponse.msg;
                    if (error.response.data.data) {
                        errorResponse.data = error.response.data.data;
                    }
                }
            }
        } else if (error.request) {
            // La solicitud fue realizada pero no se recibió respuesta
            errorResponse.msg = 'No se recibió respuesta del servidor. Comprueba tu conexión.';
        }
        
        // Guardar la respuesta personalizada en el objeto error
        error.customResponse = errorResponse;
        
        return Promise.reject(error);
    }
);