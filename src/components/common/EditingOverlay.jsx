import React from 'react';

const EditingOverlay = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-lg">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/30 animate-pulse-glow"></div>
      <div 
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500/30 animate-pulse-glow"
        style={{ animationDelay: '0.3s' }}
      ></div>
    </div>
  );
};

export default EditingOverlay; 