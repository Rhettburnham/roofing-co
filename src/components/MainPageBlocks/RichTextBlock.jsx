// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";

// Module-level flag to track if animation has played this page load
let pageLoadAnimationHasPlayed = false;

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only or Editable)
---------------------------------------------
Displays content. If not readOnly, allows inline editing of text fields.
=============================================
*/

// taking data from step_4/combined_data.json
function RichTextPreview({ richTextData, readOnly, onInlineChange, bannerColor }) {
  const [currentImage, setCurrentImage] = useState(0);
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [videosLoaded, setVideosLoaded] = useState(false);

  // State for slideshow
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimeoutRef = useRef(null); // Ref for the 2.5s play timeout
  const stepsRef = useRef([]); // Initialize with empty array

  // State to control whether the intro animation should play for cards
  const [playIntroAnimationForCards, setPlayIntroAnimationForCards] = useState(false);

  useEffect(() => {
    // This effect runs once on mount to decide if animations should play
    if (!pageLoadAnimationHasPlayed) {
      setPlayIntroAnimationForCards(true); // Allow animation
      pageLoadAnimationHasPlayed = true;    // Mark as played for this page load
    } else {
      setPlayIntroAnimationForCards(false); // Skip animation, cards should appear in final state
    }
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    console.log("RichTextPreview received data:", richTextData, "readOnly:", readOnly, "bannerColor:", bannerColor);
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

  // Keep stepsRef updated with the latest steps prop (MOVED HERE)
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);

  useEffect(() => {
    console.log("Steps data:", steps);
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
            video.onloadeddata = () => { console.log(`Video ${idx} data loaded`); resolve(); };
            video.oncanplaythrough = () => { console.log(`Video ${idx} can play through`); resolve(); };
            video.onerror = (e) => { console.error(`Error loading video for step ${idx}:`, step, e); resolve(); };
            setTimeout(resolve, 5000);
          });
        });
        await Promise.all(promises);
        console.log("All videos preloaded");
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

    console.log(`[Playback Effect] currentSlide is: ${currentSlide}, steps.length: ${steps.length}`);

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
        console.warn(`Video ${idx} has no source in DOM or step data.`);
        return;
      }

      try {
        if (idx === currentSlide) {
          console.log(`Attempting to play video ${idx} (current slide ${currentSlide})`);
          video.currentTime = 0;
          video.muted = true; 
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              console.log(`Video ${idx} started playing. Setting 2.5s timeout to advance slide.`);
              // Set timeout to advance to the next slide after 2.5 seconds
              slideTimeoutRef.current = setTimeout(() => {                
                const latestSteps = stepsRef.current; // Use the most current steps array
                console.log(`2.5s timer fired for slide ${currentSlide}. Advancing. Latest steps length: ${latestSteps?.length}`); // currentSlide here is the captured value from the outer scope
                if (latestSteps && latestSteps.length > 0) {
                  setCurrentSlide(prev => (prev + 1) % latestSteps.length);
                } else {
                  // This case should ideally be rare given other guards,
                  // but as a fallback, reset to 0 if steps somehow became empty.
                  setCurrentSlide(0);
                  console.warn("Steps array was empty or undefined when slide advancement timer fired. Resetting to slide 0.");
                }
              }, 2500); 
            }).catch(error => {
              console.warn(`Video ${idx} play() failed, cannot set advance timer:`, error.name, error.message);
              // If video fails to play, perhaps advance immediately or after a shorter fallback delay?
              // For now, it won't advance automatically if play fails.
            });
          }
        } else {
          video.pause();
          // Preload the next slide (the one that will become currentSlide after this one)
          if (idx === (currentSlide + 1) % steps.length) {
            console.log(`Preloading video ${idx} (next slide after ${currentSlide})`);
            video.load(); 
          }
        }
      } catch (error) {
        console.warn(`Error controlling video ${idx} in slideshow playback effect:`, error);
      }
    });

    return () => {
      // Cleanup: clear the timeout when the component unmounts or dependencies change
      if (slideTimeoutRef.current) {
        console.log("Clearing slide advance timeout.");
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
    overlayImages,
    playIntroAnimation,
    readOnlyCard,
    onCardFieldChange
  }) {
    const baseClasses =
      "relative bg-white p-2 rounded-lg shadow-lg flex flex-col items-center justify-center";
    const sizeClasses =
      variant === "md"
        ? "md:w-[12vw] w-[40vw] w-full max-w-[12vw] h-auto min-h-[18vw] md:min-h-[14vw] lg:min-h-[12vw]"
        : "w-[40vw] md:w-[12vw] h-auto min-h-[18vw] md:min-h-[14vw] lg:min-h-[12vw]";

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
        <div className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 z-30 flex items-center justify-center">
          {Icon && <Icon className="text-white drop-shadow-lg" />}
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
              <h3 className="ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-[2.3vw] md:text-[1.9vh] font-semibold text-gray-900 font-sans">
                {title}
              </h3>
            ) : (
              <input
                type="text"
                value={title}
                onChange={(e) => onCardFieldChange(index, 'title', e.target.value)}
                className="ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-[2.3vw] md:text-[1.9vh] font-semibold text-gray-900 font-sans bg-transparent focus:bg-white/50 focus:backdrop-blur-sm border-none focus:border-b focus:border-brand-accent outline-none w-[calc(100%-2.5rem)] md:w-[calc(100%-3rem)] p-[1px] rounded-sm placeholder-gray-500"
                onClick={(e) => e.stopPropagation()} 
                placeholder="Edit title..."
                style={{ lineHeight: 'normal' }}
              />
            )}
          </div>

          <div className="relative w-full flex-grow" style={{ zIndex: 51 }}>
            {readOnlyCard ? (
              <p className="ml-1 md:ml-0 text-[2.2vw] md:text-[1.5vh] text-gray-700 text-left font-serif leading-tight">
                {desc}
              </p>
            ) : (
              <textarea
                value={desc}
                onChange={(e) => onCardFieldChange(index, 'desc', e.target.value)}
                className="ml-1 md:ml-0 text-[2.2vw] md:text-[1.5vh] text-gray-700 font-serif leading-tight bg-transparent focus:bg-white/50 focus:backdrop-blur-sm border-none focus:border-b focus:border-brand-accent outline-none w-full h-full resize-none p-[1px] rounded-sm placeholder-gray-500"
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
    icon: PropTypes.elementType,
    title: PropTypes.string,
    desc: PropTypes.string,
    index: PropTypes.number,
    variant: PropTypes.string,
    overlayImages: PropTypes.array.isRequired,
    playIntroAnimation: PropTypes.bool.isRequired,
    readOnlyCard: PropTypes.bool.isRequired,
    onCardFieldChange: PropTypes.func.isRequired,
  };

  const RenderProcessSteps = () => {
    if (!steps || steps.length === 0) {
      return <div className="text-center md:py-2">No process steps available</div>;
    }

    // Define the size of the circular viewport for calculations
    // These should match the Tailwind classes used for the viewport
    const viewportSizeVH = 14.4; // vh for mobile-first width/height
    const mdViewportSizeVH = 20; // vh for md breakpoint
    // Note: Animating based on VH directly in JS can be tricky if CSS/JS values diverge.
    // For simplicity, we assume these are fixed or can be obtained if needed.
    // A ref to the viewport div could get its actual pixel width on mount for more robust calculations.

    return (
      <div className="w-full flex flex-col items-center">
        {/* Viewport Container - circular, overflow hidden */}
        <div 
          className="relative bg-white rounded-full shadow-lg overflow-hidden mb-2 md:mb-3"
          style={{
            width: `${viewportSizeVH}vh`, 
            height: `${viewportSizeVH}vh`,
            // Using style for md breakpoint as an example, ideally Tailwind classes handle this.
            // This is just for the JS logic if it needed pixel values for the strip's x translate.
            // However, framer-motion can animate percentages relative to the element itself.
          }}
        >
          {/* Sliding Strip - will contain all videos, animated on x-axis */}
          <motion.div
            className="flex h-full" // Use flex to lay out videos horizontally
            style={{ width: `${steps.length * 100}%` }} // Strip is N times the viewport width
            animate={{
              x: `-${currentSlide * (100 / (steps.length || 1))}%` // Guard against division by zero if steps.length is briefly 0
            }}
            transition={{ type: "tween", duration: 1, ease: "easeInOut" }} // Slide duration 1 second
            onAnimationStart={() => console.log(`[Animation Start] Sliding to slide: ${currentSlide}, target x: -${currentSlide * (100 / (steps.length || 1))}%`)}
            onAnimationComplete={() => console.log(`[Animation Complete] Arrived at slide: ${currentSlide}`)}
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
                      style={{ width: `${80 * (step.scale || 1)}%`, height: `${80 * (step.scale || 1)}%` }}
                      preload="auto"
                      key={videoSrc} // Re-trigger if src changes (e.g., blob to path)
                      onLoadedData={() => console.log(`Video ${index} (slide ${currentSlide}) loaded data`)}
                      onError={(e) => console.error(`Video ${index} load error:`, e, "Source:", videoSrc)}
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

  useEffect(() => {
    const checkAutoplaySupport = async () => { try { const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.preload = "auto"; } catch (error) { console.error("Error checking autoplay support:", error); } };
    checkAutoplaySupport(); 
  }, []);

  const handleCardChange = (cardIndex, field, value) => {
    const updatedCards = cards.map((card, idx) => 
      idx === cardIndex ? { ...card, [field]: value } : card
    );
    onInlineChange({ ...richTextData, cards: updatedCards });
  };

  return (
    <div className="rich-text-preview-container mx-auto px-4 py-8">
      {/* Part 1: Hero Text - Always render structure, content conditional */}
      <div className="text-center my-6 md:my-8">
        {readOnly ? (
          (richTextData.heroText && (
            <h2 className="text-3xl md:text-4xl font-bold">
              {richTextData.heroText}
            </h2>
          ))
        ) : (
          <textarea 
            value={richTextData.heroText || ""} 
            onChange={(e) => onInlineChange('heroText', e.target.value)} 
            placeholder="Enter Hero Text..."
            className="text-3xl md:text-4xl font-bold text-center w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-2 resize-none" // Matched styling
            rows={1}
          />
        )}
      </div>

      {/* Part 2: Layout for description and process videos/steps */}
      <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8 mt-4 md:mt-6">
        {/* Left side: Descriptions */}
        {(richTextData.bus_description || richTextData.bus_description_second || !readOnly) && (
          <div className="w-full md:w-1/2 space-y-4">
            {readOnly ? (
              (richTextData.bus_description && (
                <p className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8">
                  {richTextData.bus_description}
                </p>
              ))
            ) : (
              <textarea
                value={richTextData.bus_description || ""}
                onChange={(e) => onInlineChange('bus_description', e.target.value)}
                placeholder="Enter primary business description..."
                className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0 resize-none"
                rows={4}
                style={{ overflowY: 'auto' }}
              />
            )}
            
            {readOnly ? (
              (richTextData.bus_description_second && (
                <p className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 mt-3">
                  {richTextData.bus_description_second}
                </p>
              ))
            ) : (
              <textarea
                value={richTextData.bus_description_second || ""}
                onChange={(e) => onInlineChange('bus_description_second', e.target.value)}
                placeholder="Enter secondary business description..."
                className="text-base md:text-lg text-gray-700 font-serif leading-relaxed indent-8 mt-3 w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0 resize-none"
                rows={4}
                style={{ overflowY: 'auto' }}
              />
            )}
          </div>
        )}

        {/* Right side: Process Steps (Videos) */}
        {steps && steps.length > 0 && (
          <div className="w-full md:w-1/2 mt-6 md:mt-0">
            <RenderProcessSteps />
          </div>
        )}
      </div>

      {/* Feature Cards Section */}
      {cards && cards.length > 0 && (
        <div className="flex flex-row justify-around items-start gap-4 w-full mt-6">
          {cards.map((card, idx) => (
            <FeatureCard
              key={idx}
              variant="md"
              icon={Icons[card.icon] || Icons.Star}
              title={card.title}
              desc={card.desc}
              index={idx}
              overlayImages={overlayImages}
              playIntroAnimation={playIntroAnimationForCards}
              readOnlyCard={readOnly}
              onCardFieldChange={handleCardChange}
            />
          ))}
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
    cards: PropTypes.array,
    images: PropTypes.array,
    overlayImages: PropTypes.array,
    steps: PropTypes.array,
  }),
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func,
  bannerColor: PropTypes.string,
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
  const { images = [], steps = [] } = localData;

  const handleSharedBannerColorChange = (color) => {
    // Ensure a valid color string is passed, or a default if somehow invalid
    const newColor = typeof color === 'string' ? color : '#000000'; // Fallback to black if color is not a string
    onDataChange((prev) => ({ ...prev, sharedBannerColor: newColor }));
  };

  const handleAddImage = () => {
    onDataChange((prev) => ({ ...prev, images: [...prev.images, ""], imageUploads: [...(prev.imageUploads || []), null] }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    const updatedImageUploads = localData.imageUploads ? [...localData.imageUploads] : [];
    if (updatedImageUploads.length > index) { updatedImageUploads.splice(index,1); }
    onDataChange((prev) => ({ ...prev, images: updatedImages, imageUploads: updatedImageUploads }));
  };

  const handleChangeImage = (index, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file); 
      const updatedImages = [...images];
      updatedImages[index] = fileURL; 
      const updatedImageUploads = localData.imageUploads ? [...localData.imageUploads] : new Array(images.length).fill(null);
      while(updatedImageUploads.length <= index) { updatedImageUploads.push(null); }
      updatedImageUploads[index] = { file, fileName: file.name }; 
      onDataChange((prev) => ({ ...prev, images: updatedImages, imageUploads: updatedImageUploads }));
    }
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    );
    onDataChange(prev => ({ ...prev, steps: updatedSteps }));
  };

  const handleStepVideoUpload = (index, file) => {
    if (file) {
      const newVideoSrc = URL.createObjectURL(file);
      const updatedSteps = steps.map((step, i) =>
        i === index ? { ...step, videoFile: file, videoSrc: newVideoSrc, videoFileName: file.name } : step
      );
      onDataChange(prev => ({ ...prev, steps: updatedSteps }));
    }
  };
  
  const handleAddStep = () => {
    const newStep = { title: "New Step", videoSrc: "", href: "#", scale: 1, videoFile: null, videoFileName: "" };
    onDataChange(prev => ({ ...prev, steps: [...(prev.steps || []), newStep] }));
  };

  const handleRemoveStep = (index) => {
    const stepToRemove = steps[index];
    if (stepToRemove && stepToRemove.videoFile && stepToRemove.videoSrc && stepToRemove.videoSrc.startsWith('blob:')) {
      URL.revokeObjectURL(stepToRemove.videoSrc); // Revoke blob URL if it was a local file
    }
    const updatedSteps = steps.filter((_, i) => i !== index);
    onDataChange(prev => ({ ...prev, steps: updatedSteps }));
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((imgSrc, idx) => { 
            const currentUpload = localData.imageUploads && localData.imageUploads[idx];
            let previewUrl = imgSrc; 
            if (currentUpload && currentUpload.file) {
                previewUrl = URL.createObjectURL(currentUpload.file); 
            } else if (typeof imgSrc === 'string' && imgSrc.startsWith('blob:')) {
                previewUrl = imgSrc; 
            } else if (imgSrc) {
                previewUrl = imgSrc.startsWith('/') ? imgSrc : `/assets/images/Richtext/${imgSrc.split('/').pop() || ''}`;
            }
            return (
              <div key={idx} className="bg-gray-700 p-3 rounded shadow-md relative flex flex-col">
                <button onClick={() => handleRemoveImage(idx)} type="button" className="bg-red-500 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-600">Remove</button>
                <label className="block text-sm mb-1 font-medium text-gray-300">Image Slot {idx + 1}:</label>
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { handleChangeImage(idx, file); } }} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded mt-1 text-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt={`Preview ${idx + 1}`} 
                    className="mt-2 h-24 w-full object-contain rounded border border-gray-500 bg-gray-600" 
                    onLoad={() => { if (currentUpload && currentUpload.file && previewUrl !== imgSrc && previewUrl.startsWith('blob:')) { /* URL.revokeObjectURL(previewUrl); // Potentially problematic if not managed carefully */ } }} 
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
            <div key={index} className="bg-gray-700 p-3 rounded shadow-md">
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
                  <input type="file" accept="video/*" onChange={(e) => handleStepVideoUpload(index, e.target.files?.[0])} className="w-full bg-gray-600 border border-gray-500 px-2 py-1 rounded mt-1 text-sm text-white file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
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
          // Ensure currentBannerColor (from HeroBlock) has a fallback if undefined, though sharedBannerColor from localData might be more direct
          value={localData.sharedBannerColor || currentBannerColor || "#1e293b"} 
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
    steps: PropTypes.array, // Added steps to prop types
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
  readOnly = false, // This now directly controls RichTextPreview's inline editing capability
  richTextData, 
  onConfigChange, 
  bannerColor,
  showControls = false // This controls visibility of RichTextControlsPanel
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
      imageUploads: initial.images?.map(img => {
        if (img && typeof img === 'object' && img.file instanceof File) { // Check if it's our {file, fileName} structure
          return { file: img.file, fileName: img.fileName };
        }
        // If initial images are just paths or existing blob URLs, imageUploads should be null for them
        return null; 
      }) || [],
      overlayImages: [ ...(initial.overlayImages || [ "/assets/images/shake_img/1.png", "/assets/images/shake_img/2.png", "/assets/images/shake_img/3.png", "/assets/images/shake_img/4.png" ]) ],
      steps: (initial.steps || []).map(step => ({
        ...step,
        videoFile: null, // Will be populated by file input
        videoFileName: step.videoFileName || (typeof step.videoSrc === 'string' ? step.videoSrc.split('/').pop() : ''),
      })), 
      sharedBannerColor: initial.sharedBannerColor || bannerColor || "#1e293b", // Initialize with prop or default
    };
  });

  // Ref to store the previous value of showControls
  const prevShowControlsRef = useRef();

  useEffect(() => {
    if (richTextData) {
      setLocalData(prevLocalData => {
        // prevLocalData contains the most recent state including uncommitted inline edits.
        // richTextData is the prop from MainPageForm.

        // For fields edited inline in RichTextPreview (heroText, descriptions),
        // prevLocalData is more current if an edit just occurred and hasn't been "saved" up.
        // For data managed by RichTextControlsPanel (images, steps, cards structure, sharedBannerColor),
        // richTextData (reflecting changes from onConfigChange from panel) is generally more authoritative.

        const newCards = richTextData.cards !== undefined ? richTextData.cards.map(c => ({...c})) : prevLocalData.cards || [];
        // If cards were directly editable inline in a more complex way, their merge would need care.
        // Current setup: card title/desc are passed to FeatureCard, which calls onCardFieldChange,
        // which updates 'cards' array in localData, then onInlineChange passes it up.
        // So, prevLocalData.cards should be fine if panel isn't open.

        return {
          ...prevLocalData, // Start with local data (has latest inline edits for text, potentially latest cards from inline card edits)
          ...richTextData,  // Overlay with prop data (panel edits for images, steps, sharedBannerColor; also cards if from panel)
          
          // Explicitly prioritize prevLocalData for simple inline-editable text fields if they differ,
          // assuming prevLocalData holds a more recent uncommitted inline edit.
          heroText: prevLocalData.heroText !== richTextData.heroText && prevLocalData.heroText !== (richTextData.heroText || "") // Check if prevLocalData is different AND not just cleared
                      ? prevLocalData.heroText
                      : richTextData.heroText || "",
          bus_description: prevLocalData.bus_description !== richTextData.bus_description && prevLocalData.bus_description !== (richTextData.bus_description || "")
                      ? prevLocalData.bus_description
                      : richTextData.bus_description || "",
          bus_description_second: prevLocalData.bus_description_second !== richTextData.bus_description_second && prevLocalData.bus_description_second !== (richTextData.bus_description_second || "")
                      ? prevLocalData.bus_description_second
                      : richTextData.bus_description_second || "",
          
          // Ensure arrays come from richTextData if defined (usually from panel), else keep local.
          // This also handles cases where richTextData might explicitly set an array to empty.
          cards: richTextData.cards !== undefined ? richTextData.cards.map(c => ({...c})) : prevLocalData.cards || [],
          images: richTextData.images !== undefined ? [...richTextData.images] : prevLocalData.images || [],
          imageUploads: richTextData.imageUploads !== undefined ? [...richTextData.imageUploads] : prevLocalData.imageUploads || [],
          overlayImages: richTextData.overlayImages !== undefined ? [...richTextData.overlayImages] : prevLocalData.overlayImages || [ "/assets/images/shake_img/1.png", "/assets/images/shake_img/2.png", "/assets/images/shake_img/3.png", "/assets/images/shake_img/4.png" ],
          steps: richTextData.steps !== undefined ? richTextData.steps.map(s => ({...s})) : prevLocalData.steps || [],
          sharedBannerColor: richTextData.sharedBannerColor !== undefined ? richTextData.sharedBannerColor : prevLocalData.sharedBannerColor,
          // Ensure other fields from richTextData that are not in prevLocalData or are meant to be authoritative are included
          accredited: richTextData.accredited !== undefined ? richTextData.accredited : prevLocalData.accredited,
          years_in_business: richTextData.years_in_business !== undefined ? richTextData.years_in_business : prevLocalData.years_in_business,
        };
      });
    }
  }, [richTextData, bannerColor]); // Removed showControls from dependencies

  // Effect to call onConfigChange when editing is finished (showControls becomes false)
  useEffect(() => {
    // Check if showControls has changed from true to false
    if (prevShowControlsRef.current === true && showControls === false) {
      if (onConfigChange) {
        console.log("RichTextBlock: Editing finished (showControls changed to false). Calling onConfigChange.");
        onConfigChange(localData);
      }
    }
    // Update the ref to the current showControls value for the next render
    prevShowControlsRef.current = showControls;
  }, [showControls, localData, onConfigChange]);

  const setLocalDataAndPropagate = (updater) => {
    let newData;
    setLocalData(currentLocalData => {
        newData = typeof updater === 'function' ? updater(currentLocalData) : updater;
        // DO NOT call onConfigChange here for inline text edits.
        // It will be called by the useEffect watching showControls.
        // For RichTextControlsPanel changes, this is still the path.
        if (typeof updater !== 'function' && onConfigChange && showControls) { // Check if updater is the full object from panel
             // This condition is specifically for changes from RichTextControlsPanel
             // We assume panel changes are "deliberate" enough to propagate immediately
             // OR the panel could have its own "Save" button.
             // For now, let's assume panel changes propagate up.
            console.log("RichTextBlock: Data updated from ControlsPanel, propagating.", newData);
            onConfigChange(newData);
        }
        console.log("RichTextBlock: Local data updated.", newData);
        return newData;
    });
  };

  const handleInlineChange = (field, value) => {
    // Only update localData. onConfigChange will be called when showControls becomes false.
    setLocalData(prevLocalData => ({
      ...prevLocalData,
      [field]: value
    }));
    console.log("Inline change for field:", field, "value:", value, "(local update only)");
  };

  // When showControls is true, RichTextPreview's inline editing is active (readOnly={false})
  // and RichTextControlsPanel is also shown.
  // When showControls is false, RichTextPreview's readOnly status is determined by the main readOnly prop.
  return (
    <>
      <RichTextPreview 
        richTextData={localData} 
        readOnly={readOnly} // Pass the main readOnly prop to control inline text editability
        onInlineChange={handleInlineChange} 
        bannerColor={bannerColor} 
      />
      {showControls && (
        <div className="bg-gray-800 text-white p-4 rounded-lg mt-4 shadow-lg">
          <RichTextControlsPanel 
            localData={localData} 
            onDataChange={setLocalDataAndPropagate}
            currentBannerColor={localData.sharedBannerColor || bannerColor || "#1e293b"} 
          />
        </div>
      )}
    </>
  );
}

RichTextBlock.propTypes = {
  readOnly: PropTypes.bool,
  richTextData: PropTypes.object, 
  onConfigChange: PropTypes.func, 
  bannerColor: PropTypes.string,
  showControls: PropTypes.bool, // Added prop type
};
