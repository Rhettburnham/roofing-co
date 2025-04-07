// src/components/MainPageBlocks/RichTextBlock.jsx
import React, { useState, useEffect, useRef } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import PropTypes from "prop-types";

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only)
---------------------------------------------
general info from step_4combined_data.json
=============================================
*/

// Create a persistent flag at module level
const ANIMATION_STATE = {
  hasAnimated: false,
};

// taking data from step_4/combined_data.json
function RichTextPreview({ richTextData, processData }) {
  const [currentImage, setCurrentImage] = useState(0);
  // Track whether animations should be applied (initialized from global state)
  const [animationClass, setAnimationClass] = useState(
    ANIMATION_STATE.hasAnimated ? "animated" : "pre-animation"
  );

  // Process Block state
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [initialOrder, setInitialOrder] = useState([]);

  const {
    heroText = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
  } = richTextData || {};

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  // Fallback videos to use when process steps don't have valid sources
  const fallbackVideos = {
    Book: "/assets/videos/our_process_videos/booking.mp4",
    Inspection: "/assets/videos/our_process_videos/magnify.mp4",
    Service: "/assets/videos/our_process_videos/repair.mp4",
    Review: "/assets/videos/our_process_videos/approval.mp4",
  };

  // Use processData if provided, or fallback to hardcoded steps
  const processSteps = processData?.steps || [
    {
      title: "Book",
      videoSrc: "/assets/videos/our_process_videos/booking.mp4",
      href: "/#booking",
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

  // Format image paths to ensure they're standardized
  const formattedImages = images.map((img) =>
    img.startsWith("/")
      ? img
      : `/assets/images/Richtext/${img.split("/").pop() || ""}`
  );

  // Use a default image if no images are provided
  const slideshowImages =
    formattedImages?.length > 0
      ? formattedImages
      : ["/assets/images/Richtext/roof_workers.jpg"];

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

  // Process steps effect - Generate random initial animation order
  useEffect(() => {
    // Generate random initial animation order ONLY ONCE on mount
    const indices = [...Array(processSteps.length).keys()];
    const shuffled = indices.sort(() => Math.random() - 0.5);
    setInitialOrder(shuffled);

    // Preload all videos immediately and make them ready to display
    const preloadAllVideos = () => {
      processSteps.forEach((step, idx) => {
        // Create a temporary video element to preload
        const tempVideo = document.createElement("video");
        tempVideo.src =
          step.videoSrc || fallbackVideos[step.title] || fallbackVideos["Book"];
        tempVideo.muted = true;
        tempVideo.preload = "auto";

        // Force preload
        tempVideo.load();

        // Listen for when it's loaded enough to display first frame
        tempVideo.addEventListener("loadeddata", () => {
          if (videoRefs.current[idx]) {
            videoRefs.current[idx].src = tempVideo.src;
            videoRefs.current[idx].load();
            // Set to first frame
            videoRefs.current[idx].currentTime = 0;
          }
        });
      });
    };

    preloadAllVideos();
  }, []);

  // Handle video playback with proper cleanup
  useEffect(() => {
    let timeouts = [];

    const playVideosSequentially = () => {
      processSteps.forEach((step, idx) => {
        const startDelay = idx * 4000;
        const timeout1 = setTimeout(() => {
          if (videoRefs.current[idx]) {
            try {
              videoRefs.current[idx].currentTime = 0;
              const playPromise = videoRefs.current[idx].play();
              if (playPromise !== undefined) {
                playPromise.catch((error) => {
                  console.error(`Video ${idx} autoplay failed:`, error);
                  // If play fails, try to set fallback source and play again
                  videoRefs.current[idx].src =
                    fallbackVideos[step.title] ||
                    "/assets/videos/our_process_videos/booking.mp4";
                  videoRefs.current[idx].load();
                  // Show the first frame immediately
                  videoRefs.current[idx].currentTime = 0;
                  setTimeout(() => {
                    if (videoRefs.current[idx]) {
                      videoRefs.current[idx]
                        .play()
                        .catch((e) =>
                          console.error(
                            `Second attempt to play video ${idx} failed:`,
                            e
                          )
                        );
                    }
                  }, 500);
                });
              }
              setActiveVideo(idx);
            } catch (err) {
              console.error(`Error playing video ${idx}:`, err);
            }
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

    // Start the sequence
    playVideosSequentially();

    // Cleanup function
    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
      videoRefs.current.forEach((video) => {
        if (video) {
          try {
            video.pause();
            video.src = "";
            video.load();
          } catch (err) {
            console.error("Error cleaning up video:", err);
          }
        }
      });
    };
  }, []);

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
        ? "md:w-[13vw] md:h-[13vw] w-[40vw] h-[22vw]"
        : "w-[40vw] h-[22vw] md:w-[13vw] md:h-[13vh]";

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
          <div className="absolute inset-0 top-1 w-full ">
            <h3 className=" z-30 ml-1 md:ml-2 mr-10 leading-tight text-[2.3vw] md:text-[1.9vh] font-semibold text-gray-900 font-sans">
              {title}
            </h3>
          </div>
          {/* Description text - Adjusted for tighter vertical spacing */}
          <p className="z-30 text-[2.2vw] md:text-[1.5vh] text-gray-700 text-left px-1 md:px-1 mr-2 md:mr-0 font-serif leading-tight mt-4 md:mt-8">
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
  `;

  // Render Process Steps
  const RenderProcessSteps = () => {
    if (processSteps.length === 0) {
      return null;
    }

    return (
      <div className="flex justify-center items-center flex-wrap md:gap-4 mb-[4vh] md:mb-[8vh]">
        {processSteps.map((step, index) => {
          const isHashLink = step.href?.startsWith("/#");
          const LinkComponent = isHashLink ? HashLink : Link;
          const animationDelay = initialOrder.indexOf(index) * 0.2 || 0;

          return (
            <div key={index} className="flex items-center pt-1 md:pt-2">
              <LinkComponent to={step.href || "#"}>
                <motion.div
                  initial={{ opacity: 0.7, scale: 1 }}
                  animate={{
                    opacity: activeVideo === index ? 1 : 0.7,
                    scale: activeVideo === index ? 1.1 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                  }}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div
                    className={`rounded-full overflow-hidden flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.3)] md:w-[14.4vh] md:h-[14.4vh] w-[6.8vh] h-[6.8vh] bg-white ${
                      activeVideo === index ? "ring-2 ring-accent" : ""
                    }`}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                        // Immediately set current time to 0 to show first frame
                        if (el) {
                          el.currentTime = 0;
                          // Force display of first frame
                          const handleLoad = () => {
                            el.currentTime = 0;
                          };
                          el.addEventListener("loadeddata", handleLoad);
                          // Clean up event listener
                          return () => {
                            el.removeEventListener("loadeddata", handleLoad);
                          };
                        }
                      }}
                      src={
                        step.videoSrc ||
                        fallbackVideos[step.title] ||
                        fallbackVideos["Book"]
                      }
                      className="object-cover"
                      muted
                      playsInline
                      crossOrigin="anonymous"
                      preload="auto"
                      style={{
                        pointerEvents: "none",
                        width: `${80 * (step.scale || 1)}%`,
                        height: `${80 * (step.scale || 1)}%`,
                        display: "block",
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
    );
  };

  return (
    <div className="w-full mx-auto">
      <style>{animationStyles}</style>

      {/* Process Gradient Background */}
      <div className="h-[20vh] bg-gradient-to-b from-banner from-10% to-transparent z-10" />

      {/* Medium screens and larger */}
      <div className="md:flex flex-col -mt-[28vh] md:-mt-[20vh] z-30">
        {/* Process Steps Section - now integrated directly */}

        <div className="flex w-full ">
          {/* Left Column: Cards stacked vertically */}
          <div className="w-1/6 hidden md:flex p-1 flex-col justify-between -space-y-12 aspect-square -mt-[5vh]">
            {leftCards.map((card, idx) => {
              const IconComp = Icons[card.icon] || Icons.Star;
              return (
                <div
                  key={idx}
                  className="flex-1 mb-1 last:mb-0 flex items-center justify-center"
                >
                  <FeatureCard
                    variant="md"
                    icon={IconComp}
                    title={card.title}
                    desc={card.desc}
                    index={idx}
                  />
                </div>
              );
            })}
          </div>

          {/* Center Column: Image and text side by side */}
          <div className="md:w-4/6 w-full flex flex-col">
            <div className="flex flex-row w-full">
              {/* Image Set */}
              <div className="w-1/2">
                <div
                  className={`w-full relative rounded-2xl shadow-md h-[30vw] md:h-[30vh] image-container ${animationClass}`}
                >
                  <img
                    src={slideshowImages[currentImage]}
                    alt="Slideshow"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute bottom-2 rounded-lg left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {slideshowImages.map((_, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => setCurrentImage(sIdx)}
                        className={`w-3 h-3 rounded-full ${
                          currentImage === sIdx
                            ? "bg-white scale-110"
                            : "bg-white/50"
                        }`}
                        aria-label={`Go to image ${sIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bus Descriptions */}
              <div className="w-1/2 pl-6 ">
                <div className="px-3 md:px-1">
                  <h2 className="text-[4vw] md:text-[2.1vh] text-left text-white first-line:font-bold z-60 font-sans">
                    {heroText}
                  </h2>
                  <p className="text-[2.8vw] md:text-[1.6vh] text-black  font-serif leading-tight mt-6">
                    {bus_description}
                  </p>
                  <p className="text-[2.8vw] md:text-[1.9vh] text-black mt-2 font-serif leading-tight">
                    {bus_description_second}
                  </p>
                </div>
              </div>
            </div>

            <section className="md:px-8 relative z-40 overflow-visible mt-3">
              <RenderProcessSteps />
            </section>
          </div>

          {/* Right Column: Cards stacked vertically */}
          <div className="w-1/6 hidden md:flex p-1 flex-col justify-between -mt-[5vh] -space-y-12">
            {rightCards.map((card, idx) => {
              const i = idx + half;
              const IconComp = Icons[card.icon] || Icons.Star;
              return (
                <div
                  key={i}
                  className="flex-1 mb-2 last:mb-0 flex items-center justify-center"
                >
                  <FeatureCard
                    variant="md"
                    icon={IconComp}
                    title={card.title}
                    desc={card.desc}
                    index={i}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smaller than medium screens - mobile view */}
      <div className="md:hidden flex flex-col px-[3vw] mb-1 mt-[-2vh]">
        {/* Process display for mobile */}
        <div className="py-4">
          <RenderProcessSteps />
        </div>

        {/* Image Section */}
        <div
          className={`relative w-full rounded-lg shadow-md px-3 image-container ${animationClass}`}
        >
          <img
            src={slideshowImages[currentImage]}
            alt="Slideshow"
            className="w-full h-[30vw] object-cover rounded-lg"
          />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {slideshowImages.map((_, sIdx) => (
              <button
                key={sIdx}
                onClick={() => setCurrentImage(sIdx)}
                className={`w-2 h-2 rounded-full ${currentImage === sIdx ? "bg-white scale-110" : "bg-white/50"}`}
                aria-label={`Go to image ${sIdx + 1}`}
              />
            ))}
          </div>
          {/* Text Section */}
          <div className="mt-1 px-3">
            <h2 className="whitespace-nowrap relative text-[4vw] text-center font-bold z-60 px-[3vw] overflow-visible font-sans">
              {heroText}
            </h2>
          </div>

          <div>
            <p className="text-[2.8vw] text-gray-700 my-1 font-sans">
              {bus_description}
            </p>
            <p className="text-[2.8vw] text-gray-700 mb-2 font-sans">
              {bus_description_second}
            </p>
          </div>
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

// Add PropTypes validation
RichTextPreview.propTypes = {
  richTextData: PropTypes.shape({
    heroText: PropTypes.string,
    bus_description: PropTypes.string,
    bus_description_second: PropTypes.string,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        desc: PropTypes.string,
        icon: PropTypes.string,
      })
    ),
    images: PropTypes.arrayOf(PropTypes.string),
    overlayImages: PropTypes.arrayOf(PropTypes.string),
  }),
  processData: PropTypes.shape({
    steps: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.string,
        href: PropTypes.string,
        scale: PropTypes.number,
      })
    ),
  }),
};

/* 
=============================================
2) RICH-TEXT EDITOR PANEL (Editing Mode)
---------------------------------------------
Allows editing of:
- heroText
- bus_description
- years_in_business
- cards[] (title, desc, icon)
- images[] (slideshow images via file upload)
- steps[] (process steps with videos, inherited from processData)
Bubbles changes up via onSave()

This editor is part of the website's content management system
that allows for local editing and saving of JSON data. The edited
content can be downloaded and sent to the developer for permanent
integration into the site.
=============================================
*/
function RichTextEditorPanel({ localData, setLocalData, onSave, processData }) {
  const {
    heroText = "",
    accredited = false,
    years_in_business = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
    imageUploads = [],
    overlayImages = [],
    steps = processData?.steps || [],
  } = localData;

  const [validationError, setValidationError] = useState("");
  const [previewVideos, setPreviewVideos] = useState([]);

  // Add a new card with default values
  const handleAddCard = () => {
    setLocalData((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        { title: "New Title", desc: "New Desc", icon: "Star" },
      ],
    }));
  };

  // Remove a card at the specified index
  const handleRemoveCard = (index) => {
    const updated = [...cards];
    updated.splice(index, 1);
    setLocalData((prev) => ({ ...prev, cards: updated }));
  };

  // Update a specific field of a card at the specified index
  const handleChangeCard = (index, field, value) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData((prev) => ({ ...prev, cards: updated }));
  };

  // Add a new empty image entry to the slideshow
  const handleAddImage = () => {
    setLocalData((prev) => ({
      ...prev,
      images: [...prev.images, ""],
    }));
  };

  // Remove an image at the specified index
  const handleRemoveImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setLocalData((prev) => ({ ...prev, images: updated }));
  };

  // Update an image at the specified index with a new file
  const handleChangeImage = (index, file) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      const updated = [...images];
      updated[index] = fileURL;
      setLocalData((prev) => ({ ...prev, images: updated }));
    }
  };

  // Process Steps Methods
  useEffect(() => {
    // Create object URLs for video previews
    const newPreviews = [];
    if (localData.steps) {
      localData.steps.forEach((step) => {
        if (step.videoFile) {
          newPreviews.push(URL.createObjectURL(step.videoFile));
        } else {
          newPreviews.push(step.videoSrc);
        }
      });
    }
    setPreviewVideos(newPreviews);

    // Clean up URLs on unmount
    return () => {
      previewVideos.forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [localData.steps]);

  const handleAddStep = () => {
    setLocalData((prev) => ({
      ...prev,
      steps: [
        ...(prev.steps || []),
        {
          title: "New Step",
          videoSrc: "/assets/videos/our_process_videos/booking.mp4",
          href: "#",
          scale: 1.0,
        },
      ],
    }));
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = [...localData.steps];
    updatedSteps.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const handleStepChange = (index, field, value) => {
    const updatedSteps = [...localData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };
    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  const handleVideoUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate that it's an MP4 file
    if (!file.type.includes("video/mp4")) {
      setValidationError("Only MP4 videos are supported");
      return;
    }

    const updatedSteps = [...localData.steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      videoFile: file,
      // Store the file name for the saved file path
      fileName: file.name,
    };

    setLocalData((prev) => ({
      ...prev,
      steps: updatedSteps,
    }));
  };

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      {/* Show ProcessBlock in editor mode too */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Process Block Preview</h3>
        <div className="bg-gray-200 p-2 rounded">
          <ProcessBlock
            readOnly={true}
            processData={{ steps: localData.steps }}
          />
        </div>
      </div>

      {/* Top row: Editor title + Save button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">RichText Editor</h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Hero Text */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Hero Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={heroText}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, heroText: e.target.value }))
          }
        />
      </div>

      {/* Business Description */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Business Description:</label>
        <textarea
          className="w-full bg-gray-700 px-2 py-1 rounded"
          rows={3}
          value={bus_description}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              bus_description: e.target.value,
            }))
          }
        />
      </div>

      {/* Business Description Second */}
      <div className="mb-4">
        <label className="block text-sm mb-1">
          Additional Business Description:
        </label>
        <textarea
          className="w-full bg-gray-700 px-2 py-1 rounded"
          rows={3}
          value={bus_description_second}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              bus_description_second: e.target.value,
            }))
          }
        />
      </div>

      {/* Years in Business */}
      <div className="mb-4">
        <label className="block text-sm mb-1">Years in Business:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={years_in_business}
          onChange={(e) =>
            setLocalData((prev) => ({
              ...prev,
              years_in_business: e.target.value,
            }))
          }
        />
      </div>

      {/* Process Steps Editor */}
      <div className="space-y-6 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Process Steps</h2>
          <button
            onClick={handleAddStep}
            className="bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white text-sm"
          >
            + Add Step
          </button>
        </div>

        {/* Validation error message */}
        {validationError && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded">
            {validationError}
          </div>
        )}

        {/* Steps List */}
        {localData.steps?.map((step, index) => (
          <div
            key={index}
            className="bg-gray-700 p-4 rounded border border-gray-600"
          >
            <div className="flex justify-between mb-3">
              <h3 className="text-lg font-medium">Step {index + 1}</h3>
              <button
                onClick={() => handleRemoveStep(index)}
                className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-white text-sm"
                disabled={localData.steps.length <= 1}
              >
                Remove
              </button>
            </div>

            {/* Step Title */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Title:</label>
              <input
                type="text"
                value={step.title || ""}
                onChange={(e) =>
                  handleStepChange(index, "title", e.target.value)
                }
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
              />
            </div>

            {/* Video Upload */}
            <div className="mb-3">
              <label className="block text-sm mb-1">Video:</label>
              <input
                type="file"
                accept="video/mp4"
                onChange={(e) => handleVideoUpload(index, e)}
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
              />
              {(step.videoSrc || previewVideos[index]) && (
                <div className="mt-2 border border-gray-500 rounded p-2">
                  <p className="text-sm text-gray-300 mb-2">
                    Current video: {step.fileName || step.videoSrc}
                  </p>
                  <video
                    src={previewVideos[index] || step.videoSrc}
                    className="w-full max-h-48 object-contain mt-2"
                    controls
                    muted
                  />
                </div>
              )}
            </div>

            {/* Link URL */}
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Link URL: (use /# prefix for page anchors)
              </label>
              <input
                type="text"
                value={step.href || ""}
                onChange={(e) =>
                  handleStepChange(index, "href", e.target.value)
                }
                className="w-full bg-gray-600 px-3 py-2 rounded text-white"
                placeholder="e.g., /#booking or /about"
              />
            </div>

            {/* Scale Factor */}
            <div className="mb-3">
              <label className="block text-sm mb-1">
                Scale Factor: {step.scale || 1.0}
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={step.scale || 1.0}
                onChange={(e) =>
                  handleStepChange(index, "scale", parseFloat(e.target.value))
                }
                className="w-full bg-gray-600 rounded"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Feature Cards</h2>
          <button
            onClick={handleAddCard}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add Card
          </button>
        </div>
        {cards.map((card, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => handleRemoveCard(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Title:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={card.title || ""}
                onChange={(e) => handleChangeCard(idx, "title", e.target.value)}
              />
            </label>
            <label className="block text-sm mb-1">
              Description:
              <textarea
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                rows={2}
                value={card.desc || ""}
                onChange={(e) => handleChangeCard(idx, "desc", e.target.value)}
              />
            </label>
            <label className="block text-sm mb-1">
              Icon (lucide-react):
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={card.icon || ""}
                onChange={(e) => handleChangeCard(idx, "icon", e.target.value)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Slideshow Images */}
      <div>
        <div className="flex items-center justify-between mb-2 ">
          <h2 className="text-lg font-semibold">Slideshow Images</h2>
          <button
            onClick={handleAddImage}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded"
          >
            + Add Image
          </button>
        </div>
        {images.map((img, idx) => (
          <div key={idx} className="bg-gray-800 p-3 rounded mb-2 relative">
            <button
              onClick={() => handleRemoveImage(idx)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Upload Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleChangeImage(idx, file);
                  }
                }}
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
              />
            </label>
            {img && (
              <img
                src={img}
                alt={`Slideshow ${idx + 1}`}
                className="mt-2 h-24 rounded shadow"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Add PropTypes validation
RichTextEditorPanel.propTypes = {
  localData: PropTypes.shape({
    heroText: PropTypes.string,
    accredited: PropTypes.bool,
    years_in_business: PropTypes.string,
    bus_description: PropTypes.string,
    bus_description_second: PropTypes.string,
    cards: PropTypes.array,
    images: PropTypes.array,
    imageUploads: PropTypes.array,
    overlayImages: PropTypes.array,
    steps: PropTypes.array,
  }),
  setLocalData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  processData: PropTypes.shape({
    steps: PropTypes.array,
  }),
};

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- If readOnly=true, shows RichTextPreview
- If false, shows RichTextEditorPanel
- onConfigChange(updatedData) bubbles changes up.

This component is part of the website's content management system
that allows for local editing and saving of JSON data. The edited
content can be downloaded and sent to the developer for permanent
integration into the site.
=============================================
*/
export default function RichTextBlock({
  readOnly = false,
  richTextData,
  processData,
  onConfigChange,
}) {
  // Initialize local state with the provided data or defaults
  const [localData, setLocalData] = useState(() => {
    // Merge processData steps into richTextData if available
    const initialData = !richTextData
      ? {
          heroText: "",
          accredited: false,
          years_in_business: "",
          bus_description: "",
          bus_description_second: "",
          cards: [],
          images: [],
          imageUploads: [],
          steps: processData?.steps || [],
          overlayImages: [
            "/assets/images/shake_img/1.png",
            "/assets/images/shake_img/2.png",
            "/assets/images/shake_img/3.png",
            "/assets/images/shake_img/4.png",
          ],
        }
      : {
          ...richTextData,
          cards: richTextData.cards?.map((c) => ({ ...c })) || [],
          images: [...(richTextData.images || [])],
          steps: richTextData.steps || processData?.steps || [],
          overlayImages: [
            ...(richTextData.overlayImages || [
              "/assets/images/shake_img/1.png",
              "/assets/images/shake_img/2.png",
              "/assets/images/shake_img/3.png",
              "/assets/images/shake_img/4.png",
            ]),
          ],
        };

    return initialData;
  });

  // Save changes back to the parent component
  const handleSave = () => {
    // Prepare data for saving - convert any file references to final paths
    const dataToSave = { ...localData };

    // For any step with a file upload, update the videoSrc path
    if (dataToSave.steps) {
      dataToSave.steps = dataToSave.steps.map((step) => {
        if (step.videoFile && step.fileName) {
          // Create a proper asset path for the video
          return {
            ...step,
            videoSrc: `/assets/videos/our_process_videos/${step.fileName}`,
            // Remove videoFile from the saved data
            videoFile: undefined,
            fileName: undefined,
          };
        }
        return step;
      });
    }

    onConfigChange?.(dataToSave);
  };

  // Render the appropriate component based on mode
  if (readOnly) {
    return (
      <RichTextPreview richTextData={richTextData} processData={processData} />
    );
  }

  return (
    <RichTextEditorPanel
      localData={localData}
      setLocalData={setLocalData}
      onSave={handleSave}
      processData={processData}
    />
  );
}

// Add PropTypes validation
RichTextBlock.propTypes = {
  readOnly: PropTypes.bool,
  richTextData: PropTypes.object,
  processData: PropTypes.object,
  onConfigChange: PropTypes.func,
};
