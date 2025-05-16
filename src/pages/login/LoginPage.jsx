// src/pages/login/LoginPage.jsx
import React, { useEffect, useState } from 'react';
import LoginForm from '../../components/login/LoginForm';
import logo from '../../assets/images/logo.png';
import bgImage from '../../assets/images/imagen_fondo.jpg';

export default function LoginPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Efecto de carga suave
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative">
      {/* Imagen de fondo con efecto parallax sutil */}
      <div
        className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000 ease-linear"
        style={{
          backgroundImage: `url(${bgImage})`,
          transform: 'scale(1.05)',
          transition: 'transform 30s ease-in-out',
          filter: 'brightness(0.85) contrast(1.1)'
        }}
      ></div>

      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/40"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 h-screen flex items-center justify-center px-4">
        <div
          className={`max-w-md w-full transition-all duration-700 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          {/* Logo centrado */}
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Renting All" className="h-24 w-auto" />
          </div>

          {/* Panel de login */}
          <div className="bg-white/95 rounded-xl shadow-2xl overflow-hidden">
            {/* Header azul */}
            <div className="bg-blue-600 py-4 px-6">
              <h1 className="text-xl font-medium text-white text-center">Sistema de Alquiler</h1>
            </div>

            {/* Formulario */}
            <div className="p-6">
              <LoginForm />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-white/80 text-sm">
            <p>© {new Date().getFullYear()} Renting All. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}