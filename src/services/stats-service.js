// src/services/stats-service.js
import { api } from '../lib/axios';

export const statsService = {
    async getStats() {
        const response = await api.get('/stats');
        return response.data.data;
    },

    async getChartData() {
        const response = await api.get('/stats/chart');
        return response.data.data;
    },
};