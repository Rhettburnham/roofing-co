// src/components/RichTextSection.jsx
import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import Aboutbutton from "./About_button";

// Overlay images used in the AnimatedFeatureCard
const overlayImages = [
  "/assets/images/shake_img/1.png",
  "/assets/images/shake_img/2.png",
  "/assets/images/shake_img/3.png",
  "/assets/images/shake_img/4.png",
];

/**
 * AnimatedFeatureCard Component
 * This card “falls” in from the left (with a staggered delay) and fades its overlay.
 */
const AnimatedFeatureCard = ({ icon: Icon, title, desc, index }) => {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const delay = index * 0.2;
          entry.target.style.setProperty("--delay", `${delay}s`);
          entry.target.classList.add("animate-card-fall");
          if (overlayRef.current) {
            overlayRef.current.style.setProperty("--overlay-delay", `${delay + 0.8}s`);
          }
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px 0% 0px" }
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
          cardRef.current.removeEventListener("animationend", handleAnimationEnd);
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
      {/* Top-right static overlay */}
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
      {/* Full overlay that fades out */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-center bg-cover z-30"
        style={{
          backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
        }}
      />
      {/* Icon */}
      {Icon && <Icon className="w-5 h-5 md:w-12 md:h-12 mb-1 md:mb-2 z-10" />}
      {/* Title */}
      <h3 className="text-[2vw] md:text-sm font-semibold text-gray-900 md:mb-1 relative z-10">
        {title}
      </h3>
      {/* Description */}
      <p className="text-[1.8vw] md:text-xs text-gray-600 relative z-10">
        {desc}
      </p>
    </div>
  );
};

/**
 * RichTextSection Component
 * - Fetches the JSON from /data/richText.json
 * - Displays a hero section (with animated feature cards, hero text, and a slideshow),
 *   an "About Our Team" section, and a "Why Choose Us" section.
 */
const RichTextSection = () => {
  const [richTextData, setRichTextData] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  // Slideshow images (you can update these paths as needed)
  const images = [
    "/assets/images/Richtext/roof_workers.jpg",
    "/assets/images/Richtext/roof_workers2.jpg",
    "/assets/images/Richtext/roof_workers3.webp",
  ];

  useEffect(() => {
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
      }
    };

    fetchRichText();
  }, []);

  if (!richTextData) {
    return <p>Loading section...</p>;
  }

  // Destructure the fetched JSON data
  const {
    heroText,
    cards,
    yearsOfExcellenceTitle,
    yearsOfExcellenceDesc,
    aboutCards,
    whyChooseFeatures,
  } = richTextData;

  // For the top section, split the main feature cards into two halves
  const half = Math.ceil(cards.length / 2);
  const leftCards = cards.slice(0, half);
  const rightCards = cards.slice(half);

  return (
    <section className="bg-white">
      {/* Inline styles for card animations */}
      <style>
        {`
          @keyframes cardFall {
            0% {
              transform: translateX(-100%) rotate3d(0,0,1,-90deg);
              opacity: 0;
            }
            100% {
              transform: translateX(0) rotate3d(0,0,1,0deg);
              opacity: 1;
            }
          }
          .animate-card-fall {
            animation: cardFall 0.8s ease-out forwards var(--delay, 0s);
          }
          @keyframes overlayFadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; pointer-events: none; }
          }
          .fade-overlay-out {
            animation: overlayFadeOut 0.8s ease-out forwards var(--overlay-delay, 0s);
          }
        `}
      </style>

      {/* === Main Hero Section === */}
      <div className="flex flex-col items-center md:items-start justify-between md:flex-row px-6 gap-4 md:px-[5vw] py-4 md:py-8 relative bg-gradient-to-b from-white from-60% to-black">
        {/* Decorative Gradient Overlay */}
        <div className="h-[20.5vh] absolute -top-[8vh] right-0 left-0 bg-gradient-to-t from-white from-60% to-transparent z-20" />

        {/* Left-side Feature Cards */}
        <div className="order-3 md:order-1 flex flex-wrap items-center justify-center gap-4 w-full md:w-auto z-30">
          {leftCards.map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Star;
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

        {/* Middle Column: Hero Text and Slideshow */}
        <div className="order-1 md:order-2 flex flex-col md:flex-row gap-4 relative">
          {/* Hero Text */}
          <div className="relative text-left text-black z-40 w-full md:w-[40vw]">
            <h3 className="text-[5vw] md:text-3xl font-semibold mb-1 md:mb-3 font-serif">
              {heroText}
            </h3>
          </div>
          {/* Slideshow */}
          <div className="relative rounded-xl overflow-hidden shadow-2xl z-30 h-[40vw] w-[80vw] md:h-[35vh] md:w-[30vw]">
            <img
              src={images[currentImage]}
              alt="Professional roofers at work"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <h4 className="font-bold text-lg md:text-2xl">
                    {yearsOfExcellenceTitle}
                  </h4>
                  <p className="text-sm md:text-base">
                    {yearsOfExcellenceDesc}
                  </p>
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
        <div className="order-4 md:order-3 flex flex-wrap items-center justify-center gap-4 w-full md:w-auto z-30">
          {rightCards.map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Star;
            return (
              <AnimatedFeatureCard
                key={index + half}
                icon={IconComponent}
                title={card.title}
                desc={card.desc}
                index={index + half}
              />
            );
          })}
        </div>
      </div>

      {/* === About Our Team Section === */}
      <div className="py-8 px-6 md:px-[5vw]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          About Our Team
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {aboutCards.map((card, index) => {
            const IconComponent = Icons[card.icon] || Icons.Star;
            return (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center w-64"
              >
                {IconComponent && <IconComponent className="w-8 h-8 mb-2" />}
                <h3 className="font-semibold mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 text-center">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* === Why Choose Us Section === */}
      <div className="py-8 px-6 md:px-[5vw] bg-gray-100">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Why Choose Us
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {whyChooseFeatures.map((feature, index) => {
            const IconComponent = Icons[feature.icon] || Icons.Star;
            return (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center w-64"
              >
                {IconComponent && <IconComponent className="w-8 h-8 mb-2" />}
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600 text-center">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* === About Button and Decorative Elements === */}
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
