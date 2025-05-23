// Versión corregida de VehicleDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import VehicleForm from '../../components/vehicles/VehicleForm';
import { vehicleService } from '../../services/vehicle-service';
import { rentalService } from '../../services/rental-service';
import { ArrowLeft, Edit, Car, Calendar, Wrench, AlertTriangle, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VehicleDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skipRentals, setSkipRentals] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            // Verificar si debemos saltar la carga de alquileres
            const urlParams = new URLSearchParams(window.location.search);
            const shouldSkipRentals = urlParams.get('skipRentals') === 'true';
            setSkipRentals(shouldSkipRentals);

            try {
                // Obtener datos del vehículo
                const vehicleRes = await vehicleService.getVehicle(id);

                if (vehicleRes.ok) {
                    setVehicle(vehicleRes.data);
                } else {
                    toast.error('Error al cargar el vehículo');
                    navigate('/vehicles');
                    return;
                }

                // Cargar alquileres solo si no debemos saltarlos
                if (!shouldSkipRentals) {
                    try {
                        const rentalsRes = await rentalService.getVehicleRentals(id);

                        if (rentalsRes.ok) {
                            setRentals(rentalsRes.data || []);
                        } else {
                            console.warn("No se pudieron cargar los alquileres:", rentalsRes.msg);
                            setRentals([]);
                            toast.error("No se pudieron cargar los alquileres", {
                                icon: '⚠️',
                                style: {
                                    backgroundColor: '#FEF3C7',
                                    color: '#92400E',
                                    border: '1px solid #F59E0B'
                                },
                                duration: 4000
                            });
                        }
                    } catch (error) {
                        console.error("Error al cargar alquileres:", error);
                        setRentals([]);
                        toast.error("Error al cargar alquileres. Intente más tarde.", {
                            icon: '⚠️',
                            style: {
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1px solid #F59E0B'
                            },
                            duration: 4000
                        });
                    }
                } else {
                    setRentals([]);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error de conexión');
                navigate('/vehicles');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    // Función para manejar la actualización del vehículo
    const handleUpdateVehicle = async (vehicleData) => {
        try {
            const result = await vehicleService.updateVehicle(id, vehicleData);

            if (result.ok) {
                setShowModal(false);
                // Actualizar el vehículo en la página sin recargar
                setVehicle({
                    ...vehicle,
                    ...vehicleData
                });
                toast.success('Vehículo actualizado correctamente');
            } else {
                toast.error(`Error: ${result.msg}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="flex items-center space-x-3">
                        <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-500">Cargando información del vehículo...</p>
                    </div>
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
                return <Wrench className="text-yellow-500" />;
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

    // Verificar de forma segura si hay alquileres
    const hasRentals = rentals && rentals.length > 0;

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
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
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
                        <h2 className="text-lg font-medium flex items-center">
                            Historial de Alquileres
                            {skipRentals && (
                                <span className="ml-2 text-xs font-normal bg-amber-100 text-amber-800 px-2 py-1 rounded-full flex items-center">
                                    <AlertTriangle size={12} className="mr-1" />
                                    Modo limitado
                                </span>
                            )}
                        </h2>
                    </div>

                    {skipRentals && (
                        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4">
                            <div className="flex items-start">
                                <AlertTriangle size={18} className="text-amber-400 mt-0.5 mr-2" />
                                <div>
                                    <p className="text-sm text-amber-700">
                                        La información de alquileres está en mantenimiento. Se muestra una vista limitada.
                                    </p>
                                    <button
                                        onClick={() => {
                                            window.location.href = `/vehicles/${id}`; // Recargar sin skipRentals
                                        }}
                                        className="mt-2 text-xs font-medium text-amber-800 hover:text-amber-900 underline"
                                    >
                                        Intentar cargar alquileres
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

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
                                {(skipRentals || !hasRentals) ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {skipRentals ?
                                                'La información de alquileres no está disponible en este momento' :
                                                'Este vehículo no tiene alquileres registrados'}
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

                    {!skipRentals && hasRentals && (
                        <div className="p-4 bg-gray-50 border-t">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{rentals.length}</span> alquileres en total
                                </div>
                                <Link
                                    to="/rentals/new"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    state={{ vehicleId: vehicle.id }}
                                >
                                    Nuevo Alquiler
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acciones rápidas */}
                {(!hasRentals || skipRentals) && (
                    <div className="flex justify-center">
                        <Link
                            to="/rentals/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            state={{ vehicleId: vehicle.id }}
                        >
                            Registrar Alquiler para este Vehículo
                        </Link>
                    </div>
                )}
            </div>

            {/* Modal de edición */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Editar Vehículo"
                size="lg"
            >
                <VehicleForm
                    vehicle={vehicle}
                    onSubmit={handleUpdateVehicle}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>
        </Layout>
    );
}