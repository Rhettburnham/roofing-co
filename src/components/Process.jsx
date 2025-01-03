import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const Process = () => {
  const processSteps = [
    {
      title: "Book",
      videoSrc: "/assets/videos/our_process_videos/booking.mp4",
      href: "/#book",
      scale: 0.8  // 20% down
    },
    {
      title: "Inspection",
      videoSrc: "/assets/videos/our_process_videos/magnify.mp4",
      href: "/inspection",
      scale: 1.25  // 30% up
    },
    {
      title: "Service",
      videoSrc: "/assets/videos/our_process_videos/repair.mp4",
      href: "/#packages",
      scale: 1.1
    },
    {
      title: "Review",
      videoSrc: "/assets/videos/our_process_videos/approval.mp4",
      href: "/#testimonials",
      scale: .9
    },
  ];

  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.play().catch((error) => {
          console.error("Video autoplay failed:", error);
        });
      }
    });
  }, []);

  return (
    <section className="md:px-8 pt-4 mb-4 overflow-hidden">
      <div className="flex justify-center items-center flex-wrap md:gap-4">
        {processSteps.map((step, index) => {
          const isHashLink = step.href.startsWith("/#");
          const LinkComponent = isHashLink ? HashLink : Link;

          return (
            <div key={index} className="flex items-center pt-1 md:pt-2">
              <LinkComponent
                to={step.href}
                className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition-transform duration-300"
              >
                <div className="rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,3)] md:w-[18vh] md:h-[18vh] w-[8.5vh] h-[8.5vh] bg-white">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={step.videoSrc}
                    className="object-cover"
                    muted
                    loop
                    playsInline
                    style={{
                      pointerEvents: "none",
                      width: `${80 * step.scale}%`,
                      height: `${80 * step.scale}%`
                    }}
                    tabIndex={-1}
                  />
                </div>
                <p className="mt-2 text-center text-[3vw] md:text-lg font-semibold text-gray-700">
                  {step.title}
                </p>
              </LinkComponent>

              {index < processSteps.length - 1 && (
                <div className="flex items-center mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative w-4 h-4 md:w-12 md:h-12 md:mx-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 12h14M12 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Process;