import React, { useState, useEffect } from 'react';
import { vehicleService } from '../../services/vehicle-service';
import Button from '../common/Button';
import Input from '../common/Input';
import { Save, X } from 'lucide-react';

export default function VehicleForm({ vehicle = null, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        nroInterno: '',
        patente: '',
        marca: '',
        modelo: '',
        designacion: '',
        adquisicion: '',
        motor: '',
        chasis: '',
        titulo: '',
        estado: 'DISPONIBLE',
        responsable: '',
        ministerio: '',
        precio: '',
        // Datos del seguro
        compania: '',
        nroPoliza: '',
        vencimiento: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Si se proporciona un vehículo existente, cargar sus datos
    useEffect(() => {
        if (vehicle) {
            setForm({
                nroInterno: vehicle.nro_interno || '',
                patente: vehicle.patente || '',
                marca: vehicle.marca || '',
                modelo: vehicle.modelo || '',
                designacion: vehicle.designacion || '',
                adquisicion: vehicle.fecha_adquisicion || '',
                motor: vehicle.nro_motor || '',
                chasis: vehicle.nro_chasis || '',
                titulo: vehicle.titulo || '',
                estado: vehicle.estado || 'DISPONIBLE',
                responsable: vehicle.responsable || '',
                ministerio: vehicle.ministerio || '',
                precio: vehicle.precio || '',
                // Datos del seguro
                compania: vehicle.compania || '',
                nroPoliza: vehicle.nro_poliza || '',
                vencimiento: vehicle.fecha_vencimiento || ''
            });
        }
    }, [vehicle]);

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
    };

    const validate = () => {
        const newErrors = {};

        // Validaciones básicas
        if (!form.nroInterno) newErrors.nroInterno = 'Número interno es requerido';
        if (!form.patente) newErrors.patente = 'Patente es requerida';
        if (!form.marca) newErrors.marca = 'Marca es requerida';
        if (!form.modelo) newErrors.modelo = 'Modelo es requerido';
        if (!form.motor) newErrors.motor = 'Número de motor es requerido';
        if (!form.chasis) newErrors.chasis = 'Número de chasis es requerido';

        // Validar formato de patente (ejemplo simple)
        const patenteRegex = /^[A-Z0-9]{6,7}$/;
        if (form.patente && !patenteRegex.test(form.patente)) {
            newErrors.patente = 'Formato de patente inválido';
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

            if (vehicle) {
                // Actualizar vehículo existente
                result = await vehicleService.updateVehicle(vehicle.id, form);
            } else {
                // Crear nuevo vehículo
                result = await vehicleService.createVehicle(form);
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
                    alert(result.msg || 'Error al guardar el vehículo');
                }
            }
        } catch (error) {
            console.error('Error al guardar vehículo:', error);
            alert('Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    id="nroInterno"
                    name="nroInterno"
                    label="Número Interno"
                    value={form.nroInterno}
                    onChange={handleChange}
                    error={errors.nroInterno}
                    required
                />

                <Input
                    id="patente"
                    name="patente"
                    label="Patente"
                    value={form.patente}
                    onChange={handleChange}
                    error={errors.patente}
                    required
                />

                <Input
                    id="designacion"
                    name="designacion"
                    label="Designación"
                    value={form.designacion}
                    onChange={handleChange}
                    error={errors.designacion}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    id="marca"
                    name="marca"
                    label="Marca"
                    value={form.marca}
                    onChange={handleChange}
                    error={errors.marca}
                    required
                />

                <Input
                    id="modelo"
                    name="modelo"
                    label="Modelo"
                    value={form.modelo}
                    onChange={handleChange}
                    error={errors.modelo}
                    required
                />

                <Input
                    id="adquisicion"
                    name="adquisicion"
                    label="Fecha Adquisición"
                    type="date"
                    value={form.adquisicion}
                    onChange={handleChange}
                    error={errors.adquisicion}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    id="motor"
                    name="motor"
                    label="Número de Motor"
                    value={form.motor}
                    onChange={handleChange}
                    error={errors.motor}
                    required
                />

                <Input
                    id="chasis"
                    name="chasis"
                    label="Número de Chasis"
                    value={form.chasis}
                    onChange={handleChange}
                    error={errors.chasis}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                        Estado <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="estado"
                        name="estado"
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        value={form.estado}
                        onChange={handleChange}
                        required
                    >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="ALQUILADA">Alquilada</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                        <option value="BAJA">Baja</option>
                    </select>
                    {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
                </div>

                <Input
                    id="titulo"
                    name="titulo"
                    label="Título"
                    value={form.titulo}
                    onChange={handleChange}
                    error={errors.titulo}
                />

                <Input
                    id="precio"
                    name="precio"
                    label="Precio"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.precio}
                    onChange={handleChange}
                    error={errors.precio}
                />
            </div>

            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Información del Seguro</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    id="compania"
                    name="compania"
                    label="Compañía Aseguradora"
                    value={form.compania}
                    onChange={handleChange}
                    error={errors.compania}
                />

                <Input
                    id="nroPoliza"
                    name="nroPoliza"
                    label="Número de Póliza"
                    value={form.nroPoliza}
                    onChange={handleChange}
                    error={errors.nroPoliza}
                />

                <Input
                    id="vencimiento"
                    name="vencimiento"
                    label="Fecha de Vencimiento"
                    type="date"
                    value={form.vencimiento}
                    onChange={handleChange}
                    error={errors.vencimiento}
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
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
                    {vehicle ? 'Actualizar' : 'Guardar'} Vehículo
                </Button>
            </div>
        </form>
    );
}