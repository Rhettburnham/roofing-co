// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import * as Icons from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import IconSelectorModal from "../common/IconSelectorModal";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelImageSectionController from "../common/PanelImageSectionController";
import PanelStylingController from "../common/PanelStylingController";
import PanelFontController from "../common/PanelFontController";
import DynamicIconRenderer from "../common/DynamicIconRenderer";
import { slugify } from "../../utils/slugify";
import { debounce } from 'lodash';
import gsap from 'gsap';

// Helper to generate styles from text settings object
const getTextStyles = (settings) => {
  if (!settings || typeof settings !== 'object') {
    return {};
  }
  const styles = {};
  if (settings.fontFamily) styles.fontFamily = settings.fontFamily;
  if (settings.fontSize) styles.fontSize = `${settings.fontSize}px`;
  if (settings.fontWeight) styles.fontWeight = settings.fontWeight;
  if (settings.lineHeight) styles.lineHeight = settings.lineHeight;
  if (settings.letterSpacing) styles.letterSpacing = `${settings.letterSpacing}px`;
  if (settings.textAlign) styles.textAlign = settings.textAlign;
  if (settings.color) styles.color = settings.color;
  return styles;
};

// =============================================
// STYLING CONSTANTS - Keep consistent between edit and read-only modes
// =============================================
const TEXT_STYLES = {
  heroText: {
    base: "text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left",
    editable:
      "bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none whitespace-pre-line",
    readOnly:
      "whitespace-pre-line",
  },
  busDescription: {
    base: "text-xs sm:text-sm md:text-base lg:text-lg text-white font-normal indent-4 text-left leading-relaxed",
    editable:
      "bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none",
    readOnly:
      "",
  },
  busDescriptionSecond: {
    base: "text-xs sm:text-sm md:text-base lg:text-[2.5vh] text-white font-normal leading-relaxed indent-4 mt-1 sm:mt-3 text-left",
    editable:
      "bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none",
    readOnly:
      "",
  },
  cardTitle: {
    base: "ml-0.5 sm:ml-1 md:ml-0 mr-6 sm:mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words",
    editable:
      "bg-transparent focus:bg-white/50 focus:ring-1 focus:ring-blue-500 rounded px-1 w-full",
    readOnly:
      "",
  },
  cardDesc: {
    base: "ml-0.5 sm:ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-snug break-words",
    editable:
      "bg-transparent focus:bg-white/50 focus:ring-1 focus:ring-blue-500 rounded px-1 w-full h-full resize-none",
    readOnly:
      "",
  },
};

