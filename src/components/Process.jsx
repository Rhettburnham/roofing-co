import React, { useEffect, useRef } from 'react';
import { Link } from "react-router-dom"; // Import Link for routing
import { HashLink } from "react-router-hash-link"; // Import HashLink for in-page anchors

const Process = () => {
  // Define the process steps with corresponding links
  const processSteps = [
    { 
      title: 'Booking', 
      videoSrc: '/assets/videos/our_process_videos/booking.mp4',
      href: '/#book' // In-page link
    },
    { 
      title: 'Inspection', 
      videoSrc: '/assets/videos/our_process_videos/magnify.mp4',
      href: '/inspection' // Separate route
    },
    { 
      title: 'Repair', 
      videoSrc: '/assets/videos/our_process_videos/repair.mp4',
      href: '/#packages' // Separate route
    },
    { 
      title: 'Final Review', 
      videoSrc: '/assets/videos/our_process_videos/approval.mp4',
      href: '/#testimonials' // In-page link
    },
  ];

  const videoRefs = useRef([]);

  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.play();
      }
    });
  }, []);

  return (
    <section className="px-4 md:px-8 mb-6">
      {/* Section Title */}
      <div className="text-center text-[8vw] md:text-[4vh]">
        <h1>Our Process</h1>
      </div>

      {/* Process Steps */}
      <div className="flex justify-center items-center flex-wrap md:gap-4 ">
        {processSteps.map((step, index) => {
          // Determine if the link is an in-page anchor
          const isHashLink = step.href.startsWith('/#');
          // Choose the appropriate Link component
          const LinkComponent = isHashLink ? HashLink : Link;

          return (
            <div key={index} className="flex items-center">
              {/* Clickable Card */}
              <LinkComponent 
                to={step.href} 
                className="flex flex-col items-center cursor-pointer transform hover:scale-105 hover:custom-circle-shadow transition-transform duration-300"
              >
                {/* Circle with Video */}
                <div className="rounded-full overflow-hidden flex items-center justify-center shadow-md md:w-[20vh] md:h-[20vh] w-[8vh] h-[8vh] bg-white">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    src={step.videoSrc}
                    className="object-cover"
                    style={{
                      width:
                        step.title === 'Inspection'
                          ? '80%'
                          : step.title === 'Booking' || step.title === 'Final Review'
                          ? '60%'
                          : '80%',
                      height:
                        step.title === 'Inspection'
                          ? '80%'
                          : step.title === 'Booking' || step.title === 'Final Review'
                          ? '60%'
                          : '80%',
                    }}
                    muted
                    loop
                  />
                </div>
                {/* Step Title */}
                <p className="mt-2 text-center text-[3vw] md:text-lg font-semibold text-gray-700">
                  {step.title}
                </p>
              </LinkComponent>

              {/* Arrow Between Steps */}
              {index < processSteps.length - 1 && (
                <div className="flex items-center mx-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative w-6 h-6 md:w-12 md:h-12 md:mx-2"
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
