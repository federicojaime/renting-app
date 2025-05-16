// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VehiclesPage from './pages/vehicles/VehiclesPage';
import VehicleDetailPage from './pages/vehicles/VehicleDetailPage';
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import RentalsPage from './pages/rentals/RentalsPage';
import RentalDetailPage from './pages/rentals/RentalDetailPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { Toaster } from 'react-hot-toast';
import { authService } from './services/auth-service';

// Componente para proteger rutas - simplificado
const ProtectedRoute = ({ children }) => {
  // Verificar la autenticación
  const isAuthenticated = authService.isAuthenticated();
  console.log('¿Está autenticado?', isAuthenticated);

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    console.log('No autenticado, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el contenido
  console.log('Autenticado, mostrando ruta protegida');
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={
            authService.isAuthenticated() ?
              <Navigate to="/dashboard" replace /> :
              <LoginPage />
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <VehiclesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vehicles/:id"
          element={
            <ProtectedRoute>
              <VehicleDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute>
              <ClientDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rentals"
          element={
            <ProtectedRoute>
              <RentalsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rentals/:id"
          element={
            <ProtectedRoute>
              <RentalDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto - redirige a dashboard si está autenticado, o a login si no */}
        <Route
          path="/"
          element={
            authService.isAuthenticated() ?
              <Navigate to="/dashboard" replace /> :
              <Navigate to="/login" replace />
          }
        />

        {/* Ruta de página no encontrada */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Sistema de notificaciones */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </BrowserRouter>
  );
}