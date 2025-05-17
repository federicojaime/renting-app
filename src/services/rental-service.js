import { api } from '../lib/axios';

export const rentalService = {
    getRentals: async () => {
        try {
            const response = await api.get('/entregas');
            return response.data;
        } catch (error) {
            console.error('Error al obtener alquileres:', error);
            return error.customResponse || {
                ok: false,
                msg: 'Error al obtener alquileres',
                data: []
            };
        }
    },

    getRental: async (id) => {
        try {
            const response = await api.get(`/entrega/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener alquiler ${id}:`, error);
            return error.customResponse || {
                ok: false,
                msg: `Error al obtener alquiler ${id}`,
                data: null
            };
        }
    },

    getVehicleRentals: async (vehicleId) => {
        try {
            const response = await api.get(`/entregas/vehiculo/${vehicleId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener alquileres del vehículo ${vehicleId}:`, error);
            throw error;
        }
    },

    getClientRentals: async (clientId) => {
        try {
            const response = await api.get(`/entregas/cliente/${clientId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener alquileres del cliente ${clientId}:`, error);
            throw error;
        }
    },

    createRental: async (rentalData) => {
        try {
            const response = await api.post('/entrega', rentalData);
            return response.data;
        } catch (error) {
            console.error('Error al crear alquiler:', error);
            throw error;
        }
    },

    finalizeRental: async (id, returnData) => {
        try {
            const response = await api.patch(`/entrega/${id}/finalizar`, returnData);
            return response.data;
        } catch (error) {
            console.error(`Error al finalizar alquiler ${id}:`, error);
            throw error;
        }
    },

    deleteRental: async (id) => {
        try {
            const response = await api.delete(`/entrega/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar alquiler ${id}:`, error);
            throw error;
        }
    }
};
