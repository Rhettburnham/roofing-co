import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";

const Process = () => {
  const processSteps = [
    {
      title: "Book",
      videoSrc: "/assets/videos/our_process_videos/booking.mp4",
      href: "/#book",
      scale: 0.8, // 20% down
    },
    {
      title: "Inspection",
      videoSrc: "/assets/videos/our_process_videos/magnify.mp4",
      href: "/inspection",
      scale: 1.25, // 30% up
    },
    {
      title: "Service",
      videoSrc: "/assets/videos/our_process_videos/repair.mp4",
      href: "/#packages",
      scale: 1.1,
    },
    {
      title: "Review",
      videoSrc: "/assets/videos/our_process_videos/approval.mp4",
      href: "/#testimonials",
      scale: 0.9,
    },
  ];

  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);

  useEffect(() => {
    // Reset all videos
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        video.currentTime = 0;
        video.pause();
      }
    });

    // Sequential playback logic
    let timeouts = [];

    const playVideosSequentially = () => {
      processSteps.forEach((_, idx) => {
        // Start playing current video with delay
        const startDelay = idx * 4000; // 4 seconds between each video start
        const timeout1 = setTimeout(() => {
          if (videoRefs.current[idx]) {
            videoRefs.current[idx].currentTime = 0;
            videoRefs.current[idx].play().catch((error) => {
              console.error(`Video ${idx} autoplay failed:`, error);
            });
            setActiveVideo(idx);
          }
        }, startDelay);

        timeouts.push(timeout1);
      });

      // Restart the sequence after all videos have played
      const totalDuration = processSteps.length * 4000;
      const restartTimeout = setTimeout(() => {
        playVideosSequentially();
      }, totalDuration);

      timeouts.push(restartTimeout);
    };

    // Start the sequence
    playVideosSequentially();

    // Cleanup function
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      videoRefs.current.forEach((video) => {
        if (video) {
          video.pause();
        }
      });
    };
  }, []);

  return (
    <>
      <div className="h-[15vh] bg-gradient-to-b from-dark-below-header from-30% to-transparent " />
      <section className="md:px-8 -mt-[20vh] md:-mt-[24vh] relative z-40 overflow-visible">
        <div className="flex justify-center items-center flex-wrap md:gap-4 translate-y-[5vh] mb-[8vh] md:mb-[12vh]">
          {processSteps.map((step, index) => {
            const isHashLink = step.href.startsWith("/#");
            const LinkComponent = isHashLink ? HashLink : Link;

            return (
              <div key={index} className="flex items-center pt-1 md:pt-2">
                <LinkComponent
                  to={step.href}
                  className={`flex flex-col items-center cursor-pointer transform transition-all duration-500 ${
                    activeVideo === index ? "scale-110" : "scale-100 opacity-70"
                  }`}
                >
                  <div
                    className={`rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] md:w-[14.4vh] md:h-[14.4vh] w-[6.8vh] h-[6.8vh] bg-white ${
                      activeVideo === index
                        ? "ring-2 ring-dark-below-header"
                        : ""
                    }`}
                  >
                    <video
                      ref={(el) => (videoRefs.current[index] = el)}
                      src={step.videoSrc}
                      className="object-cover"
                      muted
                      playsInline
                      style={{
                        pointerEvents: "none",
                        width: `${80 * step.scale}%`,
                        height: `${80 * step.scale}%`,
                      }}
                      tabIndex={-1}
                    />
                  </div>
                  <p
                    className={`text-center text-[3vw] md:text-lg font-semibold ${
                      activeVideo === index
                        ? "text-dark-below-header"
                        : "text-gray-700"
                    }`}
                  >
                    {step.title}
                  </p>
                </LinkComponent>

                {index < processSteps.length - 1 && (
                  <div className="flex items-center mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`relative w-4 h-4 md:w-10 md:h-10 md:mx-2 transition-all duration-300 ${
                        activeVideo === index
                          ? "text-dark-below-header"
                          : "text-gray-500"
                      }`}
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
    </>
  );
};

export default Process;
