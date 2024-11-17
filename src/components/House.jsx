import React, { useEffect } from "react";

const SplineViewer = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
    "https://unpkg.com/@splinetool/viewer@1.9.23/build/spline-viewer.js"
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <spline-viewer url="https://prod.spline.design/BYarvlN3rYWWl9H4/scene.splinecode"></spline-viewer>
  );
};

export default SplineViewer;


