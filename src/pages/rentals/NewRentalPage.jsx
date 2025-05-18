// src/pages/rentals/NewRentalPage.jsx
import React from 'react';
import Layout from '../../components/layout/Layout';
import RentalForm from '../../components/rentals/RentalForm';
import { useNavigate } from 'react-router-dom';
import { rentalService } from '../../services/rental-service';
import toast from 'react-hot-toast';

export default function NewRentalPage() {
    const navigate = useNavigate();

    const handleSubmit = async (rentalData) => {
        try {
            const result = await rentalService.createRental(rentalData);
            if (result.ok) {
                toast.success('Alquiler creado exitosamente');
                navigate(`/rentals/${result.data.id}`);
            } else {
                toast.error(result.msg || 'Error al crear el alquiler');
            }
        } catch (error) {
            console.error('Error al crear alquiler:', error);
            toast.error('Error de conexión al crear el alquiler');
        }
    };

    const handleCancel = () => {
        navigate('/rentals');
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Nuevo Alquiler</h1>
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="p-6">
                        <RentalForm onSubmit={handleSubmit} onCancel={handleCancel} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}