// =============================================
// Helper function to derive local state from props
// =============================================
const deriveInitialLocalData = (richTextDataInput, currentBannerColor) => {
  const initial = richTextDataInput || {};

  // Get the current variant
  const currentVariant = initial.variant || "classic";

  // Get variant-specific data
  let variantSpecificData = {};
  if (initial.variants && initial.variants[currentVariant]) {
    variantSpecificData = initial.variants[currentVariant];
  }

  // Initialize images - no default images. Must come from config.
  let initialImages = initial.images || [];

  // Start with ALL properties from the initial data to preserve everything
  const derivedData = {
    ...initial, // Preserve all original properties first
    
    // Then override/process specific properties that need special handling
    images: initialImages.map((img, index) => {
      if (typeof img === "string") {
        return {
          file: null,
          url: img,
          name: img.split("/").pop() || `Image ${index + 1}`,
          originalUrl: img,
          id: `img_${Date.now()}_${index}`,
        };
      }
      if (img && typeof img === "object") {
        return {
          file: img.file instanceof File ? img.file : null,
          url: typeof img.url === "string" ? img.url : "",
          name:
            typeof img.name === "string"
              ? img.name
              : typeof img.url === "string"
                ? img.url.split("/").pop()
                : `Image ${index + 1}`,
          originalUrl:
            typeof img.originalUrl === "string"
              ? img.originalUrl
              : typeof img.url === "string"
                ? img.url
                : "",
          id: img.id || `img_${Date.now()}_${index}`,
        };
      }
      return {
        file: null,
        url: "",
        name: `Image ${index + 1}`,
        originalUrl: "",
        id: `img_${Date.now()}_${index}`,
      };
    }),
    
    steps: (initial.steps || []).map((step) => ({
      ...step,
      id: step.id || `step_${Math.random().toString(36).substr(2, 9)}`,
      videoFile: step.videoFile || null,
      videoSrc: step.videoFile
        ? URL.createObjectURL(step.videoFile)
        : step.videoSrc || "",
      videoFileName:
        step.videoFileName ||
        (step.videoFile
          ? step.videoFile.name
          : typeof step.videoSrc === "string"
            ? step.videoSrc.split("/").pop()
            : ""),
      originalVideoUrl:
        step.originalVideoUrl ||
        (typeof step.videoSrc === "string" && !step.videoSrc.startsWith("blob:")
          ? step.videoSrc
          : null),
    })),
    
    backgroundColor: initial.backgroundColor || currentBannerColor,
    variant: currentVariant,
    variants: initial.variants || {},

    // Merge variant-specific content with root-level defaults (only if not already set)
    heroText: initial.heroText !== undefined ? initial.heroText : (variantSpecificData.heroText || ""),
    bus_description: initial.bus_description !== undefined ? initial.bus_description : (variantSpecificData.bus_description || ""),
    
    cards: (variantSpecificData.cards || initial.cards || []).map((c) => ({
      ...c,
      id: c.id || `card_${Math.random().toString(36).substr(2, 9)}`,
      // Ensure all cards have valid icon properties with fallbacks
      icon: c.icon || "Star",
      iconPack: c.iconPack || "lucide",
    })),

    // Variant-specific layout and styling configurations (preserve existing values first)
    layout: initial.layout !== undefined ? initial.layout : (variantSpecificData.layout || "default"),
    showCards: initial.showCards !== undefined ? initial.showCards : (variantSpecificData.showCards !== undefined ? variantSpecificData.showCards : true),
    showSlideshow: initial.showSlideshow !== undefined ? initial.showSlideshow : (variantSpecificData.showSlideshow !== undefined ? variantSpecificData.showSlideshow : true),
    cardPosition: initial.cardPosition !== undefined ? initial.cardPosition : (variantSpecificData.cardPosition || "top"),
    textAlignment: initial.textAlignment !== undefined ? initial.textAlignment : (variantSpecificData.textAlignment || "center"),

    // Variant-specific colors (preserve existing if present)
    variantColors: initial.variantColors || variantSpecificData.colors || {},

    // Ensure styling object preserves all existing properties
    styling: {
      hasVariants: true, // Enable variant support
      ...initial.styling, // Preserve all existing styling properties
      paddingTop: initial.styling?.paddingTop ?? 4,
      paddingBottom: initial.styling?.paddingBottom ?? 4,
    },
  };

  return derivedData;
};

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only or Editable)
---------------------------------------------
Displays content. If not readOnly, allows inline editing of text fields and card icons/text.
=============================================
*/
function RichTextPreview({
  richTextData,
  readOnly,
  bannerColor,
  openIconModalForCard,
  onRichTextDataChange,
  onAddCard,
  onRemoveCard,
  playIntroAnimationForCards,
}) {
  const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] =
    useState(0);

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  const {
    heroText = "",
    bus_description = "",
    cards = [],
    images = [],
    backgroundColor = "#1e293b",
    styling = { desktopHeightVH: 45, mobileHeightVW: 75 },
    variant = "classic",
    layout = "default",
    showCards = true,
    showSlideshow = true,
    cardPosition = "top",
    textAlignment = "center",
  } = richTextData || {};

  const handleFieldChange = (field, value) => {
    onRichTextDataChange({ ...richTextData, [field]: value });
  };

  const handleVariantFieldChange = (field, value) => {
    const currentVariant = richTextData.variant || "classic";
    const updatedVariants = {
      ...richTextData.variants,
      [currentVariant]: {
        ...richTextData.variants?.[currentVariant],
        [field]: value,
      },
    };
    onRichTextDataChange({
      ...richTextData,
      variants: updatedVariants,
      [field]: value, // Also update at root level for current display
    });
  };

  const handleCardChange = (cardIndex, field, value) => {
    const updatedCards = richTextData.cards.map((card, idx) =>
      idx === cardIndex ? { ...card, [field]: value } : card
    );
    onRichTextDataChange({ ...richTextData, cards: updatedCards });
  };

  // Render different variants based on the variant prop
  const renderVariant = () => {
    // Use richTextData.variant if available, otherwise fall back to the variant prop
    const activeVariant = richTextData?.variant || variant;

    switch (activeVariant) {
      case "modern":
        return (
          <ModernRichTextVariant
            richTextData={richTextData}
            readOnly={readOnly}
            onRichTextDataChange={onRichTextDataChange}
            openIconModalForCard={openIconModalForCard}
            onAddCard={onAddCard}
            onRemoveCard={onRemoveCard}
            playIntroAnimationForCards={playIntroAnimationForCards}
          />
        );
      case "classic":
      default:
        return renderClassicVariant();
    }
  };

  const renderClassicVariant = () => {
    const slideshowImageSources = images
      .map((img) => {
        if (img && typeof img === "object" && img.url) {
          return img.url;
        }
        return "";
      })
      .filter((img) => img);

    const displaySlideshowImages = slideshowImageSources;

    // Separate useEffect for slideshow to prevent affecting card animations
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

    // FeatureCard component with enhanced animations
    // Cards slide in smoothly with GSAP animations for visual appeal
    function FeatureCard({
      iconPack,
      icon: IconName,
      title,
      desc,
      index,
      playIntroAnimation,
      readOnlyCard,
      openIconModalForCard,
      onCardFieldChange,
      onRemoveCard,
    }) {
      const cardRef = useRef(null);
      const isVisible = useInView(cardRef, { once: true, amount: 0.5 });
      const [animationCompleted, setAnimationCompleted] = useState(false);
      
      // Use DynamicIconRenderer for consistent icon handling with fallbacks
      const IconComponent = (props) => {
        // Provide fallback values if missing
        const safeIconPack = iconPack || "lucide";
        const safeIconName = IconName || "Star";
        
        // Debug logging for icon issues
        if (!iconPack || !IconName) {
          console.warn(`FeatureCard ${index}: Missing icon data. iconPack="${iconPack}", icon="${IconName}". Using fallbacks.`);
        }
        
        return (
          <DynamicIconRenderer 
            iconPack={safeIconPack} 
            iconName={safeIconName} 
            fallback={Icons.Star}
            {...props} 
          />
        );
      };

      useEffect(() => {
        if (playIntroAnimation && isVisible && !animationCompleted) {
          gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power3.out",
              onComplete: () => {
                setAnimationCompleted(true);
              },
            }
          );
        } else if (!playIntroAnimation) {
          gsap.set(cardRef.current, { opacity: 1, y: 0 });
          setAnimationCompleted(true);
        }
      }, [isVisible, index, playIntroAnimation, animationCompleted]);

      return (
        <motion.div
          ref={cardRef}
          initial={
            playIntroAnimation ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={
            playIntroAnimation ? { delay: index * 0.1 } : { duration: 0 }
          }
          className="relative bg-white p-1 sm:p-2 rounded-lg shadow-lg flex flex-col items-center justify-center group"
        >
          <div
            className={`absolute top-0 right-0 w-auto h-6 sm:h-8 md:h-10 z-30 flex items-center justify-center space-x-1 p-0.5 sm:p-1 rounded-sm 
                        ${!readOnlyCard && openIconModalForCard ? "cursor-pointer transition-colors hover:bg-black/20" : ""}`}
            onClick={(e) => {
              if (!readOnlyCard && openIconModalForCard) {
                e.stopPropagation();
                openIconModalForCard(index);
              }
            }}
            title={!readOnlyCard ? "Edit Icon" : ""}
          >
            {IconComponent && (
              <IconComponent className="text-blue-600 drop-shadow-lg w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8" />
            )}
          </div>

          <div className="relative flex flex-col z-30 w-full h-full items-start justify-start p-0.5 sm:p-1 md:p-2">
            <div
              className={`relative w-full mb-0.5 sm:mb-1 md:mb-2`}
              style={{ zIndex: 51 }}
            >
              {!readOnlyCard ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) =>
                    onCardFieldChange(index, "title", e.target.value)
                  }
                  className={TEXT_STYLES.cardTitle.editable}
                  style={getTextStyles(richTextData.cardTitleTextSettings)}
                />
              ) : (
                <h3 className={`${TEXT_STYLES.cardTitle.base} ${TEXT_STYLES.cardTitle.readOnly}`} style={getTextStyles(richTextData.cardTitleTextSettings)}>{title}</h3>
              )}
            </div>

            <div className="relative w-full flex-grow-0" style={{ zIndex: 51 }}>
              {!readOnlyCard ? (
                <textarea
                  value={desc}
                  onChange={(e) =>
                    onCardFieldChange(index, "desc", e.target.value)
                  }
                  className={TEXT_STYLES.cardDesc.editable}
                  style={getTextStyles(richTextData.cardDescTextSettings)}
                  rows={2}
                />
              ) : (
                <p className={`${TEXT_STYLES.cardDesc.base} ${TEXT_STYLES.cardDesc.readOnly}`} style={getTextStyles(richTextData.cardDescTextSettings)}>{desc}</p>
              )}
            </div>
          </div>
          {!readOnlyCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveCard(index);
              }}
              className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-white/30 hover:bg-white/50 rounded-full z-50"
              title="Remove Card"
            >
              <Icons.XCircle size={12} className="sm:w-4 sm:h-4" />
            </button>
          )}
        </motion.div>
      );
    }

    FeatureCard.propTypes = {
      iconPack: PropTypes.string,
      icon: PropTypes.string,
      title: PropTypes.string,
      desc: PropTypes.string,
      index: PropTypes.number,
      playIntroAnimation: PropTypes.bool.isRequired,
      readOnlyCard: PropTypes.bool.isRequired,
      openIconModalForCard: PropTypes.func,
      onCardFieldChange: PropTypes.func.isRequired,
      onRemoveCard: PropTypes.func,
    };

    const ImageSlideshow = () => {
      if (!displaySlideshowImages || displaySlideshowImages.length === 0)
        return null;

      return (
        <div className="absolute inset-0 w-full h-full">
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
              onError={(e) => {
                e.target.style.display = "none";
              }}
              onAnimationComplete={() =>
                console.log("Slideshow image transition completed")
              }
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
      const checkAutoplaySupport = async () => {
        try {
          const video = document.createElement("video");
          video.muted = true;
          video.playsInline = true;
          video.preload = "auto";
        } catch (error) {
          console.error("Error checking autoplay support:", error);
        }
      };
      checkAutoplaySupport();
    }, []);

    const hasDescriptionContent = bus_description || !readOnly;
    const hasSlideshowImages = displaySlideshowImages.length > 0;
    const hasCards = cards && cards.length > 0;

    // Enhanced dynamic height calculation for better viewport responsiveness
    const dynamicHeight =
      window.innerWidth < 768
        ? `${Math.max(80, styling.mobileHeightVW)}vw` // Increased minimum height on mobile
        : `${Math.max(35, styling.desktopHeightVH)}vh`; // Ensure minimum height on desktop

    // Responsive padding based on viewport and dynamic height
    const getResponsivePadding = () => {
      const isMobile = window.innerWidth < 768;
      const heightValue = isMobile
        ? styling.mobileHeightVW
        : styling.desktopHeightVH;

      if (heightValue <= 40) {
        return isMobile ? "px-[3vw]" : "px-[8vw]"; // Reduced padding for smaller heights on mobile
      } else if (heightValue <= 60) {
        return isMobile ? "px-[4vw]" : "px-[12vw]"; // Reduced padding for medium heights on mobile
      } else {
        return isMobile ? "px-[5vw]" : "px-[15vw]"; // Reduced padding for larger heights on mobile
      }
    };

    const paddingTop = styling.paddingTop || 4;
    const paddingBottom = styling.paddingBottom || 4;

    return (
      <div className="rich-text-preview-container mx-auto px-0 sm:px-6 flex flex-col relative" style={{ paddingTop: `${paddingTop}rem`, paddingBottom: `${paddingBottom}rem` }}>
        {/* Section 1: Feature Cards - Enhanced with staggered animations */}
        {(hasCards || !readOnly) && (
          <div className="w-full px-2 sm:px-0 mb-4">
            {" "}
            {/* Changed from -mb-2 to mb-4 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-4 items-stretch">
              {" "}
              {/* Reduced gaps on mobile */}
              {cards.map((card, idx) => (
                <FeatureCard
                  key={card.id || idx}
                  iconPack={card.iconPack}
                  icon={card.icon}
                  title={card.title}
                  desc={card.desc}
                  index={idx}
                  playIntroAnimation={playIntroAnimationForCards}
                  readOnlyCard={readOnly}
                  openIconModalForCard={openIconModalForCard}
                  onCardFieldChange={handleCardChange}
                  onRemoveCard={!readOnly ? onRemoveCard : undefined}
                />
              ))}
            </div>
            {!readOnly && (
              <div className="text-center mt-3 mb-2">
                {" "}
                {/* Adjusted margins */}
                <button
                  onClick={onAddCard}
                  className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md shadow focus:outline-none focus:ring-1 focus:ring-green-400"
                >
                  <Icons.PlusCircle size={14} className="inline mr-1" /> Add
                  Feature Card
                </button>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Enhanced Image Showcase with Responsive Padding and Better Text Layout */}
        {(hasSlideshowImages ||
          heroText ||
          hasDescriptionContent ||
          !readOnly) && (
          <div
            className={`relative w-full h-full group ${getResponsivePadding()}`}
            style={{
              height: dynamicHeight,
              minHeight: window.innerWidth < 768 ? "60vh" : "35vh",
            }} // Added minHeight
          >
            {hasSlideshowImages && <ImageSlideshow />}

            {/* Enhanced text overlay with better mobile spacing */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 sm:p-4 md:p-6 lg:p-8 xl:p-10 bg-black/40 group-hover:bg-black/50 transition-colors duration-300">
              {/* Hero Text Section with responsive spacing */}
              {(heroText || !readOnly) && (
                <div className="mb-4 w-full flex-shrink-0">
                  {!readOnly ? (
                    <textarea
                      value={heroText}
                      onChange={(e) =>
                        handleFieldChange("heroText", e.target.value)
                      }
                      className={TEXT_STYLES.heroText.editable}
                      style={getTextStyles(richTextData.heroTextSettings)}
                      placeholder="Enter Hero Text..."
                      rows={2}
                    />
                  ) : (
                    <h2 className={TEXT_STYLES.heroText.readOnly} style={getTextStyles(richTextData.heroTextSettings)}>
                      {heroText}
                    </h2>
                  )}
                </div>
              )}

              {/* Enhanced Description Section with improved mobile layout and spacing */}
              {hasDescriptionContent && (
                <div className="flex-shrink-0 w-full max-w-4xl mx-auto">
                  <div
                    className="p-2 sm:p-2 md:p-6 lg:p-8 rounded-lg shadow-xl backdrop-blur-sm mx-auto max-w-full"
                    style={{ backgroundColor: backgroundColor + "BF" }}
                  >
                    {(bus_description || !readOnly) && (
                      <div>
                        {!readOnly ? (
                          <div className="w-full space-y-2">
                            <textarea
                              value={bus_description}
                              onChange={(e) =>
                                handleFieldChange(
                                  "bus_description",
                                  e.target.value
                                )
                              }
                              className={`${TEXT_STYLES.busDescription.editable} w-full min-h-[4rem] sm:min-h-[6rem] md:min-h-[8rem] leading-loose`}
                              style={getTextStyles(richTextData.descriptionTextSettings)}
                              placeholder="Enter your business description... (Leave empty to hide this section)"
                              rows={4}
                            />
                            {bus_description && (
                              <button
                                onClick={() =>
                                  handleFieldChange("bus_description", "")
                                }
                                className="text-xs text-white/70 hover:text-white/90 underline"
                              >
                                Clear description
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="w-full">
                            <p
                              className={`${TEXT_STYLES.busDescription.base} ${TEXT_STYLES.busDescription.readOnly}`}
                              style={getTextStyles(richTextData.descriptionTextSettings)}
                            >
                              {bus_description}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return renderVariant();
}

RichTextPreview.propTypes = {
  richTextData: PropTypes.shape({
    heroText: PropTypes.string,
    bus_description: PropTypes.string,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        desc: PropTypes.string,
        icon: PropTypes.string,
        iconPack: PropTypes.string,
      })
    ),
    images: PropTypes.array,
    overlayImages: PropTypes.array,
    backgroundColor: PropTypes.string,
    styling: PropTypes.shape({
      desktopHeightVH: PropTypes.number,
      mobileHeightVW: PropTypes.number,
    }),
  }).isRequired,
  readOnly: PropTypes.bool.isRequired,
  bannerColor: PropTypes.string,
  openIconModalForCard: PropTypes.func,
  onRichTextDataChange: PropTypes.func.isRequired,
  onAddCard: PropTypes.func,
  onRemoveCard: PropTypes.func,
  playIntroAnimationForCards: PropTypes.bool,
};

// =============================================
// Control Components for Tabs (Simplified)
// =============================================

const RichTextColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorUpdate = (fieldName, colorValue) => {
    onControlsChange({ ...currentData, [fieldName]: colorValue });
  };

  return (
    <div className="p-3">
      <ThemeColorPicker
        label="Background Color (for text overlay box)"
        currentColorValue={currentData.backgroundColor || "#1e293b"}
        themeColors={themeColors}
        onColorChange={(fieldName, value) =>
          handleColorUpdate("backgroundColor", value)
        }
        fieldName="backgroundColor"
      />
      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
        <h4 className="text-sm font-medium text-gray-600 mb-1">Note:</h4>
        <p className="text-xs text-gray-500">
          This color is used as the background for the text overlay box
          containing the business descriptions. The color will be applied with
          75% opacity and backdrop blur for better text readability.
        </p>
      </div>
    </div>
  );
};
RichTextColorControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

/* ==============================================
   RICH TEXT FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for RichTextBlock elements
=============================================== */
const RichTextFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-6 text-center text-gray-800 border-b pb-3">Font Settings</h3>
      
      <div className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-md border">
          <PanelFontController
            label="Hero Text"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="heroTextSettings"
            themeColors={themeColors}
          />
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md border">
          <PanelFontController
            label="Description Text"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="descriptionTextSettings"
            themeColors={themeColors}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md border">
          <PanelFontController
            label="Card Title"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="cardTitleTextSettings"
            themeColors={themeColors}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md border">
          <PanelFontController
            label="Card Description"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="cardDescTextSettings"
            themeColors={themeColors}
          />
        </div>
      </div>
    </div>
  );
};

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- Manages localData derived from richTextData prop.
- Calls onConfigChange when localData is modified.
- Renders RichTextPreview for display and inline editing.
- Exposes tabsConfig for BottomStickyEditPanel.
=============================================
*/
export default function RichTextBlock({
  readOnly = false,
  richTextData,
  onConfigChange,
  bannerColor,
  themeColors,
  variant = "classic", // Default variant prop
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(
      richTextData,
      bannerColor || richTextData?.backgroundColor
    )
  );
  const prevReadOnlyRef = useRef(readOnly);

  const [isIconModalOpenForCards, setIsIconModalOpenForCards] = useState(false);
  const [editingCardIndexForIcon, setEditingCardIndexForIcon] = useState(null);

  // Move animation state management here to prevent resets on re-renders
  const animationPlayedRef = useRef(false);
  const [playIntroAnimationForCards, setPlayIntroAnimationForCards] =
    useState(false);

  // Initialize animation state only once when component mounts
  useEffect(() => {
    if (!animationPlayedRef.current) {
      setPlayIntroAnimationForCards(true);
      // Set a timeout to turn off the animation after all cards have animated
      const timeout = setTimeout(() => {
        setPlayIntroAnimationForCards(false);
        animationPlayedRef.current = true;
      }, 2000); // Adjust this timeout based on your animation duration
      return () => clearTimeout(timeout);
    }
  }, []);

  // Reset animation state when readOnly changes from true to false
  useEffect(() => {
    if (prevReadOnlyRef.current === true && readOnly === false) {
      animationPlayedRef.current = false;
      setPlayIntroAnimationForCards(true);
      // Set a timeout to turn off the animation after all cards have animated
      const timeout = setTimeout(() => {
        setPlayIntroAnimationForCards(false);
        animationPlayedRef.current = true;
      }, 2000); // Adjust this timeout based on your animation duration
      return () => clearTimeout(timeout);
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly]);

  // Separate slideshow state management
  const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] =
    useState(0);
  const slideshowIntervalRef = useRef(null);

  // Handle slideshow separately from card animations
  useEffect(() => {
    const slideshowImageSources = localData.images
      ?.map((img) => (img && typeof img === "object" && img.url ? img.url : ""))
      .filter((img) => img);

    if (slideshowImageSources?.length > 1) {
      slideshowIntervalRef.current = setInterval(() => {
        setCurrentImageSlideshowIndex(
          (prevIndex) => (prevIndex + 1) % slideshowImageSources.length
        );
      }, 3000);
    }

    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, [localData.images]);

  useEffect(() => {
    const effectiveBackgroundColor =
      richTextData?.backgroundColor || bannerColor;
    setLocalData(
      deriveInitialLocalData(richTextData, effectiveBackgroundColor)
    );
  }, [richTextData, bannerColor]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localData,
          images: localData.images.map((img) => {
            if (img.file) {
              return {
                file: img.file,
                url: img.url,
                name: img.name,
                originalUrl: img.originalUrl,
                id: img.id,
              };
            } else {
              return {
                url: img.originalUrl || img.url,
                name: img.name,
                originalUrl: img.originalUrl || img.url,
                id: img.id,
              };
            }
          }),
        };
        dataToSave.images = dataToSave.images.map((img) => {
          if (!img.file) {
            const { file, ...rest } = img;
            return rest;
          }
          return img;
        });

        console.log(
          "[RichTextBlock onConfigChange Effect] dataToSave:",
          JSON.parse(
            JSON.stringify(dataToSave, (k, v) =>
              v instanceof File
                ? {
                    name: v.name,
                    type: v.type,
                    size: v.size,
                    lastModified: v.lastModified,
                  }
                : v
            )
          )
        );
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = useCallback(
    (updatedFieldsOrFunction) => {
      setLocalData((prevLocalData) => {
        let newState;
        
        if (typeof updatedFieldsOrFunction === "function") {
          newState = updatedFieldsOrFunction(prevLocalData);
        } else {
          // Deep merge for better preservation of nested data
          newState = JSON.parse(JSON.stringify(prevLocalData)); // Deep clone to avoid mutations
          
          // Apply changes with proper merging
          for (const [key, value] of Object.entries(updatedFieldsOrFunction)) {
            if (key === 'styling' && typeof value === 'object' && value !== null) {
              // For styling updates, preserve all existing styling properties
              newState.styling = {
                ...prevLocalData.styling,
                ...value,
              };
            } else if (key === 'variants' && typeof value === 'object' && value !== null) {
              // For variants updates, preserve all existing variants
              newState.variants = {
                ...prevLocalData.variants,
                ...value,
              };
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && prevLocalData[key] && typeof prevLocalData[key] === 'object') {
              // For other nested objects, merge them properly
              newState[key] = {
                ...prevLocalData[key],
                ...value,
              };
            } else {
              // For primitive values and arrays, direct assignment
              newState[key] = value;
            }
          }
        }

        // If variant is changing, we need to merge in the new variant's data
        if (newState.variant && newState.variant !== prevLocalData.variant) {
          const variantSpecificData = newState.variants?.[newState.variant] || {};
          
          // Merge variant-specific data only if not already present
          newState.heroText = newState.heroText || variantSpecificData.heroText || prevLocalData.heroText;
          newState.bus_description = newState.bus_description || variantSpecificData.bus_description || prevLocalData.bus_description;
          newState.cards = newState.cards || variantSpecificData.cards || prevLocalData.cards;
          newState.layout = newState.layout || variantSpecificData.layout || prevLocalData.layout;
          newState.showCards = newState.showCards !== undefined ? newState.showCards : (variantSpecificData.showCards !== undefined ? variantSpecificData.showCards : prevLocalData.showCards);
          newState.showSlideshow = newState.showSlideshow !== undefined ? newState.showSlideshow : (variantSpecificData.showSlideshow !== undefined ? variantSpecificData.showSlideshow : prevLocalData.showSlideshow);
          newState.cardPosition = newState.cardPosition || variantSpecificData.cardPosition || prevLocalData.cardPosition;
          newState.textAlignment = newState.textAlignment || variantSpecificData.textAlignment || prevLocalData.textAlignment;
        }

        // Ensure core properties are never lost
        const coreProperties = [
          'heroText', 'bus_description', 'cards', 'images', 'steps', 'backgroundColor', 
          'variant', 'variants', 'accredited', 'years_in_business', 'layout', 'showCards', 
          'showSlideshow', 'cardPosition', 'textAlignment', 'heroTextSettings', 
          'descriptionTextSettings', 'cardTitleTextSettings', 'cardDescTextSettings', 
          'variantColors', 'styling'
        ];
        
        coreProperties.forEach(prop => {
          if (newState[prop] === undefined && prevLocalData[prop] !== undefined) {
            newState[prop] = prevLocalData[prop];
          }
        });

        if (!readOnly && onConfigChange) {
          const dataToSave = {
            ...newState,
            images: newState.images.map((img) => {
              if (img.file) {
                return {
                  file: img.file,
                  url: img.url,
                  name: img.name,
                  originalUrl: img.originalUrl,
                  id: img.id,
                };
              } else {
                return {
                  url: img.originalUrl || img.url,
                  name: img.name,
                  originalUrl: img.originalUrl || img.url,
                  id: img.id,
                };
              }
            }),
          };
          dataToSave.images = dataToSave.images.map((img) => {
            if (!img.file) {
              const { file, ...rest } = img;
              return rest;
            }
            return img;
          });

          onConfigChange(dataToSave);
        }
        return newState;
      });
    },
    [readOnly, onConfigChange]
  );

  const handleAddCard = useCallback(() => {
    handleLocalDataChange((prevData) => {
      const newCard = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        icon: "Star",
        iconPack: "lucide",
        title: "New Feature Card",
        desc: "Enter a concise description for this new feature.",
      };
      return { ...prevData, cards: [...(prevData.cards || []), newCard] };
    });
  }, [handleLocalDataChange]);

  const handleRemoveCard = useCallback(
    (indexToRemove) => {
      handleLocalDataChange((prevData) => {
        const updatedCards = (prevData.cards || []).filter(
          (_, i) => i !== indexToRemove
        );
        return { ...prevData, cards: updatedCards };
      });
    },
    [handleLocalDataChange]
  );

  const openIconModalForCardCallback = useCallback((cardIndex) => {
    setEditingCardIndexForIcon(cardIndex);
    setIsIconModalOpenForCards(true);
  }, []);

  const handleCardIconSelection = useCallback(
    (pack, iconName) => {
      if (editingCardIndexForIcon !== null) {
        handleLocalDataChange((prevLocalData) => {
          const updatedCards = prevLocalData.cards.map((card, idx) =>
            idx === editingCardIndexForIcon
              ? { ...card, icon: iconName, iconPack: pack }
              : card
          );
          return { ...prevLocalData, cards: updatedCards };
        });
      }
      setIsIconModalOpenForCards(false);
      setEditingCardIndexForIcon(null);
    },
    [editingCardIndexForIcon, handleLocalDataChange]
  );

  useEffect(() => {
    const imageUrlsToRevoke = (localData.images || [])
      .map((img) => img.url)
      .filter((url) => typeof url === "string" && url.startsWith("blob:"));

    return () => {
      imageUrlsToRevoke.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, [localData.images]);

  // Render different variants based on the variant prop
  const renderVariant = () => {
    // Use localData.variant if available, otherwise fall back to the variant prop
    const activeVariant = localData.variant || variant;

    switch (activeVariant) {
      case "modern":
        return (
          <ModernRichTextVariant
            richTextData={localData}
            readOnly={readOnly}
            onRichTextDataChange={handleLocalDataChange}
            openIconModalForCard={
              !readOnly ? openIconModalForCardCallback : undefined
            }
            onAddCard={!readOnly ? handleAddCard : undefined}
            onRemoveCard={!readOnly ? handleRemoveCard : undefined}
            playIntroAnimationForCards={playIntroAnimationForCards}
          />
        );
      case "classic":
      default:
        return (
          <RichTextPreview
            richTextData={localData}
            readOnly={readOnly}
            bannerColor={localData.backgroundColor}
            openIconModalForCard={
              !readOnly ? openIconModalForCardCallback : undefined
            }
            onRichTextDataChange={handleLocalDataChange}
            onAddCard={!readOnly ? handleAddCard : undefined}
            onRemoveCard={!readOnly ? handleRemoveCard : undefined}
            playIntroAnimationForCards={playIntroAnimationForCards}
          />
        );
    }
  };

  return (
    <>
      {renderVariant()}
      {!readOnly && isIconModalOpenForCards && (
        <IconSelectorModal
          isOpen={isIconModalOpenForCards}
          onClose={() => {
            setIsIconModalOpenForCards(false);
            setEditingCardIndexForIcon(null);
          }}
          onSelectIcon={handleCardIconSelection}
          currentSelection={{
            pack:
              editingCardIndexForIcon !== null &&
              localData.cards[editingCardIndexForIcon]?.iconPack,
            icon:
              editingCardIndexForIcon !== null &&
              localData.cards[editingCardIndexForIcon]?.icon,
          }}
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
  themeColors: PropTypes.object,
  variant: PropTypes.oneOf(["classic", "modern"]),
};

RichTextBlock.tabsConfig = (localData, onControlsChange, themeColors) => {
  // DEBUG: Log the data being passed to tabsConfig
  console.log(
    "[RichTextBlock.tabsConfig] DEBUG: Received localData:",
    JSON.stringify(
      {
        variant: localData.variant,
        styling: localData.styling,
        hasVariants: localData.styling?.hasVariants,
        // Log all keys to see what's available
        allKeys: Object.keys(localData),
        // Check specific properties that might be getting lost
        heroText: localData.heroText,
        bus_description: localData.bus_description,
        cards: localData.cards?.length,
        images: localData.images?.length,
        backgroundColor: localData.backgroundColor,
        variants: localData.variants ? Object.keys(localData.variants) : [],
      },
      null,
      2
    )
  );

  const tabs = {};

  // Enhanced onControlsChange wrapper to preserve data
  const enhancedOnControlsChange = (changedData) => {
    console.log("[RichTextBlock.tabsConfig] enhancedOnControlsChange called with:", changedData);
    console.log("[RichTextBlock.tabsConfig] Current localData before change:", {
      variant: localData.variant,
      styling: localData.styling,
      heroText: localData.heroText,
      bus_description: localData.bus_description,
      cards: localData.cards?.length,
      allKeys: Object.keys(localData),
    });
    
    // Call the original onControlsChange
    onControlsChange(changedData);
  };

  // Main Images Tab (using PanelImagesController for all images)
  tabs.images = (props) => {
    console.log(
      "[RichTextBlock tabsConfig] localData.images for PanelImagesController:",
      JSON.stringify(localData.images)
    ); // DEBUG LOG with stringify
    return (
      <PanelImagesController
        {...props}
        currentData={localData}
        onControlsChange={enhancedOnControlsChange}
        imageArrayFieldName="images"
        getItemName={(item, idx) => item.name || `Slideshow Image ${idx + 1}`}
      />
    );
  };

  // Colors Tab
  tabs.colors = (props) => (
    <RichTextColorControls
      {...props}
      currentData={localData}
      onControlsChange={enhancedOnControlsChange}
      themeColors={themeColors}
    />
  );

  // Fonts Tab
  tabs.fonts = (props) => (
    <RichTextFontsControls
      {...props}
      currentData={localData}
      onControlsChange={enhancedOnControlsChange}
      themeColors={themeColors}
    />
  );

  // Styling Tab - includes variant selector, height controls, and padding controls
  tabs.styling = (props) => {
    // DEBUG: Log what we're passing to PanelStylingController
    console.log(
      "[RichTextBlock.tabsConfig.styling] DEBUG: Passing to PanelStylingController:",
      {
        currentData: {
          variant: localData.variant,
          styling: localData.styling,
          allKeys: Object.keys(localData),
        },
        blockType: "RichTextBlock",
        controlType: "height",
      }
    );

    return (
      <PanelStylingController
        {...props}
        currentData={localData}
        onControlsChange={enhancedOnControlsChange}
        blockType="RichTextBlock"
        controlType="height"
      />
    );
  };

  return tabs;
};

/* ===============================================
   MODERN RICHTEXT VARIANT
   -----------------------------------------------
   Clean split-screen layout with text on one side, 
   visual content on the other
=============================================== */
const ModernRichTextVariant = memo(
  ({
    richTextData,
    readOnly,
    onRichTextDataChange,
    openIconModalForCard,
    onAddCard,
    onRemoveCard,
    playIntroAnimationForCards,
  }) => {
    const {
      heroText = "",
      bus_description = "",
      cards = [],
      images = [],
      backgroundColor = "#1e293b",
      styling = { desktopHeightVH: 45, mobileHeightVW: 75 },
      variantColors = {},
    } = richTextData || {};

    // Add slideshow state management to this variant
    const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] =
      useState(0);

    const handleFieldChange = (field, value) => {
      onRichTextDataChange({ ...richTextData, [field]: value });
    };

    const handleCardChange = (cardIndex, field, value) => {
      const updatedCards = richTextData.cards.map((card, idx) =>
        idx === cardIndex ? { ...card, [field]: value } : card
      );
      onRichTextDataChange({ ...richTextData, cards: updatedCards });
    };

    const slideshowImageSources = images
      .map((img) => {
        if (img && typeof img === "object" && img.url) {
          return img.url;
        }
        return "";
      })
      .filter((img) => img);

    const displaySlideshowImages =
      slideshowImageSources.length > 0
        ? slideshowImageSources
        : ["/assets/images/Richtext/roof_workers.jpg"];

    // Separate useEffect for slideshow
    useEffect(() => {
      let slideshowInterval;
      if (displaySlideshowImages.length > 1) {
        slideshowInterval = setInterval(() => {
          setCurrentImageSlideshowIndex(
            (prevIndex) => (prevIndex + 1) % displaySlideshowImages.length
          );
        }, 4000);
      }
      return () => {
        if (slideshowInterval) {
          clearInterval(slideshowInterval);
        }
      };
    }, [displaySlideshowImages.length]);

    // Calculate dynamic height based on styling - reduced height for modern
    const dynamicHeight =
      window.innerWidth < 768
        ? `${Math.max(50, styling.mobileHeightVW * 0.8)}vw`
        : `${Math.max(25, styling.desktopHeightVH * 0.7)}vh`;

    const ModernFeatureCard = ({
      card,
      index,
      readOnly,
      onCardFieldChange,
      onRemoveCard,
      openIconModalForCard,
      playIntroAnimation,
    }) => {
      const cardRef = useRef(null);
      const isVisible = useInView(cardRef, { once: true, amount: 0.5 });
      const [animationCompleted, setAnimationCompleted] = useState(false);
      
      // Use DynamicIconRenderer for consistent icon handling
      const IconComponent = (props) => {
        // Provide fallback values if missing
        const safeIconPack = card.iconPack || "lucide";
        const safeIconName = card.icon || "Star";
        
        // Debug logging for icon issues
        if (!card.iconPack || !card.icon) {
          console.warn(`ModernFeatureCard ${index}: Missing icon data. iconPack="${card.iconPack}", icon="${card.icon}". Using fallbacks.`);
        }
        
        return (
          <DynamicIconRenderer 
            iconPack={safeIconPack} 
            iconName={safeIconName} 
            fallback={Icons.Star}
            {...props} 
          />
        );
      };

      useEffect(() => {
        if (playIntroAnimation && isVisible && !animationCompleted) {
          gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 50 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power3.out",
              onComplete: () => {
                setAnimationCompleted(true);
              },
            }
          );
        } else if (!playIntroAnimation) {
          gsap.set(cardRef.current, { opacity: 1, y: 0 });
          setAnimationCompleted(true);
        }
      }, [isVisible, index, playIntroAnimation, animationCompleted]);

      return (
        <motion.div
          ref={cardRef}
          initial={
            playIntroAnimation ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={
            playIntroAnimation ? { delay: index * 0.1 } : { duration: 0 }
          }
          className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105 group relative"
        >
          <div className="flex items-start space-x-3">
            <div
              className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 ${
                !readOnly && openIconModalForCard
                  ? "cursor-pointer hover:scale-105"
                  : ""
              } transition-transform`}
              onClick={(e) => {
                if (!readOnly && openIconModalForCard) {
                  e.stopPropagation();
                  openIconModalForCard(index);
                }
              }}
              title={!readOnly ? "Edit Icon" : ""}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {!readOnly ? (
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) =>
                    onCardFieldChange(index, "title", e.target.value)
                  }
                  className="text-white font-semibold text-lg bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-white/50 rounded p-2 w-full outline-none"
                  placeholder="Feature Title"
                />
              ) : (
                <h3 className="text-white font-semibold text-lg">{card.title}</h3>
              )}

              {!readOnly ? (
                <textarea
                  value={card.desc}
                  onChange={(e) =>
                    onCardFieldChange(index, "desc", e.target.value)
                  }
                  className="text-white/80 text-sm mt-1 bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-white/50 rounded p-2 w-full outline-none resize-none"
                  placeholder="Feature description"
                  rows={2}
                />
              ) : (
                <p className="text-white/80 text-sm mt-1">{card.desc}</p>
              )}
            </div>

            {!readOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCard(index);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity p-1 rounded-full hover:bg-red-500/20"
                title="Remove Card"
              >
                <Icons.X size={16} />
              </button>
            )}
          </div>
        </motion.div>
      );
    };

    const ImageGallery = () => {
      if (!displaySlideshowImages || displaySlideshowImages.length === 0)
        return null;

      return (
        <div className="grid grid-cols-2 gap-4 h-full">
          {displaySlideshowImages.slice(0, 4).map((img, index) => (
            <motion.div
              key={index}
              initial={
                playIntroAnimationForCards
                  ? { opacity: 0, scale: 0.8 }
                  : { opacity: 1, scale: 1 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.7 }}
              className={`relative overflow-hidden rounded-lg ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              <img
                src={img}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </motion.div>
          ))}
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
                      className="text-3xl lg:text-4xl font-light text-white bg-transparent focus:bg-white/10 focus:ring-2 focus:ring-blue-300 rounded-lg p-3 w-full placeholder-gray-400 outline-none leading-tight resize-none text-center"
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
                  {(bus_description || !readOnly) &&
                    (!readOnly ? (
                      <div className="space-y-2">
                        <textarea
                          value={bus_description}
                          onChange={(e) =>
                            handleFieldChange(
                              "bus_description",
                              e.target.value
                            )
                          }
                          className={`${TEXT_STYLES.busDescription.editable} w-full min-h-[4rem] sm:min-h-[6rem] md:min-h-[8rem] leading-loose`}
                          style={getTextStyles(richTextData.descriptionTextSettings)}
                          placeholder="Enter your business description... (Leave empty to hide this section)"
                          rows={4}
                        />
                        {bus_description && (
                          <button
                            onClick={() =>
                              handleFieldChange("bus_description", "")
                            }
                            className="text-xs text-white/70 hover:text-white/90 underline"
                          >
                            Clear description
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full">
                        <p
                          className="text-base text-white/90 leading-relaxed"
                          style={getTextStyles(richTextData.descriptionTextSettings)}
                        >
                          {bus_description}
                        </p>
                      </div>
                    ))}
                </div>
              )}

              {/* Feature Cards */}
              {(cards.length > 0 || !readOnly) && (
                <div className="space-y-3">
                  {cards.map((card, idx) => (
                    <ModernFeatureCard
                      key={card.id || idx}
                      card={card}
                      index={idx}
                      readOnly={readOnly}
                      onCardFieldChange={handleCardChange}
                      onRemoveCard={onRemoveCard}
                      openIconModalForCard={openIconModalForCard}
                      playIntroAnimation={playIntroAnimationForCards}
                    />
                  ))}

                  {!readOnly && (
                    <button
                      onClick={onAddCard}
                      className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 border-2 border-dashed border-white/30 hover:border-white/50 rounded-xl text-white transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Icons.Plus size={18} />
                      <span>Add Feature Card</span>
                    </button>
                  )}
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
  readOnly: PropTypes.bool,
  onRichTextDataChange: PropTypes.func.isRequired,
  openIconModalForCard: PropTypes.func,
  onAddCard: PropTypes.func,
  onRemoveCard: PropTypes.func,
  playIntroAnimationForCards: PropTypes.bool,
};
