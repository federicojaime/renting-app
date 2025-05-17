import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { Bar, Line } from 'react-chartjs-2';
import { FileText, Download, Calendar, Filter, RefreshCw } from 'lucide-react';
import { rentalService } from '../../services/rental-service';
import { vehicleService } from '../../services/vehicle-service';
import { clientService } from '../../services/client-service';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend 
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [reportType, setReportType] = useState('alquileres');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [rentalsData, setRentalsData] = useState([]);
    const [vehiclesData, setVehiclesData] = useState([]);
    const [clientsData, setClientsData] = useState([]);
    const [reportData, setReportData] = useState(null);

    // Cargar datos al montar el componente o cuando cambie el tipo de reporte o el rango de fechas
    useEffect(() => {
        fetchData();
    }, [reportType, dateRange]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Obtener los datos según el tipo de reporte seleccionado
            let result;

            switch (reportType) {
                case 'alquileres':
                    if (rentalsData.length === 0) {
                        result = await rentalService.getRentals();
                        if (result.ok) {
                            setRentalsData(result.data);
                        }
                    }
                    break;
                case 'vehiculos':
                    if (vehiclesData.length === 0) {
                        result = await vehicleService.getVehicles();
                        if (result.ok) {
                            setVehiclesData(result.data);
                        }
                    }
                    break;
                case 'clientes':
                    if (clientsData.length === 0) {
                        result = await clientService.getClients();
                        if (result.ok) {
                            setClientsData(result.data);
                        }
                    }
                    break;
                default:
                    break;
            }

            // Generar datos para el reporte según el tipo seleccionado
            generateReportData();
        } catch (error) {
            console.error('Error al cargar datos para el reporte:', error);
            toast.error('Error de conexión al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const generateReportData = () => {
        switch (reportType) {
            case 'alquileres':
                generateRentalsReport();
                break;
            case 'vehiculos':
                generateVehiclesReport();
                break;
            case 'clientes':
                generateClientsReport();
                break;
            default:
                setReportData(null);
                break;
        }
    };

    const generateRentalsReport = () => {
        // Filtrar por rango de fechas
        const filteredRentals = rentalsData.filter(rental => {
            const rentalDate = new Date(rental.fecha_entrega);
            const startDate = new Date(dateRange.startDate);
            const endDate = new Date(dateRange.endDate);
            return rentalDate >= startDate && rentalDate <= endDate;
        });

        // Agrupar por mes
        const rentalsPerMonth = {};
        filteredRentals.forEach(rental => {
            const date = new Date(rental.fecha_entrega);
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!rentalsPerMonth[month]) {
                rentalsPerMonth[month] = {
                    count: 0,
                    active: 0,
                    completed: 0
                };
            }

            rentalsPerMonth[month].count++;
            if (rental.fecha_devolucion) {
                rentalsPerMonth[month].completed++;
            } else {
                rentalsPerMonth[month].active++;
            }
        });

        // Ordenar por fecha
        const sortedMonths = Object.keys(rentalsPerMonth).sort();

        // Formatear para el gráfico
        const chartData = {
            labels: sortedMonths.map(month => {
                const [year, monthNum] = month.split('-');
                return `${monthNum}/${year}`;
            }),
            datasets: [
                {
                    label: 'Total Alquileres',
                    data: sortedMonths.map(month => rentalsPerMonth[month].count),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Alquileres Activos',
                    data: sortedMonths.map(month => rentalsPerMonth[month].active),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Alquileres Finalizados',
                    data: sortedMonths.map(month => rentalsPerMonth[month].completed),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        };

        // Datos para la tabla de resumen
        const summaryData = {
            total: filteredRentals.length,
            active: filteredRentals.filter(rental => !rental.fecha_devolucion).length,
            completed: filteredRentals.filter(rental => rental.fecha_devolucion).length,
            topVehicles: getTopItems(filteredRentals, 'vehiculo_id', 'Vehículo', (rental) => `${rental.marca} ${rental.modelo} (${rental.patente})`),
            topClients: getTopItems(filteredRentals, 'cliente_id', 'Cliente', (rental) => rental.cliente_nombre)
        };

        setReportData({
            title: 'Informe de Alquileres',
            chartType: 'bar',
            chartData,
            summaryData
        });
    };

    const generateVehiclesReport = () => {
        // Agrupar vehículos por estado
        const vehiclesByStatus = {
            DISPONIBLE: 0,
            ALQUILADA: 0,
            MANTENIMIENTO: 0,
            BAJA: 0
        };

        vehiclesData.forEach(vehicle => {
            if (vehiclesByStatus[vehicle.estado] !== undefined) {
                vehiclesByStatus[vehicle.estado]++;
            }
        });

        // Formatear para el gráfico pie/doughnut
        const chartData = {
            labels: Object.keys(vehiclesByStatus),
            datasets: [
                {
                    data: Object.values(vehiclesByStatus),
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',  // Verde para disponible
                        'rgba(54, 162, 235, 0.6)',  // Azul para alquilada
                        'rgba(255, 206, 86, 0.6)',  // Amarillo para mantenimiento
                        'rgba(255, 99, 132, 0.6)'   // Rojo para baja
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };

        // Agrupar por marca
        const vehiclesByBrand = {};
        vehiclesData.forEach(vehicle => {
            const brand = vehicle.marca;
            if (!vehiclesByBrand[brand]) {
                vehiclesByBrand[brand] = 0;
            }
            vehiclesByBrand[brand]++;
        });

        // Convertir a array para ordenar
        const brandArray = Object.entries(vehiclesByBrand)
            .map(([brand, count]) => ({ brand, count }))
            .sort((a, b) => b.count - a.count);

        // Datos para la tabla de resumen
        const summaryData = {
            total: vehiclesData.length,
            byStatus: vehiclesByStatus,
            topBrands: brandArray.slice(0, 5)
        };

        setReportData({
            title: 'Informe de Vehículos',
            chartType: 'doughnut',
            chartData,
            summaryData
        });
    };

    const generateClientsReport = () => {
        // Agrupar clientes por tipo
        const clientsByType = {
            persona: 0,
            empresa: 0
        };

        clientsData.forEach(client => {
            if (clientsByType[client.tipo_cliente] !== undefined) {
                clientsByType[client.tipo_cliente]++;
            }
        });

        // Formatear para el gráfico
        const chartData = {
            labels: ['Personas', 'Empresas'],
            datasets: [
                {
                    data: [clientsByType.persona, clientsByType.empresa],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(153, 102, 255, 0.6)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }
            ]
        };

        // Datos para la tabla de resumen
        const summaryData = {
            total: clientsData.length,
            byType: clientsByType,
            // Aquí podrías agregar más información como por ejemplo:
            // - Clientes con más alquileres
            // - Clientes más recientes
            // etc.
        };

        setReportData({
            title: 'Informe de Clientes',
            chartType: 'pie',
            chartData,
            summaryData
        });
    };

    // Función para obtener los elementos más frecuentes
    const getTopItems = (data, idField, itemLabel, labelFunc, limit = 5) => {
        const counts = {};

        data.forEach(item => {
            const id = item[idField];
            if (!counts[id]) {
                counts[id] = {
                    id,
                    label: labelFunc(item),
                    count: 0
                };
            }
            counts[id].count++;
        });

        return Object.values(counts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit)
            .map((item, index) => ({
                position: index + 1,
                label: item.label,
                count: item.count
            }));
    };

    const handleReportTypeChange = (type) => {
        setReportType(type);
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setDateRange(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRefresh = () => {
        fetchData();
        toast.success('Datos actualizados');
    };

    const handleExport = () => {
        // Implementación de la exportación a PDF o Excel
        toast.success('Exportando informe...');
        // Aquí iría la lógica para exportar el informe
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>

                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            icon={<RefreshCw size={16} />}
                            onClick={handleRefresh}
                        >
                            Actualizar
                        </Button>

                        <Button
                            variant="primary"
                            icon={<Download size={16} />}
                            onClick={handleExport}
                        >
                            Exportar
                        </Button>
                    </div>
                </div>

                {/* Filtros y controles */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-medium mb-3">Tipo de Reporte</h2>
                            <div className="flex space-x-2">
                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'alquileres'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => handleReportTypeChange('alquileres')}
                                >
                                    Alquileres
                                </button>

                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'vehiculos'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => handleReportTypeChange('vehiculos')}
                                >
                                    Vehículos
                                </button>

                                <button
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${reportType === 'clientes'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => handleReportTypeChange('clientes')}
                                >
                                    Clientes
                                </button>
                            </div>
                        </div>

                        {reportType === 'alquileres' && (
                            <div className="flex items-center space-x-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Desde
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Hasta
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <Button
                                    variant="outline"
                                    icon={<Filter size={16} />}
                                    onClick={fetchData}
                                >
                                    Filtrar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <p className="text-gray-500">Cargando datos del reporte...</p>
                    </div>
                ) : (
                    <>
                        {reportData ? (
                            <div className="space-y-6">
                                {/* Título del reporte */}
                                <div className="bg-white shadow-md rounded-lg p-6">
                                    <h2 className="text-xl font-semibold text-gray-800">{reportData.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {reportType === 'alquileres' ? (
                                            `Período: ${new Date(dateRange.startDate).toLocaleDateString()} - ${new Date(dateRange.endDate).toLocaleDateString()}`
                                        ) : 'Datos actuales'}
                                    </p>
                                </div>

                                {/* Gráficos */}
                                <div className="bg-white shadow-md rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Visualización</h3>

                                    <div className="h-80">
                                        {reportData.chartType === 'bar' && (
                                            <Bar
                                                data={reportData.chartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                        title: {
                                                            display: false
                                                        }
                                                    }
                                                }}
                                            />
                                        )}

                                        {reportData.chartType === 'line' && (
                                            <Line
                                                data={reportData.chartData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'top',
                                                        },
                                                        title: {
                                                            display: false
                                                        }
                                                    }
                                                }}
                                            />
                                        )}

                                        {(reportData.chartType === 'pie' || reportData.chartType === 'doughnut') && (
                                            <div className="flex justify-center">
                                                <div className="w-72 h-72">
                                                    {reportData.chartType === 'pie' ? (
                                                        <Bar
                                                            data={reportData.chartData}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'right',
                                                                    },
                                                                    title: {
                                                                        display: false
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <Bar
                                                            data={reportData.chartData}
                                                            options={{
                                                                responsive: true,
                                                                maintainAspectRatio: false,
                                                                plugins: {
                                                                    legend: {
                                                                        position: 'right',
                                                                    },
                                                                    title: {
                                                                        display: false
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resumen de datos */}
                                <div className="bg-white shadow-md rounded-lg p-6">
                                    <h3 className="text-lg font-medium mb-4">Resumen</h3>

                                    {reportType === 'alquileres' && reportData.summaryData && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                                    <h4 className="text-sm font-medium text-blue-700">Total Alquileres</h4>
                                                    <p className="text-2xl font-semibold text-blue-900 mt-1">{reportData.summaryData.total}</p>
                                                </div>

                                                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                                    <h4 className="text-sm font-medium text-green-700">Alquileres Activos</h4>
                                                    <p className="text-2xl font-semibold text-green-900 mt-1">{reportData.summaryData.active}</p>
                                                </div>

                                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                                    <h4 className="text-sm font-medium text-purple-700">Alquileres Finalizados</h4>
                                                    <p className="text-2xl font-semibold text-purple-900 mt-1">{reportData.summaryData.completed}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Top Vehículos */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Vehículos Más Alquilados</h4>
                                                    <div className="border rounded-md overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {reportData.summaryData.topVehicles.map((vehicle) => (
                                                                    <tr key={vehicle.position}>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{vehicle.position}</td>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{vehicle.label}</td>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{vehicle.count}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Top Clientes */}
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Clientes con Más Alquileres</h4>
                                                    <div className="border rounded-md overflow-hidden">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {reportData.summaryData.topClients.map((client) => (
                                                                    <tr key={client.position}>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{client.position}</td>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{client.label}</td>
                                                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{client.count}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportType === 'vehiculos' && reportData.summaryData && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                                    <h4 className="text-sm font-medium text-blue-700">Total Vehículos</h4>
                                                    <p className="text-2xl font-semibold text-blue-900 mt-1">{reportData.summaryData.total}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                                                        <h4 className="text-xs font-medium text-green-700">Disponibles</h4>
                                                        <p className="text-xl font-semibold text-green-900">{reportData.summaryData.byStatus.DISPONIBLE}</p>
                                                    </div>

                                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                        <h4 className="text-xs font-medium text-blue-700">Alquilados</h4>
                                                        <p className="text-xl font-semibold text-blue-900">{reportData.summaryData.byStatus.ALQUILADA}</p>
                                                    </div>

                                                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                                                        <h4 className="text-xs font-medium text-yellow-700">Mantenimiento</h4>
                                                        <p className="text-xl font-semibold text-yellow-900">{reportData.summaryData.byStatus.MANTENIMIENTO}</p>
                                                    </div>

                                                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                                                        <h4 className="text-xs font-medium text-red-700">De Baja</h4>
                                                        <p className="text-xl font-semibold text-red-900">{reportData.summaryData.byStatus.BAJA}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top Marcas */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">Marcas Más Comunes</h4>
                                                <div className="border rounded-md overflow-hidden">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posición</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {reportData.summaryData.topBrands.map((brand, index) => (
                                                                <tr key={index}>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{brand.brand}</td>
                                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{brand.count}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {reportType === 'clientes' && reportData.summaryData && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                                    <h4 className="text-sm font-medium text-blue-700">Total Clientes</h4>
                                                    <p className="text-2xl font-semibold text-blue-900 mt-1">{reportData.summaryData.total}</p>
                                                </div>

                                                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                                    <h4 className="text-sm font-medium text-indigo-700">Personas</h4>
                                                    <p className="text-2xl font-semibold text-indigo-900 mt-1">{reportData.summaryData.byType.persona}</p>
                                                </div>

                                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                                    <h4 className="text-sm font-medium text-purple-700">Empresas</h4>
                                                    <p className="text-2xl font-semibold text-purple-900 mt-1">{reportData.summaryData.byType.empresa}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white shadow-md rounded-lg p-6 text-center">
                                <p className="text-gray-500">No hay datos disponibles para mostrar en el reporte.</p>
                                <Button
                                    variant="outline"
                                    icon={<RefreshCw size={16} />}
                                    onClick={handleRefresh}
                                    className="mt-4"
                                >
                                    Cargar Datos
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Acceso a reportes específicos */}
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h3 className="text-lg font-medium mb-4">Reportes Específicos</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center mb-2">
                                <Calendar size={20} className="text-blue-500 mr-2" />
                                <h4 className="font-medium">Reporte Mensual</h4>
                            </div>
                            <p className="text-sm text-gray-600">Resumen detallado de alquileres por mes</p>
                        </div>

                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center mb-2">
                                <FileText size={20} className="text-green-500 mr-2" />
                                <h4 className="font-medium">Inventario de Vehículos</h4>
                            </div>
                            <p className="text-sm text-gray-600">Estado actual de todos los vehículos</p>
                        </div>

                        <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center mb-2">
                                <FileText size={20} className="text-purple-500 mr-2" />
                                <h4 className="font-medium">Actividad de Clientes</h4>
                            </div>
                            <p className="text-sm text-gray-600">Análisis de los clientes más activos</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}