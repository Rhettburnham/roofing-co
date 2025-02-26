// src/components/RichTextSection.jsx

import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react"; // Import all icons from lucide-react
import Aboutbutton from "../../src/components/About_button";

const overlayImages = [
  "/assets/images/shake_img/1.png",
  "/assets/images/shake_img/2.png",
  "/assets/images/shake_img/3.png",
  "/assets/images/shake_img/4.png",
];

// AnimatedFeatureCard Component (as previously defined)

const RichTextSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [richTextData, setRichTextData] = useState(null);

  const images = [
    "/assets/images/Richtext/roof_workers.jpg",
    "/assets/images/Richtext/roof_workers2.jpg",
    "/assets/images/Richtext/roof_workers3.webp",
  ];

  useEffect(() => {
    // Fetch the richText.json file from public/data/
    const fetchRichText = async () => {
      try {
        const response = await fetch("/data/richText.json");
        if (!response.ok) {
          throw new Error("Failed to fetch rich text data.");
        }
        const data = await response.json();
        setRichTextData(data);
      } catch (error) {
        console.error("Error fetching rich text data:", error);
        // Optionally, set default/fallback data here
      }
    };

    fetchRichText();
  }, []);

  if (!richTextData) {
    return <p>Loading section...</p>;
  }

  // Destructure data from JSON
  const {
    heroText,
    cards = [],
    yearsOfExcellenceTitle = "25+ Years of Excellence",
    yearsOfExcellenceDesc = "Proudly serving customers for decades.",
  } = richTextData;

  return (
    <section className="bg-white relative">
      {/* Inline Styles for Animations */}
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

      {/* Main Content Container */}
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
        {/* Left-side Feature Cards */}
        <div
          className="
            order-3 md:order-1 
            flex flex-wrap
            items-center justify-center 
            gap-4 
            w-full md:w-auto
            z-30
          "
        >
          {cards.slice(0, 2).map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Star; // Fallback to 'Star' icon
            return (
              <AnimatedFeatureCard
                key={index}
                icon={IconComponent}
                title={card.title}
                desc={card.desc}
                index={index}
              />
            );
          })}
        </div>

        {/* Middle Column (Hero Text + Slideshow) */}
        <div
          className="
            order-1 md:order-2 
            flex flex-col md:flex-row 
            gap-4
            relative
          "
        >
          {/* Gradient Overlay */}
          <div
            className="
              h-[20.5vh] 
              absolute -top-[8vh] right-0 left-0 
              bg-gradient-to-t from-white from-60% to-transparent 
              z-20
            "
          />

          {/* Hero Text */}
          <div className="relative text-left text-black z-40 w-full md:w-[40vw]">
            <h3 className="text-[5vw] md:text-3xl font-semibold mb-1 md:mb-3 font-serif">
              {heroText}
            </h3>
            {/* Additional content can be added here if needed */}
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
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <p className="font-bold text-[3.5vw] md:text-2xl">
                    {yearsOfExcellenceTitle}
                  </p>
                  <p className="text-sm">{yearsOfExcellenceDesc}</p>
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

        {/* Right-side Feature Cards */}
        <div
          className="
            order-4 md:order-3
            flex flex-wrap
            items-center justify-center
            gap-4
            w-full md:w-auto
            z-30
          "
        >
          {cards.slice(2, 4).map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Star; // Fallback to 'Star' icon
            return (
              <AnimatedFeatureCard
                key={index + 2}
                icon={IconComponent}
                title={card.title}
                desc={card.desc}
                index={index + 2}
              />
            );
          })}
        </div>
      </div>

      {/* About Button and Decorative Elements */}
      <div className="flex flex-col relative w-full">
        <div className="relative bg-hover-color h-[2vh] z-30 w-full">
          <div className="absolute bottom-0 right-0 left-0 h-[0.75vh] bg-gradient-to-b from-transparent to-orange-600" />
        </div>

        <Aboutbutton />

        <div className="relative bottom-0 right-0 left-0 bg-hover-color h-[2vh] z-30 w-full">
          <div className="absolute top-0 right-0 left-0 h-[0.75vh] bg-gradient-to-t from-transparent to-orange-700" />
        </div>
      </div>
    </section>
  );
};

export default RichTextSection;
