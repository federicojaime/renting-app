import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Plus, Search, Edit, Trash, Eye, User, Building, Phone, Mail, CreditCard, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { clientService } from '../../services/client-service';
import toast from 'react-hot-toast';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [clientsPerPage] = useState(10);
    
    // Filtros
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        tipoCliente: 'todos',
        ordenarPor: 'nombreAsc'
    });

    // Cargar clientes al montar
    useEffect(() => {
        fetchClients();
    }, []);

    // Aplicar filtros y búsqueda cuando cambian
    useEffect(() => {
        applyFiltersAndSearch();
    }, [clients, searchTerm, filters]);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const result = await clientService.getClients();
            if (result.ok) {
                setClients(result.data);
                setFilteredClients(result.data);
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

    const applyFiltersAndSearch = () => {
        // Paso 1: Filtrar por término de búsqueda
        let result = clients.filter(client => {
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

        // Paso 2: Filtrar por tipo de cliente
        if (filters.tipoCliente !== 'todos') {
            result = result.filter(client => client.tipo_cliente === filters.tipoCliente);
        }

        // Paso 3: Ordenar según criterio seleccionado
        if (filters.ordenarPor === 'nombreAsc') {
            result.sort((a, b) => {
                const nombreA = a.tipo_cliente === 'persona' ? a.nombre?.toLowerCase() || '' : a.razon_social?.toLowerCase() || '';
                const nombreB = b.tipo_cliente === 'persona' ? b.nombre?.toLowerCase() || '' : b.razon_social?.toLowerCase() || '';
                return nombreA.localeCompare(nombreB);
            });
        } else if (filters.ordenarPor === 'nombreDesc') {
            result.sort((a, b) => {
                const nombreA = a.tipo_cliente === 'persona' ? a.nombre?.toLowerCase() || '' : a.razon_social?.toLowerCase() || '';
                const nombreB = b.tipo_cliente === 'persona' ? b.nombre?.toLowerCase() || '' : b.razon_social?.toLowerCase() || '';
                return nombreB.localeCompare(nombreA);
            });
        } else if (filters.ordenarPor === 'fechaCreacionAsc') {
            result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (filters.ordenarPor === 'fechaCreacionDesc') {
            result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        setFilteredClients(result);
        // Reiniciar a la primera página cuando cambian los filtros
        setCurrentPage(1);
    };

    // Obtener clientes de la página actual
    const indexOfLastClient = currentPage * clientsPerPage;
    const indexOfFirstClient = indexOfLastClient - clientsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient);

    // Cambiar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

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

    const handleViewClient = (clientId) => {
        try {
            // Redirigir a la página de detalles del cliente, evitando la carga de alquileres
            window.location.href = `/clients/${clientId}?skipRentals=true`;
        } catch (error) {
            console.error('Error al ver cliente:', error);
            toast.error('Error al intentar ver los detalles del cliente');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            let result;
            
            // Preparar datos según el tipo de cliente
            const clientData = {
                tipoCliente: formData.tipo_cliente,
                dniCuit: formData.dni_cuit,
                telefono: formData.telefono,
                email: formData.email
            };
            
            // Agregar campos específicos según el tipo de cliente
            if (formData.tipo_cliente === 'persona') {
                clientData.nombre = formData.nombre;
                clientData.razonSocial = '';  // Limpiamos el campo no utilizado
            } else {
                clientData.razonSocial = formData.razon_social;
                clientData.nombre = '';  // Limpiamos el campo no utilizado
            }
            
            if (selectedClient) {
                // Actualizar cliente existente
                result = await clientService.updateClient(selectedClient.id, clientData);
            } else {
                // Crear nuevo cliente
                result = await clientService.createClient(clientData);
            }

            if (result.ok) {
                setShowModal(false);
                await fetchClients(); // Recargar clientes
                toast.success(selectedClient ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente');
            } else {
                toast.error(`Error: ${result.msg}`);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!clientToDelete) return;

        try {
            const result = await clientService.deleteClient(clientToDelete.id);
            if (result.ok) {
                setShowDeleteModal(false);
                await fetchClients(); // Recargar clientes
                toast.success('Cliente eliminado correctamente');
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

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Obtener nombre para mostrar según tipo de cliente
    const getClientName = (client) => {
        if (!client) return '';
        return client.tipo_cliente === 'persona'
            ? client.nombre
            : client.razon_social;
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
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>

                    <Button
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={handleCreateClick}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                    >
                        Nuevo Cliente
                    </Button>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    <div className="relative max-w-md w-full">
                        <input
                            type="text"
                            placeholder="Buscar por nombre, DNI/CUIT o email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-500" />
                        </div>
                    </div>
                    
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-gray-700"
                    >
                        <Filter size={16} />
                        {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                    </Button>
                </div>

                {/* Panel de filtros avanzados */}
                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tipoCliente" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Cliente
                                </label>
                                <select
                                    id="tipoCliente"
                                    name="tipoCliente"
                                    value={filters.tipoCliente}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="todos">Todos</option>
                                    <option value="persona">Personas</option>
                                    <option value="empresa">Empresas</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="ordenarPor" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordenar por
                                </label>
                                <select
                                    id="ordenarPor"
                                    name="ordenarPor"
                                    value={filters.ordenarPor}
                                    onChange={handleFilterChange}
                                    className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="nombreAsc">Nombre (A-Z)</option>
                                    <option value="nombreDesc">Nombre (Z-A)</option>
                                    <option value="fechaCreacionAsc">Fecha de registro (Más antiguo)</option>
                                    <option value="fechaCreacionDesc">Fecha de registro (Más reciente)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contador de resultados */}
                <div className="text-sm text-gray-500">
                    Mostrando {filteredClients.length > 0 ? indexOfFirstClient + 1 : 0} - {Math.min(indexOfLastClient, filteredClients.length)} de {filteredClients.length} clientes
                </div>

                {/* Tabla de clientes */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre/Razón Social</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DNI/CUIT</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Registro</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-sm text-gray-500">Cargando clientes...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Search size={24} className="text-gray-400" />
                                                <p>No se encontraron clientes</p>
                                                {searchTerm && (
                                                    <p className="text-xs text-gray-400">Intente con otro término de búsqueda</p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentClients.map((client) => (
                                        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {getClientName(client)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${client.tipo_cliente === 'persona'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
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
                                                {client.email || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(client.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
                                                        onClick={() => handleViewClient(client.id)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                                                        onClick={() => handleEditClick(client)}
                                                        title="Editar cliente"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(client)}
                                                        title="Eliminar cliente"
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

                    {/* Paginación */}
                    {filteredClients.length > 0 && (
                        <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium">{filteredClients.length}</span> clientes en total
                            </div>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                
                                {/* Mostrar números de página */}
                                <div className="flex items-center space-x-1">
                                    {[...Array(totalPages)].map((_, i) => {
                                        // Mostrar la primera, la última, la actual y las páginas cercanas a la actual
                                        if (
                                            i + 1 === 1 || 
                                            i + 1 === totalPages || 
                                            (i + 1 >= currentPage - 1 && i + 1 <= currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => paginate(i + 1)}
                                                    className={`px-3 py-1 rounded-md ${
                                                        currentPage === i + 1 
                                                            ? 'bg-blue-600 text-white' 
                                                            : 'text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {i + 1}
                                                </button>
                                            );
                                        } else if (
                                            (i + 1 === currentPage - 2 && currentPage > 3) || 
                                            (i + 1 === currentPage + 2 && currentPage < totalPages - 2)
                                        ) {
                                            // Mostrar elipsis para páginas omitidas
                                            return <span key={i} className="px-1">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de creación/edición */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                size="md"
            >
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = {
                        tipo_cliente: e.target.elements.tipo_cliente.value,
                        nombre: e.target.elements.nombre?.value || '',
                        razon_social: e.target.elements.razon_social?.value || '',
                        dni_cuit: e.target.elements.dni_cuit.value,
                        telefono: e.target.elements.telefono.value,
                        email: e.target.elements.email.value,
                    };
                    handleFormSubmit(formData);
                }} className="space-y-6">
                    {/* Selector de tipo de cliente */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <input 
                            type="hidden" 
                            name="tipo_cliente" 
                            id="tipo_cliente"
                            value={selectedClient ? selectedClient.tipo_cliente : 'persona'}
                            readOnly={!!selectedClient} // Solo se puede modificar al crear un nuevo cliente
                        />
                        <div className="flex w-full">
                            <button
                                type="button"
                                className={`flex items-center justify-center w-1/2 py-3 rounded-l-lg transition-all ${
                                    selectedClient ? (selectedClient.tipo_cliente === 'persona' ? 'bg-blue-600 text-white font-medium shadow-md' : 'bg-gray-100 text-gray-500 cursor-not-allowed') 
                                    : (document.getElementById('tipo_cliente')?.value === 'persona' ? 'bg-blue-600 text-white font-medium shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100')
                                }`}
                                onClick={(e) => {
                                    if (!selectedClient) {
                                        e.target.form.elements.tipo_cliente.value = 'persona';
                                        e.target.closest('form').querySelector('.persona-fields').style.display = 'block';
                                        e.target.closest('form').querySelector('.empresa-fields').style.display = 'none';
                                        // Actualizar la UI
                                        e.target.classList.add('bg-blue-600', 'text-white', 'font-medium', 'shadow-md');
                                        e.target.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-100');
                                        const empresaButton = e.target.nextElementSibling;
                                        empresaButton.classList.remove('bg-blue-600', 'text-white', 'font-medium', 'shadow-md');
                                        empresaButton.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-100');
                                    }
                                }}
                                disabled={!!selectedClient} // Deshabilitar si estamos editando
                            >
                                <User size={18} className={`mr-2 ${
                                    selectedClient ? (selectedClient.tipo_cliente === 'persona' ? 'text-white' : 'text-gray-500') 
                                    : (document.getElementById('tipo_cliente')?.value === 'persona' ? 'text-white' : 'text-gray-500')
                                }`} />
                                Persona Física
                            </button>
                            <button
                                type="button"
                                className={`flex items-center justify-center w-1/2 py-3 rounded-r-lg transition-all ${
                                    selectedClient ? (selectedClient.tipo_cliente === 'empresa' ? 'bg-blue-600 text-white font-medium shadow-md' : 'bg-gray-100 text-gray-500 cursor-not-allowed') 
                                    : (document.getElementById('tipo_cliente')?.value === 'empresa' ? 'bg-blue-600 text-white font-medium shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100')
                                }`}
                                onClick={(e) => {
                                    if (!selectedClient) {
                                        e.target.form.elements.tipo_cliente.value = 'empresa';
                                        e.target.closest('form').querySelector('.persona-fields').style.display = 'none';
                                        e.target.closest('form').querySelector('.empresa-fields').style.display = 'block';
                                        // Actualizar la UI
                                        e.target.classList.add('bg-blue-600', 'text-white', 'font-medium', 'shadow-md');
                                        e.target.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gray-100');
                                        const personaButton = e.target.previousElementSibling;
                                        personaButton.classList.remove('bg-blue-600', 'text-white', 'font-medium', 'shadow-md');
                                        personaButton.classList.add('bg-white', 'text-gray-700', 'hover:bg-gray-100');
                                    }
                                }}
                                disabled={!!selectedClient} // Deshabilitar si estamos editando
                            >
                                <Building size={18} className={`mr-2 ${
                                    selectedClient ? (selectedClient.tipo_cliente === 'empresa' ? 'text-white' : 'text-gray-500') 
                                    : (document.getElementById('tipo_cliente')?.value === 'empresa' ? 'text-white' : 'text-gray-500')
                                }`} />
                                Empresa
                            </button>
                        </div>
                        {selectedClient && (
                            <div className="mt-2 text-xs text-amber-600 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No se puede cambiar el tipo de cliente una vez creado
                            </div>
                        )}
                    </div>

                    {/* Campos según tipo de cliente */}
                    <div className="space-y-5">
                        {/* Campos de Persona */}
                        <div className={`persona-fields ${(selectedClient?.tipo_cliente || 'persona') !== 'persona' ? 'hidden' : ''}`}>
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
                                        defaultValue={selectedClient?.nombre || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ingrese nombre completo"
                                        required={selectedClient?.tipo_cliente === 'persona' || !selectedClient}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Campos de Empresa */}
                        <div className={`empresa-fields ${(selectedClient?.tipo_cliente || 'persona') !== 'empresa' ? 'hidden' : ''}`}>
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
                                        defaultValue={selectedClient?.razon_social || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Ingrese razón social"
                                        required={selectedClient?.tipo_cliente === 'empresa'}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {(selectedClient?.tipo_cliente || 'persona') === 'persona' ? 'DNI' : 'CUIT'} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <CreditCard size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="dni_cuit"
                                        defaultValue={selectedClient?.dni_cuit || ''}
                                        className="w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder={(selectedClient?.tipo_cliente || 'persona') === 'persona' ? "Ingrese DNI" : "Ingrese CUIT"}
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
                                        defaultValue={selectedClient?.telefono || ''}
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
                                    defaultValue={selectedClient?.email || ''}
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
                            {selectedClient ? 'Actualizar Cliente' : 'Crear Cliente'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de confirmación de eliminación mejorado */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={
                    <div className="flex items-center text-red-600 font-semibold">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Confirmar Eliminación
                    </div>
                }
                size="sm"
                footer={
                    <div className="flex justify-end space-x-3 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                        >
                            <X size={16} className="mr-1.5" /> Cancelar
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteConfirm}
                            className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center shadow-sm"
                        >
                            <Trash size={16} className="mr-1.5" /> Eliminar
                        </Button>
                    </div>
                }
            >
                <div className="p-5">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Confirmación necesaria</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>¿Está seguro que desea eliminar el cliente <span className="font-semibold">{getClientName(clientToDelete)}</span>?</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-amber-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="ml-3 text-sm text-amber-700">Esta acción no se puede deshacer y eliminará todos los datos asociados al cliente.</p>
                        </div>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
}