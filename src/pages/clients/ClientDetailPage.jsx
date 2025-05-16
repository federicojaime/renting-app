import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { clientService } from '../../services/client-service';
import { rentalService } from '../../services/rental-service';
import { ArrowLeft, Edit, User, Briefcase, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Obtener datos del cliente y sus alquileres
                const [clientRes, rentalsRes] = await Promise.all([
                    clientService.getClient(id),
                    rentalService.getClientRentals(id)
                ]);

                if (clientRes.ok) {
                    setClient(clientRes.data);
                } else {
                    toast.error('Error al cargar el cliente');
                    navigate('/clients');
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
                    <p className="text-gray-500">Cargando información del cliente...</p>
                </div>
            </Layout>
        );
    }

    if (!client) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Cliente no encontrado</p>
                </div>
            </Layout>
        );
    }

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Obtener el nombre para mostrar según tipo de cliente
    const clientName = client.tipo_cliente === 'persona' ? client.nombre : client.razon_social;

    return (
        <Layout>
            <div className="space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/clients')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {clientName}
                        </h1>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <Button
                            variant="primary"
                            icon={<Edit size={16} />}
                            onClick={() => navigate(`/clients/edit/${id}`)}
                        >
                            Editar Cliente
                        </Button>
                    </div>
                </div>

                {/* Información del cliente */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium flex items-center">
                            {client.tipo_cliente === 'persona' ? (
                                <User size={20} className="text-blue-500 mr-2" />
                            ) : (
                                <Briefcase size={20} className="text-purple-500 mr-2" />
                            )}
                            <span>
                                {client.tipo_cliente === 'persona' ? 'Información Personal' : 'Información de la Empresa'}
                            </span>
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-medium text-gray-500">
                                        {client.tipo_cliente === 'persona' ? 'Nombre Completo' : 'Razón Social'}
                                    </h3>
                                    <p className="mt-1 text-lg font-medium text-gray-900">{clientName}</p>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500">
                                        {client.tipo_cliente === 'persona' ? 'DNI' : 'CUIT'}
                                    </h3>
                                    <p className="mt-1 text-gray-900">{client.dni_cuit}</p>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500">Fecha de Registro</h3>
                                    <p className="mt-1 text-gray-900">{formatDate(client.created_at)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <Phone size={18} className="text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                                        <p className="mt-1 text-gray-900">{client.telefono}</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <Mail size={18} className="text-gray-400 mr-2 mt-0.5" />
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                        <p className="mt-1 text-gray-900">{client.email || 'No disponible'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
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
                                            Este cliente no tiene alquileres registrados
                                        </td>
                                    </tr>
                                ) : (
                                    rentals.map((rental) => (
                                        <tr key={rental.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rental.marca} {rental.modelo} - {rental.patente}
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

                    {rentals.length > 0 && (
                        <div className="p-4 bg-gray-50 border-t">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-700">
                                    <span className="font-medium">{rentals.length}</span> alquileres en total
                                </div>
                                <Link
                                    to="/rentals/new"
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    state={{ clientId: client.id }}
                                >
                                    Nuevo Alquiler
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Acciones rápidas */}
                {rentals.length === 0 && (
                    <div className="flex justify-center">
                        <Link
                            to="/rentals/new"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            state={{ clientId: client.id }}
                        >
                            Registrar Alquiler para este Cliente
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    );
}