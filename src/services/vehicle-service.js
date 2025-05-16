import { api } from '../lib/axios';

export const vehicleService = {
  getVehicles: async () => {
    try {
      const response = await api.get('/vehiculos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      throw error;
    }
  },

  getVehicle: async (id) => {
    try {
      const response = await api.get(`/vehiculo/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener vehículo ${id}:`, error);
      throw error;
    }
  },

  createVehicle: async (vehicleData) => {
    try {
      const response = await api.post('/vehiculo', vehicleData);
      return response.data;
    } catch (error) {
      console.error('Error al crear vehículo:', error);
      throw error;
    }
  },

  updateVehicle: async (id, vehicleData) => {
    try {
      const response = await api.patch(`/vehiculo/${id}`, vehicleData);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar vehículo ${id}:`, error);
      throw error;
    }
  },

  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehiculo/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar vehículo ${id}:`, error);
      throw error;
    }
  }
};