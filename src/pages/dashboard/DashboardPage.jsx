// src/pages/dashboard/DashboardPage.jsx
import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
    Car,
    Users,
    Calendar,
    DollarSign,
    TrendingUp,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { vehicleService } from '../../services/vehicle-service';
import { rentalService } from '../../services/rental-service';
import { clientService } from '../../services/client-service';

// Componente StatCard completamente corregido
const StatCard = ({ title, value, icon, trend, colorScheme = "blue" }) => {
    // Mapa de esquemas de color
    const colorMap = {
        blue: {
            bgColor: "bg-blue-100",
            iconColor: "text-blue-500",
            trendUpColor: "text-green-600",
            trendDownColor: "text-red-600"
        },
        green: {
            bgColor: "bg-green-100",
            iconColor: "text-green-500",
            trendUpColor: "text-green-600",
            trendDownColor: "text-red-600"
        },
        purple: {
            bgColor: "bg-purple-100",
            iconColor: "text-purple-500",
            trendUpColor: "text-green-600",
            trendDownColor: "text-red-600"
        },
        amber: {
            bgColor: "bg-amber-100",
            iconColor: "text-amber-500",
            trendUpColor: "text-green-600",
            trendDownColor: "text-red-600"
        }
    };

    const colors = colorMap[colorScheme];

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <div className="text-2xl font-bold text-gray-900 mt-1 mb-1">
                        {value || '0'}
                    </div>
                    {/** {trend && (
                        <p className={`text-xs font-medium flex items-center mt-2 ${trend > 0 ? colors.trendUpColor : colors.trendDownColor}`}>
                            <TrendingUp size={14} className="mr-1" />
                            <span>{trend}% vs. mes anterior</span>
                        </p>
                    )}*/}
                </div>
                <div className={`p-3 rounded-full ${colors.bgColor}`}>
                    {React.cloneElement(icon, { className: colors.iconColor, size: 24 })}
                </div>
            </div>
        </div>
    );
};

