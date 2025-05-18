import React from 'react';

export default function StatsCard({ title, value, icon, change, color = 'blue' }) {
    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        amber: 'bg-amber-500',
        purple: 'bg-purple-500'
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
                <div className={`${colorClasses[color]} p-3 rounded-full`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                    <p className="text-2xl font-semibold mt-1">{value}</p>

                    {/** 
                    {change && (
                        <div className={`flex items-center mt-1 ${change > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                            <span className="text-xs font-medium">
                                {change > 0 ? '+' : ''}{change}%
                            </span>
                            <span className="text-xs ml-1">vs. mes anterior</span>
                        </div>
                    )}*/}
                </div>
            </div>
        </div>
    );
}