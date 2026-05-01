/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'black';
  className?: string;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: 'bg-[#007AFF] text-white shadow-lg shadow-blue-100 hover:opacity-90 active:scale-95 disabled:opacity-50',
    secondary: 'bg-white text-gray-900 border border-black/5 shadow-sm hover:bg-gray-50 active:scale-95',
    ghost: 'bg-transparent text-gray-400 hover:text-gray-900',
    black: 'bg-black text-white hover:bg-gray-800 active:scale-95',
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
