import React from 'react';

const RoomImagePlaceholder = ({ className }) => {
  return (
    <div 
      className={`flex items-center justify-center bg-gray-100 border-2 border-gray-200 ${className}`}
      style={{ minHeight: '12rem' }}
    >
      <div className="text-center p-4">
        <div className="text-gray-400 mb-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="48" 
            height="48" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
        </div>
        <p className="text-gray-500 font-medium">Gambar Tidak Tersedia</p>
      </div>
    </div>
  );
};

export default RoomImagePlaceholder;
