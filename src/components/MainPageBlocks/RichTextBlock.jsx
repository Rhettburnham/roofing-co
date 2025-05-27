// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Icons from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";
import IconSelectorModal from '../common/IconSelectorModal';

// Module-level flag to track if animation has played this page load
// let pageLoadAnimationHasPlayed = false; // Will be replaced by a ref

// =============================================
// Helper function to derive local state from props
// =============================================
const deriveInitialLocalData = (richTextDataInput, currentBannerColor) => {
  const initial = richTextDataInput || {};
  return {
    heroText: initial.heroText || "",
    accredited: initial.accredited || false,
    years_in_business: initial.years_in_business || "",
    bus_description: initial.bus_description || "",
    bus_description_second: initial.bus_description_second || "",
    cards: initial.cards?.map(c => ({ ...c, id: c.id || `card_${Math.random().toString(36).substr(2, 9)}`, icon: c.icon || 'Star' })) || [],
    images: (initial.images || []).map(img => {
      if (typeof img === 'string') {
        return { 
          file: null, 
          url: img, 
          name: img.split('/').pop(), 
          originalUrl: img 
        };
      }
      // If img is already an object (e.g., from a previous edit session that wasn't fully saved/propagated in old format)
      // try to preserve its structure or default it if invalid.
      return img && typeof img === 'object' && img.url ? 
        { ...img, originalUrl: img.originalUrl || img.url } : 
        { file: null, url: '', name: '', originalUrl: '' }; // Default for malformed objects
    }),
    overlayImages: [...(initial.overlayImages || ["/assets/images/shake_img/1.png", "/assets/images/shake_img/2.png", "/assets/images/shake_img/3.png", "/assets/images/shake_img/4.png"])],
    steps: (initial.steps || []).map(step => ({
      ...step,
      id: step.id || `step_${Math.random().toString(36).substr(2, 9)}`,
      videoFile: step.videoFile || null, 
      videoSrc: step.videoFile ? URL.createObjectURL(step.videoFile) : (step.videoSrc || ''), // Display URL
      videoFileName: step.videoFileName || (step.videoFile ? step.videoFile.name : (typeof step.videoSrc === 'string' ? step.videoSrc.split('/').pop() : '')),
      originalVideoUrl: step.originalVideoUrl || (typeof step.videoSrc === 'string' && !step.videoSrc.startsWith('blob:') ? step.videoSrc : null)
    })),
    sharedBannerColor: initial.sharedBannerColor || currentBannerColor || "#1e293b",
  };
};

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only or Editable)
---------------------------------------------
Displays content. If not readOnly, allows inline editing of text fields and card icons.
=============================================
*/
function RichTextPreview({ richTextData, readOnly, onInlineChange, bannerColor, openIconModalForCard, onCardTextChange }) {
  const [currentImage, setCurrentImage] = useState(0);
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(false);

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimeoutRef = useRef(null); // Ref for the 2.5s play timeout
  const stepsRef = useRef([]); // Initialize with empty array

  // State for image slideshow
  const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] = useState(0);

  // Ref to track if intro animation has played for this instance of RichTextPreview
  const introAnimationPlayedRef = useRef(false); // Initialize with false directly
                                                                    // For true per-pageload-once, the global might still be needed or a context. Let's make it per-instance for now.
                                                                    // Let's simplify and use a ref that's initially false and set to true after first animation.
  const animationPlayedThisInstanceRef = useRef(false);

  // State to control whether the intro animation should play for cards
  const [playIntroAnimationForCards, setPlayIntroAnimationForCards] = useState(false);

  // Refs for textareas
  const heroTextAreaRef = useRef(null);
  const descriptionTextAreaRef = useRef(null);
  const descriptionSecondTextAreaRef = useRef(null);

  const adjustTextareaHeight = useCallback((textareaRef) => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    // This effect runs once on mount to decide if animations should play
    if (!animationPlayedThisInstanceRef.current) {
      setPlayIntroAnimationForCards(true); // Allow animation
      animationPlayedThisInstanceRef.current = true;    // Mark as played for this instance
    } else {
      setPlayIntroAnimationForCards(false); // Skip animation, cards should appear in final state
    }
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    // console.log("RichTextPreview received data:", richTextData, "readOnly:", readOnly, "bannerColor:", bannerColor);
  }, [richTextData, readOnly, bannerColor]);

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  const {
    heroText = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
    steps = [],
  } = richTextData || {};

  // Adjust textarea heights when content changes or readOnly status changes
  useEffect(() => {
    if (!readOnly) adjustTextareaHeight(heroTextAreaRef);
  }, [heroText, readOnly]);

  useEffect(() => {
    if (!readOnly) adjustTextareaHeight(descriptionTextAreaRef);
  }, [bus_description, readOnly]);

  useEffect(() => {
    if (!readOnly) adjustTextareaHeight(descriptionSecondTextAreaRef);
  }, [bus_description_second, readOnly]);

  // Keep stepsRef updated with the latest steps prop (MOVED HERE)
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    // console.log("Steps data:", steps);
    steps.forEach((_, idx) => {
      if (!videoRefs.current[idx]) {
        videoRefs.current[idx] = document.createElement('video');
      }
    });
    const loadVideos = async () => {
      try {
        const promises = steps.map((step, idx) => {
          return new Promise((resolve) => {
            const video = videoRefs.current[idx];
            if (!video) { resolve(); return; }
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
            const normalizedPath = step.videoSrc.startsWith('/') ? step.videoSrc.substring(1) : step.videoSrc;
            video.src = normalizedPath;
            video.load();
            video.onloadeddata = () => { /* console.log(`Video ${idx} data loaded`); */ resolve(); };
            video.oncanplaythrough = () => { /* console.log(`Video ${idx} can play through`); */ resolve(); };
            video.onerror = (e) => { console.error(`Error loading video for step ${idx}:`, step.videoSrc, e); resolve(); }; // Keep error for actual issues
            setTimeout(resolve, 5000);
          });
        });
        await Promise.all(promises);
        // console.log("All videos preloaded");
        setVideosLoaded(true);
      } catch (error) {
        console.error("Error preloading videos:", error);
        setVideosLoaded(true);
      }
    };
    loadVideos();
    return () => {
      videoRefs.current.forEach(video => {
        if (video) {
          try { video.pause(); video.src = ""; video.load(); } catch (e) { console.warn("Error cleaning up video:", e); }
        }
      });
      videoRefs.current = [];
    };
  }, [steps]);

  // Effect for managing video playback (play/pause/load) based on currentSlide
  useEffect(() => {
    if (!videosLoaded || !steps || steps.length === 0) return;

    // console.log(`[Playback Effect] currentSlide is: ${currentSlide}, steps.length: ${steps.length}`);

    // Clear any existing slide advancement timeout before proceeding
    if (slideTimeoutRef.current) {
      clearTimeout(slideTimeoutRef.current);
    }

    videoRefs.current.forEach((video, idx) => {
      if (!video || video.tagName?.toLowerCase() !== 'video') return;
      // Ensure video source is properly set before attempting operations
      const expectedSrc = steps[idx]?.videoFile ? URL.createObjectURL(steps[idx].videoFile) :
                          (steps[idx]?.videoSrc && steps[idx].videoSrc.startsWith('/') ? steps[idx].videoSrc.substring(1) : steps[idx]?.videoSrc);
      if (!video.src || (expectedSrc && video.src !== expectedSrc && !video.src.includes(expectedSrc.split('/').pop()))) {
        // If src is not set, or seems stale (common with blob URLs if component re-renders before videoFile is processed into src attribute)
        // we might need to set it here or rely on the RenderProcessSteps to set it. 
        // For now, we assume RenderProcessSteps correctly sets the src attribute before this effect runs.
        // console.warn(`Video ${idx} src mismatch or not set. Current: ${video.src}, Expected based on step: ${expectedSrc}`);
      }
      if (!video.src && !expectedSrc) {
        // console.warn(`Video ${idx} has no source in DOM or step data.`);
        return;
      }

      try {
        if (idx === currentSlide) {
          // console.log(`Attempting to play video ${idx} (current slide ${currentSlide})`);
          video.currentTime = 0;
          video.muted = true; 
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // console.log(`Video ${idx} started playing. Setting 2.5s timeout to advance slide.`);
              // Set timeout to advance to the next slide after 2.5 seconds
              slideTimeoutRef.current = setTimeout(() => {                
                const latestSteps = stepsRef.current; // Use the most current steps array
                // console.log(`2.5s timer fired for slide ${currentSlide}. Advancing. Latest steps length: ${latestSteps?.length}`); 
                if (latestSteps && latestSteps.length > 0) {
                  setCurrentSlide(prev => (prev + 1) % latestSteps.length);
                } else {
                  setCurrentSlide(0);
                  // console.warn("Steps array was empty or undefined when slide advancement timer fired. Resetting to slide 0.");
                }
              }, 2500); 
            }).catch(error => {
              console.warn(`Video ${idx} play() failed, cannot set advance timer:`, error.name, error.message); // Keep important warnings
            });
          }
        } else {
          video.pause();
          // Preload the next slide (the one that will become currentSlide after this one)
          if (idx === (currentSlide + 1) % steps.length) {
            // console.log(`Preloading video ${idx} (next slide after ${currentSlide})`);
            video.load(); 
          }
        }
      } catch (error) {
        console.warn(`Error controlling video ${idx} in slideshow playback effect:`, error); // Keep important warnings
      }
    });

    return () => {
      // Cleanup: clear the timeout when the component unmounts or dependencies change
      if (slideTimeoutRef.current) {
        // console.log("Clearing slide advance timeout.");
        clearTimeout(slideTimeoutRef.current);
      }
    };
  }, [currentSlide, videosLoaded, steps]); // Depend on currentSlide to manage its specific video and set next timeout

  const slideshowImageSources = images.map(img => {
    if (typeof img === 'string') {
      if (img.startsWith('blob:')) return img;
      if (img.startsWith('/')) return img;
      return `/assets/images/Richtext/${img.split('/').pop() || ''}`;
    }
    return '';
  }).filter(img => img);

  const displaySlideshowImages = slideshowImageSources.length > 0
    ? slideshowImageSources
    : ["/assets/images/Richtext/roof_workers.jpg"];

  // Effect for image slideshow auto-play
  useEffect(() => {
    if (displaySlideshowImages.length > 1) {
      const slideshowInterval = setInterval(() => {
        setCurrentImageSlideshowIndex(prevIndex => (prevIndex + 1) % displaySlideshowImages.length);
      }, 3000); // Change image every 3 seconds
      return () => clearInterval(slideshowInterval);
    }
  }, [displaySlideshowImages.length]);

  const overlayImages = richTextData.overlayImages || [
    "/assets/images/shake_img/1.png",
    "/assets/images/shake_img/2.png",
    "/assets/images/shake_img/3.png",
    "/assets/images/shake_img/4.png",
  ];
  function FeatureCard({
    icon: IconName,
    title,
    desc,
    index,
    variant = "default",
    overlayImages,
    playIntroAnimation,
    readOnlyCard,
    openIconModalForCard,
    onInlineChange
  }) {
    const IconComponent = Icons[IconName] || Icons.Star;
    const baseClasses =
      "relative bg-white p-2 rounded-lg shadow-lg flex flex-col items-center justify-center";
    
    // New size classes based on the request
    const sizeClasses = 
      "w-full md:w-[24vw] " + // Single column full width below md, 24vw width on md and up
      "min-h-[9vw] md:min-h-[7vw] lg:min-h-[6vw]"; // Adjusted heights

    const cardAnimationVariants = {
      hidden: { x: "-100%", rotate: -30, opacity: 0 },
      visible: {
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: {
          type: "spring",
          stiffness: 100,
          damping: 15,
          delay: index * 0.2,
        },
      },
    };

    const overlayAnimationVariants = {
      hidden: { opacity: 1, pointerEvents: 'auto' }, // Overlay is visible and interactive initially
      visible: { // Overlay is invisible and non-interactive after animation
        opacity: 0,
        pointerEvents: 'none', // Make it non-interactive when faded
        transition: {
          duration: 0.5,
          ease: "easeOut",
          delay: (index * 0.2) + 0.8,
        },
      },
    };

    const handleTitleChange = (e) => {
      onInlineChange(index, 'title', e.target.value);
    };
    const handleDescChange = (e) => {
      onInlineChange(index, 'desc', e.target.value);
    };

    return (
      <motion.div
        className={`${baseClasses} ${sizeClasses}`}
        variants={cardAnimationVariants}
        initial={playIntroAnimation ? "hidden" : "visible"}
        animate={"visible"}
      >
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
        <div
          className={`absolute -top-1 -right-1 w-auto h-8 md:h-10 z-30 flex items-center justify-center space-x-1 p-1 rounded-sm 
                      ${!readOnlyCard && openIconModalForCard ? 'cursor-pointer transition-colors hover:bg-black/20' : ''}`}
          onClick={(e) => {
            if (!readOnlyCard && openIconModalForCard) {
              e.stopPropagation();
              openIconModalForCard(index);
            }
          }}
          title={!readOnlyCard ? "Edit Icon" : ""}
        >
          {IconComponent && <IconComponent className="text-white drop-shadow-lg w-6 h-6 md:w-8 md:h-8" />}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-transparent z-10 rounded-lg" />
        
        <motion.div
          className="absolute inset-0 bg-center bg-cover z-40 rounded-lg"
          style={{
            backgroundImage: `url(${overlayImages[index % overlayImages.length]})`,
          }}
          variants={overlayAnimationVariants}
          initial={playIntroAnimation ? "hidden" : "visible"} 
          animate={"visible"} 
        />

        <div className="relative flex flex-col z-30 w-full h-full items-start justify-start p-1 md:p-2">
          <div className="relative w-full mb-1 md:mb-2" style={{ zIndex: 51 }}>
            {readOnlyCard ? (
              <h3 className="ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words">
                {title}
              </h3>
            ) : (
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                className="ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans bg-transparent focus:bg-white/50 focus:backdrop-blur-sm border-none focus:border-b focus:border-brand-accent outline-none w-[calc(100%-2.5rem)] md:w-[calc(100%-3rem)] p-[1px] rounded-sm placeholder-gray-500"
                onClick={(e) => e.stopPropagation()} 
                placeholder="Edit title..."
                style={{ lineHeight: 'normal' }}
              />
            )}
          </div>

          <div className="relative w-full flex-grow" style={{ zIndex: 51 }}>
            {readOnlyCard ? (
              <p className="ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-tight break-words">
                {desc}
              </p>
            ) : (
              <textarea
                value={desc}
                onChange={handleDescChange}
                className="ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 font-serif leading-tight bg-transparent focus:bg-white/50 focus:backdrop-blur-sm border-none focus:border-b focus:border-brand-accent outline-none w-full h-full resize-none p-[1px] rounded-sm placeholder-gray-500"
                onClick={(e) => e.stopPropagation()} 
                placeholder="Edit description..."
                style={{ lineHeight: 'normal', overflowY: 'auto' }}
                rows={3}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
  

  FeatureCard.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    desc: PropTypes.string,
    index: PropTypes.number,
    variant: PropTypes.string,
    overlayImages: PropTypes.array.isRequired,
    playIntroAnimation: PropTypes.bool.isRequired,
    readOnlyCard: PropTypes.bool.isRequired,
    openIconModalForCard: PropTypes.func,
    onInlineChange: PropTypes.func.isRequired,
  };

  const RenderProcessSteps = () => {
    if (!steps || steps.length === 0) {
      return <div className="text-center md:py-2">No process steps available</div>;
    }

    // Define the size of the circular viewport for calculations
    // These were the old values, now replaced by Tailwind classes below
    // const viewportSizeVH = 14.4; // vh for mobile-first width/height
    // const mdViewportSizeVH = 20; // vh for md breakpoint
    // Note: Animating based on VH directly in JS can be tricky if CSS/JS values diverge.
    // For simplicity, we assume these are fixed or can be obtained if needed.
    // A ref to the viewport div could get its actual pixel width on mount for more robust calculations.

    return (
      <div className="w-full flex flex-col items-center">
        {/* Viewport Container - circular, overflow hidden */}
        <div 
          className="relative bg-white overflow-hidden mb-2 md:mb-3 w-[18vh] h-[18vh] md:w-[22vh] md:h-[22vh]"
          // Removed inline style: style={{
          //  width: `${viewportSizeVH}vh`, 
          //  height: `${viewportSizeVH}vh`,
          // }}
        >
          {/* Sliding Strip - will contain all videos, animated on x-axis */}
          <motion.div
            className="flex h-full" // Use flex to lay out videos horizontally
            style={{ width: `${steps.length * 100}%` }} // Strip is N times the viewport width
            animate={{
              x: `-${currentSlide * (100 / (steps.length || 1))}%` // Guard against division by zero if steps.length is briefly 0
            }}
            transition={{ type: "tween", duration: 1, ease: "easeInOut" }} // Slide duration 1 second
            // onAnimationStart={() => console.log(`[Animation Start] Sliding to slide: ${currentSlide}, target x: -${currentSlide * (100 / (steps.length || 1))}%`)}
            // onAnimationComplete={() => console.log(`[Animation Complete] Arrived at slide: ${currentSlide}`)}
          >
            {steps.map((step, index) => {
              const videoSrc = step.videoFile ? URL.createObjectURL(step.videoFile) :
                               (step.videoSrc && step.videoSrc.startsWith('/') ? step.videoSrc.substring(1) : step.videoSrc);
              
              return (
                // Each Video Item takes full width of the viewport (100% of its allocated segment in the strip)
                <div 
                  key={step.title + index} 
                  className="w-full h-full flex-shrink-0 flex items-center justify-center"
                  style={{ width: `${100 / steps.length}%`}} // Each item is 1/Nth of the strip's total width
                >
                  {videoSrc ? (
                    <video
                      ref={el => videoRefs.current[index] = el}
                      src={videoSrc}
                      muted
                      playsInline
                      loop 
                      autoPlay // Autoplay will be managed by useEffect primarily
                      className="object-contain"
                      style={{ width: `${(step.scale || 1) * 100}%`, height: `${(step.scale || 1) * 100}%` }}
                      preload="auto"
                      key={videoSrc + index + (step.videoFile ? step.videoFile.name : '')} 
                      // onLoadedData={() => console.log(`Video ${index} (for slide ${index}) loaded data. Current slide is ${currentSlide}`)}
                      // onError={(e) => console.error(`Video ${index} load error:`, e, "Source:", videoSrc)}
                    />
                  ) : (
                    <Icons.HelpCircle className="w-1/2 h-1/2 text-gray-400" />
                  )}
                </div>
              );
            })}
          </motion.div>
        </div>
        {/* Text titles/navigation can be re-added here if desired, but removed per last request */}
      </div>
    );
  };

  const ImageSlideshow = () => {
    if (!displaySlideshowImages || displaySlideshowImages.length === 0) return null;
    return (
      <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden rounded-lg shadow-lg bg-gray-200">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentImageSlideshowIndex}
            src={displaySlideshowImages[currentImageSlideshowIndex]}
            alt={`Slideshow image ${currentImageSlideshowIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.target.style.display='none'; }}
          />
        </AnimatePresence>
         {displaySlideshowImages.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-500">No images available.</p>
            </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const checkAutoplaySupport = async () => { try { const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = "auto"; } catch (error) { console.error("Error checking autoplay support:", error); } };
    checkAutoplaySupport(); 
  }, []);

  const handleCardChange = (cardIndex, field, value) => {
    const updatedCards = cards.map((card, idx) => 
      idx === cardIndex ? { ...card, [field]: value } : card
    );
    onInlineChange({ cards: updatedCards });
  };

  const hasDescriptionContent = richTextData.bus_description || richTextData.bus_description_second || !readOnly;
  const hasProcessSteps = steps && steps.length > 0;
  const hasSlideshowImages = displaySlideshowImages.length > 0;
  const hasCards = cards && cards.length > 0;

  return (
    <div className="rich-text-preview-container mx-auto px-6 py-4 flex flex-col gap-y-2 md:gap-y-3">

      {/* NEW TOP CONTAINER: MD is ROW, SM is COL */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-x-6 lg:gap-x-8 w-full my-1 md:my-2">

        {/* PART 1: Left Column (Header & Videos on MD), or Top Row (Header/Video side-by-side on SM) */}
        {/* This part should render if either hero text OR process steps are present */}
        {(richTextData.heroText || !readOnly || hasProcessSteps) && (
          <div className="flex flex-col md:w-1/2 lg:w-2/5 xl:w-1/3 order-1"> {/* Outer container for this part */}
            <div className="flex flex-row items-stretch justify-center md:flex-col md:items-center"> {/* items-stretch for mobile row height, justify-center for single item centering */}

              {/* Hero Text */}
              {(richTextData.heroText || !readOnly) && (
                <div className={`px-1 md:px-0 my-1 md:my-1 text-center md:max-w-xl md:mx-auto ${hasProcessSteps ? 'w-1/2 md:w-full' : 'w-full'}`}>
                  {readOnly ? (
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 whitespace-pre-line">{heroText}</h2>
                  ) : (
                    <textarea
                      ref={heroTextAreaRef}
                      value={heroText || ""}
                      onChange={(e) => {
                        onInlineChange('heroText', e.target.value);
                      }}
                      placeholder="Enter Hero Text..."
                      className="text-3xl md:text-4xl font-bold text-center w-full max-w-2xl mx-auto bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 resize-none"
                      rows={2}
                      style={readOnly ? {} : { overflowY: 'hidden' }}
                    />
                  )}
                </div>
              )}

              {/* Process Videos */}
              {hasProcessSteps && (
                <div className={`px-1 md:px-0 my-1 md:my-1 ${(richTextData.heroText || !readOnly) ? 'w-1/2 md:w-full' : 'w-full'}`}>
                  <RenderProcessSteps />
                </div>
              )}
            </div>
          </div>
        )}

        {/* PART 2: Right Column (Feature Cards on MD), or Section below Header/Video on SM */}
        {hasCards && (
          <div className="w-full md:w-1/2 lg:w-3/5 xl:w-2/3 my-4 md:my-0 order-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-stretch">
              {cards.map((card, idx) => (
                <FeatureCard
                  key={card.id || idx}
                  icon={card.icon}
                  title={card.title}
                  desc={card.desc}
                  index={idx}
                  overlayImages={overlayImages}
                  playIntroAnimation={playIntroAnimationForCards}
                  readOnlyCard={readOnly}
                  openIconModalForCard={openIconModalForCard}
                  onInlineChange={onCardTextChange}
                />
              ))}
            </div>
          </div>
        )}
      </div> {/* END OF NEW TOP CONTAINER */}


      {/* DESCRIPTIONS AND SLIDESHOW SECTION (Remains below the new top container) */}
      {(hasDescriptionContent || hasSlideshowImages) && (
        <div className="flex flex-col px-[10vw] md:px-[15vw] md:flex-row md:items-start md:gap-x-6 lg:gap-x-8 w-full my-1 md:my-2 order-3">
          {/* Descriptions Column */}
          {hasDescriptionContent && (
            <div className={`w-full ${hasSlideshowImages ? 'md:w-1/2' : 'md:w-full'} space-y-4 px-2 md:px-0`}>
              {readOnly ? (
                richTextData.bus_description && (
                  <p className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8">
                    {richTextData.bus_description}
                  </p>
                )
              ) : (
                <textarea
                  ref={descriptionTextAreaRef}
                  value={bus_description || ""}
                  onChange={(e) => onInlineChange('bus_description', e.target.value)}
                  placeholder="Enter primary business description..."
                  className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 resize-none"
                  rows={3} style={readOnly ? {} : { overflowY: 'hidden' }}
                />
              )}

              {readOnly ? (
                richTextData.bus_description_second && (
                  <p className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 mt-3">
                    {richTextData.bus_description_second}
                  </p>
                )
              ) : (
                <textarea
                  ref={descriptionSecondTextAreaRef}
                  value={bus_description_second || ""}
                  onChange={(e) => onInlineChange('bus_description_second', e.target.value)}
                  placeholder="Enter secondary business description..."
                  className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 mt-3 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 resize-none"
                  rows={3} style={readOnly ? {} : { overflowY: 'hidden' }}
                />
              )}
            </div>
          )}

          {/* Image Slideshow Column */}
          {hasSlideshowImages && (
            <div className={`w-full ${hasDescriptionContent ? 'md:w-1/2' : 'md:w-full'} ${hasDescriptionContent ? 'mt-6 md:mt-0' : ''} px-2 md:px-0`}>
              <ImageSlideshow />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

RichTextPreview.propTypes = {
  richTextData: PropTypes.shape({
    heroText: PropTypes.string,
    bus_description: PropTypes.string,
    bus_description_second: PropTypes.string,
    cards: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        desc: PropTypes.string,
        icon: PropTypes.string,
    })),
    images: PropTypes.array,
    overlayImages: PropTypes.array,
    steps: PropTypes.array,
  }).isRequired,
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func.isRequired,
  bannerColor: PropTypes.string,
  openIconModalForCard: PropTypes.func,
  onCardTextChange: PropTypes.func.isRequired,
};

/* 
=============================================
2) RICH-TEXT CONTROLS PANEL
---------------------------------------------
Allows editing of:
- images[] (slideshow images via file upload)
- sharedBannerColor (to sync with HeroBlock's bannerColor)
- Process Steps (title, href, scale, video)
=============================================
*/
function RichTextControlsPanel({ localData, onDataChange, currentBannerColor }) {
  const { images = [], steps = [], imageUploads = [] } = localData || {};

  const handleSharedBannerColorChange = (color) => {
    const newColor = typeof color === 'string' ? color : '#000000'; 
    onDataChange((prev) => ({ ...prev, sharedBannerColor: newColor }));
  };

  const handleAddImage = () => {
    onDataChange((prev) => ({ 
        ...prev, 
        images: [...(prev.images || []), { file: null, url: '', name: 'New Image', originalUrl: '' }], 
        // imageUploads: [...(prev.imageUploads || []), null] // No longer needed
    }));
  };

  const handleRemoveImage = (index) => {
    onDataChange((prev) => {
        const currentImages = prev.images || [];
        // const currentImageUploads = prev.imageUploads || []; // No longer needed

        const updatedImages = [...currentImages];
        const imageToRemove = updatedImages[index];
        if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToRemove.url);
        }
        updatedImages.splice(index, 1);
        
        // const updatedImageUploads = [...currentImageUploads]; // No longer needed
        // if (updatedImageUploads.length > index) {  // No longer needed
        //     const uploadData = updatedImageUploads[index]; // No longer needed
        //     if (uploadData && uploadData.file && typeof imageToRemoveSrc === 'string' && imageToRemoveSrc.startsWith('blob:')) { // No longer needed
        //         URL.revokeObjectURL(imageToRemoveSrc); // No longer needed
        //     } // No longer needed
        //     updatedImageUploads.splice(index,1);  // No longer needed
        // } // No longer needed
        return { ...prev, images: updatedImages /*, imageUploads: updatedImageUploads */ }; // imageUploads removed
    });
  };

  const handleChangeImage = (index, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file); 
      onDataChange((prev) => {
          const currentImages = prev.images || [];
          // const currentImageUploads = prev.imageUploads || []; // No longer needed

          const updatedImages = [...currentImages];
          // const updatedImageUploads = [...currentImageUploads]; // No longer needed
          
          while(updatedImages.length <= index) { 
            updatedImages.push({ file: null, url: '', name: '', originalUrl: '' }); 
          }
          // while(updatedImageUploads.length <= index) { updatedImageUploads.push(null); } // No longer needed

          const oldImageState = updatedImages[index];
          if (oldImageState && oldImageState.url && oldImageState.url.startsWith('blob:')) {
              URL.revokeObjectURL(oldImageState.url);
          }

          updatedImages[index] = { 
            file: file, 
            url: fileURL, 
            name: file.name, 
            originalUrl: oldImageState?.originalUrl || '' // Preserve originalUrl
          }; 
          // updatedImageUploads[index] = { file, fileName: file.name }; // No longer needed
          return { ...prev, images: updatedImages /*, imageUploads: updatedImageUploads */ }; // imageUploads removed
      });
    }
  };

  const handleStepChange = (index, field, value) => {
    onDataChange(prev => {
        const updatedSteps = (prev.steps || []).map((step, i) => 
            i === index ? { ...step, [field]: value } : step
        );
        return { ...prev, steps: updatedSteps };
    });
  };

  const handleStepVideoUpload = (index, file) => {
    if (file) {
      const newVideoSrcBlob = URL.createObjectURL(file);
      onDataChange(prev => {
          const currentSteps = prev.steps || [];
          const oldStep = currentSteps[index];
          if (oldStep && oldStep.videoFile && oldStep.videoSrc && oldStep.videoSrc.startsWith('blob:')) {
              URL.revokeObjectURL(oldStep.videoSrc);
          }

          let updatedSteps = [...currentSteps];
          if (index < updatedSteps.length) {
            updatedSteps = updatedSteps.map((step, i) =>
                i === index ? { 
                    ...step, 
                    videoFile: file, 
                    videoSrc: newVideoSrcBlob, 
                    videoFileName: file.name, 
                    originalVideoUrl: step.originalVideoUrl // Preserve existing originalVideoUrl
                } : step
            );
          } else if (index === updatedSteps.length) { 
             updatedSteps.push({
                id: `step_new_${Date.now()}`,
                title: "New Video Step", 
                videoFile: file, 
                videoSrc: newVideoSrcBlob, 
                videoFileName: file.name, 
                href: "#", 
                scale: 1,
                originalVideoUrl: null // New step, no original video URL yet
            });
          }
          
          return { ...prev, steps: updatedSteps };
      });
    }
  };
  
  const handleAddStep = () => {
    const newStep = { 
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2,5)}`, 
        title: "New Step", 
        videoSrc: "", 
        href: "#", 
        scale: 1, 
        videoFile: null, 
        videoFileName: "", 
        originalVideoUrl: null 
    };
    onDataChange(prev => ({ ...prev, steps: [...(prev.steps || []), newStep] }));
  };

  const handleRemoveStep = (index) => {
    onDataChange(prev => {
        const currentSteps = prev.steps || [];
        const stepToRemove = currentSteps[index];
        if (stepToRemove && stepToRemove.videoFile && stepToRemove.videoSrc && stepToRemove.videoSrc.startsWith('blob:')) {
          URL.revokeObjectURL(stepToRemove.videoSrc); 
        }
        const updatedSteps = currentSteps.filter((_, i) => i !== index);
        return { ...prev, steps: updatedSteps };
    });
  };

  return (
    <div> 
      <div className="flex items-center justify-between mb-4"><h1 className="text-xl md:text-2xl font-semibold text-gray-200">Content Editor</h1></div>
      
      {/* Image Editor Section */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2 ">
          <h2 className="text-lg font-semibold text-gray-300">Edit Slideshow Images</h2>
          <button onClick={handleAddImage} type="button" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow">+ Add Image Slot</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
          {(images || []).map((imgState, idx) => { 
            // const currentUpload = imageUploads && imageUploads[idx]; // No longer neededcols-3
            let displayFileName = 'Empty';
            if (imgState && imgState.name) {
                displayFileName = imgState.name;
            } else if (imgState && typeof imgState.url === 'string' && !imgState.url.startsWith('blob:') && imgState.url) {
                displayFileName = imgState.url.split('/').pop() || 'Existing Image';
            } else if (imgState && typeof imgState.url === 'string' && imgState.url.startsWith('blob:')) {
                displayFileName = imgState.name || 'New Upload'; // Use name from file if available
            }

            let previewUrl = imgState?.url; 
            if (typeof previewUrl === 'string' && !previewUrl.startsWith('blob:') && !previewUrl.startsWith('/') && previewUrl) {
                previewUrl = `/assets/images/Richtext/${previewUrl.split('/').pop() || ''}`;
            } else if (!previewUrl && imgState?.file) { // Should be handled by imgState.url being blob
                // previewUrl = URL.createObjectURL(imgState.file); 
            }
            
            return (
              <div key={idx} className="bg-gray-700 p-3 rounded shadow-md relative flex flex-col">
                <button onClick={() => handleRemoveImage(idx)} type="button" className="bg-red-500 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-600">Remove</button>
                <label className="block text-sm mb-1 font-medium text-gray-300 truncate">Slot {idx + 1}: {displayFileName}</label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleChangeImage(idx, file); } e.target.value = null; }} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded mt-1 text-sm text-white focus:ring-blue-500 focus:border-blue-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={`Preview ${idx + 1}`}
                    className="mt-2 h-24 w-full object-contain rounded border border-gray-500 bg-gray-600" 
                    onError={(e) => {e.target.style.display='none'; /* Hide broken img */}}
                  />
                ) : (
                  <div className="mt-2 h-24 w-full flex items-center justify-center bg-gray-600 border border-dashed border-gray-500 rounded text-gray-400 text-xs">Preview</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Steps Editor Section */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-300">Edit Process Steps</h2>
          <button onClick={handleAddStep} type="button" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow">+ Add Step</button>
        </div>
        <div className="space-y-4">
          {(steps || []).map((step, index) => (
            <div key={step.id || index} className="bg-gray-700 p-3 rounded shadow-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-md font-semibold text-gray-200">Step {index + 1}</h3>
                <button onClick={() => handleRemoveStep(index)} type="button" className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded">Remove Step</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-300">Title:</label>
                  <input type="text" value={step.title || ''} onChange={(e) => handleStepChange(index, 'title', e.target.value)} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-300">Link URL (href):</label>
                  <input type="text" value={step.href || ''} onChange={(e) => handleStepChange(index, 'href', e.target.value)} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-300">Icon Scale (e.g., 0.8, 1, 1.25):</label>
                  <input type="number" step="0.05" value={step.scale || 1} onChange={(e) => handleStepChange(index, 'scale', parseFloat(e.target.value))} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded text-sm text-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-300">Video File:</label>
                  <input type="file" accept="video/*" onChange={(e) => {const file = e.target.files?.[0]; if(file) handleStepVideoUpload(index, file); e.target.value = null;}} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded mt-1 text-sm text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                  {step.videoSrc && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Current: {step.videoFileName || step.videoSrc.split('/').pop()}</span>
                      {step.videoSrc.startsWith('blob:') && <video src={step.videoSrc} controls className="mt-1 w-full h-24 object-contain rounded bg-black" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Shared Banner Color Section */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <label className="block text-sm mb-1 font-medium text-gray-300">Shared Banner Gradient Color (syncs with Hero):</label>
        <input 
          type="color" 
          value={(localData && localData.sharedBannerColor) || currentBannerColor || "#1e293b"} 
          onChange={(e) => handleSharedBannerColorChange(e.target.value)}
          className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer"
        />
      </div>
    </div>
  );
}

RichTextControlsPanel.propTypes = { 
  localData: PropTypes.shape({ 
    images: PropTypes.array, 
    imageUploads: PropTypes.array,
    sharedBannerColor: PropTypes.string, 
    steps: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        href: PropTypes.string,
        scale: PropTypes.number,
        videoSrc: PropTypes.string,
        videoFile: PropTypes.object, 
        videoFileName: PropTypes.string,
    })),
  }).isRequired,
  onDataChange: PropTypes.func.isRequired,
  currentBannerColor: PropTypes.string, 
};

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- If `controlsOpen` is true, it renders RichTextControlsPanel for image editing,
  and RichTextPreview for inline text editing.
- If `controlsOpen` is false, it renders RichTextPreview in read-only mode (for text)
  or editable mode based on the `readOnly` prop.
- `onConfigChange` bubbles ALL changes up.
- `showControls` prop will determine if the RichTextControlsPanel is rendered.
=============================================
*/
export default function RichTextBlock({ 
  readOnly = false, 
  richTextData, 
  onConfigChange, 
  bannerColor,
  showControls = false 
}) {
  const [localData, setLocalData] = useState(() => deriveInitialLocalData(richTextData, bannerColor));
  const prevShowControlsRef = useRef(showControls);

  const [isIconModalOpenForCards, setIsIconModalOpenForCards] = useState(false);
  const [editingCardIndexForIcon, setEditingCardIndexForIcon] = useState(null);

  // Effect to synchronize localData with richTextData prop
  useEffect(() => {
    setLocalData(prevLocalData => {
      const newBaseFromProps = deriveInitialLocalData(richTextData, bannerColor);
      const defaultHeroText = "";
      const defaultBusDesc = "";
      const defaultBusDescSecond = "";

      const resolvedHeroText =
        (prevLocalData.heroText !== undefined && prevLocalData.heroText !== (newBaseFromProps.heroText || defaultHeroText) && prevLocalData.heroText !== defaultHeroText)
        ? prevLocalData.heroText
        : (newBaseFromProps.heroText || defaultHeroText);

      const resolvedBusDescription =
        (prevLocalData.bus_description !== undefined && prevLocalData.bus_description !== (newBaseFromProps.bus_description || defaultBusDesc) && prevLocalData.bus_description !== defaultBusDesc)
        ? prevLocalData.bus_description
        : (newBaseFromProps.bus_description || defaultBusDesc);

      const resolvedBusDescriptionSecond =
        (prevLocalData.bus_description_second !== undefined && prevLocalData.bus_description_second !== (newBaseFromProps.bus_description_second || defaultBusDescSecond) && prevLocalData.bus_description_second !== defaultBusDescSecond)
        ? prevLocalData.bus_description_second
        : (newBaseFromProps.bus_description_second || defaultBusDescSecond);

      const mergedImages = (newBaseFromProps.images || []).map((propImgState, idx) => {
        const prevImgState = prevLocalData.images?.[idx];
        if (prevImgState && prevImgState.file && 
            (prevImgState.url === propImgState.url || 
             (prevImgState.originalUrl && prevImgState.originalUrl === propImgState.originalUrl) ||
             (propImgState.url && propImgState.url === prevImgState.url ) // if prop url is already blob from parent
            ))
        {
          return prevImgState; 
        }
        return propImgState; 
      });

      const mergedSteps = (newBaseFromProps.steps || []).map((propStep) => {
        const prevStep = prevLocalData.steps?.find(s => s.id === propStep.id);
        if (prevStep && prevStep.videoFile && 
            (prevStep.videoSrc === propStep.videoSrc || 
             (prevStep.originalVideoUrl && prevStep.originalVideoUrl === propStep.originalVideoUrl) ||
             (propStep.videoSrc && propStep.videoSrc === prevStep.videoSrc) // if prop src is already blob
            ))
        {
          return { ...propStep, videoFile: prevStep.videoFile, videoFileName: prevStep.videoFileName, videoSrc: prevStep.videoSrc, originalVideoUrl: prevStep.originalVideoUrl };
        }
        return propStep;
      });

      const mergedCards = (newBaseFromProps.cards || []).map((propCard) => {
        const localCardEquivalent = prevLocalData.cards?.find(lc => lc.id === propCard.id);
        if (localCardEquivalent) {
          return {
            ...propCard, 
            icon: propCard.icon || localCardEquivalent.icon || 'Star', // Prioritize prop icon for immediate feedback from modal
            title: (localCardEquivalent.title !== undefined && localCardEquivalent.title !== (propCard.title || "") && localCardEquivalent.title !== "") 
                   ? localCardEquivalent.title 
                   : (propCard.title || ""),
            desc: (localCardEquivalent.desc !== undefined && localCardEquivalent.desc !== (propCard.desc || "") && localCardEquivalent.desc !== "")
                  ? localCardEquivalent.desc
                  : (propCard.desc || ""),
          };
        }
        return { ...propCard, icon: propCard.icon || 'Star'}; 
      });

      return {
        ...newBaseFromProps, // Base for panel-controlled items like sharedBannerColor
        heroText: resolvedHeroText,
        bus_description: resolvedBusDescription,
        bus_description_second: resolvedBusDescriptionSecond,
        cards: mergedCards,
        images: mergedImages,
        steps: mergedSteps,
      };
    });
  }, [richTextData, bannerColor]); // MODIFIED: Removed showControls and localData dependencies

  // Effect to call onConfigChange when exiting edit mode
  useEffect(() => {
    if (prevShowControlsRef.current === true && showControls === false) {
      if (onConfigChange) {
        // console.log("RichTextBlock: Editing finished (showControls from true to false). Calling onConfigChange with:", localData);
        onConfigChange(localData);
      }
    }
    prevShowControlsRef.current = showControls;
  }, [showControls, localData, onConfigChange]); 

  // For RichTextControlsPanel: updates localData AND propagates immediately via onConfigChange
  const setLocalDataAndPropagate = useCallback((updater) => {
    let newDataSetByUpdater;
    setLocalData(currentLocalData => {
        newDataSetByUpdater = typeof updater === 'function' ? updater(currentLocalData) : updater;
        // Critical: Ensure onConfigChange is called with the *result* of the state update.
        // React state updates can be asynchronous.
        return newDataSetByUpdater;
    });

    // Call onConfigChange *after* setLocalData has initiated the update.
    // It will use the value that *will be* set.
    // For more robust propagation, onConfigChange could be called in a useEffect that watches specific parts of localData
    // known to be changed by the panel, but this direct call is common.
    if (showControls && onConfigChange) {
        // We need to ensure newDataSetByUpdater is defined. This will happen if updater ran.
        // This is a slight simplification; for absolute certainty with async state,
        // one might use a useEffect to watch for changes to panel-controlled fields in localData.
        // However, given the flow, this direct call often works as intended.
        
        // Schedule onConfigChange to run after the current event loop tick,
        // allowing React to process the state update first.
        setTimeout(() => {
            setLocalData(currentAfterUpdate => { // Read the most current state
                 // console.log("RichTextBlock: Data updated from ControlsPanel/IconSelection, propagating immediately.", currentAfterUpdate);
                 onConfigChange(currentAfterUpdate);
                 return currentAfterUpdate; // No actual change, just reading
            });
        }, 0);
    }
  }, [showControls, onConfigChange]);

  // For RichTextPreview inline text edits (hero, descriptions, card text on blur): updates localData only.
  const handleInlineChange = useCallback((fieldOrObject, value) => {
    setLocalData(prevLocalData => {
      let newLocalData;
      if (typeof fieldOrObject === 'object') { 
        newLocalData = { ...prevLocalData, ...fieldOrObject };
      } else { 
        newLocalData = { ...prevLocalData, [fieldOrObject]: value };
      }
      // console.log("RichTextBlock: Inline change, local data updated (will save on exit).", newLocalData);
      return newLocalData;
    });
  }, []); 

  const openIconModalForCard = useCallback((cardIndex) => {
    setEditingCardIndexForIcon(cardIndex);
    setIsIconModalOpenForCards(true);
  }, []);

  const handleCardIconSelection = useCallback((pack, iconName) => {
    if (editingCardIndexForIcon !== null) {
      // Update local state first
      let newLocalDataAfterIconChange;
      setLocalData(prevLocalData => {
        const updatedCards = prevLocalData.cards.map((card, idx) =>
          idx === editingCardIndexForIcon ? { ...card, icon: iconName } : card
        );
        newLocalDataAfterIconChange = { ...prevLocalData, cards: updatedCards };
        return newLocalDataAfterIconChange;
      });

      // Then propagate this specific change immediately using onConfigChange
      // This requires newLocalDataAfterIconChange to be available here.
      // Using a timeout or a more complex state management for propagation might be needed if direct access isn't reliable.
      // For simplicity, attempting direct propagation, assuming setLocalData finishes or queues fast enough.
      if (showControls && onConfigChange) {
         // Use a timeout to ensure state update has likely processed
         setTimeout(() => {
            setLocalData(currentAfterIconUpdate => {
                // console.log("RichTextBlock: Card icon updated, propagating immediately.", currentAfterIconUpdate);
                onConfigChange(currentAfterIconUpdate);
                return currentAfterIconUpdate; // No change, just reading
            });
        }, 0);
      }
    }
    setIsIconModalOpenForCards(false);
    setEditingCardIndexForIcon(null);
  }, [editingCardIndexForIcon, showControls, onConfigChange]);

  // Define handleCardChange here
  const handleCardChange = useCallback((cardIndex, field, value) => {
    setLocalData(prevLocalData => {
      const updatedCards = (prevLocalData.cards || []).map((card, idx) => 
        idx === cardIndex ? { ...card, [field]: value } : card
      );
      const newLocalData = { ...prevLocalData, cards: updatedCards };
      // If controls are open, propagate immediately.
      // Otherwise, changes are local and will be saved when controls are closed/edit finishes.
      if (showControls && onConfigChange) {
        // console.log("RichTextBlock: Card text changed (from handleCardChange), propagating immediately.", newLocalData);
        onConfigChange(newLocalData);
      }
      return newLocalData;
    });
  }, [showControls, onConfigChange]);

  return (
    <>
      <RichTextPreview 
        richTextData={localData} 
        readOnly={!showControls} 
        onInlineChange={handleInlineChange} 
        bannerColor={bannerColor} 
        openIconModalForCard={openIconModalForCard}
        onCardTextChange={handleCardChange}
      />
      {showControls && (
        <div className="bg-gray-800 text-white p-4 rounded-lg mt-4 shadow-lg">
          <RichTextControlsPanel 
            localData={localData} 
            onDataChange={setLocalDataAndPropagate} 
            currentBannerColor={(localData && localData.sharedBannerColor) || bannerColor || "#1e293b"} 
          />
        </div>
      )}
      {isIconModalOpenForCards && (
        <IconSelectorModal
          isOpen={isIconModalOpenForCards}
          onClose={() => {
            setIsIconModalOpenForCards(false);
            setEditingCardIndexForIcon(null);
          }}
          onIconSelect={handleCardIconSelection}
          currentIconPack={'lucide'} 
          currentIconName={editingCardIndexForIcon !== null && localData.cards[editingCardIndexForIcon] ? localData.cards[editingCardIndexForIcon].icon : null}
        />
      )}
    </>
  );
}

RichTextBlock.propTypes = {
  readOnly: PropTypes.bool,
  richTextData: PropTypes.object, 
  onConfigChange: PropTypes.func, 
  bannerColor: PropTypes.string,
  showControls: PropTypes.bool, 
};
