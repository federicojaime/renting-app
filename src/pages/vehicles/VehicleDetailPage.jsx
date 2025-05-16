import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { vehicleService } from '../../services/vehicle-service';
import { rentalService } from '../../services/rental-service';
import { ArrowLeft, Edit, Car, Calendar, Tool, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener datos del vehículo y sus alquileres
                const [vehicleRes, rentalsRes] = await Promise.all([
                    vehicleService.getVehicle(id),
                    rentalService.getVehicleRentals(id)
                ]);

                if (vehicleRes.ok) {
                    setVehicle(vehicleRes.data);
                } else {
                    toast.error('Error al cargar el vehículo');
                    navigate('/vehicles');
                }

                if (rentalsRes.ok) {
                    setRentals(rentalsRes.data);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error de conexión');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Cargando información del vehículo...</p>
                </div>
            </Layout>
        );
    }

    if (!vehicle) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Vehículo no encontrado</p>
                </div>
            </Layout>
        );
    }

    // Obtener el icono de estado
    const getStatusIcon = () => {
        switch (vehicle.estado) {
            case 'DISPONIBLE':
                return <Car className="text-green-500" />;
            case 'ALQUILADA':
                return <Calendar className="text-blue-500" />;
            case 'MANTENIMIENTO':
                return <Tool className="text-yellow-500" />;
            case 'BAJA':
                return <AlertTriangle className="text-red-500" />;
            default:
                return <Car className="text-gray-500" />;
        }
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Layout>
            <div className="space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/vehicles')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {vehicle.marca} {vehicle.modelo} - {vehicle.patente}
                        </h1>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <Button
                            variant="primary"
                            icon={<Edit size={16} />}
                            onClick={() => navigate(`/vehicles/edit/${id}`)}
                        >
                            Editar Vehículo
                        </Button>
                    </div>
                </div>

                {/* Información del vehículo */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium flex items-center">
                            {getStatusIcon()}
                            <span className="ml-2">Información del Vehículo</span>
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Número Interno</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.nro_interno}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Patente</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.patente}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Designación</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.designacion || 'N/A'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Marca</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.marca}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Modelo</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.modelo}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Fecha de Adquisición</h3>
                                <p className="mt-1 text-sm text-gray-900">{formatDate(vehicle.fecha_adquisicion)}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Número de Motor</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.nro_motor}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Número de Chasis</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.nro_chasis}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Estado</h3>
                                <p className="mt-1 text-sm">
                                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${vehicle.estado === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                                            vehicle.estado === 'ALQUILADA' ? 'bg-blue-100 text-blue-800' :
                                                vehicle.estado === 'MANTENIMIENTO' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                        }`}>
                                        {vehicle.estado}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Título</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.titulo || 'N/A'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Responsable</h3>
                                <p className="mt-1 text-sm text-gray-900">{vehicle.responsable || 'N/A'}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Precio</h3>
                                <p className="mt-1 text-sm text-gray-900">
                                    {vehicle.precio ? `$${Number(vehicle.precio).toLocaleString()}` : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Información del seguro */}
                        {(vehicle.compania || vehicle.nro_poliza || vehicle.fecha_vencimiento) && (
                            <div className="mt-8">
                                <h3 className="text-sm font-medium text-gray-700 border-b pb-2 mb-4">Información del Seguro</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Compañía</h4>
                                        <p className="mt-1 text-sm text-gray-900">{vehicle.compania || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Número de Póliza</h4>
                                        <p className="mt-1 text-sm text-gray-900">{vehicle.nro_poliza || 'N/A'}</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-500">Fecha de Vencimiento</h4>
                                        <p className="mt-1 text-sm text-gray-900">{formatDate(vehicle.fecha_vencimiento)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Historial de alquileres */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium">Historial de Alquileres</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrega</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Devolución</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rentals.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Este vehículo no tiene alquileres registrados
                                        </td>
                                    </tr>
                                ) : (
                                    rentals.map((rental) => (
                                        <tr key={rental.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rental.cliente_nombre}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(rental.fecha_entrega)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rental.fecha_devolucion ? formatDate(rental.fecha_devolucion) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rental.fecha_devolucion ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {rental.fecha_devolucion ? 'Finalizado' : 'Activo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/rentals/${rental.id}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Ver detalles
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    );
}