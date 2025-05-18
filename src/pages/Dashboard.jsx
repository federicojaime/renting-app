import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Car, Calendar, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle-service';
import { rentalService } from '../../services/rental-service';
import { clientService } from '../../services/client-service';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [recentRental, setRecentRental] = useState(null);
    const [vehicleStats, setVehicleStats] = useState({
        disponibles: 0,
        alquilados: 0,
        mantenimiento: 0,
        baja: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Cargar datos
                const vehiclesResponse = await vehicleService.getVehicles();
                const rentalsResponse = await rentalService.getRentals();
                
                // Procesar estadísticas de vehículos
                if (vehiclesResponse.ok && vehiclesResponse.data) {
                    const vehicles = vehiclesResponse.data;
                    setVehicleStats({
                        disponibles: vehicles.filter(v => v.estado === 'DISPONIBLE').length,
                        alquilados: vehicles.filter(v => v.estado === 'ALQUILADA').length,
                        mantenimiento: vehicles.filter(v => v.estado === 'MANTENIMIENTO').length,
                        baja: vehicles.filter(v => v.estado === 'BAJA').length
                    });
                }
                
                // Obtener alquiler más reciente
                if (rentalsResponse.ok && rentalsResponse.data && rentalsResponse.data.length > 0) {
                    setRecentRental(rentalsResponse.data[0]);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);
    
    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </Layout>
        );
    }
    
    return (
        <Layout>
            <div>
                <h1 className="text-2xl font-bold mb-6">DashSSSboard</h1>
                
                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Vehículos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-blue-500 p-3 rounded-full">
                                <Car className="text-white" size={20} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-gray-600">Vehículos</h2>
                            </div>
                        </div>
                    </div>
                    
                    {/* Alquileres Activos */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-green-500 p-3 rounded-full">
                                <Calendar className="text-white" size={20} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-gray-600">Alquileres Activos</h2>
                            </div>
                        </div>
                    </div>
                    
                    {/* Clientes */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-purple-500 p-3 rounded-full">
                                <Users className="text-white" size={20} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-gray-600">Clientes</h2>
                            </div>
                        </div>
                    </div>
                    
                    {/* Ingresos Mensuales */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="bg-amber-500 p-3 rounded-full">
                                <CreditCard className="text-white" size={20} />
                            </div>
                            <div className="ml-4">
                                <h2 className="text-gray-600">Ingresos Mensuales</h2>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Contenido principal - 2 columnas */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Alquileres recientes - 7 columnas */}
                    <div className="lg:col-span-7 bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-0">
                            {/* Placeholder para el contenido que falta */}
                            <div className="h-20 bg-white"></div>
                            
                            {/* Tabla de alquileres */}
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CLIENTE</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VEHÍCULO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            Federicssso Jaimes
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            AC-NISSAN 15-FRONTIER S 4X2 MT 2.3 D CD - AF526UA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Esta columna parece estar vacía en la imagen */}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            
                            {/* Controles de deslizamiento */}
                            <div className="bg-gray-100 px-6 py-2 border-t border-gray-200 flex items-center justify-between">
                                <button className="text-gray-400">◀</button>
                                <div className="flex-1 mx-4">
                                    <div className="h-2 bg-gray-300 rounded-full">
                                        <div className="w-1/3 h-full bg-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                                <button className="text-gray-400">▶</button>
                            </div>
                            
                            {/* Enlace para ver todos los alquileres */}
                            <div className="px-6 py-3 text-right">
                                <Link to="/rentals" className="text-blue-600 hover:text-blue-800 text-sm">
                                    Ver todos los alquileres →
                                </Link>
                            </div>
                        </div>
                    </div>
                    
                    {/* Gráfico de Estado de Flota - 5 columnas */}
                    <div className="lg:col-span-5 bg-white rounded-lg shadow overflow-hidden">
                        <div className="p-6 flex justify-center">
                            {/* Gráfico circular simplificado */}
                            <div className="relative h-48 w-48">
                                <svg viewBox="0 0 100 100">
                                    {/* Círculo verde principal (disponibles) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#22c55e"
                                        strokeWidth="20"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="0"
                                    />
                                    {/* Círculo azul (alquilados) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="20"
                                        strokeDasharray="251.2"
                                        strokeDashoffset="226.1"
                                    />
                                    {/* Círculo blanco interno (hueco) */}
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="30"
                                        fill="white"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}