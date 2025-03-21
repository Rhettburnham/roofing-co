// LoadingScreen.jsx
import React, { memo } from "react";

// Using a memo to prevent unnecessary re-renders of the loading screen
const LoadingScreen = memo(() => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Simple CSS spinner instead of video for better performance */}
        <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 font-medium">Loading content...</p>
      </div>
    </div>
  );
});

// Display name for debugging
LoadingScreen.displayName = "LoadingScreen";

export default LoadingScreen;
