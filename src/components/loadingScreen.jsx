// LoadingScreen.jsx
import React from "react";

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="relative" style={{ width: "20vh", height: "20vh" }}>
        <video
          src="/assets/videos/our_process_videos/repair.mp4"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.1)" }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
