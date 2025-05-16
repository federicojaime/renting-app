import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Registrar los componentes de Chart.js necesarios
ChartJS.register(ArcElement, Tooltip, Legend);

export default function VehicleStatus({ vehicles = [] }) {
    // Contar vehículos por estado
    const disponibles = vehicles.filter(v => v.estado === 'DISPONIBLE').length;
    const alquilados = vehicles.filter(v => v.estado === 'ALQUILADA').length;
    const mantenimiento = vehicles.filter(v => v.estado === 'MANTENIMIENTO').length;
    const baja = vehicles.filter(v => v.estado === 'BAJA').length;

    // Datos para el gráfico
    const data = {
        labels: ['Disponibles', 'Alquilados', 'En Mantenimiento', 'De Baja'],
        datasets: [
            {
                data: [disponibles, alquilados, mantenimiento, baja],
                backgroundColor: [
                    'rgb(34, 197, 94)', // Verde
                    'rgb(59, 130, 246)', // Azul
                    'rgb(250, 204, 21)', // Amarillo
                    'rgb(239, 68, 68)', // Rojo
                ],
                borderWidth: 1,
            },
        ],
    };

    // Opciones del gráfico
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                },
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
                <h2 className="text-lg font-medium">Estado de la Flota</h2>
            </div>

            <div className="p-6">
                <div className="h-64">
                    <Doughnut data={data} options={options} />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                        <h3 className="text-lg font-medium text-green-700">{disponibles}</h3>
                        <p className="text-sm text-green-600">Vehículos Disponibles</p>
                    </div>

                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                        <h3 className="text-lg font-medium text-blue-700">{alquilados}</h3>
                        <p className="text-sm text-blue-600">Vehículos Alquilados</p>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
                        <h3 className="text-lg font-medium text-yellow-700">{mantenimiento}</h3>
                        <p className="text-sm text-yellow-600">En Mantenimiento</p>
                    </div>

                    <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                        <h3 className="text-lg font-medium text-red-700">{baja}</h3>
                        <p className="text-sm text-red-600">De Baja</p>
                    </div>
                </div>
            </div>
        </div>
    );
}