// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useCallback, memo } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// =============================================
// STYLING CONSTANTS - Simplified single styles
// =============================================
const TEXT_STYLES = {
  heroText:
    "text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left",
  busDescription:
    "text-xs sm:text-sm md:text-base lg:text-[2.5vh] text-white font-normal indent-4 text-left leading-relaxed",
  cardTitle:
    "ml-0.5 sm:ml-1 md:ml-0 mr-6 sm:mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words",
  cardDesc:
    "ml-0.5 sm:ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-snug break-words",
};

// =============================================
// Helper function to get editing styles
// =============================================
const getEditableStyle = (baseStyle) =>
  `${baseStyle} bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none`;

// =============================================
// IMAGE HELPERS - Following BeforeAfterBlock pattern
// =============================================

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (imageValue && typeof imageValue === "object" && imageValue.url) {
    return imageValue.url;
  }
  if (typeof imageValue === "string") {
    if (
      imageValue.startsWith("/") ||
      imageValue.startsWith("blob:") ||
      imageValue.startsWith("data:")
    ) {
      return imageValue;
    }
    return `/${imageValue.replace(/^\.\//, "")}`;
  }
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath = null) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath?.split("/").pop() || "image.jpg";
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (imageConfig && typeof imageConfig === "object") {
    // If imageConfig is an object, it might be from a previous state or a new upload
    urlToDisplay = imageConfig.url || defaultPath;
    nameToStore =
      imageConfig.name || urlToDisplay?.split("/").pop() || "image.jpg";
    fileObject = imageConfig.file || null;
    // Preserve originalUrl if it already exists
    originalUrlToStore =
      imageConfig.originalUrl ||
      (typeof imageConfig.url === "string" &&
      !imageConfig.url.startsWith("blob:")
        ? imageConfig.url
        : defaultPath);
  } else if (typeof imageConfig === "string") {
    // If imageConfig is a string, it's an initial path
    urlToDisplay = imageConfig;
    nameToStore = imageConfig.split("/").pop() || "image.jpg";
    originalUrlToStore = imageConfig;
  }

  return {
    file: fileObject,
    url: urlToDisplay,
    name: nameToStore,
    originalUrl: originalUrlToStore,
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
};

// Helper function to derive local state from props - simplified and fixed
const deriveInitialLocalData = (richTextDataInput) => {
  const initial = richTextDataInput || {};
  const currentVariant = initial.variant || "classic";

  // Get variant-specific data
  let variantSpecificData = {};
  if (initial.variants && initial.variants[currentVariant]) {
    variantSpecificData = initial.variants[currentVariant];
  }

  // Initialize images properly - convert string paths to image objects
  let initialImages = [];
  if (initial.images && Array.isArray(initial.images)) {
    initialImages = initial.images
      .map((img) => {
        if (typeof img === "string" || (img && typeof img === "object")) {
          return initializeImageState(img);
        }
        return null; // Return null for invalid entries
      })
      .filter(Boolean); // Filter out nulls
  }

  // Initialize overlay images - these are the card slate backgrounds
  let overlayImages = [];
  if (initial.overlayImages && Array.isArray(initial.overlayImages)) {
    overlayImages = initial.overlayImages
      .map((img) => {
        if (typeof img === "string" || (img && typeof img === "object")) {
          return initializeImageState(img);
        }
        return null; // Return null for invalid entries
      })
      .filter(Boolean); // Filter out nulls
  }

  return {
    // Core data
    images: initialImages,
    overlayImages: overlayImages,
    backgroundColor: initial.backgroundColor,
    variant: currentVariant,

    // Content - with defaults for editing
    heroText: initial.heroText,
    accredited: initial.accredited,
    years_in_business: initial.years_in_business,
    bus_description: initial.bus_description,
    cards: (initial.cards || []).map((c, index) => ({
      ...c,
      id: c.id || `card_${index}_${Date.now()}`,
      icon: c.icon,
      iconPack: c.iconPack,
      title: c.title,
      desc: c.desc,
    })),

    // Variant-specific layout configurations
    layout: variantSpecificData.layout,
    showCards:
      variantSpecificData.showCards !== undefined
        ? variantSpecificData.showCards
        : true,
    showSlideshow:
      variantSpecificData.showSlideshow !== undefined
        ? variantSpecificData.showSlideshow
        : true,
    cardPosition: variantSpecificData.cardPosition || "top",
    textAlignment: variantSpecificData.textAlignment || "center",

    // Variant-specific colors
    variantColors: variantSpecificData.colors || {},

    styling: {
      ...initial.styling,
      desktopHeightVH: initial.styling?.desktopHeightVH || 45,
      mobileHeightVW: initial.styling?.mobileHeightVW || 75,
      hasVariants: true,
    },
  };
};

