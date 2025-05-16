import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ClientForm from '../../components/clients/ClientForm';
import { Plus, Search, Edit, Trash, Eye } from 'lucide-react';
import { clientService } from '../../services/client-service';
import toast from 'react-hot-toast';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);

    // Cargar clientes al montar
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const result = await clientService.getClients();
            if (result.ok) {
                setClients(result.data);
            } else {
                toast.error('Error al cargar clientes: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al cargar clientes:', error);
            toast.error('Error de conexión al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setSelectedClient(null);
        setShowModal(true);
    };

    const handleEditClick = (client) => {
        setSelectedClient(client);
        setShowModal(true);
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const handleFormSubmit = async () => {
        setShowModal(false);
        await fetchClients(); // Recargar clientes
        toast.success(selectedClient ? 'Cliente actualizado' : 'Cliente creado');
    };

    const handleDeleteConfirm = async () => {
        if (!clientToDelete) return;

        try {
            const result = await clientService.deleteClient(clientToDelete.id);
            if (result.ok) {
                setShowDeleteModal(false);
                await fetchClients(); // Recargar clientes
                toast.success('Cliente eliminado');
            } else {
                toast.error('Error al eliminar cliente: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            toast.error('Error de conexión al eliminar cliente');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrar clientes según término de búsqueda
    const filteredClients = clients.filter(client => {
        const searchString = searchTerm.toLowerCase();
        const nombreCompleto = client.tipo_cliente === 'persona'
            ? client.nombre?.toLowerCase() || ''
            : client.razon_social?.toLowerCase() || '';

        return (
            nombreCompleto.includes(searchString) ||
            client.dni_cuit?.toLowerCase().includes(searchString) ||
            client.email?.toLowerCase().includes(searchString) ||
            client.telefono?.toLowerCase().includes(searchString)
        );
    });

    // Obtener nombre para mostrar según tipo de cliente
    const getClientName = (client) => {
        return client.tipo_cliente === 'persona'
            ? client.nombre
            : client.razon_social;
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>

                    <Button
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={handleCreateClick}
                    >
                        Nuevo Cliente
                    </Button>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative max-w-md w-full">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, DNI/CUIT o email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>

                {/* Tabla de clientes */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre/Razón Social</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DNI/CUIT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Cargando clientes...
                                        </td>
                                    </tr>
                                ) : filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No se encontraron clientes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {getClientName(client)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.tipo_cliente === 'persona' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {client.tipo_cliente === 'persona' ? 'Persona' : 'Empresa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.dni_cuit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.telefono}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/clients/${client.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        onClick={() => handleEditClick(client)}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeleteClick(client)}
                                                    >
                                                        <Trash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal de creación/edición */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                size="md"
            >
                <ClientForm
                    client={selectedClient}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Modal de confirmación de eliminación */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Confirmar Eliminación"
                size="sm"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteConfirm}
                        >
                            Eliminar
                        </Button>
                    </>
                }
            >
                <p>¿Está seguro que desea eliminar el cliente {getClientName(clientToDelete || {})}?</p>
                <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </Modal>
        </Layout>
    );
}