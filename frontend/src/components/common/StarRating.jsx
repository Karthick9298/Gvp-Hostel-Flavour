import React, { useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarRating = ({ 
  rating = 0, 
  onChange, 
  size = 'md', 
  readonly = false,
  showValue = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const handleClick = (value) => {
    if (!readonly && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = currentRating >= value;
          
          return (
            <button
              key={value}
              type="button"
              className={`
                ${sizeClasses[size]}
                transition-all duration-200 transform
                ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
                ${!readonly && 'active:scale-95'}
                focus:outline-none
              `}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              {isFilled ? (
                <FaStar 
                  className={`
                    ${readonly ? 'text-accent-500' : 'text-accent-400'}
                    drop-shadow-[0_0_8px_rgba(251,177,47,0.5)]
                    ${!readonly && hoverRating >= value && 'animate-pulse'}
                  `}
                />
              ) : (
                <FaRegStar 
                  className={`
                    ${readonly ? 'text-navy-600' : 'text-navy-500'}
                    ${!readonly && 'hover:text-accent-400/50'}
                  `}
                />
              )}
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-base font-semibold text-accent-400 bg-navy-800/50 px-3 py-1 rounded-full border border-accent-500/30">
          {currentRating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