/* 
=============================================
RICH-TEXT PREVIEW (Read-Only or Editable)
=============================================
*/
function RichTextPreview({ richTextData, readOnly, onRichTextDataChange }) {
  const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] =
    useState(0);

  // Extract images for slideshow effect - must be before early return
  const images = richTextData?.images || [];
  const slideshowImageSources = images
    .map((img) => getDisplayUrl(img))
    .filter(Boolean);
  const displaySlideshowImages =
    slideshowImageSources.length > 0 ? slideshowImageSources : [];

  // Always call useEffect, not conditionally - moved before early return
  useEffect(() => {
    let slideshowInterval;
    if (displaySlideshowImages.length > 1) {
      slideshowInterval = setInterval(() => {
        setCurrentImageSlideshowIndex(
          (prevIndex) => (prevIndex + 1) % displaySlideshowImages.length
        );
      }, 3000);
    }
    return () => {
      if (slideshowInterval) {
        clearInterval(slideshowInterval);
      }
    };
  }, [displaySlideshowImages.length]);

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  const { variant = "classic", overlayImages = [] } = richTextData;

  const handleFieldChange = (field, value) => {
    onRichTextDataChange({ ...richTextData, [field]: value });
  };

  const handleCardChange = (cardIndex, field, value) => {
    const updatedCards = richTextData.cards.map((card, idx) =>
      idx === cardIndex ? { ...card, [field]: value } : card
    );
    onRichTextDataChange({ ...richTextData, cards: updatedCards });
  };

  // Render different variants
  const renderVariant = () => {
    const variantProps = {
      richTextData,
      readOnly,
      onRichTextDataChange,
      handleFieldChange,
      handleCardChange,
      currentImageSlideshowIndex,
      displaySlideshowImages,
      overlayImages,
    };

    switch (variant) {
      case "modern":
        return <ModernRichTextVariant {...variantProps} />;
      case "grid":
        return <GridRichTextVariant {...variantProps} />;
      case "classic":
      default:
        return <ClassicRichTextVariant {...variantProps} />;
    }
  };

  return renderVariant();
}

RichTextPreview.propTypes = {
  richTextData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onRichTextDataChange: PropTypes.func.isRequired,
};

