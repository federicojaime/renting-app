import React, { useState, useEffect } from 'react';
import { rentalService } from '../../services/rental-service';
import { vehicleService } from '../../services/vehicle-service';
import { clientService } from '../../services/client-service';
import Button from '../common/Button';
import Input from '../common/Input';
import { Save, X, Search } from 'lucide-react';

export default function RentalForm({ rental = null, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        vehiculo_id: '',
        cliente_id: '',
        funcionarioEntrega: '',
        funcionarioRecibe: '',
        dniEntrega: '',
        dniRecibe: '',
        fechaEntrega: new Date().toISOString().split('T')[0],
        lugarEntrega: '',
        kilometrajeEntrega: '',
        nivelCombustible: 'MEDIO',
        observaciones: '',
        inventario: {
            lucesPrincipales: false,
            luzMedia: false,
            luzStop: false,
            antenaRadio: false,
            limpiaParabrisas: false,
            espejoIzquierdo: false,
            espejoDerecho: false,
            vidriosLaterales: false,
            parabrisas: false,
            tapones: false,
            taponGasolina: false,
            carroceria: false,
            parachoqueDelantero: false,
            parachoqueTrasero: false,
            placas: false,
            calefaccion: false,
            radioCd: false,
            bocinas: false,
            encendedor: false,
            espejoRetrovisor: false,
            ceniceros: false,
            cinturones: false,
            manijasVidrios: false,
            pisosGoma: false,
            tapetes: false,
            fundaAsientos: false,
            jaladorPuertas: false,
            sujetadorManos: false,
            gato: false,
            llaveRueda: false,
            estucheLlaves: false,
            triangulo: false,
            llantaAuxilio: false,
            extintor: false,
            botiquin: false,
            otros: false,
            soat: false,
            inspeccionTecnica: false
        }
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [vehicles, setVehicles] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Cargar vehículos y clientes al montar
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesResult, clientsResult] = await Promise.all([
                    vehicleService.getVehicles(),
                    clientService.getClients()
                ]);

                if (vehiclesResult.ok) {
                    setVehicles(vehiclesResult.data);
                }

                if (clientsResult.ok) {
                    setClients(clientsResult.data);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    // Si se proporciona un alquiler existente, cargar sus datos
    useEffect(() => {
        if (rental) {
            // Transformar datos del alquiler al formato del formulario
            // Este mapeo dependerá de la estructura exacta de tus datos
            setForm({
                vehiculo_id: rental.vehiculo_id || '',
                cliente_id: rental.cliente_id || '',
                funcionarioEntrega: rental.funcionario_entrega || '',
                funcionarioRecibe: rental.funcionario_recibe || '',
                dniEntrega: rental.dni_entrega || '',
                dniRecibe: rental.dni_recibe || '',
                fechaEntrega: rental.fecha_entrega || '',
                lugarEntrega: rental.lugar_entrega || '',
                kilometrajeEntrega: rental.kilometraje_entrega || '',
                nivelCombustible: rental.nivel_combustible || 'MEDIO',
                observaciones: rental.observaciones || '',
                inventario: {
                    // Mapear todos los campos del inventario
                    lucesPrincipales: rental.luces_principales || false,
                    // ... resto de campos
                }
            });

            // Buscar y establecer el vehículo y cliente seleccionados
            const vehicle = vehicles.find(v => v.id === rental.vehiculo_id);
            if (vehicle) setSelectedVehicle(vehicle);

            const client = clients.find(c => c.id === rental.cliente_id);
            if (client) setSelectedClient(client);
        }
    }, [rental, vehicles, clients]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Limpiar el error de este campo si existe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }

        // Actualizar vehículo o cliente seleccionado
        if (name === 'vehiculo_id') {
            const vehicle = vehicles.find(v => v.id === parseInt(value));
            setSelectedVehicle(vehicle || null);
        } else if (name === 'cliente_id') {
            const client = clients.find(c => c.id === parseInt(value));
            setSelectedClient(client || null);
        }
    };

    const handleInventoryChange = (e) => {
        const { name, checked } = e.target;
        setForm(prev => ({
            ...prev,
            inventario: {
                ...prev.inventario,
                [name]: checked
            }
        }));
    };

    const validate = () => {
        const newErrors = {};

        // Validaciones básicas
        if (!form.vehiculo_id) newErrors.vehiculo_id = 'Vehículo es requerido';
        if (!form.cliente_id) newErrors.cliente_id = 'Cliente es requerido';
        if (!form.funcionarioEntrega) newErrors.funcionarioEntrega = 'Funcionario de entrega es requerido';
        if (!form.funcionarioRecibe) newErrors.funcionarioRecibe = 'Funcionario que recibe es requerido';
        if (!form.dniEntrega) newErrors.dniEntrega = 'DNI del funcionario de entrega es requerido';
        if (!form.dniRecibe) newErrors.dniRecibe = 'DNI del funcionario que recibe es requerido';
        if (!form.fechaEntrega) newErrors.fechaEntrega = 'Fecha de entrega es requerida';
        if (!form.lugarEntrega) newErrors.lugarEntrega = 'Lugar de entrega es requerido';
        if (!form.kilometrajeEntrega) newErrors.kilometrajeEntrega = 'Kilometraje es requerido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        try {
            let result;

            if (rental) {
                // Actualizar alquiler existente (si aplica)
                result = await rentalService.updateRental(rental.id, form);
            } else {
                // Crear nuevo alquiler
                result = await rentalService.createRental(form);
            }

            if (result.ok) {
                onSubmit(result.data);
            } else {
                // Manejar errores de validación del servidor
                if (result.errores) {
                    setErrors(result.errores.reduce((acc, error) => {
                        const field = error.split(' ')[0].toLowerCase();
                        acc[field] = error;
                        return acc;
                    }, {}));
                } else {
                    alert(result.msg || 'Error al guardar el alquiler');
                }
            }
        } catch (error) {
            console.error('Error al guardar alquiler:', error);
            alert('Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return <div className="flex justify-center py-8">Cargando datos...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Alquiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="vehiculo_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Vehículo <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="vehiculo_id"
                        name="vehiculo_id"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={form.vehiculo_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un vehículo</option>
                        {vehicles.filter(v => v.estado === 'DISPONIBLE').map(vehicle => (
                            <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.marca} {vehicle.modelo} - {vehicle.patente}
                            </option>
                        ))}
                    </select>
                    {errors.vehiculo_id && <p className="mt-1 text-sm text-red-600">{errors.vehiculo_id}</p>}

                    {selectedVehicle && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                            <p><strong>Marca:</strong> {selectedVehicle.marca}</p>
                            <p><strong>Modelo:</strong> {selectedVehicle.modelo}</p>
                            <p><strong>Patente:</strong> {selectedVehicle.patente}</p>
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="cliente_id"
                        name="cliente_id"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={form.cliente_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un cliente</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.tipo_cliente === 'persona' ? client.nombre : client.razon_social} - {client.dni_cuit}
                            </option>
                        ))}
                    </select>
                    {errors.cliente_id && <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>}

                    {selectedClient && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                            <p><strong>Tipo:</strong> {selectedClient.tipo_cliente === 'persona' ? 'Persona' : 'Empresa'}</p>
                            <p><strong>{selectedClient.tipo_cliente === 'persona' ? 'Nombre' : 'Razón Social'}:</strong> {selectedClient.tipo_cliente === 'persona' ? selectedClient.nombre : selectedClient.razon_social}</p>
                            <p><strong>DNI/CUIT:</strong> {selectedClient.dni_cuit}</p>
                            <p><strong>Teléfono:</strong> {selectedClient.telefono}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    id="funcionarioEntrega"
                    name="funcionarioEntrega"
                    label="Funcionario que Entrega"
                    value={form.funcionarioEntrega}
                    onChange={handleChange}
                    error={errors.funcionarioEntrega}
                    required
                />

                <Input
                    id="dniEntrega"
                    name="dniEntrega"
                    label="DNI Funcionario Entrega"
                    value={form.dniEntrega}
                    onChange={handleChange}
                    error={errors.dniEntrega}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    id="funcionarioRecibe"
                    name="funcionarioRecibe"
                    label="Funcionario que Recibe"
                    value={form.funcionarioRecibe}
                    onChange={handleChange}
                    error={errors.funcionarioRecibe}
                    required
                />

                <Input
                    // Continuación de Components/Rentals/RentalForm.jsx
                    id="dniRecibe"
                    name="dniRecibe"
                    label="DNI Funcionario Recibe"
                    value={form.dniRecibe}
                    onChange={handleChange}
                    error={errors.dniRecibe}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    id="fechaEntrega"
                    name="fechaEntrega"
                    label="Fecha de Entrega"
                    type="date"
                    value={form.fechaEntrega}
                    onChange={handleChange}
                    error={errors.fechaEntrega}
                    required
                />

                <Input
                    id="lugarEntrega"
                    name="lugarEntrega"
                    label="Lugar de Entrega"
                    value={form.lugarEntrega}
                    onChange={handleChange}
                    error={errors.lugarEntrega}
                    required
                />

                <Input
                    id="kilometrajeEntrega"
                    name="kilometrajeEntrega"
                    label="Kilometraje"
                    type="number"
                    min="0"
                    value={form.kilometrajeEntrega}
                    onChange={handleChange}
                    error={errors.kilometrajeEntrega}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="nivelCombustible" className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel de Combustible <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="nivelCombustible"
                        name="nivelCombustible"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={form.nivelCombustible}
                        onChange={handleChange}
                        required
                    >
                        <option value="VACIO">Vacío</option>
                        <option value="CUARTO">1/4</option>
                        <option value="MEDIO">1/2</option>
                        <option value="TRES_CUARTOS">3/4</option>
                        <option value="LLENO">Lleno</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                    </label>
                    <textarea
                        id="observaciones"
                        name="observaciones"
                        rows={3}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={form.observaciones}
                        onChange={handleChange}
                    ></textarea>
                </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8">Inventario</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Exterior</h4>

                    <div className="flex items-center">
                        <input
                            id="lucesPrincipales"
                            name="lucesPrincipales"
                            type="checkbox"
                            checked={form.inventario.lucesPrincipales}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="lucesPrincipales" className="ml-2 block text-sm text-gray-700">
                            Luces Principales
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="luzMedia"
                            name="luzMedia"
                            type="checkbox"
                            checked={form.inventario.luzMedia}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="luzMedia" className="ml-2 block text-sm text-gray-700">
                            Luz Media
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="luzStop"
                            name="luzStop"
                            type="checkbox"
                            checked={form.inventario.luzStop}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="luzStop" className="ml-2 block text-sm text-gray-700">
                            Luz de Stop
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="antenaRadio"
                            name="antenaRadio"
                            type="checkbox"
                            checked={form.inventario.antenaRadio}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="antenaRadio" className="ml-2 block text-sm text-gray-700">
                            Antena de Radio
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="limpiaParabrisas"
                            name="limpiaParabrisas"
                            type="checkbox"
                            checked={form.inventario.limpiaParabrisas}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="limpiaParabrisas" className="ml-2 block text-sm text-gray-700">
                            Limpia Parabrisas
                        </label>
                    </div>

                    {/* Más ítems de inventario exterior... */}
                </div>

                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Interior</h4>

                    <div className="flex items-center">
                        <input
                            id="calefaccion"
                            name="calefaccion"
                            type="checkbox"
                            checked={form.inventario.calefaccion}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="calefaccion" className="ml-2 block text-sm text-gray-700">
                            Calefacción
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="radioCd"
                            name="radioCd"
                            type="checkbox"
                            checked={form.inventario.radioCd}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="radioCd" className="ml-2 block text-sm text-gray-700">
                            Radio/CD
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="bocinas"
                            name="bocinas"
                            type="checkbox"
                            checked={form.inventario.bocinas}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="bocinas" className="ml-2 block text-sm text-gray-700">
                            Bocinas
                        </label>
                    </div>

                    {/* Más ítems de inventario interior... */}
                </div>

                <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Accesorios</h4>

                    <div className="flex items-center">
                        <input
                            id="gato"
                            name="gato"
                            type="checkbox"
                            checked={form.inventario.gato}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="gato" className="ml-2 block text-sm text-gray-700">
                            Gato
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="llaveRueda"
                            name="llaveRueda"
                            type="checkbox"
                            checked={form.inventario.llaveRueda}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="llaveRueda" className="ml-2 block text-sm text-gray-700">
                            Llave de Rueda
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="triangulo"
                            name="triangulo"
                            type="checkbox"
                            checked={form.inventario.triangulo}
                            onChange={handleInventoryChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="triangulo" className="ml-2 block text-sm text-gray-700">
                            Triángulo
                        </label>
                    </div>

                    {/* Más ítems de inventario accesorios... */}
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-8">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    icon={<X size={18} />}
                >
                    Cancelar
                </Button>

                <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    icon={<Save size={18} />}
                >
                    {rental ? 'Actualizar' : 'Crear'} Alquiler
                </Button>
            </div>
        </form>
    );
}