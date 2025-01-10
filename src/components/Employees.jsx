import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Import images (ensure these paths are correct for your project)
import rooferImage from "/assets/images/roofer.png";
import estimatorImage from "/assets/images/estimator.png";
import foremanImage from "/assets/images/foreman.png";
import salesrepImage from "/assets/images/salesrep.png";
import managerImage from "/assets/images/manager.png";
import inspectorImage from "/assets/images/inspector.png";

// Your employees array
const employees = [
  { name: "Rob", role: "Roofer", image: rooferImage },
  { name: "Alice", role: "Foreman", image: foremanImage },
  { name: "Frank", role: "Estimator", image: estimatorImage },
  { name: "Diana", role: "Sales Rep", image: salesrepImage },
  { name: "Garret", role: "Project Manager", image: managerImage },
  { name: "Drew", role: "Inspector", image: inspectorImage },
];

// A small hook to figure out how many items to show at once
const useItemsToShow = () => {
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 700) {
        setItemsToShow(7);
      } else {
        setItemsToShow(5);
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  return itemsToShow;
};

const Employees = () => {
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDurationState, setTransitionDuration] = useState(0.5);
  const itemsToShow = useItemsToShow();
  const slideInterval = 2500;

  // Extend employees for a seamless loop
  const extendedEmployees = useMemo(() => {
    return employees.concat(employees.slice(0, itemsToShow));
  }, [itemsToShow]);

  // Auto-slide the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= employees.length - 1) {
          // Instantly jump back to 0, then restore smooth transition
          setTransitionDuration(0);
          setTimeout(() => setTransitionDuration(0.5), 50);
          return 0;
        }
        return prevIndex + 1;
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [employees.length, slideInterval]);

  // Nail + Text animations
  useEffect(() => {
    // Starting positions:
    // Nail: far right offscreen
    // Text: far left offscreen
    gsap.set(nailRef.current, { x: "100vw" });
    gsap.set(textRef.current, { x: "-100vw" });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "bottom 95%", // Adjust as needed
        toggleActions: "play none none none",
        once: true,
        markers: false
      },
    });

// 1) Nail slides in 40% (from 100vw -> 60vw)
masterTimeline.to(nailRef.current, {
  x: "-7vw",
  duration: 0.8,
  ease: "power2.out",
});

// 2) After 0.5s delay: Nail slides additional 20% and text slides in
masterTimeline
  .to(
    nailRef.current,
    {
      x: "-10vw",
      duration: 0.6,
      ease: "power2.inOut",
    },
    "+=0.5"
  )
  .to(
    textRef.current,
    {
      x: "-50%",
      duration: 0.6,
      ease: "power2.inOut",
    },
    "<" // simultaneous with second nail movement
  );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="">
      {/* Header: includes the nail + text */}
      <div
        ref={headerRef}
        className="relative flex items-center w-full overflow-hidden py-11"
      >
        {/* The NAIL (coming in from right) */}
        <div
          ref={nailRef}
          className="absolute right-[17vw] md:right-[17%] w-[30%] h-[15vh] md:h-[5vh]"
        >
          <div
            className="w-full h-full dynamic-shadow"
            style={{
              backgroundImage: "url('/assets/images/nail.png')",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "scale(3) scaleX(-1)",
              transformOrigin: "right center",
            }}
          />
        </div>

        {/* The TEXT (OUR TEAM, from the left) */}
        <div ref={textRef} className="absolute left-1/2 z-30">
          <h2 className="text-[7vw] md:text-[6vh] font-normal font-ultra-condensed font-rye pt-3">
            OUR TEAM
          </h2>
        </div>
      </div>

      {/* Employees carousel */}
      <div className="relative employee-section flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-screen-lg ">
          <div
            className="flex transition-transform"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              transitionDuration: `${transitionDurationState}s`,
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              width: `${(extendedEmployees.length * 100) / itemsToShow}%`,
            }}
          >
            {extendedEmployees.map((employee, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex flex-col items-center justify-start px-2"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <div className="relative mb-4">
                  <div className="bg-white w-[12.5vh] h-[12.5vh] md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                    <img
                      src={employee.image}
                      alt={employee.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = "/assets/images/placeholder.png";
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-center mt-1">
                    <p className="text-[3vw] md:text-[2vh] text-black font-semibold text-center">
                      {employee.name}
                    </p>
                    <p className="text-[2.5vw] md:text-[1.5vh] font-semibold text-black text-center">
                      {employee.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;
