// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only or Editable)
---------------------------------------------
Displays content. If not readOnly, allows inline editing of text fields.
=============================================
*/

// Create a persistent flag at module level
const ANIMATION_STATE = {
  hasAnimated: false,
};

// taking data from step_4/combined_data.json
function RichTextPreview({ richTextData, readOnly, onInlineChange }) {
  // Initialize hooks at the top to avoid conditional hook calls
  const [currentImage, setCurrentImage] = useState(0);
  const [animationClass, setAnimationClass] = useState(
    ANIMATION_STATE.hasAnimated ? "animated" : "pre-animation"
  );
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(false);

  // Debug richTextData
  useEffect(() => {
    console.log("RichTextPreview received data:", richTextData, "readOnly:", readOnly);
  }, [richTextData, readOnly]);

  // Return early if no data
  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  // Extract data from richTextData (which is localData when editing)
  const {
    heroText = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
    steps = [],
    // years_in_business is edited in the panel, so not directly needed here for display
  } = richTextData || {};

  // Trigger animation once on first mount only
  useEffect(() => {
    // If we've already animated, don't do anything
    if (ANIMATION_STATE.hasAnimated) return;

    // Set a small timeout to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setAnimationClass("animated");
      ANIMATION_STATE.hasAnimated = true;
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Initialize and preload all videos on component mount
  useEffect(() => {
    // For debugging - log the steps array
    console.log("Steps data:", steps);
    
    // Create video elements early
    steps.forEach((_, idx) => {
      if (!videoRefs.current[idx]) {
        videoRefs.current[idx] = document.createElement('video');
      }
    });

    const loadVideos = async () => {
      try {
        // Set up each video element with proper loading attributes
        const promises = steps.map((step, idx) => {
          return new Promise((resolve) => {
            const video = videoRefs.current[idx];
            if (!video) {
              resolve();
              return;
            }
            
            // Set video loading attributes
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto"; // Force preloading
            
            // Remove the leading slash if it exists
            const normalizedPath = step.videoSrc.startsWith('/') 
              ? step.videoSrc.substring(1) 
              : step.videoSrc;
            
            // Set the video source
            video.src = normalizedPath;
            
            // Load the video data (important for preloading)
            video.load();
            
            // Set up event handlers for loading
            video.onloadeddata = () => {
              console.log(`Video ${idx} data loaded`);
              resolve();
            };
            
            video.oncanplaythrough = () => {
              console.log(`Video ${idx} can play through`);
              resolve();
            };
            
            video.onerror = (e) => {
              console.error(`Error loading video for step ${idx}:`, step, e);
              resolve();
            };
            
            // Timeout in case loading takes too long
            setTimeout(resolve, 5000);
          });
        });

        // Wait for all videos to be ready
        await Promise.all(promises);
        console.log("All videos preloaded");
        setVideosLoaded(true);
      } catch (error) {
        console.error("Error preloading videos:", error);
        setVideosLoaded(true);
      }
    };

    loadVideos();

    // Clean up video refs when component unmounts
    return () => {
      videoRefs.current.forEach(video => {
        if (video) {
          try {
            video.pause();
            video.src = "";
            video.load();
          } catch (e) {
            console.warn("Error cleaning up video:", e);
          }
        }
      });
      videoRefs.current = [];
    };
  }, [steps]);

  // Handle video playback control
  useEffect(() => {
    if (!videosLoaded || !steps || steps.length === 0) return;

    let timeouts = [];
    let isComponentMounted = true;

    const playCurrentVideo = () => {
      // Get the real index (remove the highlighting flag)
      const currentIndex = activeVideo % 100;
      const isHighlighted = activeVideo < 100;
      
      // Pause all videos except the active one
      videoRefs.current.forEach((video, idx) => {
        if (!video) return;

        try {
          // Check if video is actually a video element
          // (it might have been replaced by an image)
          if (video.tagName?.toLowerCase() !== 'video') {
            return;
          }

          // Check if video has a valid source
          if (!video.src) {
            console.warn(`Video ${idx} has no source`);
            return;
          }

          // Force preloading by calling load() before play
          if (idx === currentIndex) {
            // Force preload and reset to beginning
            video.currentTime = 0;
            video.muted = true;
            video.load();
            
            // Simple play without setTimeout
            console.log(`Playing video ${idx}`);
            try {
              video.play().catch(error => {
                console.warn(`Video ${idx} play failed:`, error.name);
              });
            } catch (error) {
              console.warn("Video play error:", error);
            }
          } else {
            // Pause other videos
            video.pause();
          }
        } catch (error) {
          console.warn(`Error controlling video ${idx}:`, error);
        }
      });

      // If currently highlighted, schedule unhighlight after 2.5 seconds
      if (isHighlighted) {
        const highlightTimeout = setTimeout(() => {
          if (isComponentMounted) {
            // Remove highlight but keep the video playing (add 100 to mark as unhighlighted)
            setActiveVideo(currentIndex + 100);
          }
        }, 2500); // 2.5 seconds for highlight
        timeouts.push(highlightTimeout);
      }

      // Set up the next video after a total of 6 seconds
      const nextIndex = (currentIndex + 1) % steps.length;
      const videoTimeout = setTimeout(() => {
        if (isComponentMounted) {
          // Set to the next index with highlighting (pure index without +100)
          setActiveVideo(nextIndex);
        }
      }, 6000); // 6 seconds for video playback

      timeouts.push(videoTimeout);
    };

    playCurrentVideo();

    return () => {
      isComponentMounted = false;
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [activeVideo, videosLoaded, steps]);

  // Smartly determine slideshow image sources
  const slideshowImageSources = images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('blob:')) {
        return img; // It's a blob URL, use directly
      } else if (img.startsWith('/')) {
        return img; // It's an absolute path, use directly
      } else {
        // Assume it's a relative path needing the Richtext folder prefix
        return `/assets/images/Richtext/${img.split('/').pop() || ''}`;
      }
    }
    return ''; // Fallback for non-string or invalid entries
  }).filter(img => img); // Remove any empty strings

  const displaySlideshowImages = slideshowImageSources.length > 0
    ? slideshowImageSources
    : ["/assets/images/Richtext/roof_workers.jpg"]; // Default if no valid images

  // little info card diff size vp logic
  const half = Math.ceil(cards.length / 2);
  const leftCards = cards.slice(0, half);
  const rightCards = cards.slice(half);

  // Overlay images used for card backgrounds and visual effects - use from data or fallback
  const overlayImages = richTextData.overlayImages || [
    "/assets/images/shake_img/1.png",
    "/assets/images/shake_img/2.png",
    "/assets/images/shake_img/3.png",
    "/assets/images/shake_img/4.png",
  ];
  function FeatureCard({
    icon: Icon,
    title,
    desc,
    index,
    variant = "default",
  }) {
    // Base styling for all card variants
    const baseClasses =
      "relative bg-white p-2 rounded-lg shadow-lg flex flex-col items-center justify-center";
  
    // For md viewports, ensure square aspect ratio
    const sizeClasses =
      variant === "md"
        ? "md:w-[12vw] w-[40vw] w-full max-w-[12vw] h-auto min-h-[18vw] md:min-h-[14vw] lg:min-h-[12vw]"
        : "w-[40vw] md:w-[12vw] h-auto min-h-[18vw] md:min-h-[14vw] lg:min-h-[12vw]";
  
    // Calculate delay based on index to stagger animations
    const delay = index * 0.15;
  
    return (
      <div
        className={`${baseClasses} ${sizeClasses} feature-card ${animationClass}`}
        style={{ "--delay": `${delay}s` }}
      >
        {/* Decorative triangle in top-right corner */}
        <div
          className="absolute top-0 right-0 w-12 h-12 md:w-14 md:h-14 z-20 rounded-tr-lg"
          style={{
            backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
            backgroundPosition: "top right",
            backgroundRepeat: "no-repeat",
            backgroundSize: "auto",
            clipPath: "polygon(0 0, 100% 0, 100% 100%)",
          }}
        />
  
        {/* Icon positioned in top-right corner */}
        <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 z-30 flex items-center justify-center">
          {Icon && <Icon className="text-white drop-shadow-lg" />}
        </div>
  
        {/* Gradient overlay for visual effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent z-10 rounded-lg" />
  
        {/* Overlay image that fades away */}
        <div
          className={`absolute inset-0 bg-center bg-cover z-20 rounded-lg overlay-image ${animationClass}`}
          style={{
            backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
            "--delay": `${delay + 0.6}s`,
          }}
        />
  
        {/* Title container */}
        <div className="flex flex-col z-30">
          <div className="absolute inset-0 top-1 md:top-3 w-full ">
            <h3 className="z-30 ml-1 md:ml-2 mr-10 leading-tight text-[1.5vw] md:text-[1.2vw] lg:text-[1vw] font-semibold text-gray-900 font-sans max-w-[85%]">
              {title}
            </h3>
          </div>
          {/* Description text - Adjusted for tighter vertical spacing */}
          <p className="z-30 text-[2.2vw] md:text-[1.5vh] text-gray-700 text-left px-1 md:px-1 mr-2 md:mr-0 font-serif leading-tight mt-8 md:mt-10 lg:mt-12">
            {desc}
          </p>
        </div>
      </div>
    );
  }
  

  FeatureCard.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string,
    desc: PropTypes.string,
    index: PropTypes.number,
    variant: PropTypes.string,
  };

  const animationStyles = `
    /* Style that applies only before animation starts */
    .feature-card.pre-animation {
      transform: translateX(-100%) rotate(45deg);
      opacity: 0;
    }
    
    /* Animation that runs once */
    .feature-card.animated {
      transform: translateX(0) rotate(0);
      opacity: 1;
      transition: transform 0.8s ease-out, opacity 0.8s ease-out;
      transition-delay: var(--delay, 0s);
    }
    
    /* Overlay image that fades away after cards appear */
    .overlay-image.pre-animation {
      opacity: 1;
    }
    
    .overlay-image.animated {
      opacity: 0;
      transition: opacity 0.5s ease-out;
      transition-delay: var(--delay, 0s);
    }
    
    /* Main slideshow image container */
    .image-container.pre-animation {
      opacity: 0;
    }
    
    .image-container.animated {
      opacity: 1;
      transition: opacity 1s ease-in-out;
      transition-delay: 0.5s;
    }
    
    /* Mobile process section optimizations */
    .mobile-process-section .rounded-full {
      width: 8vh !important;
      height: 8vh !important;
    }
    
    .mobile-process-section p {
      font-size: 0.85rem !important;
    }
    
    .mobile-process-section svg {
      width: 0.75rem;
      height: 0.75rem;
      margin: 0 0.25rem;
    }

    /* Ensure process steps stay in a single row */
    .mobile-process-section > div {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      padding-bottom: 10px;
    }
    
    .mobile-process-section > div > div {
      flex-shrink: 0;
    }

    /* Styling for inline editable textareas */
    .inline-editable {
      background-color: rgba(200, 200, 255, 0.2); /* Light blueish semi-transparent background for visibility */
      border: 1px dashed #aaa;
      padding: 4px;
      resize: vertical; 
      width: 100%;
      box-sizing: border-box;
      border-radius: 4px;
    }
    .inline-editable-hero {
      font-weight: bold;
      color: white; 
      background-color: rgba(0, 0, 50, 0.25); /* Darker blueish for hero on dark bg */
    }
     .inline-editable-desc {
      color: black; 
      font-family: serif;
      background-color: rgba(220, 220, 255, 0.25); /* Lighter blueish for desc on light bg */
    }
  `;

  // Render Process Steps - simplified following Process.jsx pattern
  const RenderProcessSteps = () => {
    if (!steps || steps.length === 0) {
      return <div className="text-center md:py-2">No process steps available</div>;
    }

    // For debugging - show video paths
    console.log("Rendering process steps with video paths:", steps.map(s => s.videoSrc));
    
    // Helper function to check if a step is currently highlighted
    const isStepHighlighted = (index) => {
      // A step is highlighted if activeVideo equals its index (no +100)
      return activeVideo === index;
    };
    
    // Helper function to check if a step's video is currently playing
    const isVideoPlaying = (index) => {
      // The video is playing if either:
      // 1. The step is highlighted (activeVideo === index)
      // 2. The step is unhighlighted but still playing (activeVideo === index + 100)
      return activeVideo === index || activeVideo === index + 100;
    };

    return (
      <div className="flex justify-center items-center flex-nowrap md:gap-4 mb-[2.5vh] md:mb-[6vh] w-full">
        {steps.map((step, index) => {
          const isHashLink = step.href?.startsWith("/#");
          const LinkComponent = isHashLink ? HashLink : Link;

          // Fix the video path to ensure it points to the correct location
          // Remove the leading slash to make the path relative to the public folder
          const videoSrc = step.videoSrc.startsWith('/') 
            ? step.videoSrc.substring(1) 
            : step.videoSrc;

          // Create a fallback image path based on the video title
          const fallbackImage = `/assets/images/our_process_images/${step.title.toLowerCase()}.jpg`;

          return (
            <div key={index} className="flex items-center pt-1 md:pt-2 shrink-0">
              <LinkComponent to={step.href || "#"}>
                <motion.div
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{
                    opacity: isStepHighlighted(index) ? 1 : 0.7,
                    scale: isStepHighlighted(index) ? 1.1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => {
                    // Set to exact index to activate highlight
                    setActiveVideo(index);
                  }}
                >
                  <div
                    className={`rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] md:w-[14.4vh] md:h-[14.4vh] w-[6.8vh] h-[6.8vh] bg-white ${
                      isStepHighlighted(index) ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <video
                      ref={(el) => {
                        // Only set the ref if it's a new element
                        if (el && !videoRefs.current[index]) {
                          videoRefs.current[index] = el;
                        }
                      }}
                      src={videoSrc}
                      muted
                      playsInline
                      autoPlay={isVideoPlaying(index)}
                      loop={isVideoPlaying(index)}
                      className="object-contain"
                      style={{
                        pointerEvents: "none",
                        width: `${80 * (step.scale || 1)}%`,
                        height: `${80 * (step.scale || 1)}%`,
                        opacity: 1,
                        display: "block",
                      }}
                      tabIndex={-1}
                      preload="auto"
                      onError={(e) => {
                        console.error(`Video ${index} load error:`, e);
                        // Try to set a fallback image if the video fails to load
                        if (e.target) {
                          try {
                            // Create an image element instead
                            const img = document.createElement('img');
                            img.src = fallbackImage;
                            img.alt = step.title;
                            img.style.width = `${80 * (step.scale || 1)}%`;
                            img.style.height = `${80 * (step.scale || 1)}%`;
                            img.style.objectFit = 'contain';
                            
                            // Replace the video with the image
                            const parent = e.target.parentNode;
                            if (parent) {
                              parent.replaceChild(img, e.target);
                            }
                          } catch (imgError) {
                            console.warn("Failed to replace video with image:", imgError);
                          }
                        }
                      }}
                    />
                  </div>
                  <p
                    className={`text-center text-[3vw] md:text-lg font-semibold ${
                      isStepHighlighted(index) ? "text-accent" : "text-black"
                    }`}
                  >
                    {step.title}
                  </p>
                </motion.div>
              </LinkComponent>

              {index < steps.length - 1 && (
                <div className="flex items-center mx-2 shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`relative w-7 h-7 md:w-6 md:h-6 md:mx-2 transition-all duration-300 ${
                      isStepHighlighted(index) ? "text-accent" : "text-white"
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
    );
  };

  useEffect(() => {
    const checkAutoplaySupport = async () => {
      try {
        const video = document.createElement('video');
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
      } catch (error) {
        console.error("Error checking autoplay support:", error);
      }
    };
    checkAutoplaySupport(); 
  }, []);

  

  return (
    <div className="w-full mx-auto">
      <style>{animationStyles}</style>

      {/* Process Gradient Background */}
      <div className="h-[20vh] bg-gradient-to-b from-banner from-10% to-transparent z-10" />

      {/* Medium screens and larger - HIDDEN on small screens */}
      <div className="hidden md:flex md:flex-col md:-mt-[20vh] z-30">
      <div className="flex w-full">
        {/* Left Column */}
        <div className="w-1/6 hidden md:flex flex-col gap-y-6 p-1 z-3 pb-9">
          {leftCards.map((card, idx) => (
            <FeatureCard
              key={idx}
              variant="md"
              icon={Icons[card.icon] || Icons.Star}
              title={card.title}
              desc={card.desc}
              index={idx}
            />
          ))}
        </div>

        {/* Center Column */}
        <div className="md:w-4/6 w-full flex flex-col">
          {/* 1) Side-by-side row */}
          <div className="flex w-full">
            {/* Image (always visible) */}
            <div className="w-1/2">
              <div className={`relative rounded-2xl shadow-md h-[30vw] md:h-[30vh] image-container ${animationClass}`}>
                <img
                  src={displaySlideshowImages[currentImage]}
                  alt="Slideshow"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {displaySlideshowImages.map((_, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => setCurrentImage(sIdx)}
                      className={`w-3 h-3 rounded-full ${
                        currentImage === sIdx ? "bg-white scale-110" : "bg-white/50"
                      }`}
                      aria-label={`Go to image ${sIdx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Primary text block: shows only on md+ */}
            <div className="w-1/2 pl-6">
              <h2 className="text-[4vw] md:text-[2.5vh] text-white font-sans font-bold mb-4">
                {heroText}
              </h2>
              {/* Split text content between the two sections */}
              <p className="text-[2.8vw] md:text-[1.9vh] text-black font-serif leading-tight indent-8">
                {bus_description.split('. ').slice(0, 2).join('. ')}
              </p>
              <p className="text-[2.8vw] md:text-[1.9vh] text-black font-serif leading-tight indent-8 mt-2">
                {bus_description.split('. ').slice(2).join('. ')}
              </p>
              {/* Hide the second paragraph here on smaller than lg */}
              <p className="hidden lg:block text-[2.8vw] md:text-[1.9vh] text-black font-serif leading-tight indent-8 mt-2">
                {bus_description_second}
              </p>
            </div>
          </div>

          {/* 2) Spillover row: full-width, only on screens < lg */}
          <div className="w-full block lg:hidden mt-4 px-6">
            {readOnly ? (
              <p className="text-[2.8vw] md:text-[1.9vh] text-black font-serif leading-tight indent-8">
                {bus_description_second}
              </p>
            ) : (
               <textarea
                  value={bus_description_second}
                  onChange={(e) => onInlineChange('bus_description_second', e.target.value)}
                  className="text-[2.8vw] md:text-[1.9vh] leading-tight indent-8 inline-editable inline-editable-desc"
                  rows={4}
                />
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-1/6 hidden md:flex flex-col gap-y-6 p-1 z-3 pb-12">
          {rightCards.map((card, idx) => (
            <FeatureCard
              key={idx + half}
              variant="md"
              icon={Icons[card.icon] || Icons.Star}
              title={card.title}
              desc={card.desc}
              index={idx + half}
            />
          ))}
        </div>
      </div>
      </div>

      {/* Smaller than medium screens - mobile view */}
      <div className="md:hidden flex flex-col px-[3vw] -mt-[20vh] mb-1 mt-[-2vh]">
        {/* Process Steps Section for mobile */}
        <section className="relative z-40 overflow-visible mb-4 -mt-[20vh]">
          <div className="mobile-process-section w-full">
            <RenderProcessSteps />
          </div>
        </section>

        {/* Image Section */}
        <div
          className={`relative w-full rounded-lg shadow-md px-3 -mt-[4vh] image-container ${animationClass}`}
        >
          <img
            src={displaySlideshowImages[currentImage]}
            alt="Slideshow"
            className="w-full h-[30vw] object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {displaySlideshowImages.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentImage(sIdx)}
                className={`w-2 h-2 rounded-full ${currentImage === sIdx ? "bg-white scale-110" : "bg-white/50"}`}
                aria-label={`Go to image ${sIdx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Text Section - Separated from Image Section */}
        <div className="mt-3 px-3">
          {readOnly ? (
            <h2 className="whitespace-nowrap relative text-[4vw] text-center font-bold z-60 px-[3vw] overflow-visible font-sans">
              {heroText}
            </h2>
          ) : (
            <textarea
              value={heroText}
              onChange={(e) => onInlineChange('heroText', e.target.value)}
              className="whitespace-nowrap relative text-[4vw] text-center font-bold z-60 px-[3vw] overflow-visible font-sans inline-editable inline-editable-hero"
              rows={1}
            />
          )}
          {readOnly ? (
            <p className="text-[2.8vw] text-gray-700 my-1 font-sans indent-6">
              {bus_description}
            </p>
          ) : (
            <textarea
              value={bus_description}
              onChange={(e) => onInlineChange('bus_description', e.target.value)}
              className="text-[2.8vw] text-gray-700 my-1 font-sans indent-6 inline-editable inline-editable-desc"
              rows={3}
            />
          )}
          {readOnly ? (
            <p className="text-[2.8vw] text-gray-700 mb-2 font-sans indent-6">
              {bus_description_second}
            </p>
          ) : (
             <textarea
              value={bus_description_second}
              onChange={(e) => onInlineChange('bus_description_second', e.target.value)}
              className="text-[2.8vw] text-gray-700 mb-2 font-sans indent-6 inline-editable inline-editable-desc"
              rows={3}
            />
          )}
        </div>

        {/* Cards in a 2x2 (or more) grid */}
        <div className="grid grid-cols-2 gap-2 px-[2vw]">
          {cards.map((card, idx) => {
            const IconComp = Icons[card.icon] || Icons.Star;
            return (
              <div key={idx}>
                <FeatureCard
                  variant="mobile"
                  icon={IconComp}
                  title={card.title}
                  desc={card.desc}
                  index={idx}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

RichTextPreview.propTypes = {
  richTextData: PropTypes.shape({
    heroText: PropTypes.string,
    bus_description: PropTypes.string,
    bus_description_second: PropTypes.string,
    cards: PropTypes.array,
    images: PropTypes.array,
    overlayImages: PropTypes.array,
    steps: PropTypes.array,
  }),
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func,
};

/* 
=============================================
2) RICH-TEXT EDITOR PANEL (Image Editing Only)
---------------------------------------------
Allows editing of:
- images[] (slideshow images via file upload)

Other fields are edited inline or not at all.
=============================================
*/
function RichTextEditorPanel({ localData, setLocalDataForPanel }) { 
  const {
    images = [],
  } = localData;

  const [validationError, setValidationError] = useState(""); 

  const handleAddImage = () => {
    setLocalDataForPanel((prev) => ({
      ...prev,
      images: [...prev.images, ""], 
      imageUploads: [...(prev.imageUploads || []), null] 
    }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    
    const updatedImageUploads = localData.imageUploads ? [...localData.imageUploads] : [];
    if (updatedImageUploads.length > index) {
      updatedImageUploads.splice(index,1);
    }
    setLocalDataForPanel((prev) => ({ 
        ...prev, 
        images: updatedImages,
        imageUploads: updatedImageUploads 
    }));
  };

  const handleChangeImage = (index, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file); 
      
      const updatedImages = [...images];
      updatedImages[index] = fileURL; 

      const updatedImageUploads = localData.imageUploads ? [...localData.imageUploads] : new Array(images.length).fill(null);
      while(updatedImageUploads.length <= index) {
        updatedImageUploads.push(null);
      }
      updatedImageUploads[index] = { file, fileName: file.name }; 

      setLocalDataForPanel((prev) => ({
        ...prev,
        images: updatedImages,
        imageUploads: updatedImageUploads,
      }));
    }
  };

  return (
    <div className="p-4 mt-4"> {/* Removed distinct background and border */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-700">Slideshow Image Editor</h1>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2 ">
          <h2 className="text-lg font-semibold text-gray-600">Edit Slideshow Images</h2>
          <button
            onClick={handleAddImage}
            type="button" 
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow"
          >
            + Add Image Slot
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((imgSrc, idx) => { // imgSrc is localData.images[idx]
            const currentUpload = localData.imageUploads && localData.imageUploads[idx];
            const previewUrl = currentUpload && currentUpload.file ? URL.createObjectURL(currentUpload.file) : imgSrc;

            return (
              <div key={idx} className="bg-gray-100 p-3 rounded shadow-md relative flex flex-col">
                <button
                  onClick={() => handleRemoveImage(idx)}
                  type="button" 
                  className="bg-red-500 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-600"
                >
                  Remove
                </button>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Image Slot {idx + 1}:
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleChangeImage(idx, file);
                    }
                  }}
                  className="w-full bg-white border border-gray-300 px-2 py-1 rounded mt-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={`Preview ${idx + 1}`}
                    className="mt-2 h-24 w-full object-contain rounded border border-gray-200 bg-gray-50"
                    onLoad={() => {
                      // Revoke object URL only if it was created from a File object for this specific preview
                      if (currentUpload && currentUpload.file && previewUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(previewUrl);
                      }
                    }}
                  />
                ) : (
                  <div className="mt-2 h-24 w-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded text-gray-400 text-xs">Preview</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {validationError && <p className="text-red-500 mt-2 text-sm">{validationError}</p>}
    </div>
  );
}

RichTextEditorPanel.propTypes = {
  localData: PropTypes.shape({
    images: PropTypes.array,
    imageUploads: PropTypes.array, 
  }).isRequired,
  setLocalDataForPanel: PropTypes.func.isRequired,
  // onSave prop is removed as it's no longer used by a button within this panel
};

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- If readOnly=true, shows RichTextPreview (display only)
- If false (edit mode):
    - Shows RichTextPreview (for inline text editing)
    - Shows RichTextEditorPanel (for image editing)
- onConfigChange(updatedData) bubbles ALL changes up (auto-save model).
=============================================
*/
export default function RichTextBlock({
  readOnly = false,
  richTextData, 
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initial = richTextData || {};
    return {
      heroText: initial.heroText || "",
      accredited: initial.accredited || false, 
      years_in_business: initial.years_in_business || "", 
      bus_description: initial.bus_description || "",
      bus_description_second: initial.bus_description_second || "",
      cards: initial.cards?.map((c) => ({ ...c })) || [], 
      images: [...(initial.images || [])],
      imageUploads: initial.images?.map(img => img && typeof img === 'object' && img.file ? {file: img.file, fileName: img.fileName} : null) || [], 
      overlayImages: [
        ...(initial.overlayImages || [
          "/assets/images/shake_img/1.png",
          "/assets/images/shake_img/2.png",
          "/assets/images/shake_img/3.png",
          "/assets/images/shake_img/4.png",
        ]),
      ],
      steps: initial.steps || [], 
    };
  });

  useEffect(() => {
    if (richTextData) {
      setLocalData(prevData => ({
        ...prevData, 
        ...richTextData,
        cards: richTextData.cards?.map((c) => ({ ...c })) || prevData.cards || [],
        images: [...(richTextData.images || prevData.images || [])],
        imageUploads: richTextData.imageUploads || prevData.imageUploads || richTextData.images?.map(img => img && typeof img === 'object' && img.file ? {file: img.file, fileName: img.fileName} : null) || [],
        overlayImages: richTextData.overlayImages || prevData.overlayImages || [
            "/assets/images/shake_img/1.png",
            "/assets/images/shake_img/2.png",
            "/assets/images/shake_img/3.png",
            "/assets/images/shake_img/4.png",
        ],
        steps: richTextData.steps || prevData.steps || [],
      }));
    }
  }, [richTextData]);

  // Wrapper for setLocalData to also call onConfigChange for auto-saving panel changes
  const setLocalDataAndPropagate = (updater) => {
    const newData = typeof updater === 'function' ? updater(localData) : updater;
    setLocalData(newData);
    if (onConfigChange) {
      onConfigChange(newData);
    }
    console.log("RichTextBlock: Data updated and propagated via onConfigChange", newData);
  };

  const handleInlineChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    if (onConfigChange) {
      onConfigChange(updatedData); 
    }
    console.log("Inline change, auto-saving field:", field, "value:", value, "New data:", updatedData);
  };

  if (readOnly) {
    return <RichTextPreview richTextData={richTextData} readOnly={true} />;
  }

  return (
    <>
      <RichTextPreview
        richTextData={localData} 
        readOnly={false}
        onInlineChange={handleInlineChange} 
      />
      <RichTextEditorPanel
        localData={localData}
        setLocalDataForPanel={setLocalDataAndPropagate} // Pass the wrapped setter
      />
    </>
  );
}

RichTextBlock.propTypes = {
  readOnly: PropTypes.bool,
  richTextData: PropTypes.object, 
  onConfigChange: PropTypes.func, 
};