/* 
=============================================
CLASSIC RICHTEXT VARIANT
=============================================
*/
const ClassicRichTextVariant = memo(
  ({
    richTextData,
    readOnly,
    handleFieldChange,
    handleCardChange,
    currentImageSlideshowIndex,
    displaySlideshowImages,
    overlayImages,
  }) => {
    const {
      heroText,
      bus_description,
      cards = [],
      backgroundColor,
      styling = { desktopHeightVH: 45, mobileHeightVW: 75 },
    } = richTextData;

    // FeatureCard component
    const FeatureCard = memo(({ card, index }) => {
      const IconToRender = Icons[card.icon] || Icons.Star;

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

      const MotionWrapper = readOnly ? motion.div : "div";

      return (
        <MotionWrapper
          className="relative bg-white p-1 sm:p-2 rounded-lg shadow-lg flex flex-col items-center justify-center w-full min-h-[120px] sm:min-h-[140px] lg:-mx-2 group"
          variants={cardAnimationVariants}
          initial="hidden"
          animate="visible"
        >
          <div
            className="absolute top-0 right-0 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 z-20 rounded-tr-lg"
            style={{
              backgroundImage: `url(${getDisplayUrl(
                overlayImages[index % overlayImages.length]
              )})`,
              backgroundPosition: "top right",
              backgroundRepeat: "no-repeat",
              backgroundSize: "auto",
              clipPath: "polygon(0 0, 100% 0, 100% 100%)",
            }}
          />

          <div className="absolute top-0 right-0 w-auto h-6 sm:h-8 md:h-10 z-30 flex items-center justify-center space-x-1 p-0.5 sm:p-1 rounded-sm">
            <IconToRender className="text-white drop-shadow-lg w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
          </div>

          <div className="relative flex flex-col z-30 w-full h-full items-start justify-start p-0.5 sm:p-1 md:p-2">
            <div
              className="relative w-full mb-0.5 sm:mb-1 md:mb-2"
              style={{ zIndex: 51 }}
            >
              {!readOnly ? (
                <input
                  type="text"
                  value={card.title || ""}
                  onChange={(e) =>
                    handleCardChange(index, "title", e.target.value)
                  }
                  className={getEditableStyle(TEXT_STYLES.cardTitle)}
                />
              ) : (
                <h3 className={TEXT_STYLES.cardTitle}>{card.title}</h3>
              )}
            </div>

            <div className="relative w-full flex-grow" style={{ zIndex: 51 }}>
              {!readOnly ? (
                <textarea
                  value={card.desc || ""}
                  onChange={(e) =>
                    handleCardChange(index, "desc", e.target.value)
                  }
                  className={getEditableStyle(TEXT_STYLES.cardDesc) + " h-full"}
                  rows={2}
                />
              ) : (
                <p className={TEXT_STYLES.cardDesc}>{card.desc}</p>
              )}
            </div>
          </div>
        </MotionWrapper>
      );
    });

    FeatureCard.displayName = "FeatureCard";
    FeatureCard.propTypes = {
      card: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        desc: PropTypes.string,
        icon: PropTypes.string,
      }).isRequired,
      index: PropTypes.number.isRequired,
    };

    const ImageSlideshow = () => {
      if (!displaySlideshowImages || displaySlideshowImages.length === 0)
        return null;

      const MotionWrapper = readOnly ? motion.img : "img";

      return (
        <div className="absolute inset-0 w-full h-full">
          <AnimatePresence initial={false} mode="wait">
            <MotionWrapper
              key={currentImageSlideshowIndex}
              src={displaySlideshowImages[currentImageSlideshowIndex]}
              alt={`Slideshow image ${currentImageSlideshowIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </AnimatePresence>
        </div>
      );
    };

    const hasDescriptionContent = bus_description || !readOnly;
    const hasSlideshowImages = displaySlideshowImages.length > 0;
    const hasCards = cards && cards.length > 0;

    // Dynamic height calculation
    const dynamicHeight =
      window.innerWidth < 768
        ? `${styling.mobileHeightVW}vw`
        : `${styling.desktopHeightVH}vh`;

    // Responsive padding
    const getResponsivePadding = () => {
      const isMobile = window.innerWidth < 768;
      const heightValue = isMobile
        ? styling.mobileHeightVW
        : styling.desktopHeightVH;

      if (heightValue <= 40) return isMobile ? "px-[3vw]" : "px-[8vw]";
      if (heightValue <= 60) return isMobile ? "px-[4vw]" : "px-[12vw]";
      return isMobile ? "px-[5vw]" : "px-[15vw]";
    };

    return (
      <div className="rich-text-preview-container mx-auto px-0 sm:px-6 flex flex-col z-40 relative">
        {/* Feature Cards Section */}
        {(hasCards || !readOnly) && (
          <div className="w-full px-2 sm:px-0 mb-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-4 items-stretch">
              {cards.map((card, idx) => (
                <FeatureCard key={card.id || idx} card={card} index={idx} />
              ))}
            </div>
          </div>
        )}

        {/* Image Showcase Section */}
        {(hasSlideshowImages ||
          heroText ||
          hasDescriptionContent ||
          !readOnly) && (
          <div
            className={`relative w-full h-full group ${getResponsivePadding()}`}
            style={{
              height: dynamicHeight,
              minHeight: window.innerWidth < 768 ? "60vh" : "35vh",
            }}
          >
            {hasSlideshowImages && <ImageSlideshow />}

            {/* Text overlay */}
            <div className="absolute inset-0 flex flex-col items-center text-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-black/40 group-hover:bg-black/50 transition-colors duration-300">
              {/* Hero Text Section */}
              {(heroText || !readOnly) && (
                <div className="mb-10 sm:mb-10 md:mb-12 lg:mb-8 w-full flex-shrink-0">
                  {!readOnly ? (
                    <textarea
                      value={heroText || ""}
                      onChange={(e) =>
                        handleFieldChange("heroText", e.target.value)
                      }
                      className={getEditableStyle(TEXT_STYLES.heroText)}
                      placeholder="Enter Hero Text..."
                      rows={2}
                    />
                  ) : (
                    <h2 className={TEXT_STYLES.heroText}>{heroText}</h2>
                  )}
                </div>
              )}

              {/* Description Section */}
              {hasDescriptionContent && (
                <div className="flex-1 flex flex-col justify-center w-full overflow-hidden">
                  <div
                    className="flex-1 flex flex-col justify-center p-2 sm:p-2 md:p-6 lg:p-8 rounded-lg shadow-xl backdrop-blur-sm overflow-hidden"
                    style={{ backgroundColor: backgroundColor + "BF" }}
                  >
                    <div className="flex-1 flex flex-col justify-center overflow-hidden">
                      {(bus_description || !readOnly) && (
                        <div className="flex-grow flex items-center overflow-hidden">
                          {!readOnly ? (
                            <div className="w-full space-y-2">
                              <textarea
                                value={bus_description || ""}
                                onChange={(e) =>
                                  handleFieldChange(
                                    "bus_description",
                                    e.target.value
                                  )
                                }
                                className={`${getEditableStyle(TEXT_STYLES.busDescription)} w-full min-h-[4rem] sm:min-h-[6rem] md:min-h-[8rem] leading-loose`}
                                placeholder="Enter your business description..."
                                rows={4}
                                style={{ lineHeight: "1.8" }}
                              />
                            </div>
                          ) : (
                            <div className="w-full">
                              <p
                                className={`${TEXT_STYLES.busDescription} flex-1 overflow-hidden`}
                                style={{
                                  lineHeight: "1.8",
                                  wordSpacing: "0.1em",
                                }}
                              >
                                {bus_description}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

ClassicRichTextVariant.displayName = "ClassicRichTextVariant";
ClassicRichTextVariant.propTypes = {
  richTextData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleCardChange: PropTypes.func.isRequired,
  currentImageSlideshowIndex: PropTypes.number.isRequired,
  displaySlideshowImages: PropTypes.array.isRequired,
  overlayImages: PropTypes.array.isRequired,
};

/* 
=============================================
MODERN RICHTEXT VARIANT
=============================================
*/
const ModernRichTextVariant = memo(
  ({
    richTextData,
    readOnly,
    handleFieldChange,
    handleCardChange,
    displaySlideshowImages,
  }) => {
    const {
      heroText,
      bus_description,
      cards = [],
      styling = { desktopHeightVH: 45, mobileHeightVW: 75 },
    } = richTextData;

    const dynamicHeight =
      window.innerWidth < 768
        ? `${styling.mobileHeightVW * 0.8}vw`
        : `${styling.desktopHeightVH * 0.7}vh`;

    const ModernFeatureCard = ({ card, index }) => {
      const IconToRender = Icons[card.icon] || Icons.Star;
      const MotionWrapper = readOnly ? motion.div : "div";

      return (
        <MotionWrapper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
        >
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform">
              <IconToRender className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {!readOnly ? (
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) =>
                    handleCardChange(index, "title", e.target.value)
                  }
                  className="text-white font-semibold text-lg bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-blue-400 rounded p-1 w-full outline-none"
                  placeholder="Feature Title"
                />
              ) : (
                <h3 className="text-white font-semibold text-lg">
                  {card.title}
                </h3>
              )}

              {!readOnly ? (
                <textarea
                  value={card.desc}
                  onChange={(e) =>
                    handleCardChange(index, "desc", e.target.value)
                  }
                  className="text-white/80 text-sm mt-1 bg-transparent focus:bg-white/10 focus:ring-1 focus:ring-blue-400 rounded p-1 w-full outline-none resize-none"
                  placeholder="Feature description"
                  rows={2}
                />
              ) : (
                <p className="text-white/80 text-sm mt-1">{card.desc}</p>
              )}
            </div>
          </div>
        </MotionWrapper>
      );
    };

    ModernFeatureCard.propTypes = {
      card: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }).isRequired,
      index: PropTypes.number.isRequired,
    };

    const ImageGallery = () => {
      if (!displaySlideshowImages || displaySlideshowImages.length === 0)
        return null;

      return (
        <div className="grid grid-cols-2 gap-4 h-full">
          {displaySlideshowImages.slice(0, 4).map((img, index) => {
            const MotionWrapper = readOnly ? motion.div : "div";
            return (
              <MotionWrapper
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-lg ${index === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </MotionWrapper>
            );
          })}
        </div>
      );
    };

    return (
      <div
        className="w-full mx-auto relative"
        style={{ minHeight: dynamicHeight }}
      >
        <div className="grid lg:grid-cols-2 gap-0 min-h-full">
          {/* Left Side - Content */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>

            <div className="relative z-10 space-y-6">
              {/* Hero Text */}
              {(heroText || !readOnly) && (
                <div>
                  {!readOnly ? (
                    <textarea
                      value={heroText}
                      onChange={(e) =>
                        handleFieldChange("heroText", e.target.value)
                      }
                      className="text-3xl lg:text-4xl font-light text-white bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-blue-300 rounded-lg p-3 w-full placeholder-gray-300 outline-none leading-tight resize-none"
                      placeholder="Enter Hero Text..."
                      rows={2}
                    />
                  ) : (
                    <h1 className="text-3xl lg:text-4xl font-light text-white leading-tight">
                      {heroText}
                    </h1>
                  )}
                </div>
              )}

              {/* Description */}
              {(bus_description || !readOnly) && (
                <div className="space-y-4">
                  {!readOnly ? (
                    <textarea
                      value={bus_description}
                      onChange={(e) =>
                        handleFieldChange("bus_description", e.target.value)
                      }
                      className="text-base text-white/90 bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-blue-300 rounded-lg p-3 w-full placeholder-gray-300 outline-none leading-relaxed resize-none"
                      placeholder="Enter your business description..."
                      rows={4}
                      style={{ lineHeight: "1.8" }}
                    />
                  ) : (
                    <p
                      className="text-base text-white/90 leading-relaxed"
                      style={{ lineHeight: "1.8", wordSpacing: "0.1em" }}
                    >
                      {bus_description}
                    </p>
                  )}
                </div>
              )}

              {/* Feature Cards */}
              {cards.length > 0 && (
                <div className="space-y-3">
                  {cards.map((card, idx) => (
                    <ModernFeatureCard
                      key={card.id || idx}
                      card={card}
                      index={idx}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Visual Content */}
          <div className="bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-bl from-gray-50 to-gray-100"></div>
            <div className="relative z-10 p-6 lg:p-8 h-full flex items-center">
              <ImageGallery />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ModernRichTextVariant.displayName = "ModernRichTextVariant";
ModernRichTextVariant.propTypes = {
  richTextData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleCardChange: PropTypes.func.isRequired,
  displaySlideshowImages: PropTypes.array.isRequired,
};

/* 
=============================================
   GRID RICHTEXT VARIANT
=============================================
*/
const GridRichTextVariant = memo(
  ({
    richTextData,
    readOnly,
    handleFieldChange,
    handleCardChange,
    currentImageSlideshowIndex,
    displaySlideshowImages,
  }) => {
    const {
      heroText,
      bus_description,
      cards = [],
      styling = { desktopHeightVH: 45, mobileHeightVW: 75 },
    } = richTextData;

    const dynamicHeight =
      window.innerWidth < 768
        ? `${styling.mobileHeightVW}vw`
        : `${styling.desktopHeightVH}vh`;

    const GridFeatureCard = ({ card, index }) => {
      const IconToRender = Icons[card.icon] || Icons.Star;
      const cardColors = [
        "from-blue-500 to-blue-600",
        "from-green-500 to-green-600",
        "from-purple-500 to-purple-600",
        "from-orange-500 to-orange-600",
        "from-teal-500 to-teal-600",
        "from-pink-500 to-pink-600",
      ];
      const cardColor = cardColors[index % cardColors.length];
      const MotionWrapper = readOnly ? motion.div : "div";

      return (
        <MotionWrapper
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${cardColor} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative`}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center transition-colors">
              <IconToRender className="w-8 h-8 text-white" />
            </div>

            <div className="space-y-2">
              {!readOnly ? (
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) =>
                    handleCardChange(index, "title", e.target.value)
                  }
                  className="text-white font-bold text-lg bg-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/50 rounded p-2 w-full outline-none text-center"
                  placeholder="Feature Title"
                />
              ) : (
                <h3 className="text-white font-bold text-lg">{card.title}</h3>
              )}

              {!readOnly ? (
                <textarea
                  value={card.desc}
                  onChange={(e) =>
                    handleCardChange(index, "desc", e.target.value)
                  }
                  className="text-white/90 text-sm bg-transparent focus:bg-white/20 focus:ring-2 focus:ring-white/50 rounded p-2 w-full outline-none resize-none text-center leading-relaxed"
                  placeholder="Feature description"
                  rows={3}
                />
              ) : (
                <p className="text-white/90 text-sm leading-relaxed">
                  {card.desc}
                </p>
              )}
            </div>
          </div>
        </MotionWrapper>
      );
    };

    GridFeatureCard.propTypes = {
      card: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string.isRequired,
        desc: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }).isRequired,
      index: PropTypes.number.isRequired,
    };

    const ImageMosaic = () => {
      if (!displaySlideshowImages || displaySlideshowImages.length === 0)
        return null;

      const MotionWrapper = readOnly ? motion.img : "img";

      return (
        <div className="relative w-full h-full mb-[3vh] md:mb-[9vh] lg:mb-[12vh] lg:h-80 rounded-2xl overflow-hidden shadow-xl">
          <AnimatePresence initial={false} mode="wait">
            <MotionWrapper
              key={currentImageSlideshowIndex}
              src={displaySlideshowImages[currentImageSlideshowIndex]}
              alt={`Slideshow image ${currentImageSlideshowIndex + 1}`}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

          {/* Image indicators */}
          {displaySlideshowImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {displaySlideshowImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentImageSlideshowIndex
                      ? "bg-white"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="w-full mx-auto" style={{ minHeight: dynamicHeight }}>
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {/* Hero Section */}
          {(heroText || !readOnly) && (
            <div className="text-center space-y-6">
              {!readOnly ? (
                <textarea
                  value={heroText}
                  onChange={(e) =>
                    handleFieldChange("heroText", e.target.value)
                  }
                  className="text-4xl lg:text-5xl font-bold text-gray-800 bg-transparent focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 rounded-lg p-4 w-full placeholder-gray-400 outline-none leading-tight resize-none text-center"
                  placeholder="Enter Hero Text..."
                  rows={2}
                />
              ) : (
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                  {heroText}
                </h1>
              )}
            </div>
          )}

          {/* Image Showcase */}
          <ImageMosaic />

          {/* Description Section */}
          {(bus_description || !readOnly) && (
            <div className="w-full mx-auto space-y-6 text-center">
              {!readOnly ? (
                <textarea
                  value={bus_description}
                  onChange={(e) =>
                    handleFieldChange("bus_description", e.target.value)
                  }
                  className="text-lg text-gray-700 bg-transparent focus:bg-gray-100 focus:ring-2 focus:ring-blue-500 rounded-lg p-4 w-full placeholder-gray-400 outline-none leading-relaxed resize-none text-center"
                  placeholder="Enter your business description..."
                  rows={4}
                  style={{ lineHeight: "1.8" }}
                />
              ) : (
                <p
                  className="text-lg text-gray-700 leading-relaxed"
                  style={{ lineHeight: "1.8", wordSpacing: "0.1em" }}
                >
                  {bus_description}
                </p>
              )}
            </div>
          )}

          {/* Feature Cards Grid */}
          {cards.length > 0 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, idx) => (
                  <GridFeatureCard
                    key={card.id || idx}
                    card={card}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

GridRichTextVariant.displayName = "GridRichTextVariant";
GridRichTextVariant.propTypes = {
  richTextData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleCardChange: PropTypes.func.isRequired,
  currentImageSlideshowIndex: PropTypes.number.isRequired,
  displaySlideshowImages: PropTypes.array.isRequired,
};

/* 
=============================================
MAIN EXPORT: RichTextBlock
=============================================
*/
export default function RichTextBlock({
  readOnly = false,
  richTextData,
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(richTextData)
  );

  // Sync with prop changes
  useEffect(() => {
    if (richTextData) {
      setLocalData(deriveInitialLocalData(richTextData));
    }
  }, [richTextData]);

  const handleLocalDataChange = useCallback(
    (updatedData) => {
      setLocalData(updatedData);
      if (!readOnly && onConfigChange) {
        // Clean data for saving - convert image objects back to proper format
        const cleanedData = {
          ...updatedData,
          images:
            updatedData.images?.map((img) => {
              if (img?.file) {
                // Keep file object for new uploads
                return img;
              } else {
                // For existing images, just keep the URL
                return img?.originalUrl || img?.url;
              }
            }) || [],
          overlayImages:
            updatedData.overlayImages?.map((img) => {
              if (img?.file) {
                return img;
              } else {
                return img?.originalUrl || img?.url;
              }
            }) || [],
        };
        onConfigChange(cleanedData);
      }
    },
    [readOnly, onConfigChange]
  );

  return (
    <RichTextPreview
      richTextData={localData}
      readOnly={readOnly}
      onRichTextDataChange={handleLocalDataChange}
    />
  );
}

RichTextBlock.propTypes = {
  readOnly: PropTypes.bool,
  richTextData: PropTypes.object,
  onConfigChange: PropTypes.func,
};

// TabsConfig for TopStickyEditPanel integration - using PanelImagesController like BeforeAfterBlock
RichTextBlock.tabsConfig = (localData, onControlsChange) => {
  const tabs = {};

  // General Tab - Content and Variant Settings
  tabs.general = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Content Settings
      </h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Variant Style:
        </label>
        <select
          value={localData.variant || "classic"}
          onChange={(e) =>
            onControlsChange({ ...localData, variant: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="classic">Classic Layout</option>
          <option value="modern">Modern Split Layout</option>
          <option value="grid">Grid Layout</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Color:
        </label>
        <input
          type="color"
          value={localData.backgroundColor || "#1e293b"}
          onChange={(e) =>
            onControlsChange({ ...localData, backgroundColor: e.target.value })
          }
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );

  // Images Tab - using PanelImagesController like BeforeAfterBlock
  tabs.images = () => {
    const handleImagesChange = (data) => {
      const newImages = data.images || [];
      // Convert PanelImagesController format back to our format
      const convertedImages = newImages.map((img) => {
        if (img?.file) {
          return {
            file: img.file,
            url: img.url,
            name: img.name,
            originalUrl: img.originalUrl,
            id:
              img.id ||
              `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
        } else {
          return initializeImageState(img?.url || img);
        }
      });
      onControlsChange({ ...localData, images: convertedImages });
    };

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Slideshow Images
        </h3>

        <div className="bg-gray-50 p-3 rounded-md">
          <PanelImagesController
            currentData={{ images: localData.images || [] }}
            onControlsChange={handleImagesChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) =>
              item?.name || `Slideshow Image ${idx + 1}`
            }
            maxImages={10}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md border">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Upload multiple images for an automatic slideshow</li>
            <li>• Images will cycle every 3-4 seconds in the preview</li>
            <li>• Recommended size: 1200x800px or larger</li>
          </ul>
        </div>
      </div>
    );
  };

  // Overlays Tab for card decoration images
  tabs.overlays = () => {
    const handleOverlayImagesChange = (data) => {
      const newImages = data.overlayImages || [];
      // Convert PanelImagesController format back to our format
      const convertedImages = newImages.map((img) => {
        if (img?.file) {
          return {
            file: img.file,
            url: img.url,
            name: img.name,
            originalUrl: img.originalUrl,
            id:
              img.id ||
              `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          };
        } else {
          return initializeImageState(img?.url || img);
        }
      });
      onControlsChange({ ...localData, overlayImages: convertedImages });
    };

    return (
      <div className="p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Card Overlay Images
        </h3>

        <div className="bg-gray-50 p-3 rounded-md">
          <PanelImagesController
            currentData={{ overlayImages: localData.overlayImages || [] }}
            onControlsChange={handleOverlayImagesChange}
            imageArrayFieldName="overlayImages"
            getItemName={(item, idx) =>
              item?.name || `Overlay Image ${idx + 1}`
            }
            maxImages={4}
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-md border">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Tips:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>
              • These images are used as corner decorations on the feature
              cards.
            </li>
            <li>
              • Upload up to 4 images. They will be applied to the cards in
              order.
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Styling Tab - Layout and Height Settings
  tabs.styling = () => (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-700">
        Layout Settings
      </h3>

      <PanelStylingController
        currentData={localData}
        onControlsChange={(newData) => onControlsChange(newData)}
        blockType="RichTextBlock"
        controlType="height"
      />
    </div>
  );

  return tabs;
};
