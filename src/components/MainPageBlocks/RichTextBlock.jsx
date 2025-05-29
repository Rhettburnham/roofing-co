// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Icons from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";
import IconSelectorModal from '../common/IconSelectorModal';
import ThemeColorPicker from "../common/ThemeColorPicker";

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
  // Removed videoRefs, activeVideo, videosLoaded, slideTimeoutRef, stepsRef
  // const videoRefs = useRef([]);
  // const [activeVideo, setActiveVideo] = useState(0);
  // const [videosLoaded, setVideosLoaded] = useState(false);
  // const slideTimeoutRef = useRef(null); 
  // const stepsRef = useRef([]); 

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0); // This was for video steps, might be reused or removed if not needed for general slideshow

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
    // steps = [], // Steps removed
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
  // useEffect(() => { // STEPS REMOVED
  // stepsRef.current = steps;
  // }, [steps]);

  // useEffect(() => { // STEPS REMOVED - All video loading and playback logic
    // console.log("Steps data:", steps);
    // steps.forEach((_, idx) => {
    //   if (!videoRefs.current[idx]) {
    //     videoRefs.current[idx] = document.createElement('video');
    //   }
    // });
    // const loadVideos = async () => {
    //   try {
    //     const promises = steps.map((step, idx) => {
    //       return new Promise((resolve) => {
    //         const video = videoRefs.current[idx];
    //         if (!video) { resolve(); return; }
    //         video.muted = true;
    //         video.playsInline = true;
    //         video.preload = "auto";
    //         const normalizedPath = step.videoSrc.startsWith('/') ? step.videoSrc.substring(1) : step.videoSrc;
    //         video.src = normalizedPath;
    //         video.load();
    //         video.onloadeddata = () => { /* console.log(`Video ${idx} data loaded`); */ resolve(); };
    //         video.oncanplaythrough = () => { /* console.log(`Video ${idx} can play through`); */ resolve(); };
    //         video.onerror = (e) => { console.error(`Error loading video for step ${idx}:`, step.videoSrc, e); resolve(); }; // Keep error for actual issues
    //         setTimeout(resolve, 5000);
    //       });
    //     });
    //     await Promise.all(promises);
        // console.log("All videos preloaded");
    //     setVideosLoaded(true);
    //   } catch (error) {
    //     console.error("Error preloading videos:", error);
    //     setVideosLoaded(true);
    //   }
    // };
    // loadVideos();
    // return () => {
    //   videoRefs.current.forEach(video => {
    //     if (video) {
    //       try { video.pause(); video.src = ""; video.load(); } catch (e) { console.warn("Error cleaning up video:", e); }
    //     }
    //   });
    //   videoRefs.current = [];
    // };
  // }, [steps]);

  // Effect for managing video playback (play/pause/load) based on currentSlide
  // useEffect(() => { // STEPS REMOVED - All video playback logic
    // if (!videosLoaded || !steps || steps.length === 0) return;

    // console.log(`[Playback Effect] currentSlide is: ${currentSlide}, steps.length: ${steps.length}`);

    // Clear any existing slide advancement timeout before proceeding
    // if (slideTimeoutRef.current) {
    //   clearTimeout(slideTimeoutRef.current);
    // }

    // videoRefs.current.forEach((video, idx) => {
    //   if (!video || video.tagName?.toLowerCase() !== 'video') return;
      // Ensure video source is properly set before attempting operations
      // const expectedSrc = steps[idx]?.videoFile ? URL.createObjectURL(steps[idx].videoFile) :
                          // (steps[idx]?.videoSrc && steps[idx].videoSrc.startsWith('/') ? steps[idx].videoSrc.substring(1) : steps[idx]?.videoSrc);
      // if (!video.src || (expectedSrc && video.src !== expectedSrc && !video.src.includes(expectedSrc.split('/').pop()))) {
        // If src is not set, or seems stale (common with blob URLs if component re-renders before videoFile is processed into src attribute)
        // we might need to set it here or rely on the RenderProcessSteps to set it. 
        // For now, we assume RenderProcessSteps correctly sets the src attribute before this effect runs.
        // console.warn(`Video ${idx} src mismatch or not set. Current: ${video.src}, Expected based on step: ${expectedSrc}`);
      // }
      // if (!video.src && !expectedSrc) {
        // console.warn(`Video ${idx} has no source in DOM or step data.`);
      //   return;
      // }

  //     try {
  //       if (idx === currentSlide) {
            // console.log(`Attempting to play video ${idx} (current slide ${currentSlide})`);
  //         video.currentTime = 0;
  //         video.muted = true; 
  //         const playPromise = video.play();
  //         if (playPromise !== undefined) {
  //           playPromise.then(() => {
                // console.log(`Video ${idx} started playing. Setting 2.5s timeout to advance slide.`);
                // Set timeout to advance to the next slide after 2.5 seconds
  //             slideTimeoutRef.current = setTimeout(() => {                
  //               const latestSteps = stepsRef.current; // Use the most current steps array
                  // console.log(`2.5s timer fired for slide ${currentSlide}. Advancing. Latest steps length: ${latestSteps?.length}`); 
  //               if (latestSteps && latestSteps.length > 0) {
  //                 setCurrentSlide(prev => (prev + 1) % latestSteps.length);
  //               } else {
  //                 setCurrentSlide(0);
                    // console.warn("Steps array was empty or undefined when slide advancement timer fired. Resetting to slide 0.");
  //               }
  //             }, 2500); 
  //           }).catch(error => {
  //             console.warn(`Video ${idx} play() failed, cannot set advance timer:`, error.name, error.message); // Keep important warnings
  //           });
  //         }
  //       } else {
  //         video.pause();
            // Preload the next slide (the one that will become currentSlide after this one)
  //         if (idx === (currentSlide + 1) % steps.length) {
              // console.log(`Preloading video ${idx} (next slide after ${currentSlide})`);
  //           video.load(); 
  //         }
  //       }
  //     } catch (error) {
  //       console.warn(`Error controlling video ${idx} in slideshow playback effect:`, error); // Keep important warnings
  //     }
  //   });

  //   return () => {
      // Cleanup: clear the timeout when the component unmounts or dependencies change
  //     if (slideTimeoutRef.current) {
        // console.log("Clearing slide advance timeout.");
  //       clearTimeout(slideTimeoutRef.current);
  //     }
  //   };
  // }, [currentSlide, videosLoaded, steps]); // Depend on currentSlide to manage its specific video and set next timeout

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
        className={`${baseClasses} ${sizeClasses} lg:-mx-2`}
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

  const ImageSlideshow = () => {
    if (!displaySlideshowImages || displaySlideshowImages.length === 0) return null;
    return (
      <div className="absolute inset-0 w-full h-full"> {/* MODIFIED: To act as a background */}
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
  // const hasProcessSteps = steps && steps.length > 0; // STEPS REMOVED
  const hasSlideshowImages = displaySlideshowImages.length > 0;
  const hasCards = cards && cards.length > 0;

  return (
    <div className="rich-text-preview-container mx-auto px-0 sm:px-6 flex flex-col ">
      {/* Section 1: Feature Cards - Placed above the image/text block */}
      {hasCards && (
        <div className="w-full px-2 sm:px-0 my-4 md:my-6"> 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[-2vh] md:gap-[-0.5rem] items-stretch">
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

      {/* Section 2: Image Slideshow as Background with Overlaid Text - Reverted to simpler full-width overlay and reduced height */}
      {(hasSlideshowImages || richTextData.heroText || hasDescriptionContent || !readOnly) && (
        <div className="relative w-full h-[50vh] md:h-[45vh] lg:h-[38vh] group px-[10vw]"> {/* Reduced height, removed md:flex and md:order-2 */}
          
          {hasSlideshowImages && <ImageSlideshow />}
          
          {/* Overlay for text content - centered, takes full width of parent */}
          <div className="absolute inset-0 flex flex-col items-center text-center p-4 md:p-6 lg:p-8 bg-black/40 group-hover:bg-black/50 transition-colors duration-300">
            
            {/* Hero Text - Centered */}
            {(richTextData.heroText || !readOnly) && (
              <div className="mb-4 md:mb-6 w-full">
                {readOnly ? (
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left">{heroText}</h2>
                ) : (
                  <textarea
                    ref={heroTextAreaRef}
                    value={heroText || ""}
                    onChange={(e) => {
                      onInlineChange('heroText', e.target.value);
                      adjustTextareaHeight(heroTextAreaRef);
                    }}
                    placeholder="Enter Hero Text..."
                    className="text-3xl sm:text-4xl md:text-5xl font-bold w-full max-w-3xl mx-auto bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-2 resize-none placeholder-gray-300 text-center"
                    rows={2}
                    style={{ overflowY: 'hidden' }}
                  />
                )}
              </div>
            )}

            {/* Description Texts - Contained, with white text and slightly opaque background */}
            {hasDescriptionContent && (
              <div className="mx-[8vw] p-3 md:p-4 bg-slate-800 bg-opacity-75 backdrop-blur-sm rounded-lg shadow-xl w-full md:w-auto">
                {readOnly ? (
                  <>
                    {richTextData.bus_description && (
                      <p className="text-sm sm:text-base md:text-lg text-white font-serif leading-relaxed indent-0 text-left">
                        {richTextData.bus_description}
                      </p>
                    )}
                    {richTextData.bus_description_second && (
                      <p className="text-sm sm:text-base md:text-lg text-white font-serif leading-relaxed indent-0 mt-3 text-left">
                        {richTextData.bus_description_second}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <textarea
                      ref={descriptionTextAreaRef}
                      value={bus_description || ""}
                      onChange={(e) => {
                        onInlineChange('bus_description', e.target.value);
                        adjustTextareaHeight(descriptionTextAreaRef);
                      }}
                      placeholder="Enter primary business description..."
                      className="text-sm sm:text-base md:text-lg text-white font-serif leading-relaxed indent-0 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-2 resize-none placeholder-gray-200 text-left"
                      rows={3} style={{ overflowY: 'hidden' }}
                    />
                    <textarea
                      ref={descriptionSecondTextAreaRef}
                      value={bus_description_second || ""}
                      onChange={(e) => {
                        onInlineChange('bus_description_second', e.target.value);
                        adjustTextareaHeight(descriptionSecondTextAreaRef);
                      }}
                      placeholder="Enter secondary business description..."
                      className="text-sm sm:text-base md:text-lg text-white font-serif leading-relaxed indent-0 mt-3 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-white/50 rounded p-2 resize-none placeholder-gray-200 text-left"
                      rows={3} style={{ overflowY: 'hidden' }}
                    />
                  </>
                )}
              </div>
            )}
          </div>
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
    // steps: PropTypes.array, // Steps removed
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
function RichTextControlsPanel({ localData, onDataChange, currentBannerColor, themeColors }) {
  const { images = [], imageUploads = [] } = localData || {}; // Removed steps from destructuring

  const handleSharedBannerColorChange = (fieldName, color) => {
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

  // const handleStepChange = (index, field, value) => { // STEPS REMOVED
  //   onDataChange(prev => {
  //       const updatedSteps = (prev.steps || []).map((step, i) => 
  //           i === index ? { ...step, [field]: value } : step
  //       );
  //       return { ...prev, steps: updatedSteps };
  //   });
  // };

  // const handleStepVideoUpload = (index, file) => { // STEPS REMOVED
  //   if (file) {
  //     const newVideoSrcBlob = URL.createObjectURL(file);
  //     onDataChange(prev => {
  //         const currentSteps = prev.steps || [];
  //         const oldStep = currentSteps[index];
  //         if (oldStep && oldStep.videoFile && oldStep.videoSrc && oldStep.videoSrc.startsWith('blob:')) {
  //             URL.revokeObjectURL(oldStep.videoSrc);
  //         }

  //         let updatedSteps = [...currentSteps];
  //         if (index < updatedSteps.length) {
  //           updatedSteps = updatedSteps.map((step, i) =>
  //               i === index ? { 
  //                   ...step, 
  //                   videoFile: file, 
  //                   videoSrc: newVideoSrcBlob, 
  //                   videoFileName: file.name, 
  //                   originalVideoUrl: step.originalVideoUrl // Preserve existing originalVideoUrl
  //               } : step
  //           );
  //         } else if (index === updatedSteps.length) { 
  //            updatedSteps.push({
  //               id: `step_new_${Date.now()}`,
  //               title: "New Video Step", 
  //               videoFile: file, 
  //               videoSrc: newVideoSrcBlob, 
  //               videoFileName: file.name, 
  //               href: "#", 
  //               scale: 1,
  //               originalVideoUrl: null // New step, no original video URL yet
  //           });
  //         }
          
  //         return { ...prev, steps: updatedSteps };
  //     });
  //   }
  // };
  
  // const handleAddStep = () => { // STEPS REMOVED
  //   const newStep = { 
  //       id: `step_${Date.now()}_${Math.random().toString(36).substr(2,5)}`, 
  //       title: "New Step", 
  //       videoSrc: "", 
  //       href: "#", 
  //       scale: 1, 
  //       videoFile: null, 
  //       videoFileName: "", 
  //       originalVideoUrl: null 
  //   };
  //   onDataChange(prev => ({ ...prev, steps: [...(prev.steps || []), newStep] }));
  // };

  // const handleRemoveStep = (index) => { // STEPS REMOVED
  //   onDataChange(prev => {
  //       const currentSteps = prev.steps || [];
  //       const stepToRemove = currentSteps[index];
  //       if (stepToRemove && stepToRemove.videoFile && stepToRemove.videoSrc && stepToRemove.videoSrc.startsWith('blob:')) {
  //         URL.revokeObjectURL(stepToRemove.videoSrc); 
  //       }
  //       const updatedSteps = currentSteps.filter((_, i) => i !== index);
  //       return { ...prev, steps: updatedSteps };
  //   });
  // };

  return (
    <div> 
      <div className="flex items-center justify-between mb-3"><h1 className="text-lg md:text-xl font-semibold text-gray-200">Content Editor</h1></div>
      
      {/* Image Editor Section */}
      <div className="mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-300">Slideshow Images</h2>
          <button onClick={handleAddImage} type="button" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded shadow">+ Add Slot</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
              <div key={idx} className="bg-gray-700 p-2 rounded shadow-md relative flex flex-col">
                <button onClick={() => handleRemoveImage(idx)} type="button" className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded absolute top-1.5 right-1.5 hover:bg-red-600 z-10">Remove</button>
                <label className="block text-xs mb-0.5 font-medium text-gray-300 truncate pr-12">Slot {idx + 1}: {displayFileName}</label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleChangeImage(idx, file); } e.target.value = null; }} className="w-full bg-gray-600 border border-gray-500 px-2 py-0.5 rounded mt-0.5 text-xs text-white focus:ring-blue-500 focus:border-blue-500 file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={`Preview ${idx + 1}`}
                    className="mt-1.5 h-16 w-full object-contain rounded border border-gray-500 bg-gray-600"
                    onError={(e) => {e.target.style.display='none'; /* Hide broken img */}}
                  />
                ) : (
                  <div className="mt-1.5 h-16 w-full flex items-center justify-center bg-gray-600 border border-dashed border-gray-500 rounded text-gray-400 text-xs">Preview</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Process Steps Editor Section - REMOVED */}
      {/* <div className="mb-4 pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-gray-300">Process Steps Videos</h2>
          <button onClick={handleAddStep} type="button" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2.5 py-1 rounded shadow">+ Add Step</button>
        </div>
        <div className="space-y-2">
          {(steps || []).map((step, index) => (
            <div key={step.id || index} className="bg-gray-700 p-2 rounded shadow-md">
              <div className="flex justify-between items-center mb-1.5">
                <h3 className="text-sm font-semibold text-gray-200">Step {index + 1} Video</h3>
                <button onClick={() => handleRemoveStep(index)} type="button" className="bg-red-500 hover:bg-red-600 text-white text-xs px-1.5 py-0.5 rounded">Remove</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-2"> 
                <div>
                  <input type="file" accept="video/*" onChange={(e) => {const file = e.target.files?.[0]; if(file) handleStepVideoUpload(index, file); e.target.value = null;}} className="w-full bg-gray-600 border border-gray-500 px-2 py-0.5 rounded text-xs text-white file:mr-1 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                  {step.videoSrc && (
                    <div className="mt-1.5">
                      <span className="text-xs text-gray-400 block mb-0.5">Current: {step.videoFileName || step.videoSrc.split('/').pop()}</span>
                      {step.videoSrc.startsWith('blob:') && <video src={step.videoSrc} controls className="w-full h-20 object-contain rounded bg-black" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      
      {/* Shared Banner Color Section */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <ThemeColorPicker
          label="Shared Banner Gradient Color (syncs with Hero)"
          currentColorValue={(localData && localData.sharedBannerColor) || currentBannerColor || "#1e293b"}
          themeColors={themeColors}
          onColorChange={handleSharedBannerColorChange}
          fieldName="sharedBannerColor"
          className="text-gray-300" // Pass className to style the label text if needed
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
    // steps: PropTypes.arrayOf(PropTypes.shape({ // Steps removed
    //     id: PropTypes.string,
    //     videoSrc: PropTypes.string,
    //     videoFile: PropTypes.object, 
    //     videoFileName: PropTypes.string,
    // })),
  }).isRequired,
  onDataChange: PropTypes.func.isRequired,
  currentBannerColor: PropTypes.string,
  themeColors: PropTypes.object, // Added themeColors prop type
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
  showControls = false,
  themeColors // Destructure themeColors from props
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

      // const mergedSteps = (newBaseFromProps.steps || []).map((propStep) => { // STEPS REMOVED
      //   const prevStep = prevLocalData.steps?.find(s => s.id === propStep.id);
      //   if (prevStep && prevStep.videoFile && 
      //       (prevStep.videoSrc === propStep.videoSrc || 
      //        (prevStep.originalVideoUrl && prevStep.originalVideoUrl === propStep.originalVideoUrl) ||
      //        (propStep.videoSrc && propStep.videoSrc === prevStep.videoSrc) // if prop src is already blob
      //       ))
      //   {
      //     return { ...propStep, videoFile: prevStep.videoFile, videoFileName: prevStep.videoFileName, videoSrc: prevStep.videoSrc, originalVideoUrl: prevStep.originalVideoUrl };
      //   }
      //   return propStep;
      // });

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
        // steps: mergedSteps, // Steps removed
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
            themeColors={themeColors}
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
  themeColors: PropTypes.object,
};
