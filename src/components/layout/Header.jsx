// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Bell, Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth-service';
import Button from '../common/Button';

export default function Header() {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const user = authService.getUser();

    const toggleUserMenu = () => {
        setShowUserMenu(!showUserMenu);
        if (showNotifications) setShowNotifications(false);
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
        if (showUserMenu) setShowUserMenu(false);
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="flex justify-between items-center px-6 py-4">
                {/* Logo y título */}
                <div className="flex items-center">
                    <button
                        className="md:hidden text-gray-500 mr-3"
                        onClick={toggleMobileMenu}
                    >
                        <Menu size={24} />
                    </button>
                    <Link to="/dashboard" className="flex items-center">
                        <img
                            src="/assets/logo-horizontal.png"
                            alt="Logo"
                            className="h-10 w-auto mr-3"
                        />
                    </Link>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center space-x-4">
                    {/* Botón de notificaciones */}
                    <div className="relative">
                        <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative"
                            onClick={toggleNotifications}
                        >
                            <Bell size={22} />
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>

                        {/* Panel de notificaciones */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-20 border border-gray-100">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                    <h3 className="text-sm font-medium text-gray-700">Notificaciones</h3>
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    <div className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition duration-150">
                                        <p className="text-sm font-medium text-gray-900">Alquiler finalizado</p>
                                        <p className="text-xs text-gray-500 mt-1">Se ha finalizado el alquiler del vehículo Toyota Corolla.</p>
                                        <p className="text-xs text-gray-400 mt-1">Hace 2 horas</p>
                                    </div>
                                    <div className="px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition duration-150">
                                        <p className="text-sm font-medium text-gray-900">Nuevo cliente registrado</p>
                                        <p className="text-xs text-gray-500 mt-1">Juan Pérez se ha registrado como nuevo cliente.</p>
                                        <p className="text-xs text-gray-400 mt-1">Ayer</p>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition duration-150">
                                        <p className="text-sm font-medium text-gray-900">Mantenimiento programado</p>
                                        <p className="text-xs text-gray-500 mt-1">Vehículo Ford Focus requiere mantenimiento.</p>
                                        <p className="text-xs text-gray-400 mt-1">Hace 2 días</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                                        Ver todas las notificaciones
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Menú de usuario */}
                    <div className="relative">
                        <button
                            className="flex items-center text-sm focus:outline-none"
                            onClick={toggleUserMenu}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {user?.firstname?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block ml-3 text-left">
                                <div className="text-sm font-medium text-gray-700">
                                    {user?.firstname} {user?.lastname}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Administrador
                                </div>
                            </div>
                        </button>

                        {/* Menú desplegable de usuario */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-1 z-20 border border-gray-100">
                                <Link
                                    to="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Tu Perfil
                                </Link>
                                <Link
                                    to="/settings"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Configuración
                                </Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => {
                                        authService.logout();
                                        window.location.href = '/login';
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                >
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Menú móvil - visible solo cuando se hace clic en el botón de menú en pantallas pequeñas */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-gray-200 bg-gray-50 py-2 px-4 space-y-1">
                    <Link
                        to="/dashboard"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/vehicles"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Vehículos
                    </Link>
                    <Link
                        to="/clients"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Clientes
                    </Link>
                    <Link
                        to="/rentals"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Alquileres
                    </Link>
                    <Link
                        to="/reports"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Reportes
                    </Link>
                    <Link
                        to="/settings"
                        className="block py-2 px-3 rounded-md hover:bg-gray-100 text-sm font-medium"
                    >
                        Configuración
                    </Link>
                </div>
            )}
        </header>
    );
}