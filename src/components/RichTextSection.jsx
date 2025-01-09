import React, { useState, useEffect, useRef } from "react";
import { Shield, Award, Clock, Home } from "lucide-react";
import Aboutbutton from "./About_button";

const overlayImages = [
  "assets/images/shake_img/1.png",
  "assets/images/shake_img/2.png",
  "assets/images/shake_img/3.png",
  "assets/images/shake_img/4.png",
];

const AnimatedFeatureCard = ({ icon: Icon, title, desc, index }) => {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Add staggered delay based on column position
          const delay = index * 0.2;
          entry.target.style.setProperty("--delay", `${delay}s`);
          entry.target.classList.add("animate-card-fall");

          // Set the overlay fade delay to match the card animation
          if (overlayRef.current) {
            overlayRef.current.style.setProperty(
              "--overlay-delay",
              `${delay + 0.8}s`
            );
          }

          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px 0% 0px",
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);

      const handleAnimationEnd = (e) => {
        if (e.animationName === "cardFall") {
          overlayRef.current?.classList.add("fade-overlay-out");
        }
      };

      cardRef.current.addEventListener("animationend", handleAnimationEnd);

      return () => {
        if (cardRef.current) {
          observer.unobserve(cardRef.current);
          cardRef.current.removeEventListener(
            "animationend",
            handleAnimationEnd
          );
        }
      };
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="relative items-center bg-white p-1 md:p-2 h-[25vw] md:h-[20vh] md:w-[20vh] w-[40vw] rounded-lg drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] overflow-hidden"
      style={{
        transform: "translateX(-100%) rotate3d(0, 0, 1, -90deg)",
        transformOrigin: "right center",
        opacity: "0",
        willChange: "transform, opacity",
      }}
    >
      {/* Top-right corner overlay (static image) */}
      <div
        className="absolute top-0 right-0 w-8 md:w-16 h-8 md:h-16 z-20"
        style={{
          backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
          backgroundPosition: "top right",
          backgroundRepeat: "no-repeat",
          backgroundSize: "auto",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        }}
      />

      {/* Full overlay that fades out after card anim */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-center bg-cover z-30"
        style={{
          backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
        }}
      />

      {/* Icon + Title + Description */}
      <Icon className="w-5 h-5 md:w-12 md:h-12 mb-1 md:mb-2 z-10" />

      <h3 className="text-[2vw] md:text-sm font-semibold text-gray-900 md:mb-1 relative z-10">
        {title}
      </h3>

      <p className="text-[1.8vw] md:text-xs text-gray-600 relative z-10">
        {desc}
      </p>
    </div>
  );
};

const RichTextSection = () => {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    "assets/images/Richtext/roof_workers.jpg",
    "assets/images/Richtext/roof_workers2.jpg",
    "assets/images/Richtext/roof_workers3.webp",
  ];

  return (
    <section className="bg-white">
      <style>
        {`
          @keyframes cardFall {
            0% {
              transform: translateX(-100%) rotate3d(0, 0, 1, -90deg);
              opacity: 0;
            }
            100% {
              transform: translateX(0) rotate3d(0, 0, 1, 0deg);
              opacity: 1;
            }
          }
          
          .animate-card-fall {
            animation: cardFall 0.8s ease-out forwards var(--delay, 0s);
          }

          @keyframes overlayFadeOut {
            0% {
              opacity: 1;
            }
            100% {
              opacity: 0;
              pointer-events: none;
            }
          }
          
          .fade-overlay-out {
            animation: overlayFadeOut 0.8s ease-out forwards var(--overlay-delay, 0s);
          }
        `}
      </style>

      {/* 
        Main container:
          - On mobile: use items-center to keep children centered horizontally.
          - On desktop: revert to items-start (so it looks the same as before).
      */}
      <div
        className="
        flex flex-col 
        items-center md:items-start 
        justify-between md:justify-around md:flex-row
        px-6 gap-4 md:px-[5vw] py-4 md:py-8 
        -mt-[10vh] 
        relative bg-gradient-to-b from-white from-60% to-black
      "
      >
        {/* Left-side cards (2) */}
        <div
          className="
          order-3 md:order-1 
          flex flex-wrap  /* allow wrapping in 2×2 on mobile */
          items-center justify-center 
          gap-4 
          w-full md:w-auto
          z-30
        "
        >
          <AnimatedFeatureCard
            icon={Shield}
            title="Guaranteed Quality"
            desc="50-year material warranty on all installations"
            index={0}
          />
          <AnimatedFeatureCard
            icon={Clock}
            title="24/7 Support"
            desc="Emergency repairs available anytime"
            index={1}
          />
        </div>

        {/* Middle column (Text + Slideshow) */}
        <div
          className="
          order-1 md:order-2 
          flex flex-col md:flex-row 
          gap-4
        "
        >
          {/* The gradient overlay on top */}
          <div
            className="
            h-[20.5vh] 
            absolute -top-[8vh] right-0 left-0 
            bg-gradient-to-t from-white from-60% to-transparent 
            z-20
          "
          />

          {/* Rich text block */}
          <div className="relative text-left text-black z-40 w-full md:w-[40vw]">
            <h3 className="text-[5vw] md:text-3xl font-semibold mb-1 md:mb-3 font-serif">
              Commitment to Stability
            </h3>
            <p className="text-[3vw] md:text-lg leading-relaxed w-full font-serif">
              At Summit Ridge Roofing, we prioritize stability in every project.
              Our reliable roofing solutions ensure that your home remains
              secure and protected through all seasons. With decades of
              experience, we deliver consistent quality and dependable service
              you can trust.
            </p>
          </div>

          {/* Slideshow */}
          <div
            className="
            relative 
            rounded-xl 
            overflow-hidden 
            shadow-2xl 
            z-30 
            h-[40vw] w-[80vw] 
            md:h-[35vh] md:w-[30vw]
          "
          >
            <img
              src={images[currentImage]}
              alt="Professional roofers at work"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <p className="font-bold text-[3.5vw] md:text-2xl">25+</p>
                  <p className="text-sm">Years of Excellence</p>
                </div>
                <div className="flex space-x-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentImage === idx
                          ? "bg-white scale-110"
                          : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right-side cards (2) */}
        <div
          className="
          order-4 md:order-3
          flex flex-wrap  /* allow wrapping in 2×2 on mobile */
          items-center justify-center
          gap-4
          w-full md:w-auto
          z-30
        "
        >
          <AnimatedFeatureCard
            icon={Home}
            title="Local Expertise"
            desc="Deep understanding of local weather patterns and codes"
            index={2}
          />
          <AnimatedFeatureCard
            icon={Award}
            title="Award-Winning"
            desc="A+ BBB rating and multiple industry awards"
            index={3}
          />
        </div>
      </div>

      {/* The existing About button at the bottom, same for all screens */}
      <div className="flex flex-col relative  w-full">
        <div className="relative bg-hover-color h-[2vh] z-30 w-full">
          <div className="absolute bottom-0 right-0 left-0 h-[.75vh] bg-gradient-to-b from-transparent to-90% to-orange-600" />
        </div>

        <Aboutbutton />

        <div className="relative bottom-0 right-0 left-0 bg-hover-color h-[2vh] z-30 w-full">
          <div className="absolute top-0 right-0 left-0 h-[.75vh] bg-gradient-to-t from-transparent to-90% to-orange-700" />
        </div>
      </div>
    </section>
  );
};

export default RichTextSection;
