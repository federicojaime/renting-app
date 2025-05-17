import React, { useState, useEffect } from 'react';
import { Calendar, Shield, X, Save, ChevronDown } from 'lucide-react';

// Componente de input personalizado para unificar el estilo
const FormInput = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    error,
    required = false,
    className = '',
    placeholder = '',
    min,
    step,
    icon
}) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${icon ? 'pr-10' : ''} ${className}`}
                placeholder={placeholder}
                required={required}
                min={min}
                step={step}
            />
            {icon && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
                    {icon}
                </div>
            )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default function VehicleForm({ vehicle = null, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        nroInterno: '',
        patente: '',
        designacion: '',
        marca: '',
        modelo: '',
        adquisicion: '',
        motor: '',
        chasis: '',
        titulo: '',
        estado: 'DISPONIBLE',
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
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validate = () => {
        const newErrors = {};

        // Validaciones para campos requeridos según la API
        if (!form.nroInterno) newErrors.nroInterno = 'Número interno es requerido';
        if (!form.patente) newErrors.patente = 'Patente es requerida';
        if (!form.marca) newErrors.marca = 'Marca es requerida';
        if (!form.modelo) newErrors.modelo = 'Modelo es requerido';
        if (!form.adquisicion) newErrors.adquisicion = 'Fecha de adquisición es requerida';
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
            // Mapear datos del formulario al formato esperado por la API
            const vehicleData = {
                nroInterno: form.nroInterno,
                patente: form.patente,
                marca: form.marca,
                modelo: form.modelo,
                designacion: form.designacion,
                adquisicion: form.adquisicion,
                motor: form.motor,
                chasis: form.chasis,
                titulo: form.titulo,
                estado: form.estado,
                responsable: form.responsable || '',
                ministerio: form.ministerio || '',
                precio: form.precio,
                compania: form.compania,
                nroPoliza: form.nroPoliza,
                vencimiento: form.vencimiento
            };

            // Si el vehículo ya existe, preservar su ID
            if (vehicle && vehicle.id) {
                vehicleData.id = vehicle.id;
            }

            onSubmit(vehicleData);
        } catch (error) {
            console.error('Error al procesar formulario:', error);
            toast.error('Error al procesar el formulario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                        label="Número Interno"
                        name="nroInterno"
                        value={form.nroInterno}
                        onChange={handleChange}
                        error={errors.nroInterno}
                        required
                    />

                    <FormInput
                        label="Patente"
                        name="patente"
                        value={form.patente}
                        onChange={handleChange}
                        error={errors.patente}
                        required
                        className="uppercase"
                    />

                    <FormInput
                        label="Designación"
                        name="designacion"
                        value={form.designacion}
                        onChange={handleChange}
                        error={errors.designacion}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                    <FormInput
                        label="Marca"
                        name="marca"
                        value={form.marca}
                        onChange={handleChange}
                        error={errors.marca}
                        required
                    />

                    <FormInput
                        label="Modelo"
                        name="modelo"
                        value={form.modelo}
                        onChange={handleChange}
                        error={errors.modelo}
                        required
                    />

                    <FormInput
                        label="Fecha Adquisición"
                        name="adquisicion"
                        value={form.adquisicion}
                        onChange={handleChange}
                        type="date"
                        icon={<Calendar size={18} />}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                    <FormInput
                        label="Número de Motor"
                        name="motor"
                        value={form.motor}
                        onChange={handleChange}
                        error={errors.motor}
                        required
                    />

                    <FormInput
                        label="Número de Chasis"
                        name="chasis"
                        value={form.chasis}
                        onChange={handleChange}
                        error={errors.chasis}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                    {/* Custom select para Estado */}
                    <div className="space-y-2">
                        <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                            Estado<span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                            <select
                                id="estado"
                                name="estado"
                                value={form.estado}
                                onChange={handleChange}
                                className="w-full pl-3 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                <option value="DISPONIBLE">Disponible</option>
                                <option value="ALQUILADA">Alquilada</option>
                                <option value="MANTENIMIENTO">Mantenimiento</option>
                                <option value="BAJA">Baja</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <ChevronDown size={18} />
                            </div>
                        </div>
                        {errors.estado && <p className="mt-1 text-sm text-red-600">{errors.estado}</p>}
                    </div>

                    <FormInput
                        label="Título"
                        name="titulo"
                        value={form.titulo}
                        onChange={handleChange}
                    />

                    <FormInput
                        label="Precio"
                        name="precio"
                        value={form.precio}
                        onChange={handleChange}
                        type="number"
                        min={0}
                        step="0.01"
                    />
                </div>
            </div>

            {/* Sección de información del seguro */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
                <div className="flex items-center mb-4">
                    <Shield size={20} className="text-indigo-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-800">Información del Seguro</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <FormInput
                        label="Compañía Aseguradora"
                        name="compania"
                        value={form.compania}
                        onChange={handleChange}
                    />

                    <FormInput
                        label="Número de Póliza"
                        name="nroPoliza"
                        value={form.nroPoliza}
                        onChange={handleChange}
                    />

                    <FormInput
                        label="Fecha de Vencimiento"
                        name="vencimiento"
                        value={form.vencimiento}
                        onChange={handleChange}
                        type="date"
                        icon={<Calendar size={18} />}
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                    <X size={18} className="mr-2" />
                    Cancelar
                </button>

                <button
                    type="submit"
                    className={`flex items-center px-5 py-2.5 rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save size={18} className="mr-2" />
                            {vehicle ? 'Actualizar' : 'Guardar'} Vehículo
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}