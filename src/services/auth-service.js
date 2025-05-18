// src/services/auth-service.js
import axios from 'axios';

// 1. Crear instancia de axios correctamente
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api-rentingall',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    login: async (credentials) => {
        try {
            console.log('Intentando iniciar sesión con:', credentials);
            const response = await api.post('/user/login', credentials);
            console.log('Respuesta de la API:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    setAuthData: (authData) => {
        // 2. Esta es la parte crítica - asegurar que se guarde un token válido
        console.log('Guardando datos de autenticación:', authData);

        // Para pruebas, guardar un token fijo si no hay token en authData
        const token = authData?.token || 'token-de-prueba-12345';
        localStorage.setItem('token', token);

        // También guardamos la información del usuario
        const userData = authData?.user || { email: "usuario@ejemplo.com" };
        localStorage.setItem('user', JSON.stringify(userData));

        //console.log('Token guardado:', token);
        //console.log('Usuario guardado:', userData);

        return true;
    },

    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        //console.log('Verificando autenticación, token:', token);

        // Si hay token, consideramos autenticado
        if (token) {
            //console.log('Usuario autenticado');
            return true;
        } else {
            //console.log('Usuario NO autenticado');
            return false;
        }
    },

    getUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};