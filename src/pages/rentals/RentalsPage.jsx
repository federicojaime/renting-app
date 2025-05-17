import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { Plus, Search, Eye, FileText, AlertTriangle, Filter, Calendar, ChevronLeft, ChevronRight, Car, User } from 'lucide-react';
import { rentalService } from '../../services/rental-service';
import toast from 'react-hot-toast';

export default function RentalsPage() {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [rentalsPerPage] = useState(10);
    
    // Filtros avanzados
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        sortBy: 'dateDesc' // 'dateDesc', 'dateAsc', 'clientAsc', 'vehicleAsc'
    });

    // Cargar alquileres al montar
    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        setLoading(true);
        try {
            const result = await rentalService.getRentals();
            if (result.ok) {
                setRentals(result.data);
            } else {
                toast.error('Error al cargar alquileres: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al cargar alquileres:', error);
            toast.error('Error de conexión al cargar alquileres');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Resetear a la primera página al buscar
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // Resetear a la primera página al cambiar filtro
    };

    const handleAdvancedFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(1); // Resetear a la primera página al cambiar filtros avanzados
    };

    const handleResetFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            sortBy: 'dateDesc'
        });
        setSearchTerm('');
        setFilter('all');
        setCurrentPage(1);
    };

    // Filtrar alquileres según término de búsqueda, filtros básicos y avanzados
    const getFilteredRentals = () => {
        let filtered = [...rentals];
        
        // Aplicar filtro de búsqueda
        if (searchTerm) {
            const searchString = searchTerm.toLowerCase();
            filtered = filtered.filter(rental => (
                rental.cliente_nombre?.toLowerCase().includes(searchString) ||
                rental.patente?.toLowerCase().includes(searchString) ||
                rental.marca?.toLowerCase().includes(searchString) ||
                rental.modelo?.toLowerCase().includes(searchString)
            ));
        }
        
        // Aplicar filtro de estado
        if (filter !== 'all') {
            filtered = filtered.filter(rental => {
                if (filter === 'active') return !rental.fecha_devolucion;
                if (filter === 'completed') return rental.fecha_devolucion;
                return true;
            });
        }
        
        // Aplicar filtros de fecha
        if (filters.startDate) {
            filtered = filtered.filter(rental => {
                return new Date(rental.fecha_entrega) >= new Date(filters.startDate);
            });
        }
        
        if (filters.endDate) {
            filtered = filtered.filter(rental => {
                return new Date(rental.fecha_entrega) <= new Date(filters.endDate);
            });
        }
        
        // Aplicar ordenamiento
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'dateAsc':
                    return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
                case 'dateDesc':
                    return new Date(b.fecha_entrega) - new Date(a.fecha_entrega);
                case 'clientAsc':
                    return (a.cliente_nombre || '').localeCompare(b.cliente_nombre || '');
                case 'vehicleAsc':
                    return `${a.marca} ${a.modelo}`.localeCompare(`${b.marca} ${b.modelo}`);
                default:
                    return new Date(b.fecha_entrega) - new Date(a.fecha_entrega);
            }
        });
        
        return filtered;
    };

    // Aplicar filtros y obtener alquileres para la página actual
    const filteredRentals = getFilteredRentals();
    const indexOfLastRental = currentPage * rentalsPerPage;
    const indexOfFirstRental = indexOfLastRental - rentalsPerPage;
    const currentRentals = filteredRentals.slice(indexOfFirstRental, indexOfLastRental);
    const totalPages = Math.ceil(filteredRentals.length / rentalsPerPage);

    // Cambiar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Verificar alquiler
    const handleVerifyClick = (rentalId) => {
        // Implementar la verificación del alquiler pendiente
        toast.success(`Verificación del alquiler #${rentalId} iniciada`);
    };

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Alquileres</h1>

                    <Button
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={() => navigate('/rentals/new')}
                    >
                        Nuevo Alquiler
                    </Button>
                </div>

                {/* Barra de búsqueda y filtros */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Buscar por cliente, patente o modelo..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'all'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => handleFilterChange('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'active'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => handleFilterChange('active')}
                        >
                            Activos
                        </button>
                        <button
                            className={`px-4 py-2 text-sm font-medium rounded-md ${filter === 'completed'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => handleFilterChange('completed')}
                        >
                            Finalizados
                        </button>
                        <Button
                            variant="outline"
                            icon={<Filter size={16} />}
                            onClick={() => setShowFilters(!showFilters)}
                            className="ml-2"
                        >
                            {showFilters ? 'Ocultar filtros' : 'Filtros avanzados'}
                        </Button>
                    </div>
                </div>

                {/* Filtros avanzados */}
                {showFilters && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleAdvancedFilterChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleAdvancedFilterChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                                    Ordenar por
                                </label>
                                <select
                                    id="sortBy"
                                    name="sortBy"
                                    value={filters.sortBy}
                                    onChange={handleAdvancedFilterChange}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="dateDesc">Fecha (más reciente)</option>
                                    <option value="dateAsc">Fecha (más antigua)</option>
                                    <option value="clientAsc">Cliente (A-Z)</option>
                                    <option value="vehicleAsc">Vehículo (A-Z)</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={handleResetFilters}
                                    className="w-full"
                                >
                                    Limpiar filtros
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contador de resultados */}
                <div className="text-sm text-gray-500 mt-4">
                    Mostrando {filteredRentals.length > 0 ? indexOfFirstRental + 1 : 0} - {Math.min(indexOfLastRental, filteredRentals.length)} de {filteredRentals.length} alquileres
                </div>

                {/* Tabla de alquileres */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrega</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devolución</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center">
                                            <div className="flex justify-center items-center space-x-2">
                                                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span className="text-gray-500">Cargando alquileres...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : currentRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <Search size={24} className="text-gray-400" />
                                                <p>No se encontraron alquileres</p>
                                                {(searchTerm || filter !== 'all' || filters.startDate || filters.endDate) && (
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={handleResetFilters}
                                                        className="mt-2"
                                                    >
                                                        Limpiar filtros
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User size={14} className="text-gray-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {rental.cliente_nombre || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {rental.cliente_documento || ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <Car size={14} className="text-blue-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {rental.marca} {rental.modelo}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {rental.patente}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <Calendar size={14} className="text-green-500" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatDate(rental.fecha_entrega)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {rental.lugar_entrega}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {rental.fecha_devolucion ? (
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                            <Calendar size={14} className="text-purple-500" />
                                                        </div>
                                                        <div className="ml-3">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {formatDate(rental.fecha_devolucion)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {rental.lugar_devolucion}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${rental.fecha_devolucion
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {rental.fecha_devolucion ? 'Finalizado' : 'Activo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        to={`/rentals/${rental.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded-full transition-colors"
                                                        title="Ver detalles"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    {!rental.fecha_devolucion && (
                                                        <Link
                                                            to={`/rentals/${rental.id}`}
                                                            className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded-full transition-colors"
                                                            title="Finalizar alquiler"
                                                        >
                                                            <FileText size={18} />
                                                        </Link>
                                                    )}
                                                    {rental.estado === 'pendiente' && (
                                                        <button
                                                            className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded-full transition-colors"
                                                            onClick={() => handleVerifyClick(rental.id)}
                                                            title="Verificar alquiler pendiente"
                                                        >
                                                            <AlertTriangle size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {filteredRentals.length > 0 && (
                        <div className="px-6 py-4 bg-gray-50 border-t flex flex-col sm:flex-row items-center justify-between">
                            <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                <span className="font-medium">{filteredRentals.length}</span> alquileres encontrados
                                <span className="mx-2">|</span>
                                <span className="text-green-600 font-medium">{rentals.filter(r => !r.fecha_devolucion).length}</span> activos
                                <span className="mx-2">|</span>
                                <span className="text-purple-600 font-medium">{rentals.filter(r => r.fecha_devolucion).length}</span> finalizados
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
        </Layout>
    );
}