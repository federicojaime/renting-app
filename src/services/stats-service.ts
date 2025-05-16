// src/services/stats-service.ts
import { api } from '../lib/axios';

interface StatsResponse {
    ok: boolean;
    msg: string;
    data: {
        total_vehiculos: number;
        entregas_activas: number;
        total_clientes: number;
        ingresos_totales: number;
    };
}

interface ChartDataResponse {
    ok: boolean;
    msg: string;
    data: Array<{
        mes: string;
        total_entregas: number;
        ingresos: number;
    }>;
}

export const statsService = {
    async getStats() {
        const response = await api.get<StatsResponse>('/stats');
        return response.data.data;
    },

    async getChartData() {
        const response = await api.get<ChartDataResponse>('/stats/chart');
        return response.data.data;
    },
};