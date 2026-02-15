import React from 'react';
import { FaUtensils } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullScreen = true }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Animated food icon */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className={`${sizeClasses[size]} relative`}>
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/30 border-t-primary-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-4 border-accent-500/30 border-b-accent-500 animate-spin-slow"></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <FaUtensils className="text-primary-400 text-2xl animate-pulse" />
          </div>
        </div>
      </div>

      {/* Loading text with gradient */}
      <div className="text-center space-y-2">
        <p className={`${textSizeClasses[size]} font-medium bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent`}>
          {text}
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-200"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce animation-delay-400"></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-primary-950 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/20 via-transparent to-transparent"></div>
        <div className="relative">
          {spinnerContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinnerContent}
    </div>
  );
};

export default LoadingSpinner;
