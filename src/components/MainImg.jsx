import React from 'react';

const MainImg = () => {
  return (
    <div className="relative w-full max-w-screen-lg mx-auto">
      {/* Top Triangle (Faint Color) */}
      <div
        className="absolute top-0 left-0 w-full h-16 faint-color"
        style={{
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
        }}
      ></div>
      
      {/* Square Image */}
      <div className="relative w-full aspect-square">
        <img
          src="/assets/images/main_img.jpg"
          alt="Main"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom Triangle (White) */}
      <div
        className="absolute bottom-0 left-0 w-full h-16 bg-white"
        style={{
          clipPath: 'polygon(50% 0, 0 100%, 100% 100%)',
        }}
      ></div>
    </div>
  );
};

export default MainImg;

