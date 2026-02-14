import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-navy-950">
      <div className={`spinner ${sizeClasses[size]} mb-4`}></div>
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
