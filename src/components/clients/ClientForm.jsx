import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/client-service';
import Button from '../common/Button';
import Input from '../common/Input';
import { Save, X } from 'lucide-react';

export default function ClientForm({ client = null, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        tipoCliente: 'persona',
        nombre: '',
        razonSocial: '',
        dniCuit: '',
        telefono: '',
        email: ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Si se proporciona un cliente existente, cargar sus datos
    useEffect(() => {
        if (client) {
            setForm({
                tipoCliente: client.tipo_cliente || 'persona',
                nombre: client.nombre || '',
                razonSocial: client.razon_social || '',
                dniCuit: client.dni_cuit || '',
                telefono: client.telefono || '',
                email: client.email || ''
            });
        }
    }, [client]);

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

        // Validaciones según tipo de cliente
        if (form.tipoCliente === 'persona') {
            if (!form.nombre) newErrors.nombre = 'Nombre es requerido';
        } else {
            if (!form.razonSocial) newErrors.razonSocial = 'Razón social es requerida';
        }

        if (!form.dniCuit) newErrors.dniCuit = 'DNI/CUIT es requerido';
        if (!form.telefono) newErrors.telefono = 'Teléfono es requerido';

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (form.email && !emailRegex.test(form.email)) {
            newErrors.email = 'Formato de email inválido';
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

            if (client) {
                // Actualizar cliente existente
                result = await clientService.updateClient(client.id, form);
            } else {
                // Crear nuevo cliente
                result = await clientService.createClient(form);
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
                    alert(result.msg || 'Error al guardar el cliente');
                }
            }
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            alert('Error de conexión. Intente nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border mb-6">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <input
                            id="tipoPersona"
                            name="tipoCliente"
                            type="radio"
                            value="persona"
                            checked={form.tipoCliente === 'persona'}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="tipoPersona" className="ml-2 block text-sm font-medium text-gray-700">
                            Persona Física
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="tipoEmpresa"
                            name="tipoCliente"
                            type="radio"
                            value="empresa"
                            checked={form.tipoCliente === 'empresa'}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <label htmlFor="tipoEmpresa" className="ml-2 block text-sm font-medium text-gray-700">
                            Empresa
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.tipoCliente === 'persona' ? (
                    <Input
                        id="nombre"
                        name="nombre"
                        label="Nombre Completo"
                        value={form.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        required
                    />
                ) : (
                    <Input
                        id="razonSocial"
                        name="razonSocial"
                        label="Razón Social"
                        value={form.razonSocial}
                        onChange={handleChange}
                        error={errors.razonSocial}
                        required
                    />
                )}

                <Input
                    id="dniCuit"
                    name="dniCuit"
                    label={form.tipoCliente === 'persona' ? 'DNI' : 'CUIT'}
                    value={form.dniCuit}
                    onChange={handleChange}
                    error={errors.dniCuit}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    id="telefono"
                    name="telefono"
                    label="Teléfono"
                    value={form.telefono}
                    onChange={handleChange}
                    error={errors.telefono}
                    required
                />

                <Input
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
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
                    {client ? 'Actualizar' : 'Guardar'} Cliente
                </Button>
            </div>
        </form>
    );
}