// Componente Tabla de Alquileres Recientes
const RecentRentalsTable = ({ rentals, searchTerm, onSearch }) => {
    // Filtrar alquileres según término de búsqueda
    const filteredRentals = rentals.filter(rental => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            (rental.clientName && rental.clientName.toLowerCase().includes(searchLower)) ||
            (rental.vehicleInfo && rental.vehicleInfo.toLowerCase().includes(searchLower)) ||
            (rental.date && rental.date.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-gray-200 p-5 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Alquileres Recientes</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800"
                            value={searchTerm}
                            onChange={(e) => onSearch(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={16} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredRentals.length > 0 ? (
                            filteredRentals.map((rental, index) => (
                                <tr key={rental.id || index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{rental.clientName}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{rental.vehicleInfo}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{rental.date}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rental.status === 'Activo'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'
                                            }`}>
                                            {rental.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/rentals/${rental.id}`} className="text-blue-600 hover:text-blue-900 flex items-center justify-end">
                                            <Eye size={16} className="mr-1" />
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    <div className="text-gray-500 py-4">
                                        <div className="flex justify-center mb-3">
                                            <Search size={48} className="text-gray-300" />
                                        </div>
                                        <p className="text-lg font-medium">No se encontraron resultados</p>
                                        <p className="text-sm">Intente con otros términos de búsqueda</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-right">
                <Link to="/rentals" className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                    Ver todos los alquileres →
                </Link>
            </div>
        </div>
    );
};

// Componente de Gráfico de Estado de Vehículos
const VehicleStatusChart = ({ vehicleStats }) => {
    // Calcular porcentajes para el gráfico
    const total = Object.values(vehicleStats).reduce((acc, val) => acc + val, 0);
    const disponiblesPercent = (vehicleStats.disponibles / total) * 100;
    const alquiladosPercent = (vehicleStats.alquilados / total) * 100;
    const mantenimientoPercent = (vehicleStats.mantenimiento / total) * 100;
    const bajaPercent = (vehicleStats.baja / total) * 100;

    // Calcular los ángulos para el gráfico SVG
    const alquiladosAngle = (alquiladosPercent / 100) * 360;
    const mantenimientoAngle = (mantenimientoPercent / 100) * 360;
    const bajaAngle = (bajaPercent / 100) * 360;

    // Convertir ángulos a valores de strokeDasharray y strokeDashoffset
    const circumference = 2 * Math.PI * 40; // Perímetro del círculo de radio 40

    const alquiladosDash = (alquiladosPercent / 100) * circumference;
    const alquiladosOffset = 0;

    const mantenimientoDash = (mantenimientoPercent / 100) * circumference;
    const mantenimientoOffset = alquiladosDash;

    const bajaDash = (bajaPercent / 100) * circumference;
    const bajaOffset = alquiladosDash + mantenimientoDash;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado de la Flota</h2>

            <div className="flex justify-center mb-6">
                <div className="relative" style={{ width: '200px', height: '200px' }}>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {/* Disponibles (verde) - como base */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="20"
                        />

                        {/* Alquilados (azul) */}
                        {alquiladosPercent > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="20"
                                strokeDasharray={`${alquiladosDash} ${circumference - alquiladosDash}`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                            />
                        )}

                        {/* Mantenimiento (amarillo) */}
                        {mantenimientoPercent > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#eab308"
                                strokeWidth="20"
                                strokeDasharray={`${mantenimientoDash} ${circumference - mantenimientoDash}`}
                                strokeDashoffset={`-${alquiladosDash}`}
                                transform="rotate(-90 50 50)"
                            />
                        )}

                        {/* Baja (rojo) */}
                        {bajaPercent > 0 && (
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="20"
                                strokeDasharray={`${bajaDash} ${circumference - bajaDash}`}
                                strokeDashoffset={`-${alquiladosDash + mantenimientoDash}`}
                                transform="rotate(-90 50 50)"
                            />
                        )}

                        {/* Círculo blanco central */}
                        <circle
                            cx="50"
                            cy="50"
                            r="30"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>

            {/* Leyenda */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span className="text-sm text-gray-600">Disponibles</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-sm text-gray-600">Alquilados</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-sm text-gray-600">En Mantenimiento</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-sm text-gray-600">De Baja</span>
                </div>
            </div>

            {/* Estadísticas numéricas */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-green-600">{vehicleStats.disponibles}</div>
                    <div className="text-sm text-green-600">Vehículos Disponibles</div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-blue-600">{vehicleStats.alquilados}</div>
                    <div className="text-sm text-blue-600">Vehículos Alquilados</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-yellow-600">{vehicleStats.mantenimiento}</div>
                    <div className="text-sm text-yellow-600">En Mantenimiento</div>
                </div>
                <div className="bg-red-50 p-3 rounded-md">
                    <div className="text-xl font-bold text-red-600">{vehicleStats.baja}</div>
                    <div className="text-sm text-red-600">De Baja</div>
                </div>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalVehicles: 0,
        activeRentals: 0,
        totalClients: 0,
        monthlyRevenue: 0
    });
    const [recentRentals, setRecentRentals] = useState([]);
    const [vehicleStats, setVehicleStats] = useState({
        disponibles: 16,
        alquilados: 2,
        mantenimiento: 0,
        baja: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Datos ficticios en caso de error
            let defaultVehicleStats = {
                disponibles: 16,
                alquilados: 2,
                mantenimiento: 0,
                baja: 0
            };

            let defaultRentals = [
                {
                    id: 1,
                    clientName: 'Federicos Jaimes',
                    vehicleInfo: 'AC-NISSAN 15-FRONTIER S 4X2 MT 2.3 D CD - AF526UA',
                    date: '6/2/2025',
                    status: 'Finalizado'
                },
                {
                    id: 2,
                    clientName: 'María González',
                    vehicleInfo: 'Toyota Hilux 2.8 - AD432XZ',
                    date: '10/2/2025',
                    status: 'Activo'
                },
                {
                    id: 3,
                    clientName: 'Carlos Rodríguez',
                    vehicleInfo: 'Ford Ranger 3.2 - AF789TH',
                    date: '15/2/2025',
                    status: 'Activo'
                }
            ];

            const defaultStats = {
                totalVehicles: 18,
                activeRentals: 8,
                totalClients: 34,
                monthlyRevenue: 156800
            };

            // Intentar cargar datos reales
            const [vehiclesRes, rentalsRes, clientsRes] = await Promise.all([
                vehicleService.getVehicles().catch(() => ({ ok: false })),
                rentalService.getRentals().catch(() => ({ ok: false })),
                clientService.getClients().catch(() => ({ ok: false }))
            ]);

            // Procesar datos de vehículos
            if (vehiclesRes.ok && Array.isArray(vehiclesRes.data)) {
                const vehicles = vehiclesRes.data;
                setVehicleStats({
                    disponibles: vehicles.filter(v => v.estado === 'DISPONIBLE').length || defaultVehicleStats.disponibles,
                    alquilados: vehicles.filter(v => v.estado === 'ALQUILADA').length || defaultVehicleStats.alquilados,
                    mantenimiento: vehicles.filter(v => v.estado === 'MANTENIMIENTO').length || defaultVehicleStats.mantenimiento,
                    baja: vehicles.filter(v => v.estado === 'BAJA').length || defaultVehicleStats.baja
                });

                setStats(prev => ({
                    ...prev,
                    totalVehicles: vehicles.length || defaultStats.totalVehicles
                }));
            } else {
                setVehicleStats(defaultVehicleStats);
                setStats(prev => ({
                    ...prev,
                    totalVehicles: defaultStats.totalVehicles
                }));
            }

            // Procesar datos de alquileres
            if (rentalsRes.ok && Array.isArray(rentalsRes.data)) {
                const rentals = rentalsRes.data;
                const formattedRentals = rentals.slice(0, 5).map(r => ({
                    id: r.id,
                    clientName: r.cliente_nombre || 'Cliente',
                    vehicleInfo: `${r.marca || ''} ${r.modelo || ''} - ${r.patente || ''}`.trim(),
                    date: r.fecha_entrega ? new Date(r.fecha_entrega).toLocaleDateString() : '',
                    status: r.fecha_devolucion ? 'Finalizado' : 'Activo'
                }));

                if (formattedRentals.length > 0) {
                    setRecentRentals(formattedRentals);
                } else {
                    setRecentRentals(defaultRentals);
                }

                setStats(prev => ({
                    ...prev,
                    activeRentals: rentals.filter(r => !r.fecha_devolucion).length || defaultStats.activeRentals
                }));
            } else {
                setRecentRentals(defaultRentals);
                setStats(prev => ({
                    ...prev,
                    activeRentals: defaultStats.activeRentals
                }));
            }

            // Procesar datos de clientes
            if (clientsRes.ok && Array.isArray(clientsRes.data)) {
                setStats(prev => ({
                    ...prev,
                    totalClients: clientsRes.data.length || defaultStats.totalClients
                }));
            } else {
                setStats(prev => ({
                    ...prev,
                    totalClients: defaultStats.totalClients
                }));
            }

            // Establecer ingresos mensuales (dato ficticio)
            setStats(prev => ({
                ...prev,
                monthlyRevenue: defaultStats.monthlyRevenue
            }));

        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            // Los datos por defecto ya están establecidos
        } finally {
            setLoading(false);
        }
    };

    // Función para manejar la búsqueda
    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="ml-3 text-gray-500">Cargando dashboard...</p>
                </div>
            </Layout>
        );
    }
    console.log({ stats });

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <div className="text-sm text-gray-500">
                        Última actualización: {new Date().toLocaleString()}
                    </div>
                </div>

                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Vehículos"
                        value={stats.totalVehicles}
                        icon={<Car />}
                        trend={5}
                        colorScheme="blue"
                    />

                    <StatCard
                        title="Alquileres Activos"
                        value={stats.activeRentals}
                        icon={<Calendar />}
                        trend={128}
                        colorScheme="green"
                    />

                    <StatCard
                        title="Clientes"
                        value={stats.totalClients}
                        icon={<Users />}
                        trend={3}
                        colorScheme="purple"
                    />

                    <StatCard
                        title="Ingresos Mensuales"
                        value={`$${stats.monthlyRevenue.toLocaleString()}`}
                        icon={<DollarSign />}
                        trend={12}
                        colorScheme="amber"
                    />
                </div>

                {/* Contenido principal - Tabla y Gráfico */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Tabla de alquileres recientes - 7 columnas */}
                    <div className="lg:col-span-7">
                        <RecentRentalsTable
                            rentals={recentRentals}
                            searchTerm={searchTerm}
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* Gráfico circular - 5 columnas */}
                    <div className="lg:col-span-5">
                        <VehicleStatusChart vehicleStats={vehicleStats} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}