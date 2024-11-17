import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger);

const RoofAssembly = () => {
  const roofRef = useRef([]);
  const wallsRef = useRef(null);

  useEffect(() => {
    gsap.from(roofRef.current, {
      y: -100,
      opacity: 0,
      stagger: 0.3,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: wallsRef.current,
        start: 'top center',
        toggleActions: 'play none none none',
      },
    });
  }, []);

  return (
    <div className="relative h-screen flex items-center justify-center bg-blue-100">
      {/* Walls */}
      <div
        ref={wallsRef}
        className="absolute bottom-20 w-3/4 h-48 bg-gray-300"
      >
        {/* Placeholder for walls */}
        <div className="h-full bg-gray-600 flex items-center justify-center text-white text-lg">
          Walls
        </div>
      </div>

      {/* Roof Framework */}
      <div className="absolute top-20 w-3/4 flex flex-col items-center">
        <div
          ref={(el) => (roofRef.current[0] = el)}
          className="w-full h-8 bg-brown-500"
          style={{ backgroundColor: '#8B4513' }}
        >
          {/* Roof Beam */}
          <div className="h-full bg-brown-700 flex items-center justify-center text-white">
            Roof Beam
          </div>
        </div>
        <div
          ref={(el) => (roofRef.current[1] = el)}
          className="w-full h-8 bg-brown-500 mt-4"
          style={{ backgroundColor: '#8B4513' }}
        >
          {/* Roof Truss 1 */}
          <div className="h-full bg-brown-700 flex items-center justify-center text-white">
            Roof Truss 1
          </div>
        </div>
        <div
          ref={(el) => (roofRef.current[2] = el)}
          className="w-full h-8 bg-brown-500 mt-4"
          style={{ backgroundColor: '#8B4513' }}
        >
          {/* Roof Truss 2 */}
          <div className="h-full bg-brown-700 flex items-center justify-center text-white">
            Roof Truss 2
          </div>
        </div>
        <div
          ref={(el) => (roofRef.current[3] = el)}
          className="w-full h-8 bg-brown-500 mt-4"
          style={{ backgroundColor: '#8B4513' }}
        >
          {/* Roof Truss 3 */}
          <div className="h-full bg-brown-700 flex items-center justify-center text-white">
            Roof Truss 3
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoofAssembly;
