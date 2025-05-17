const [filteredVehicles, setFilteredVehicles] = useState([]);
const [filteredClients, setFilteredClients] = useState([]);
const [inventoryGroups, setInventoryGroups] = useState({
    exterior: [
        { key: 'lucesPrincipales', label: 'Luces Principales' },
        { key: 'luzMedia', label: 'Luz Media' },
        { key: 'luzStop', label: 'Luz de Stop' },
        { key: 'antenaRadio', label: 'Antena de Radio' },
        { key: 'limpiaParabrisas', label: 'Limpia Parabrisas' },
        { key: 'espejoIzquierdo', label: 'Espejo Izquierdo' },
        { key: 'espejoDerecho', label: 'Espejo Derecho' },
        { key: 'vidriosLaterales', label: 'Vidrios Laterales' },
        { key: 'parabrisas', label: 'Parabrisas' },
        { key: 'tapones', label: 'Tapones' },
        { key: 'taponGasolina', label: 'Tapón de Gasolina' },
        { key: 'carroceria', label: 'Carrocería' },
        { key: 'parachoqueDelantero', label: 'Parachoque Delantero' },
        { key: 'parachoqueTrasero', label: 'Parachoque Trasero' },
        { key: 'placas', label: 'Placas' }
    ],
    interior: [
        { key: 'calefaccion', label: 'Calefacción' },
        { key: 'radioCd', label: 'Radio/CD' },
        { key: 'bocinas', label: 'Bocinas' },
        { key: 'encendedor', label: 'Encendedor' },
        { key: 'espejoRetrovisor', label: 'Espejo Retrovisor' },
        { key: 'ceniceros', label: 'Ceniceros' },
        { key: 'cinturones', label: 'Cinturones' },
        { key: 'manijasVidrios', label: 'Manijas de Vidrios' },
        { key: 'pisosGoma', label: 'Pisos de Goma' },
        { key: 'tapetes', label: 'Tapetes' },
        { key: 'fundaAsientos', label: 'Fundas de Asientos' },
        { key: 'jaladorPuertas', label: 'Jaladores de Puertas' },
        { key: 'sujetadorManos', label: 'Sujetadores de Manos' }
    ],
    accesorios: [
        { key: 'gato', label: 'Gato' },
        { key: 'llaveRueda', label: 'Llave de Rueda' },
        { key: 'estucheLlaves', label: 'Estuche de Llaves' },
        { key: 'triangulo', label: 'Triángulo' },
        { key: 'llantaAuxilio', label: 'Llanta Auxilio' },
        { key: 'extintor', label: 'Extintor' },
        { key: 'botiquin', label: 'Botiquín' },
        { key: 'otros', label: 'Otros' },
        { key: 'soat', label: 'SOAT' },
        { key: 'inspeccionTecnica', label: 'Inspección Técnica' }
    ]
});

