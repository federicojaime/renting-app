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

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  if (!isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        
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
            localStorage.getItem('token') !== null ? 
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
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
    </BrowserRouter>
  );
}