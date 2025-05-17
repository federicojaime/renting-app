// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Car, Users, FileText, CreditCard, ArrowRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { vehicleService } from '../services/vehicle-service';
import { rentalService } from '../services/rental-service';
import { clientService } from '../services/client-service';
import { statsService } from '../services/stats-service';

// Registramos los componentes de ChartJS que necesitamos
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeRentals: 0,
        totalClients: 0,
        monthlyRevenue: 0
    });
    const [vehicles, setVehicles] = useState([]);
    const [recentRentals, setRecentRentals] = useState([]);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Cargamos todos los datos necesarios en paralelo
                const [vehiclesRes, rentalsRes, clientsRes, statsRes, chartDataRes] = await Promise.all([
                    vehicleService.getVehicles(),
                    rentalService.getRentals(),
                    clientService.getClients(),
                    statsService.getStats(), // Obtener estadísticas generales
                    statsService.getChartData() // Obtener datos para gráficos
                ]);

                // Procesar vehículos
                if (vehiclesRes.ok) {
                    setVehicles(vehiclesRes.data);
                }

                // Procesar alquileres recientes
                if (rentalsRes.ok) {
                    const rentals = rentalsRes.data;
                    setRecentRentals(
                        rentals.slice(0, 5).map(r => ({
                            id: r.id,
                            cliente: r.cliente_nombre,
                            vehiculo: `${r.marca} ${r.modelo} - ${r.patente}`,
                            fecha: new Date(r.fecha_entrega).toLocaleDateString(),
                            estado: r.fecha_devolucion ? 'Finalizado' : 'Activo'
                        }))
                    );
                }

                // Configurar estadísticas
                if (statsRes.ok) {
                    const statsData = statsRes.data;
                    setStats({
                        totalVehicles: statsData.total_vehiculos,
                        activeRentals: statsData.entregas_activas,
                        totalClients: statsData.total_clientes,
                        monthlyRevenue: statsData.ingresos_totales
                    });
                } else {
                    // Si la API de estadísticas falla, calculamos manualmente
                    setStats({
                        totalVehicles: vehiclesRes.ok ? vehiclesRes.data.length : 0,
                        activeRentals: rentalsRes.ok ? rentalsRes.data.filter(r => !r.fecha_devolucion).length : 0,
                        totalClients: clientsRes.ok ? clientsRes.data.length : 0,
                        monthlyRevenue: 0 // No podemos calcular esto sin datos financieros
                    });
                }

                // Datos para gráficos
                if (chartDataRes.ok) {
                    setChartData(chartDataRes.data);
                }

            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Preparar datos para el gráfico de estado de vehículos
    const vehiculosData = {
        labels: ['Disponibles', 'En uso', 'En mantenimiento'],
        datasets: [{
            data: [
                vehicles.filter(v => v.estado === 'disponible').length,
                vehicles.filter(v => v.estado === 'alquilado').length,
                vehicles.filter(v => v.estado === 'mantenimiento').length
            ],
            backgroundColor: [
                'rgba(46, 213, 115, 0.8)',
                'rgba(86, 130, 255, 0.8)',
                'rgba(255, 165, 2, 0.8)'
            ],
            borderColor: [
                'rgba(46, 213, 115, 1)',
                'rgba(86, 130, 255, 1)',
                'rgba(255, 165, 2, 1)'
            ],
            borderWidth: 1,
        }]
    };

    // Preparar datos para el gráfico de ingresos mensuales
    const ingresosMensualesData = {
        labels: chartData ? chartData.map(item => item.mes) : [],
        datasets: [{
            label: 'Ingresos (miles $)',
            data: chartData ? chartData.map(item => item.ingresos / 1000) : [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 2,
        }]
    };

    // Opciones para los gráficos
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12 }
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Ingresos Mensuales (2025)',
                font: { size: 14 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return '$' + value + 'k';
                    }
                }
            }
        }
    };

    // Datos para las tarjetas informativas
    const statCards = [
        {
            title: 'Vehículos',
            value: stats.totalVehicles.toString(),
            icon: <Car size={24} className="text-white" />,
            bgColor: 'bg-blue-500',
            route: '/vehicles'
        },
        {
            title: 'Alquileres Activos',
            value: stats.activeRentals.toString(),
            icon: <Calendar size={24} className="text-white" />,
            bgColor: 'bg-green-500',
            route: '/rentals'
        },
        {
            title: 'Clientes',
            value: stats.totalClients.toString(),
            icon: <Users size={24} className="text-white" />,
            bgColor: 'bg-purple-500',
            route: '/clients'
        },
        {
            title: 'Ingresos Mensuales',
            value: `$${stats.monthlyRevenue.toLocaleString()}`,
            icon: <CreditCard size={24} className="text-white" />,
            bgColor: 'bg-amber-500',
            route: '/reports'
        },
    ];

    if (loading) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

            {/* Tarjetas estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                        <div className={`p-4 ${card.bgColor}`}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-medium text-white">{card.title}</h2>
                                <div className="p-2 rounded-full bg-white/20">
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 flex items-end justify-between">
                            <div className="text-3xl font-bold text-gray-800">{card.value}</div>
                            <button 
                                onClick={() => navigate(card.route)}
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                Ver detalles
                                <ArrowRight size={16} className="ml-1" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Contenido principal - Gráficos y Tabla */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8">
                {/* Alquileres recientes - 4 columnas */}
                <div className="lg:col-span-4 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Alquileres Recientes</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Vehículo
                                    </th>
                                    <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-5 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-5 py-8 text-center text-gray-500">
                                            No hay alquileres recientes para mostrar
                                        </td>
                                    </tr>
                                ) : (
                                    recentRentals.map((rental, index) => (
                                        <tr key={rental.id || index} className="hover:bg-gray-50">
                                            <td className="px-5 py-4 border-b border-gray-200 text-sm whitespace-nowrap">
                                                <div className="font-medium text-gray-900">{rental.cliente}</div>
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-200 text-sm">
                                                <div className="text-gray-900 truncate max-w-xs" title={rental.vehiculo}>
                                                    {rental.vehiculo}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-200 text-sm whitespace-nowrap">
                                                {rental.fecha}
                                            </td>
                                            <td className="px-5 py-4 border-b border-gray-200 text-sm whitespace-nowrap">
                                                <span 
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        rental.estado === 'Activo' ? 
                                                        'bg-green-100 text-green-800' : 
                                                        'bg-blue-100 text-blue-800'
                                                    }`}
                                                >
                                                    {rental.estado}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-center">
                        <button 
                            onClick={() => navigate('/rentals')}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Ver todos los alquileres
                            <ArrowRight size={16} className="ml-2" />
                        </button>
                    </div>
                </div>

                {/* Gráfico de distribución de vehículos - 3 columnas */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="p-5 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-800">Estado de Flota</h2>
                    </div>
                    <div className="p-5 flex items-center justify-center">
                        <div className="h-64 w-full">
                            <Doughnut data={vehiculosData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfico de ingresos mensuales - 7 columnas */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Rendimiento Financiero</h2>
                </div>
                <div className="p-5">
                    <div className="h-64">
                        {chartData && chartData.length > 0 ? (
                            <Bar data={ingresosMensualesData} options={barOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500">No hay datos financieros disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}