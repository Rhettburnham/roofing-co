import React from 'react';

const MainImg = () => {
  return (
    <div className="relative md:h-[0vh] h-[40vh] flex items-center pt-3 md:pt-0">
      {/* Image Container - Visible on small screens, hidden on md and larger */}
      <div className="block md:hidden relative">
        <img
          src="/assets/images/main_img.jpg"
          alt="Main Display"
          className="h-auto w-full"
        />

        {/* Bottom Triangle (White) */}
        <div
          className="absolute bottom-0 left-0 w-full h-[12vh] bg-white"
          style={{
            clipPath: 'polygon(50% 0%, 0 100%, 100% 100%)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default MainImg;
