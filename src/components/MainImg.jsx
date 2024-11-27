import React from 'react';

const MainImg = () => {
  return (
    <div className="relative w-full min-w-screen-lg md:h-40[vh]">
      {/* Square Image */}
      <div className="relative w-full">
        <img
          src="/assets/images/main_img.jpg"
          alt="Main"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Bottom Triangle (White) */}
      <div
        className="absolute bottom-0 left-0 w-full h-[10vh] md:h-[20vh] bg-white"
        style={{
          clipPath: 'polygon(50% 0%, 0 100%, 100% 100%)',
        }}
      ></div>
    </div>
  );
};

export default MainImg;