import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost/api-rentingall',
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
      
      // Si el servidor respondió con un error, devolver ese error
      if (error.response && error.response.data) {
        return error.response.data;
      }
      
      // Si es un error de red u otro tipo, lanzar el error para manejarlo en el componente
      throw error;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
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