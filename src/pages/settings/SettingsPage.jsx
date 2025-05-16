import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import { Save, Users, Shield, Bell, Database, RefreshCw, HelpCircle, Mail } from 'lucide-react';
import { authService } from '../../services/auth-service';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('perfil');
    const [loading, setLoading] = useState(false);
    const [formProfile, setFormProfile] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phone: ''
    });
    const [formPassword, setFormPassword] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [formNotifications, setFormNotifications] = useState({
        emailAlerts: true,
        rentalReminders: true,
        maintenanceAlerts: true,
        systemUpdates: false
    });
    const [formAppearance, setFormAppearance] = useState({
        theme: 'light',
        densidad: 'normal',
        fontSize: 'medium'
    });
    const [showBackupModal, setShowBackupModal] = useState(false);
    const [backupInProgress, setBackupInProgress] = useState(false);

    useEffect(() => {
        // Cargar datos del usuario actual
        const user = authService.getUser();
        if (user) {
            setFormProfile({
                firstname: user.firstname || '',
                lastname: user.lastname || '',
                email: user.email || '',
                phone: user.phone || ''
            });
        }
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setFormProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setFormPassword(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target;
        setFormNotifications(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleAppearanceChange = (name, value) => {
        setFormAppearance(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulación de actualización de perfil
            await new Promise(resolve => setTimeout(resolve, 800));

            // Actualizar usuario en localStorage (en producción, esto sería una llamada a la API)
            const currentUser = authService.getUser();
            const updatedUser = { ...currentUser, ...formProfile };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            toast.error('Error al actualizar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Validar que las contraseñas coincidan
        if (formPassword.newPassword !== formPassword.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        // Validar longitud mínima
        if (formPassword.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            // Simulación de actualización de contraseña
            await new Promise(resolve => setTimeout(resolve, 800));

            // Resetear formulario
            setFormPassword({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });

            toast.success('Contraseña actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar contraseña:', error);
            toast.error('Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulación de guardado de preferencias
            await new Promise(resolve => setTimeout(resolve, 600));

            toast.success('Preferencias de notificaciones guardadas');
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            toast.error('Error al guardar las preferencias');
        } finally {
            setLoading(false);
        }
    };

    const handleAppearanceSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Simulación de guardado de preferencias
            await new Promise(resolve => setTimeout(resolve, 600));

            toast.success('Preferencias de apariencia guardadas');
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            toast.error('Error al guardar las preferencias');
        } finally {
            setLoading(false);
        }
    };

    const handleBackup = async () => {
        setBackupInProgress(true);

        try {
            // Simulación de proceso de backup
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.success('Copia de seguridad creada correctamente');
            setShowBackupModal(false);
        } catch (error) {
            console.error('Error al crear copia de seguridad:', error);
            toast.error('Error al crear la copia de seguridad');
        } finally {
            setBackupInProgress(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {/* Pestañas de navegación */}
                    <div className="flex border-b">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'perfil'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('perfil')}
                        >
                            <Users size={16} className="inline mr-2" />
                            Perfil
                        </button>

                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'seguridad'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('seguridad')}
                        >
                            <Shield size={16} className="inline mr-2" />
                            Seguridad
                        </button>

                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'notificaciones'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('notificaciones')}
                        >
                            <Bell size={16} className="inline mr-2" />
                            Notificaciones
                        </button>

                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'apariencia'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('apariencia')}
                        >
                            <HelpCircle size={16} className="inline mr-2" />
                            Apariencia
                        </button>

                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'sistema'
                                    ? 'text-blue-600 border-b-2 border-blue-500'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('sistema')}
                        >
                            <Database size={16} className="inline mr-2" />
                            Sistema
                        </button>
                    </div>

                    {/* Contenido de las pestañas */}
                    <div className="p-6">
                        {/* Pestaña de Perfil */}
                        {activeTab === 'perfil' && (
                            <form onSubmit={handleProfileSubmit} className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
                                        {formProfile.firstname.charAt(0)}{formProfile.lastname.charAt(0)}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-medium">{formProfile.firstname} {formProfile.lastname}</h2>
                                        <p className="text-sm text-gray-500">{formProfile.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        id="firstname"
                                        name="firstname"
                                        label="Nombre"
                                        value={formProfile.firstname}
                                        onChange={handleProfileChange}
                                        required
                                    />

                                    <Input
                                        id="lastname"
                                        name="lastname"
                                        label="Apellido"
                                        value={formProfile.lastname}
                                        onChange={handleProfileChange}
                                        required
                                    />

                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        label="Email"
                                        value={formProfile.email}
                                        onChange={handleProfileChange}
                                        required
                                    />

                                    <Input
                                        id="phone"
                                        name="phone"
                                        label="Teléfono"
                                        value={formProfile.phone}
                                        onChange={handleProfileChange}
                                    />
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={loading}
                                        icon={<Save size={18} />}
                                    >
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Pestaña de Seguridad */}
                        {activeTab === 'seguridad' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                <h2 className="text-lg font-medium mb-4">Cambiar Contraseña</h2>

                                <div className="space-y-4">
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        label="Contraseña Actual"
                                        value={formPassword.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />

                                    <Input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        label="Nueva Contraseña"
                                        value={formPassword.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />

                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        label="Confirmar Contraseña"
                                        value={formPassword.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        La contraseña debe tener al menos 6 caracteres y contener letras y números.
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={loading}
                                        icon={<Save size={18} />}
                                    >
                                        Actualizar Contraseña
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Pestaña de Notificaciones */}
                        {activeTab === 'notificaciones' && (
                            <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                                <h2 className="text-lg font-medium mb-4">Preferencias de Notificaciones</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <h3 className="text-sm font-medium">Alertas por Email</h3>
                                            <p className="text-xs text-gray-500">Recibir notificaciones importantes por correo electrónico</p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="emailAlerts"
                                                name="emailAlerts"
                                                type="checkbox"
                                                checked={formNotifications.emailAlerts}
                                                onChange={handleNotificationChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <h3 className="text-sm font-medium">Recordatorios de Alquileres</h3>
                                            <p className="text-xs text-gray-500">Notificaciones sobre vencimientos de alquileres</p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="rentalReminders"
                                                name="rentalReminders"
                                                type="checkbox"
                                                checked={formNotifications.rentalReminders}
                                                onChange={handleNotificationChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <h3 className="text-sm font-medium">Alertas de Mantenimiento</h3>
                                            <p className="text-xs text-gray-500">Notificaciones sobre mantenimientos programados de vehículos</p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="maintenanceAlerts"
                                                name="maintenanceAlerts"
                                                type="checkbox"
                                                checked={formNotifications.maintenanceAlerts}
                                                onChange={handleNotificationChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between py-3 border-b">
                                        <div>
                                            <h3 className="text-sm font-medium">Actualizaciones del Sistema</h3>
                                            <p className="text-xs text-gray-500">Notificaciones sobre nuevas características y mejoras</p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="systemUpdates"
                                                name="systemUpdates"
                                                type="checkbox"
                                                checked={formNotifications.systemUpdates}
                                                onChange={handleNotificationChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={loading}
                                        icon={<Save size={18} />}
                                    >
                                        Guardar Preferencias
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Pestaña de Apariencia */}
                        {activeTab === 'apariencia' && (
                            <form onSubmit={handleAppearanceSubmit} className="space-y-6">
                                <h2 className="text-lg font-medium mb-4">Preferencias de Apariencia</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Tema</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.theme === 'light'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('theme', 'light')}
                                            >
                                                <div className="h-10 bg-white border mb-2"></div>
                                                <p className="text-sm font-medium">Claro</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.theme === 'dark'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('theme', 'dark')}
                                            >
                                                <div className="h-10 bg-gray-800 border mb-2"></div>
                                                <p className="text-sm font-medium">Oscuro</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.theme === 'system'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('theme', 'system')}
                                            >
                                                <div className="h-10 bg-gradient-to-r from-white to-gray-800 border mb-2"></div>
                                                <p className="text-sm font-medium">Sistema</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Densidad de Contenido</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.densidad === 'compacta'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('densidad', 'compacta')}
                                            >
                                                <p className="text-sm font-medium">Compacta</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.densidad === 'normal'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('densidad', 'normal')}
                                            >
                                                <p className="text-sm font-medium">Normal</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.densidad === 'amplia'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('densidad', 'amplia')}
                                            >
                                                <p className="text-sm font-medium">Amplia</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium mb-3">Tamaño de Fuente</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.fontSize === 'small'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('fontSize', 'small')}
                                            >
                                                <p className="text-xs font-medium">Pequeño</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.fontSize === 'medium'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('fontSize', 'medium')}
                                            >
                                                <p className="text-sm font-medium">Mediano</p>
                                            </div>

                                            <div
                                                className={`border rounded-lg p-4 cursor-pointer ${formAppearance.fontSize === 'large'
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                                onClick={() => handleAppearanceChange('fontSize', 'large')}
                                            >
                                                <p className="text-base font-medium">Grande</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        isLoading={loading}
                                        icon={<Save size={18} />}
                                    >
                                        Guardar Preferencias
                                    </Button>
                                </div>
                            </form>
                        )}

                        {/* Pestaña de Sistema */}
                        {activeTab === 'sistema' && (
                            <div className="space-y-6">
                                <h2 className="text-lg font-medium mb-4">Configuración del Sistema</h2>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-medium">Copia de Seguridad</h3>
                                                <p className="text-xs text-gray-500 mt-1">Crear una copia de seguridad de todos los datos del sistema</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                icon={<Database size={16} />}
                                                onClick={() => setShowBackupModal(true)}
                                            >
                                                Crear Backup
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-medium">Actualizar Sistema</h3>
                                                <p className="text-xs text-gray-500 mt-1">Buscar e instalar actualizaciones disponibles</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                icon={<RefreshCw size={16} />}
                                            >
                                                Buscar Actualizaciones
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-sm font-medium">Soporte Técnico</h3>
                                                <p className="text-xs text-gray-500 mt-1">Contactar con el equipo de soporte técnico</p>
                                            </div>

                                            <Button
                                                variant="outline"
                                                icon={<Mail size={16} />}
                                            >
                                                Contactar Soporte
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-6 border-t pt-4">
                                        <p className="text-sm text-gray-500">
                                            Versión del sistema: <span className="font-medium">1.0.0</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Copia de Seguridad */}
            <Modal
                isOpen={showBackupModal}
                onClose={() => !backupInProgress && setShowBackupModal(false)}
                title="Crear Copia de Seguridad"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Se creará una copia de seguridad completa de todos los datos del sistema. Este proceso puede tardar varios minutos dependiendo de la cantidad de información.
                    </p>

                    <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                            <strong>Nota:</strong> Durante el proceso de backup, algunas funciones del sistema podrían experimentar lentitud.
                        </p>
                    </div>

                    {backupInProgress && (
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-2/3"></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">Creando copia de seguridad...</p>
                        </div>
                    )}
                </div>

                <div className="mt-5 sm:mt-6 flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowBackupModal(false)}
                        disabled={backupInProgress}
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant="primary"
                        onClick={handleBackup}
                        isLoading={backupInProgress}
                        icon={<Database size={16} />}
                    >
                        Iniciar Backup
                    </Button>
                </div>
            </Modal>
        </Layout>
    );
}