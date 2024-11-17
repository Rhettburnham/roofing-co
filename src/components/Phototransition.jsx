import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const PhotoTransition = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showBlank, setShowBlank] = useState(false);
  const borderRefs = useRef([]);
  const overlayRef = useRef(null);

  // Array of image sources
  const images = [
    '/assets/images/roof_1.jpeg',
    '/assets/images/roof_2.jpeg',
    '/assets/images/roof_3.webp',
  ];

  useEffect(() => {
    const imageInterval = setInterval(() => {
      if (currentImage < images.length - 1) {
        setCurrentImage(prevImage => prevImage + 1);
      } else {
        setShowBlank(true); // Transition out the last image and show blank

        // Animate border bars using GSAP
        gsap.to(borderRefs.current[0], { duration: 1, y: '-100%' }); // Move top bar up
        gsap.to(borderRefs.current[1], { duration: 1, y: '100%' }); // Move bottom bar down
        gsap.to(borderRefs.current[2], { duration: 1, x: '-100%' }); // Move left bar left
        gsap.to(borderRefs.current[3], { duration: 1, x: '100%' }); // Move right bar right

        // Fade out the overlay after the bars finish moving
        gsap.to(overlayRef.current, { duration: 1, opacity: 0, delay: 1 });

        clearInterval(imageInterval); // Stop the interval
      }
    }, 1000); // Show each image for 1 second

    return () => clearInterval(imageInterval); // Cleanup interval on component unmount
  }, [currentImage]);

  return (
    <div className="relative w-screen h-[40vh] bg-white flex items-center justify-center overflow-hidden">
      {/* Gray overlay */}
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 w-full h-full bg-gray-500 opacity-80"
      />

      {/* Black border bars */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div
          ref={el => borderRefs.current[0] = el}
          className="absolute top-0 left-0 w-full h-[10%] bg-black"
        /> {/* Top bar */}
        <div
          ref={el => borderRefs.current[1] = el}
          className="absolute bottom-0 left-0 w-full h-[10%] bg-black"
        /> {/* Bottom bar */}
        <div
          ref={el => borderRefs.current[2] = el}
          className="absolute top-0 left-0 w-[10%] h-full bg-black"
        /> {/* Left bar */}
        <div
          ref={el => borderRefs.current[3] = el}
          className="absolute top-0 right-0 w-[10%] h-full bg-black"
        /> {/* Right bar */}
      </div>

      {!showBlank && (
        <img
          src={images[currentImage]}
          alt="Transitioning Photos"
          className="object-cover w-full h-full"
        />
      )}
    </div>
  );
};

export default PhotoTransition;
