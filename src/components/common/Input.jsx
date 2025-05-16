import React from 'react';

export default function Input({
    id,
    name,
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    error = null,
    icon = null,
    className = '',
    required = false,
    ...props
}) {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {icon}
                    </div>
                )}

                <input
                    id={id}
                    name={name}
                    type={type}
                    className={`${icon ? 'pl-10' : 'pl-4'
                        } pr-4 py-2 block w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${error ? 'border-red-300' : 'border-gray-300'
                        }`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}