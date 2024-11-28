import React from 'react';

const MainImg = () => {
  return (
    <div className="relative md:h-[0vh] h-[50vh] flex items-center pt-12 md:pt-0">
      {/* Image Container - Visible on small screens, hidden on md and larger */}
      <div className="block md:hidden">
        <img
          src="/assets/images/main_img.jpg"
          alt="Main Display"
          className="h-auto w-full"
        />
      </div>

      {/* Bottom Triangle (White) */}
      <div
        className="absolute bottom-0 left-0 w-full h-[10vh] md:h-[0vh] bg-white"
        style={{
          clipPath: 'polygon(50% 0%, 0 100%, 100% 100%)',
        }}
      ></div>
    </div>
  );
};

export default MainImg;
