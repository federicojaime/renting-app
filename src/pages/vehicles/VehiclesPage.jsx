import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import VehicleForm from '../../components/vehicles/VehicleForm';
import { Plus, Search, Edit, Trash, Eye, AlertTriangle, X, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { vehicleService } from '../../services/vehicle-service';
import toast from 'react-hot-toast';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    // Estados para filtros
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        estado: '',
        marca: '',
        añoDesde: '',
        añoHasta: ''
    });

    // Estados para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Lista única de marcas para el filtro
    const [marcas, setMarcas] = useState([]);

    // Cargar vehículos al montar
    useEffect(() => {
        fetchVehicles();
    }, []);

    // Extraer marcas únicas cuando se cargan los vehículos
    useEffect(() => {
        if (vehicles.length > 0) {
            const uniqueMarcas = [...new Set(vehicles.map(v => v.marca).filter(Boolean))];
            setMarcas(uniqueMarcas.sort());
        }
    }, [vehicles]);

    // Actualizar total de páginas cuando cambian los elementos filtrados o por página
    useEffect(() => {
        const filtered = getFilteredVehicles();
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        // Resetear a la primera página cuando cambian los filtros
        setCurrentPage(1);
    }, [filters, searchTerm, vehicles, itemsPerPage]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const result = await vehicleService.getVehicles();
            if (result.ok) {
                setVehicles(result.data);
            } else {
                toast.error('Error al cargar vehículos: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
            toast.error('Error de conexión al cargar vehículos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setSelectedVehicle(null);
        setShowModal(true);
    };

    const handleEditClick = (vehicle) => {
        setSelectedVehicle(vehicle);
        setShowModal(true);
    };

    const handleDeleteClick = (vehicle) => {
        setVehicleToDelete(vehicle);
        setShowDeleteModal(true);
    };

    const handleViewVehicle = (vehicleId) => {
        try {
            // Redireccionar a la página de detalles
            window.location.href = `/vehicles/${vehicleId}?skipRentals=true`;
        } catch (error) {
            console.error('Error al ver vehículo:', error);
            toast.error('Error al intentar ver los detalles del vehículo');
        }
    };

    const handleFormSubmit = async (vehicleData) => {
        try {
            // Asegurarse de que todos los campos requeridos estén presentes
            const formattedData = {
                nroInterno: vehicleData.nroInterno || '',
                patente: vehicleData.patente || '',
                marca: vehicleData.marca || '',
                modelo: vehicleData.modelo || '',
                designacion: vehicleData.designacion || '',
                adquisicion: vehicleData.adquisicion || '',
                motor: vehicleData.motor || '',
                chasis: vehicleData.chasis || '',
                titulo: vehicleData.titulo || '',
                estado: vehicleData.estado || 'DISPONIBLE',
                responsable: vehicleData.responsable || '',
                ministerio: vehicleData.ministerio || '',
                precio: vehicleData.precio || '',
                compania: vehicleData.compania || '',
                nroPoliza: vehicleData.nroPoliza || '',
                vencimiento: vehicleData.vencimiento || ''
            };

            let result;
            if (selectedVehicle) {
                // Actualizar vehículo existente
                result = await vehicleService.updateVehicle(selectedVehicle.id, formattedData);
            } else {
                // Crear nuevo vehículo
                result = await vehicleService.createVehicle(formattedData);
            }

            if (result.ok) {
                setShowModal(false);
                await fetchVehicles(); // Recargar vehículos
                toast.success(selectedVehicle ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente');
            } else {
                // Mostrar mensajes de error específicos si los hay
                if (result.errores && result.errores.length > 0) {
                    result.errores.forEach(error => {
                        toast.error(`Error: ${error}`);
                    });
                } else {
                    toast.error(`Error: ${result.msg}`);
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error de conexión');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!vehicleToDelete) return;

        try {
            const result = await vehicleService.deleteVehicle(vehicleToDelete.id);
            if (result.ok) {
                setShowDeleteModal(false);
                await fetchVehicles(); // Recargar vehículos
                toast.success('Vehículo eliminado correctamente');
            } else {
                toast.error('Error al eliminar vehículo: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al eliminar vehículo:', error);
            toast.error('Error de conexión al eliminar vehículo');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Manejar cambios en los filtros
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Limpiar todos los filtros
    const clearFilters = () => {
        setFilters({
            estado: '',
            marca: '',
            añoDesde: '',
            añoHasta: ''
        });
        setSearchTerm('');
    };

    // Función para obtener vehículos filtrados
    const getFilteredVehicles = () => {
        return vehicles.filter(vehicle => {
            // Filtrado por término de búsqueda
            const matchesSearch = searchTerm === '' ||
                (vehicle.patente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (vehicle.marca?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (vehicle.modelo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (vehicle.nro_interno?.toLowerCase() || '').includes(searchTerm.toLowerCase());

            // Filtrado por estado
            const matchesEstado = filters.estado === '' || vehicle.estado === filters.estado;

            // Filtrado por marca
            const matchesMarca = filters.marca === '' || vehicle.marca === filters.marca;

            // Filtrado por año de adquisición
            let matchesAño = true;
            if (vehicle.fecha_adquisicion) {
                const año = new Date(vehicle.fecha_adquisicion).getFullYear();
                if (filters.añoDesde && año < parseInt(filters.añoDesde)) {
                    matchesAño = false;
                }
                if (filters.añoHasta && año > parseInt(filters.añoHasta)) {
                    matchesAño = false;
                }
            }

            return matchesSearch && matchesEstado && matchesMarca && matchesAño;
        });
    };

    // Obtener vehículos para la página actual
    const getCurrentPageVehicles = () => {
        const filtered = getFilteredVehicles();
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filtered.slice(startIndex, startIndex + itemsPerPage);
    };

    // Manejar cambio de página
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Manejar cambio en elementos por página
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Resetear a la primera página
    };

    // Determinar el estado del vehículo con color
    const getStatusClass = (status) => {
        switch (status) {
            case 'DISPONIBLE':
                return 'bg-green-100 text-green-800';
            case 'ALQUILADA':
                return 'bg-blue-100 text-blue-800';
            case 'MANTENIMIENTO':
                return 'bg-yellow-100 text-yellow-800';
            case 'BAJA':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            icon={<Filter size={16} />}
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                        >
                            Filtros {showFilters ? '▲' : '▼'}
                        </Button>
                        <Button
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={handleCreateClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm"
                        >
                            Nuevo Vehículo
                        </Button>
                    </div>
                </div>

                {/* Panel de filtros desplegable */}
                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Búsqueda general */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Patente, marca, modelo..."
                                        className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search size={16} className="text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Filtro por Estado */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    name="estado"
                                    value={filters.estado}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                >
                                    <option value="">Todos</option>
                                    <option value="DISPONIBLE">Disponible</option>
                                    <option value="ALQUILADA">Alquilada</option>
                                    <option value="MANTENIMIENTO">Mantenimiento</option>
                                    <option value="BAJA">Baja</option>
                                </select>
                            </div>

                            {/* Filtro por Marca */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                                <select
                                    name="marca"
                                    value={filters.marca}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                >
                                    <option value="">Todas</option>
                                    {marcas.map(marca => (
                                        <option key={marca} value={marca}>{marca}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Filtros de año */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año desde</label>
                                    <input
                                        type="number"
                                        name="añoDesde"
                                        value={filters.añoDesde}
                                        onChange={handleFilterChange}
                                        placeholder="Desde"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        min="1900"
                                        max="2100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Año hasta</label>
                                    <input
                                        type="number"
                                        name="añoHasta"
                                        value={filters.añoHasta}
                                        onChange={handleFilterChange}
                                        placeholder="Hasta"
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                        min="1900"
                                        max="2100"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabla de vehículos */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nro. Interno</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patente</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Marca/Modelo</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-sm text-gray-500">Cargando vehículos...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : getCurrentPageVehicles().length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Search size={24} className="text-gray-400" />
                                                <p>No se encontraron vehículos</p>
                                                {(searchTerm || Object.values(filters).some(v => v !== '')) && (
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-2">Pruebe con otros filtros</p>
                                                        <button
                                                            onClick={clearFilters}
                                                            className="px-3 py-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            Limpiar filtros
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    getCurrentPageVehicles().map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {vehicle.nro_interno}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.patente}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {vehicle.marca} {vehicle.modelo}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(vehicle.estado)}`}>
                                                    {vehicle.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 p-1 rounded-full hover:bg-indigo-50"
                                                        onClick={() => handleViewVehicle(vehicle.id)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                                                        onClick={() => handleEditClick(vehicle)}
                                                        title="Editar vehículo"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                                        onClick={() => handleDeleteClick(vehicle)}
                                                        title="Eliminar vehículo"
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

                    {/* Controles de paginación */}
                    {!loading && getFilteredVehicles().length > 0 && (
                        <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                            <div className="flex items-center mb-3 sm:mb-0">
                                <span className="text-sm text-gray-700 mr-2">
                                    Mostrar
                                </span>
                                <select
                                    className="w-16 p-1 border border-gray-300 rounded-md text-sm"
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <span className="text-sm text-gray-700 ml-2">
                                    por página | {getFilteredVehicles().length} vehículos en total
                                </span>
                            </div>

                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className={`p-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                    title="Primera página"
                                >
                                    <ChevronsLeft size={20} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-1 rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                    title="Página anterior"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center px-2">
                                    <span className="text-sm text-gray-700">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                    title="Página siguiente"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <button
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className={`p-1 rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
                                    title="Última página"
                                >
                                    <ChevronsRight size={20} />
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
                title={selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                size="lg"
            >
                <VehicleForm
                    vehicle={selectedVehicle}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowModal(false)}
                />
            </Modal>

            {/* Modal de confirmación de eliminación mejorado */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title={
                    <div className="flex items-center text-red-600 font-semibold">
                        <AlertTriangle size={18} className="mr-2" />
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
                                    <p>¿Está seguro que desea eliminar el vehículo <span className="font-semibold">{vehicleToDelete?.marca} {vehicleToDelete?.modelo}</span> ({vehicleToDelete?.patente})?</p>
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
                            <p className="ml-3 text-sm text-amber-700">Esta acción no se puede deshacer y eliminará todos los datos asociados al vehículo.</p>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Estilos CSS para animaciones */}
            <style jsx>{`
               .animate-fadeIn {
                   animation: fadeIn 0.3s ease-in-out;
               }
               
               @keyframes fadeIn {
                   from { opacity: 0; transform: translateY(-10px); }
                   to { opacity: 1; transform: translateY(0); }
               }
           `}</style>
        </Layout>
    );
}