// Cargar vehículos y clientes al montar
useEffect(() => {
    const fetchData = async () => {
        try {
            const [vehiclesResult, clientsResult] = await Promise.all([
                vehicleService.getVehicles(),
                clientService.getClients()
            ]);

            if (vehiclesResult.ok) {
                const availableVehicles = vehiclesResult.data.filter(v => v.estado === 'DISPONIBLE' || (rental && rental.vehiculo_id === v.id));
                setVehicles(availableVehicles);
                setFilteredVehicles(availableVehicles);
            }

            if (clientsResult.ok) {
                setClients(clientsResult.data);
                setFilteredClients(clientsResult.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoadingData(false);
        }
    };

    fetchData();
}, [rental]);

// Si se proporciona un alquiler existente, cargar sus datos
useEffect(() => {
    if (rental) {
        // Transformar datos del alquiler al formato del formulario
        const rentalInventario = {};
        Object.keys(form.inventario).forEach(key => {
            // Convertir clave de camelCase a snake_case para coincidir con el formato del API
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            rentalInventario[key] = !!rental[snakeKey]; // Convertir a booleano
        });

        setForm({
            vehiculo_id: rental.vehiculo_id?.toString() || '',
            cliente_id: rental.cliente_id?.toString() || '',
            funcionarioEntrega: rental.funcionario_entrega || '',
            funcionarioRecibe: rental.funcionario_recibe || '',
            dniEntrega: rental.dni_entrega || '',
            dniRecibe: rental.dni_recibe || '',
            fechaEntrega: rental.fecha_entrega || '',
            lugarEntrega: rental.lugar_entrega || '',
            kilometrajeEntrega: rental.kilometraje_entrega?.toString() || '',
            nivelCombustible: rental.nivel_combustible || 'MEDIO',
            observaciones: rental.observaciones || '',
            inventario: rentalInventario
        });

        // Buscar y establecer el vehículo y cliente seleccionados
        const vehicle = vehicles.find(v => v.id === rental.vehiculo_id);
        if (vehicle) setSelectedVehicle(vehicle);

        const client = clients.find(c => c.id === rental.cliente_id);
        if (client) setSelectedClient(client);
    }
}, [rental, vehicles, clients]);

useEffect(() => {
    if (searchVehicleTerm) {
        const term = searchVehicleTerm.toLowerCase();
        const filtered = vehicles.filter(vehicle =>
            vehicle.marca.toLowerCase().includes(term) ||
            vehicle.modelo.toLowerCase().includes(term) ||
            vehicle.patente.toLowerCase().includes(term)
        );
        setFilteredVehicles(filtered);
    } else {
        setFilteredVehicles(vehicles);
    }
}, [searchVehicleTerm, vehicles]);

useEffect(() => {
    if (searchClientTerm) {
        const term = searchClientTerm.toLowerCase();
        const filtered = clients.filter(client => {
            const nombre = client.tipo_cliente === 'persona' ? client.nombre : client.razon_social;
            return (
                (nombre && nombre.toLowerCase().includes(term)) ||
                (client.dni_cuit && client.dni_cuit.toLowerCase().includes(term))
            );
        });
        setFilteredClients(filtered);
    } else {
        setFilteredClients(clients);
    }
}, [searchClientTerm, clients]);

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

// Función para seleccionar/deseleccionar todos los ítems de un grupo
const handleSelectGroup = (group, checked) => {
    const updatedInventory = { ...form.inventario };

    inventoryGroups[group].forEach(item => {
        updatedInventory[item.key] = checked;
    });

    setForm(prev => ({
        ...prev,
        inventario: updatedInventory
    }));
};

const validate = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!form.vehiculo_id) newErrors.vehiculo_id = 'Vehículo es requerido';
    if (!form.cliente_id) newErrors.cliente_id = 'Cliente es requerido';
    if (!form.funcionarioEntrega) newErrors.funcionarioEntrega = 'Funcionario de entrega es requerido';
    if (!form.funcionarioRecibe) newErrors.funcionarioRecibe = 'Funcionario que recibe es requerido';
    if (!form.dniEntrega) {
        newErrors.dniEntrega = 'DNI del funcionario de entrega es requerido';
    } else if (!/^\d{7,8}$/.test(form.dniEntrega)) {
        newErrors.dniEntrega = 'DNI debe contener 7-8 dígitos';
    }

    if (!form.dniRecibe) {
        newErrors.dniRecibe = 'DNI del funcionario que recibe es requerido';
    } else if (!/^\d{7,8}$/.test(form.dniRecibe)) {
        newErrors.dniRecibe = 'DNI debe contener 7-8 dígitos';
    }

    if (!form.fechaEntrega) newErrors.fechaEntrega = 'Fecha de entrega es requerida';
    if (!form.lugarEntrega) newErrors.lugarEntrega = 'Lugar de entrega es requerido';

    if (!form.kilometrajeEntrega) {
        newErrors.kilometrajeEntrega = 'Kilometraje es requerido';
    } else if (isNaN(parseInt(form.kilometrajeEntrega)) || parseInt(form.kilometrajeEntrega) < 0) {
        newErrors.kilometrajeEntrega = 'Kilometraje debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
        let result;

        // Preparar los datos a enviar
        const rentalData = {
            vehiculo_id: parseInt(form.vehiculo_id),
            cliente_id: parseInt(form.cliente_id),
            funcionarioEntrega: form.funcionarioEntrega,
            funcionarioRecibe: form.funcionarioRecibe,
            dniEntrega: form.dniEntrega,
            dniRecibe: form.dniRecibe,
            fechaEntrega: form.fechaEntrega,
            lugarEntrega: form.lugarEntrega,
            kilometrajeEntrega: parseInt(form.kilometrajeEntrega),
            nivelCombustible: form.nivelCombustible,
            observaciones: form.observaciones,
            inventario: form.inventario
        };

        if (rental) {
            // Actualizar alquiler existente (si aplica)
            result = await rentalService.updateRental(rental.id, rentalData);
        } else {
            // Crear nuevo alquiler
            result = await rentalService.createRental(rentalData);
        }

        if (result.ok) {
            onSubmit(result.data);
        } else {
            // Manejar errores de validación del servidor
            if (result.errores) {
                const serverErrors = {};
                result.errores.forEach(error => {
                    const fieldParts = error.split(' ');
                    const field = fieldParts[0].toLowerCase();
                    serverErrors[field] = error;
                });
                setErrors(serverErrors);
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
    return (
        <div className="flex justify-center py-8">
            <div className="flex items-center space-x-3">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Cargando datos...</p>
            </div>
        </div>
    );
}

return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Alquiler</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selección de vehículo */}
            <div>
                <label htmlFor="vehiculo_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Vehículo <span className="text-red-500">*</span>
                </label>

                {/* Búsqueda de vehículos */}
                <div className="mb-2 relative">
                    <input
                        type="text"
                        placeholder="Buscar por marca, modelo o patente..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={searchVehicleTerm}
                        onChange={(e) => setSearchVehicleTerm(e.target.value)}
                        disabled={rental !== null} // Deshabilitar la búsqueda al editar
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>

                <select
                    id="vehiculo_id"
                    name="vehiculo_id"
                    className={`block w-full pl-3 pr-10 py-2 text-base border ${errors.vehiculo_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
                    value={form.vehiculo_id}
                    onChange={handleChange}
                    required
                    disabled={rental !== null} // Deshabilitar el cambio de vehículo al editar
                >
                    <option value="">Seleccione un vehículo</option>
                    {filteredVehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.marca} {vehicle.modelo} - {vehicle.patente}
                        </option>
                    ))}
                </select>
                {errors.vehiculo_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.vehiculo_id}</p>
                )}

                {filteredVehicles.length === 0 && vehicles.length > 0 && (
                    <p className="mt-1 text-sm text-amber-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        No se encontraron vehículos que coincidan con la búsqueda
                    </p>
                )}

                {selectedVehicle && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                        <p><strong>Marca:</strong> {selectedVehicle.marca}</p>
                        <p><strong>Modelo:</strong> {selectedVehicle.modelo}</p>
                        <p><strong>Patente:</strong> {selectedVehicle.patente}</p>
                        {selectedVehicle.designacion && (
                            <p><strong>Designación:</strong> {selectedVehicle.designacion}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Selección de cliente */}
            <div>
                <label htmlFor="cliente_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente <span className="text-red-500">*</span>
                </label>

                {/* Búsqueda de clientes */}
                <div className="mb-2 relative">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, razón social o DNI/CUIT..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={searchClientTerm}
                        onChange={(e) => setSearchClientTerm(e.target.value)}
                        disabled={rental !== null} // Deshabilitar la búsqueda al editar
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-400" />
                    </div>
                </div>

                <select
                    id="cliente_id"
                    name="cliente_id"
                    className={`block w-full pl-3 pr-10 py-2 text-base border ${errors.cliente_id ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
                    value={form.cliente_id}
                    onChange={handleChange}
                    required
                    disabled={rental !== null} // Deshabilitar el cambio de cliente al editar
                >
                    <option value="">Seleccione un cliente</option>
                    {filteredClients.map(client => (
                        <option key={client.id} value={client.id}>
                            {client.tipo_cliente === 'persona' ? client.nombre : client.razon_social} - {client.dni_cuit}
                        </option>
                    ))}
                </select>
                {errors.cliente_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.cliente_id}</p>
                )}

                {filteredClients.length === 0 && clients.length > 0 && (
                    <p className="mt-1 text-sm text-amber-600 flex items-center">
                        <AlertCircle size={16} className="mr-1" />
                        No se encontraron clientes que coincidan con la búsqueda
                    </p>
                )}

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
            <div>
                <label htmlFor="fechaEntrega" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Entrega <span className="text-red-500">*</span>
                </label>
                <input
                    type="date"
                    id="fechaEntrega"
                    name="fechaEntrega"
                    className={`block w-full px-3 py-2 border ${errors.fechaEntrega ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
                    value={form.fechaEntrega}
                    onChange={handleChange}
                    required
                />
                {errors.fechaEntrega && (
                    <p className="mt-1 text-sm text-red-600">{errors.fechaEntrega}</p>
                )}
            </div>

            <Input
                id="lugarEntrega"
                name="lugarEntrega"
                label="Lugar de Entrega"
                value={form.lugarEntrega}
                onChange={handleChange}
                error={errors.lugarEntrega}
                required
            />

            <div>
                <label htmlFor="kilometrajeEntrega" className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometraje <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                        type="number"
                        id="kilometrajeEntrega"
                        name="kilometrajeEntrega"
                        min="0"
                        className={`block w-full pl-3 pr-12 py-2 border ${errors.kilometrajeEntrega ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm`}
                        value={form.kilometrajeEntrega}
                        onChange={handleChange}
                        required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">km</span>
                    </div>
                </div>
                {errors.kilometrajeEntrega && (
                    <p className="mt-1 text-sm text-red-600">{errors.kilometrajeEntrega}</p>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="nivelCombustible" className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel de Combustible <span className="text-red-500">*</span>
                </label>
                <select
                    id="nivelCombustible"
                    name="nivelCombustible"
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                    placeholder="Detalles adicionales sobre la entrega del vehículo..."
                ></textarea>
            </div>
        </div>

        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mt-8">Inventario</h3>

        <div className="space-y-6">
            {/* Grupo de ítems Exterior */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Exterior</h4>
                    <div className="space-x-2">
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('exterior', true)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            Seleccionar todos
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('exterior', false)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Desmarcar todos
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {inventoryGroups.exterior.map(item => (
                        <div key={item.key} className="flex items-center">
                            <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                checked={form.inventario[item.key] || false}
                                onChange={handleInventoryChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={item.key} className="ml-2 block text-sm text-gray-700">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grupo de ítems Interior */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Interior</h4>
                    <div className="space-x-2">
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('interior', true)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            Seleccionar todos
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('interior', false)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Desmarcar todos
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {inventoryGroups.interior.map(item => (
                        <div key={item.key} className="flex items-center">
                            <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                checked={form.inventario[item.key] || false}
                                onChange={handleInventoryChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={item.key} className="ml-2 block text-sm text-gray-700">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grupo de ítems Accesorios */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-700">Accesorios</h4>
                    <div className="space-x-2">
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('accesorios', true)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                            Seleccionar todos
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSelectGroup('accesorios', false)}
                            className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Desmarcar todos
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {inventoryGroups.accesorios.map(item => (
                        <div key={item.key} className="flex items-center">
                            <input
                                id={item.key}
                                name={item.key}
                                type="checkbox"
                                checked={form.inventario[item.key] || false}
                                onChange={handleInventoryChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={item.key} className="ml-2 block text-sm text-gray-700">
                                {item.label}
                            </label>
                        </div>
                    ))}
                </div>
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
