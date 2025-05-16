import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { rentalService } from '../../services/rental-service';
import { ArrowLeft, Calendar, Car, User, Truck, FileText, Clipboard, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RentalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [rental, setRental] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [returnForm, setReturnForm] = useState({
        fechaDevolucion: new Date().toISOString().split('T')[0],
        lugarDevolucion: '',
        kilometrajeDevolucion: '',
        observaciones: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const result = await rentalService.getRental(id);
                if (result.ok) {
                    setRental(result.data);

                    // Pre-llenar formulario de devolución si es necesario
                    if (result.data && result.data.lugar_entrega) {
                        setReturnForm(prev => ({
                            ...prev,
                            lugarDevolucion: result.data.lugar_entrega
                        }));
                    }
                } else {
                    toast.error('Error al cargar el alquiler');
                    navigate('/rentals');
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

    // Formatear fecha para mostrar
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const handleReturnFormChange = (e) => {
        const { name, value } = e.target;
        setReturnForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFinalizeSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await rentalService.finalizeRental(id, returnForm);

            if (result.ok) {
                toast.success('Alquiler finalizado correctamente');
                setShowFinalizeModal(false);
                // Actualizar datos del alquiler
                const updatedRental = await rentalService.getRental(id);
                if (updatedRental.ok) {
                    setRental(updatedRental.data);
                }
            } else {
                toast.error(result.msg || 'Error al finalizar el alquiler');
            }
        } catch (error) {
            console.error('Error al finalizar alquiler:', error);
            toast.error('Error de conexión al finalizar el alquiler');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrintClick = () => {
        // Implementación de impresión o generación de PDF del alquiler
        toast.success('Generando documento...');
        // Aquí iría la lógica para generar e imprimir el documento
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Cargando información del alquiler...</p>
                </div>
            </Layout>
        );
    }

    if (!rental) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <p className="text-gray-500">Alquiler no encontrado</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => navigate('/rentals')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Detalle de Alquiler #{rental.id}
                        </h1>
                    </div>

                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <Button
                            variant="outline"
                            icon={<FileText size={16} />}
                            onClick={handlePrintClick}
                        >
                            Imprimir
                        </Button>

                        {!rental.fecha_devolucion && (
                            <Button
                                variant="primary"
                                icon={<Clipboard size={16} />}
                                onClick={() => setShowFinalizeModal(true)}
                            >
                                Finalizar Alquiler
                            </Button>
                        )}
                    </div>
                </div>

                {/* Estado del alquiler */}
                <div className={`p-4 rounded-lg border ${rental.fecha_devolucion
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-center">
                        {rental.fecha_devolucion ? (
                            <CheckCircle size={20} className="text-purple-500 mr-2" />
                        ) : (
                            <Calendar size={20} className="text-green-500 mr-2" />
                        )}
                        <span className={`font-medium ${rental.fecha_devolucion ? 'text-purple-700' : 'text-green-700'
                            }`}>
                            {rental.fecha_devolucion ? 'Alquiler Finalizado' : 'Alquiler Activo'}
                        </span>
                    </div>
                </div>

                {/* Información del alquiler */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información del vehículo */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-4 bg-blue-50 border-b border-blue-100">
                            <h2 className="text-lg font-medium flex items-center text-blue-700">
                                <Car size={20} className="mr-2" />
                                Vehículo
                            </h2>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <h3 className="text-xl font-medium text-gray-900">
                                    {rental.marca} {rental.modelo}
                                </h3>
                                <p className="text-sm text-gray-600">Patente: {rental.patente}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-500">Designación</p>
                                    <p className="font-medium">{rental.designacion || 'N/A'}</p>
                                </div>
                                <Link
                                    to={`/vehicles/${rental.vehiculo_id}`}
                                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center justify-end"
                                >
                                    Ver información completa
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Información del cliente */}
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-4 bg-green-50 border-b border-green-100">
                            <h2 className="text-lg font-medium flex items-center text-green-700">
                                <User size={20} className="mr-2" />
                                Cliente
                            </h2>
                        </div>

                        <div className="p-5">
                            <div className="mb-4">
                                <h3 className="text-xl font-medium text-gray-900">
                                    {rental.cliente_nombre || 'N/A'}
                                </h3>
                                <p className="text-sm text-gray-600">DNI/CUIT: {rental.cliente_documento || 'N/A'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <p className="text-sm text-gray-500">Contacto</p>
                                    <p className="font-medium">{rental.cliente_telefono || 'N/A'}</p>
                                </div>
                                <Link
                                    to={`/clients/${rental.cliente_id}`}
                                    className="text-green-600 hover:text-green-900 text-sm flex items-center justify-end"
                                >
                                    Ver información completa
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalles de la entrega */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium flex items-center">
                            <Truck size={20} className="text-gray-500 mr-2" />
                            Detalles de la Entrega
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Funcionario que Entrega</h3>
                                <p className="mt-1 text-gray-900">{rental.funcionario_entrega}</p>
                                <p className="text-sm text-gray-500">DNI: {rental.dni_entrega}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Funcionario que Recibe</h3>
                                <p className="mt-1 text-gray-900">{rental.funcionario_recibe}</p>
                                <p className="text-sm text-gray-500">DNI: {rental.dni_recibe}</p>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">Fecha de Entrega</h3>
                                <p className="mt-1 text-gray-900">{formatDate(rental.fecha_entrega)}</p>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">Lugar de Entrega</h3>
                                <p className="mt-1 text-gray-900">{rental.lugar_entrega}</p>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">Kilometraje</h3>
                                <p className="mt-1 text-gray-900">{rental.kilometraje_entrega} km</p>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-500">Nivel de Combustible</h3>
                                <p className="mt-1 text-gray-900">{rental.nivel_combustible}</p>
                            </div>
                        </div>

                        {rental.observaciones && (
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-gray-500">Observaciones</h3>
                                <p className="mt-1 text-gray-900 whitespace-pre-line">{rental.observaciones}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detalles de la devolución (si existe) */}
                {rental.fecha_devolucion && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="p-6 border-b">
                            <h2 className="text-lg font-medium flex items-center">
                                <Clipboard size={20} className="text-purple-500 mr-2" />
                                Detalles de la Devolución
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Fecha de Devolución</h3>
                                    <p className="mt-1 text-gray-900">{formatDate(rental.fecha_devolucion)}</p>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Lugar de Devolución</h3>
                                    <p className="mt-1 text-gray-900">{rental.lugar_devolucion}</p>
                                </div>

                                <div className="mt-4">
                                    <h3 className="text-sm font-medium text-gray-500">Kilometraje</h3>
                                    <div className="mt-1">
                                        <p className="text-gray-900">{rental.kilometraje_devolucion} km</p>
                                        {rental.kilometraje_entrega && rental.kilometraje_devolucion && (
                                            <p className="text-sm text-gray-500">
                                                Recorrido: {rental.kilometraje_devolucion - rental.kilometraje_entrega} km
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {rental.observaciones_devolucion && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-medium text-gray-500">Observaciones de Devolución</h3>
                                        <p className="mt-1 text-gray-900 whitespace-pre-line">{rental.observaciones_devolucion}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Inventario */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6 border-b">
                        <h2 className="text-lg font-medium">Inventario</h2>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6">
                            {/* Primera columna: Exterior */}
                            <div>
                                <h3 className="font-medium text-gray-700 mb-3">Exterior</h3>
                                <ul className="space-y-2">
                                    {[
                                        { key: 'luces_principales', label: 'Luces Principales' },
                                        { key: 'luz_media', label: 'Luz Media' },
                                        { key: 'luz_stop', label: 'Luz de Stop' },
                                        { key: 'antena_radio', label: 'Antena de Radio' },
                                        { key: 'limpia_parabrisas', label: 'Limpia Parabrisas' },
                                        { key: 'parabrisas', label: 'Parabrisas' },
                                        { key: 'espejo_izquierdo', label: 'Espejo Izquierdo' },
                                        { key: 'espejo_derecho', label: 'Espejo Derecho' },
                                        { key: 'parachoque_delantero', label: 'Parachoque Delantero' },
                                        { key: 'parachoque_trasero', label: 'Parachoque Trasero' }
                                    ].map(item => (
                                        <li key={item.key} className="flex items-center">
                                            {rental[item.key] ? (
                                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500 mr-2" />
                                            )}
                                            <span className="text-sm">{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Segunda columna: Interior */}
                            <div>
                                <h3 className="font-medium text-gray-700 mb-3">Interior</h3>
                                <ul className="space-y-2">
                                    {[
                                        { key: 'calefaccion', label: 'Calefacción' },
                                        { key: 'radio_cd', label: 'Radio/CD' },
                                        { key: 'bocinas', label: 'Bocinas' },
                                        { key: 'encendedor', label: 'Encendedor' },
                                        { key: 'espejo_retrovisor', label: 'Espejo Retrovisor' },
                                        { key: 'ceniceros', label: 'Ceniceros' },
                                        { key: 'cinturones', label: 'Cinturones' },
                                        { key: 'manijas_vidrios', label: 'Manijas de Vidrios' },
                                        { key: 'tapetes', label: 'Tapetes' }
                                    ].map(item => (
                                        <li key={item.key} className="flex items-center">
                                            {rental[item.key] ? (
                                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500 mr-2" />
                                            )}
                                            <span className="text-sm">{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Tercera columna: Accesorios */}
                            <div>
                                <h3 className="font-medium text-gray-700 mb-3">Accesorios</h3>
                                <ul className="space-y-2">
                                    {[
                                        { key: 'gato', label: 'Gato' },
                                        { key: 'llave_rueda', label: 'Llave de Rueda' },
                                        { key: 'triangulo', label: 'Triángulo' },
                                        { key: 'extintor', label: 'Extintor' },
                                        { key: 'botiquin', label: 'Botiquín' },
                                        { key: 'llanta_auxilio', label: 'Llanta Auxilio' },
                                        { key: 'soat', label: 'SOAT' },
                                        { key: 'inspeccion_tecnica', label: 'Inspección Técnica' }
                                    ].map(item => (
                                        <li key={item.key} className="flex items-center">
                                            {rental[item.key] ? (
                                                <CheckCircle size={16} className="text-green-500 mr-2" />
                                            ) : (
                                                <XCircle size={16} className="text-red-500 mr-2" />
                                            )}
                                            <span className="text-sm">{item.label}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de finalización */}
            <Modal
                isOpen={showFinalizeModal}
                onClose={() => setShowFinalizeModal(false)}
                title="Finalizar Alquiler"
                size="md"
            >
                <form onSubmit={handleFinalizeSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Fecha de Devolución
                            </label>
                            <input
                                type="date"
                                name="fechaDevolucion"
                                value={returnForm.fechaDevolucion}
                                onChange={handleReturnFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Lugar de Devolución
                            </label>
                            <input
                                type="text"
                                name="lugarDevolucion"
                                value={returnForm.lugarDevolucion}
                                onChange={handleReturnFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Kilometraje Final
                            </label>
                            <input
                                type="number"
                                name="kilometrajeDevolucion"
                                value={returnForm.kilometrajeDevolucion}
                                onChange={handleReturnFormChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                required
                                min={rental?.kilometraje_entrega || 0}
                            />
                            {rental?.kilometraje_entrega && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Kilometraje de entrega: {rental.kilometraje_entrega} km
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Observaciones
                            </label>
                            <textarea
                                name="observaciones"
                                value={returnForm.observaciones}
                                onChange={handleReturnFormChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFinalizeModal(false)}
                            className="sm:col-start-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            isLoading={submitting}
                            className="sm:col-start-2"
                        >
                            Finalizar Alquiler
                        </Button>
                    </div>
                </form>
            </Modal>
        </Layout>
    );
}

