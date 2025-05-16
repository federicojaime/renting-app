import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import { Plus, Search, Eye, FileText, AlertTriangle } from 'lucide-react';
import { rentalService } from '../../services/rental-service';
import toast from 'react-hot-toast';

export default function RentalsPage() {
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

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
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
    };

    // Filtrar alquileres según término de búsqueda y filtro de estado
    const filteredRentals = rentals.filter(rental => {
        const searchString = searchTerm.toLowerCase();
        const matches = (
            rental.cliente_nombre?.toLowerCase().includes(searchString) ||
            rental.patente?.toLowerCase().includes(searchString) ||
            rental.marca?.toLowerCase().includes(searchString) ||
            rental.modelo?.toLowerCase().includes(searchString)
        );

        if (filter === 'all') return matches;
        if (filter === 'active') return matches && !rental.fecha_devolucion;
        if (filter === 'completed') return matches && rental.fecha_devolucion;

        return matches;
    });

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
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                    </div>
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
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Cargando alquileres...
                                        </td>
                                    </tr>
                                ) : filteredRentals.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No se encontraron alquileres
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRentals.map((rental) => (
                                        <tr key={rental.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {rental.cliente_nombre || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {rental.marca} {rental.modelo}
                                                <div className="text-xs text-gray-400">{rental.patente}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(rental.fecha_entrega)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(rental.fecha_devolucion)}
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
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    {!rental.fecha_devolucion && (
                                                        <Link
                                                            to={`/rentals/${rental.id}/finalize`}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            <FileText size={18} />
                                                        </Link>
                                                    )}
                                                    {rental.estado === 'pendiente' && (
                                                        <button
                                                            className="text-yellow-600 hover:text-yellow-900"
                                                            onClick={() => handleVerifyClick(rental.id)}
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

                    <div className="px-6 py-4 bg-gray-50 border-t">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                <span className="font-medium">{filteredRentals.length}</span> alquileres encontrados
                            </p>

                            <div className="text-sm text-gray-500">
                                Activos: <span className="font-medium text-green-600">{rentals.filter(r => !r.fecha_devolucion).length}</span>
                                <span className="mx-2">|</span>
                                Finalizados: <span className="font-medium text-purple-600">{rentals.filter(r => r.fecha_devolucion).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}