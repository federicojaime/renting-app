import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Car, Users, FileText, BarChart2, Settings, LogOut } from 'lucide-react';
import { authService } from '../../services/auth-service';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
    const navigate = useNavigate();
    const user = authService.getUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const menuItems = [
        { to: '/dashboard', icon: <Home size={20} />, text: 'Dashboard' },
        { to: '/vehicles', icon: <Car size={20} />, text: 'Vehículos' },
        { to: '/clients', icon: <Users size={20} />, text: 'Clientes' },
        { to: '/rentals', icon: <FileText size={20} />, text: 'Alquileres' },
        { to: '/reports', icon: <BarChart2 size={20} />, text: 'Reportes' },
        { to: '/settings', icon: <Settings size={20} />, text: 'Configuración' }
    ];

    return (
        <div className="w-64 bg-white shadow-lg">
            <div className="p-4">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-sm rounded-md ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`
                            }
                        >
                            <span className="mr-3">{item.icon}</span>
                            {item.text}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 mt-auto border-t">
                <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full"
                >
                    <LogOut size={20} className="mr-3" />
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}