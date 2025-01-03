import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Aboutbutton = () => {
  const navigate = useNavigate();
  const imageRef = useRef([]);
  const [image, setImage] = useState({ imageId: 0 });
  const { imageId } = image;
  const slideDuration = 3.5;

  const slides = [
    "assets/images/roof_slideshow/i1.jpeg",
    "assets/images/roof_slideshow/i2.jpeg",
    "assets/images/roof_slideshow/i3.jpeg",
    "assets/images/roof_slideshow/i4.jpeg",
    "assets/images/roof_slideshow/i5.jpeg",
    "assets/images/roof_slideshow/i6.jpeg",
    "assets/images/roof_slideshow/i7.webp",
    "assets/images/roof_slideshow/i8.webp",
    "assets/images/roof_slideshow/i9.jpeg",
    "assets/images/roof_slideshow/i10.webp",
    "assets/images/roof_slideshow/i11.jpeg",
    "assets/images/roof_slideshow/i12.webp",
  ];

  const duplicatedSlides = [...slides, ...slides];

  useEffect(() => {
    gsap.to("#slider", {
      transform: `translateX(${-50 * imageId}%)`,
      duration: slideDuration,
      ease: "power2.inOut",
      onComplete: () => {
        if (imageId === slides.length) {
          gsap.set("#slider", { transform: `translateX(0%)` });
          setImage({ imageId: 0 });
        }
      },
    });
  }, [imageId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImage((prev) => ({
        ...prev,
        imageId: prev.imageId + 1,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    // Navigate to the "/about" route
    navigate("/about");
  };

  return (
    <div className="bg-white z-40">
      <div className="relative overflow-hidden z-30">
        {/* Fixed Centered Button */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
          <button
            className="text-white text-xl md:text-3xl font-semibold px-4 py-2 md:px-8 md:py-4 rounded-lg shadow-lg dark_button hover:bg-gray-600"
            onClick={handleClick} // Navigate to /about
          >
            <div>About Us</div>
          </button>
        </div>

        {/* Image Carousel */}
        <div className="flex" id="slider">
          {duplicatedSlides.map((src, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="relative sm:w-[70vw] w-[88vw] md:h-[20vh] sm:h-[20vh] h-[15vh]">
                <div className="flex items-center justify-center overflow-hidden w-full h-full relative">
                  <img
                    src={src}
                    alt={`Slide ${i}`}
                    className="w-full h-full object-cover pointer-events-none"
                    ref={(el) => (imageRef.current[i] = el)}
                  />
                  {/* Grey Overlay */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Aboutbutton;
