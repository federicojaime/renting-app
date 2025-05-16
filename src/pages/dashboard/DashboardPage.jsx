import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatsCard from '../../components/dashboard/StatsCard';
import RecentRentals from '../../components/dashboard/RecentRentals';
import VehicleStatus from '../../components/dashboard/VehicleStatus';
import { Car, Users, Calendar, CreditCard } from 'lucide-react';
import { vehicleService } from '../../services/vehicle-service';
import { rentalService } from '../../services/rental-service';
import { clientService } from '../../services/client-service';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeRentals: 0,
        totalClients: 0,
        monthlyRevenue: 0
    });
    const [recentRentals, setRecentRentals] = useState([]);
    const [vehicles, setVehicles] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Obtener datos para el dashboard
                const [vehiclesRes, rentalsRes, clientsRes] = await Promise.all([
                    vehicleService.getVehicles(),
                    rentalService.getRentals(),
                    clientService.getClients()
                ]);

                // Procesar datos de vehículos
                if (vehiclesRes.ok) {
                    setVehicles(vehiclesRes.data);
                }

                // Procesar datos de alquileres
                let rentals = [];
                if (rentalsRes.ok) {
                    rentals = rentalsRes.data;
                    setRecentRentals(
                        rentals.slice(0, 5).map(r => ({
                            id: r.id,
                            clientName: r.cliente_nombre,
                            vehicleInfo: `${r.marca} ${r.modelo} - ${r.patente}`,
                            date: new Date(r.fecha_entrega).toLocaleDateString(),
                            status: r.fecha_devolucion ? 'Finalizado' : 'Activo'
                        }))
                    );
                }

                // Calcular estadísticas
                setStats({
                    totalVehicles: vehiclesRes.ok ? vehiclesRes.data.length : 0,
                    activeRentals: rentalsRes.ok ? rentals.filter(r => !r.fecha_devolucion).length : 0,
                    totalClients: clientsRes.ok ? clientsRes.data.length : 0,
                    monthlyRevenue: 0 // Calcular ingresos mensuales si es necesario
                });
            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error);
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
                    <p className="text-gray-500">Cargando datos...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatsCard
                        title="Vehículos"
                        value={stats.totalVehicles}
                        icon={<Car size={20} className="text-white" />}
                        color="blue"
                    />

                    <StatsCard
                        title="Alquileres Activos"
                        value={stats.activeRentals}
                        icon={<Calendar size={20} className="text-white" />}
                        color="green"
                    />

                    <StatsCard
                        title="Clientes"
                        value={stats.totalClients}
                        icon={<Users size={20} className="text-white" />}
                        color="purple"
                    />

                    <StatsCard
                        title="Ingresos Mensuales"
                        value={`$ ${stats.monthlyRevenue.toLocaleString()}`}
                        icon={<CreditCard size={20} className="text-white" />}
                        color="amber"
                    />
                </div>

                {/* Contenido principal */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Alquileres recientes - 3 columnas */}
                    <div className="lg:col-span-3">
                        <RecentRentals rentals={recentRentals} />
                    </div>

                    {/* Estado de vehículos - 2 columnas */}
                    <div className="lg:col-span-2">
                        <VehicleStatus vehicles={vehicles} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}