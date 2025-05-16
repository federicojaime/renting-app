import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import VehicleForm from '../../components/vehicles/VehicleForm';
import { Plus, Search, Edit, Trash, Eye } from 'lucide-react';
import { vehicleService } from '../../services/vehicle-service';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    // Cargar vehículos al montar
    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const result = await vehicleService.getVehicles();
            if (result.ok) {
                setVehicles(result.data);
            } else {
                alert('Error al cargar vehículos: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
            alert('Error de conexión al cargar vehículos');
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

    const handleFormSubmit = async () => {
        setShowModal(false);
        await fetchVehicles(); // Recargar vehículos
    };

    const handleDeleteConfirm = async () => {
        if (!vehicleToDelete) return;

        try {
            const result = await vehicleService.deleteVehicle(vehicleToDelete.id);
            if (result.ok) {
                setShowDeleteModal(false);
                await fetchVehicles(); // Recargar vehículos
            } else {
                alert('Error al eliminar vehículo: ' + result.msg);
            }
        } catch (error) {
            console.error('Error al eliminar vehículo:', error);
            alert('Error de conexión al eliminar vehículo');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    // Filtrar vehículos según término de búsqueda
    const filteredVehicles = vehicles.filter(vehicle => {
        const searchString = searchTerm.toLowerCase();
        return (
            vehicle.patente.toLowerCase().includes(searchString) ||
            vehicle.marca.toLowerCase().includes(searchString) ||
            vehicle.modelo.toLowerCase().includes(searchString) ||
            vehicle.nro_interno.toLowerCase().includes(searchString)
        );
    });

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
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>

                    <Button
                        variant="primary"
                        icon={<Plus size={16} />}
                        onClick={handleCreateClick}
                    >
                        Nuevo Vehículo
                    </Button>
                </div>

                {/* Barra de búsqueda */}
                <div className="relative max-w-md w-full">
                    <input
                        type="text"
                        placeholder="Buscar por patente, marca o modelo..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>

                {/* Tabla de vehículos */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nro. Interno</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca/Modelo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            Cargando vehículos...
                                        </td>
                                    </tr>
                                ) : filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                            No se encontraron vehículos
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50">
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
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        onClick={() => {/* Ver detalles */ }}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="text-blue-600 hover:text-blue-900"
                                                        onClick={() => handleEditClick(vehicle)}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        className="text-red-600 hover:text-red-900"
                                                        onClick={() => handleDeleteClick(vehicle)}
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
                title={selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                size="lg"
            >
                <VehicleForm
                    vehicle={selectedVehicle}
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
                <p>¿Está seguro que desea eliminar el vehículo {vehicleToDelete?.marca} {vehicleToDelete?.modelo} ({vehicleToDelete?.patente})?</p>
                <p className="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
            </Modal>
        </Layout>
    );
}