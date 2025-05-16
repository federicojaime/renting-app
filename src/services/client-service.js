import { api } from '../lib/axios';

export const clientService = {
    getClients: async () => {
        try {
            const response = await api.get('/clientes');
            return response.data;
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            throw error;
        }
    },

    getClient: async (id) => {
        try {
            const response = await api.get(`/cliente/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener cliente ${id}:`, error);
            throw error;
        }
    },

    searchByDniCuit: async (dniCuit) => {
        try {
            const response = await api.get(`/cliente/buscar/${dniCuit}`);
            return response.data;
        } catch (error) {
            console.error(`Error al buscar cliente con DNI/CUIT ${dniCuit}:`, error);
            throw error;
        }
    },

    createClient: async (clientData) => {
        try {
            const response = await api.post('/cliente', clientData);
            return response.data;
        } catch (error) {
            console.error('Error al crear cliente:', error);
            throw error;
        }
    },

    updateClient: async (id, clientData) => {
        try {
            const response = await api.patch(`/cliente/${id}`, clientData);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar cliente ${id}:`, error);
            throw error;
        }
    },

    deleteClient: async (id) => {
        try {
            const response = await api.delete(`/cliente/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar cliente ${id}:`, error);
            throw error;
        }
    }
};