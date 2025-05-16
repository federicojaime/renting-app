import React from 'react';

export default function Footer() {
    return (
        <footer className="mt-8 py-4 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Renting All. Todos los derechos reservados.</p>
        </footer>
    );
}