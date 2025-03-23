import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { motion, AnimatePresence } from "framer-motion";

const Process = () => {
  const processSteps = [
    {
      title: "Book",
      videoSrc: "/assets/videos/our_process_videos/booking.mp4",
      href: "/#book", 
      scale: 0.8,
    },
    {
      title: "Inspection",
      videoSrc: "/assets/videos/our_process_videos/magnify.mp4",
      href: "/inspection",
      scale: 1.25,
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
  const [initialOrder, setInitialOrder] = useState([]);

  useEffect(() => {
    // Generate random initial animation order
    const indices = [...Array(processSteps.length).keys()];
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setInitialOrder(shuffled);

    // Reset all videos
    videoRefs.current.forEach((video, idx) => {
      if (video) {
        video.currentTime = 0;
        video.pause();
      }
    });

    let timeouts = [];

    const playVideosSequentially = () => {
      processSteps.forEach((_, idx) => {
        const startDelay = idx * 4000;
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

      const totalDuration = processSteps.length * 4000;
      const restartTimeout = setTimeout(() => {
        playVideosSequentially();
      }, totalDuration);

      timeouts.push(restartTimeout);
    };

    playVideosSequentially();

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
      <div className="h-[20vh] bg-gradient-to-b from-banner from-0% to-transparent" />
      <section className="md:px-8 -mt-[28vh] md:-mt-[32vh] relative z-40 overflow-visible">
        <div className="flex justify-center items-center flex-wrap md:gap-4 translate-y-[5vh] mb-[8vh] md:mb-[12vh]">
          {processSteps.map((step, index) => {
            const isHashLink = step.href.startsWith("/#");
            const LinkComponent = isHashLink ? HashLink : Link;
            const animationDelay = initialOrder.indexOf(index) * 0.2;

            return (
              <div key={index} className="flex items-center pt-1 md:pt-2">
                <LinkComponent to={step.href}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: animationDelay
                    }}
                    className={`flex flex-col items-center cursor-pointer transform transition-all duration-500 ${
                      activeVideo === index ? "scale-110" : "scale-100 opacity-70"
                    }`}
                  >
                    <div
                      className={`rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] md:w-[14.4vh] md:h-[14.4vh] w-[6.8vh] h-[6.8vh] bg-white ${
                        activeVideo === index ? "ring-2 ring-accent" : ""
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
                    <AnimatePresence>
                      {activeVideo === index && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-center text-[3vw] md:text-lg font-semibold text-accent"
                        >
                          {step.title}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LinkComponent>

                {index < processSteps.length - 1 && (
                  <div className="flex items-center mx-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`relative w-4 h-4 md:w-10 md:h-10 md:mx-2 transition-all duration-300 ${
                        activeVideo === index ? "text-accent" : "text-gray-500"
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
