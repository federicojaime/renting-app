import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { clientService } from '../../services/client-service';
import { rentalService } from '../../services/rental-service';
import { ArrowLeft, Edit, User, Briefcase, Phone, Mail, AlertTriangle, X, CreditCard, Building } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClientDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
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
                // Obtener datos del cliente
                const clientRes = await clientService.getClient(id);
                
                if (clientRes.ok) {
                    setClient(clientRes.data);
                } else {
                    toast.error('Error al cargar el cliente');
                    navigate('/clients');
                    return;
                }
                
                // Cargar alquileres solo si no debemos saltarlos
                if (!shouldSkipRentals) {
                    try {
                        const rentalsRes = await rentalService.getClientRentals(id);
                        
                        if (rentalsRes.ok) {
                            setRentals(rentalsRes.data);
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
                navigate('/clients');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);
    
    // Función para manejar la actualización del cliente
    const handleUpdateClient = async (formData) => {
        try {
            const result = await clientService.updateClient(id, {
                tipoCliente: formData.tipo_cliente,
                nombre: formData.nombre,
                razonSocial: formData.razon_social,
                dniCuit: formData.dni_cuit,
                telefono: formData.telefono,
                email: formData.email
            });
            
            if (result.ok) {
                setShowModal(false);
                // Actualizar el cliente en la página sin recargar
                setClient({
                    ...client,
                    tipo_cliente: formData.tipo_cliente,
                    nombre: formData.nombre,
                    razon_social: formData.razon_social,
                    dni_cuit: formData.dni_cuit,
                    telefono: formData.telefono,
                    email: formData.email
                });
                toast.success('Cliente actualizado correctamente');
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
                        <p className="text-gray-500">Cargando información del cliente...</p>
                    </div>
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
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
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
                                            window.location.href = `/clients/${id}`; // Recargar sin skipRentals
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Entrega</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Devolución</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(skipRentals || rentals.length === 0) ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {skipRentals ? 
                                                'La información de alquileres no está disponible en este momento' : 
                                                'Este cliente no tiene alquileres registrados'}
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

                    {!skipRentals && rentals.length > 0 && (
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
                {(rentals.length === 0 || skipRentals) && (
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

            {/* Modal de edición */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Editar Cliente"
                size="md"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = {
                        tipo_cliente: e.target.elements.tipo_cliente?.value || client.tipo_cliente,
                        nombre: e.target.elements.nombre?.value || '',
                        razon_social: e.target.elements.razon_social?.value || '',
                        dni_cuit: e.target.elements.dni_cuit.value,
                        telefono: e.target.elements.telefono.value,
                        email: e.target.elements.email.value,
                    };
                    handleUpdateClient(formData);
                }} className="space-y-6">
                    {/* Selector de tipo de cliente */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <input type="hidden" name="tipo_cliente" defaultValue={client.tipo_cliente} />
                        <div className="flex w-full">
                            <button
                                type="button"
                                className={`flex items-center justify-center w-1/2 py-3 rounded-l-lg transition-all ${
                                    client.tipo_cliente === 'persona'
                                        ? 'bg-blue-600 text-white font-medium shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                onClick={(e) => {
                                    e.target.form.elements.tipo_cliente.value = 'persona';
                                }}
                            >
                                <User size={18} className={client.tipo_cliente === 'persona' ? 'mr-2 text-white' : 'mr-2 text-gray-500'} />
                                Persona Física
                            </button>
                            <button
                                type="button"
                                className={`flex items-center justify-center w-1/2 py-3 rounded-r-lg transition-all ${
                                    client.tipo_cliente === 'empresa'
                                        ? 'bg-blue-600 text-white font-medium shadow-md'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                                onClick={(e) => {
                                    e.target.form.elements.tipo_cliente.value = 'empresa';
                                }}
                            >
                                <Building size={18} className={client.tipo_cliente === 'empresa' ? 'mr-2 text-white' : 'mr-2 text-gray-500'} />
                                Empresa
                            </button>
                        </div>
                    </div>

                    {/* Campos según tipo de cliente */}
                    <div className="space-y-5">
                        {client.tipo_cliente === 'persona' ? (
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="nombre"
                                        defaultValue={client.nombre || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ingrese nombre completo"
                                        required
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Razón Social <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Building size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="razon_social"
                                        defaultValue={client.razon_social || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ingrese razón social"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {client.tipo_cliente === 'persona' ? 'DNI' : 'CUIT'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="dni_cuit"
                                        defaultValue={client.dni_cuit || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder={client.tipo_cliente === 'persona' ? "Ingrese DNI" : "Ingrese CUIT"}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="telefono"
                                        defaultValue={client.telefono || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ingrese teléfono"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    defaultValue={client.email || ''}
                                    className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="ejemplo@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                        >
                            <X size={16} className="mr-1" /> Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                        >
                            Actualizar Cliente
                        </button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}