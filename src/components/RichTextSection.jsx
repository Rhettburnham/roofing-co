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
          entry.target.style.setProperty('--delay', `${delay}s`);
          entry.target.classList.add("animate-card-fall");
          
          // Set the overlay fade delay to match the card animation
          if (overlayRef.current) {
            overlayRef.current.style.setProperty('--overlay-delay', `${delay + 0.8}s`);
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
          cardRef.current.removeEventListener("animationend", handleAnimationEnd);
        }
      };
    }
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="relative items-center bg-white p-2 h-[40vw] md:h-[25vh] aspect-square rounded-lg  overflow-hidden"
        style={{
          transform: "translateX(-100%) rotate3d(0, 0, 1, -90deg)",
          transformOrigin: "right center",
          opacity: "0",
          willChange: "transform, opacity",
        }}
      >
        <div
          className="absolute top-0 right-0 w-12 md:w-16 h-12 md:h-16 z-20"
          style={{
            backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
            backgroundSize: "auto",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />

        <div
          ref={overlayRef}
          className="absolute inset-0 bg-center bg-cover z-30"
          style={{ backgroundImage: `url(${overlayImages[index % overlayImages.length]})` }}
        />

        <Icon className="w-6 h-6 md:w-12 md:h-12 mb-3 md:mb-4 z-10" />

        <h3 className="text-[3.5vw] md:text-lg font-semibold text-gray-900 mb-1 md:mb-2 relative z-10">
          {title}
        </h3>

        <p className="text-[3vw] md:text-sm text-gray-600 relative z-10">
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
    <section className="mx-auto pt-12 bg-gradient-to-t from-faint-color to-white">
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

      <div className="max-w-4xl mx-auto text-center mb-3 md:mb-6 -mt-16">
        <h2 className="text-[6vw] md:text-[7vh] font-bold text-gray-900">
          Protecting Your Home Since 1955
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 md:gap-8 max-w-7xl mx-auto px-6 md:px-[5vw] space-x-4">
        <div className="w-full">
          <div className="relative rounded-xl h-[35vh] overflow-hidden shadow-2xl">
            <img
              src={images[currentImage]}
              alt="Professional roofers at work"
              className="w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex justify-between items-end">
                <div className="text-white">
                  <p className="font-bold text-[2vw] md:text-2xl">25+</p>
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

        <div className="w-full flex flex-col justify-center">
          <div className="text-black">
            <h3 className="text-[4vw] md:text-3xl font-semibold mb-1 md:mb-3">
              Commitment to Stability
            </h3>
            <p className="text-[3vw] md:text-lg leading-relaxed">
              At Summit Ridge Roofing, we prioritize stability in every project.
              Our reliable roofing solutions ensure that your home remains secure
              and protected through all seasons. With decades of experience, we
              deliver consistent quality and dependable service you can trust.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center gap-3 md:gap-12 mx-auto px-8 py-4 md:px-16">
        {[
          {
            icon: Shield,
            title: "Guaranteed Quality",
            desc: "50-year material warranty on all installations",
          },
          {
            icon: Clock,
            title: "24/7 Support",
            desc: "Emergency repairs available anytime",
          },
          {
            icon: Home,
            title: "Local Expertise",
            desc: "Deep understanding of local weather patterns and codes",
          },
          {
            icon: Award,
            title: "Award-Winning",
            desc: "A+ BBB rating and multiple industry awards",
          },
        ].map((item, index) => (
          <AnimatedFeatureCard
            key={index}
            icon={item.icon}
            title={item.title}
            desc={item.desc}
            index={index}
          />
        ))}
      </div>

      <Aboutbutton />
    </section>
  );
};

export default RichTextSection;