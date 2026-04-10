import React from 'react';

export interface ButtonProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    onClick,
}) => {
    const baseStyles = 'px-4 py-2 rounded font-semibold transition-colors';
    const variantStyles = {
        primary: 'bg-blue-500 text-white hover:bg-blue-600',
        secondary: 'bg-gray-500 text-white hover:bg-gray-600',
        danger: 'bg-red-500 text-white hover:bg-red-600',
    };
    const sizeStyles = {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-4 py-2',
        lg: 'text-lg px-6 py-3',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export interface InputProps {
    placeholder?: string;
    type?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export const Input: React.FC<InputProps> = ({
    placeholder,
    type = 'text',
    value,
    onChange,
}) => {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
        />
    );
};

export interface ModalProps {
    isOpen: boolean;
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
