// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth-service';

export function Dashboard() {
    const navigate = useNavigate();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-semibold">Sistema de Alquiler</span>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4">Hola, {user?.firstname || 'Usuario'}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
                <div className="bg-white shadow rounded-lg p-6">
                    <p>Bienvenido al sistema de alquiler de vehículos.</p>
                    <p className="mt-2">Desde aquí podrás gestionar vehículos, clientes y alquileres.</p>
                </div>
            </div>
        </div>
    );
}