// src/components/MainPageBlocks/RichTextBlock.jsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as Icons from "lucide-react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import IconSelectorModal from '../common/IconSelectorModal';
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// =============================================
// STYLING CONSTANTS - Keep consistent between edit and read-only modes
// =============================================
const TEXT_STYLES = {
  heroText: {
    base: "text-3xl sm:text-4xl md:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left",
    editable: "text-3xl sm:text-4xl md:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none",
    readOnly: "text-3xl sm:text-4xl md:text-5xl font-bold text-white whitespace-pre-line drop-shadow-md text-left"
  },
  busDescription: {
    base: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal indent-4 text-left",
    editable: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal indent-4 text-left bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none",
    readOnly: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal indent-4 text-left"
  },
  busDescriptionSecond: {
    base: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal leading-relaxed indent-4 mt-3 text-left",
    editable: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal leading-relaxed indent-4 mt-3 text-left bg-transparent focus:bg-white/20 focus:ring-1 focus:ring-blue-500 rounded p-2 w-full resize-none",
    readOnly: "text-sm sm:text-base md:text-[2.5vh] text-white font-normal leading-relaxed indent-4 mt-3 text-left"
  },
  cardTitle: {
    base: "ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words",
    editable: "ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words bg-transparent focus:bg-white/50 focus:ring-1 focus:ring-blue-500 rounded px-1 w-full",
    readOnly: "ml-1 md:ml-0 mr-10 md:mr-12 leading-tight text-xs sm:text-sm md:text-base font-semibold text-gray-900 font-sans break-words"
  },
  cardDesc: {
    base: "ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-tight break-words",
    editable: "ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-tight break-words bg-transparent focus:bg-white/50 focus:ring-1 focus:ring-blue-500 rounded px-1 w-full h-full resize-none",
    readOnly: "ml-1 md:ml-0 text-xs sm:text-sm md:text-[0.9rem] text-gray-700 text-left font-serif leading-tight break-words"
  }
};

// Default images for RichTextBlock
const DEFAULT_IMAGES = [
  "/assets/images/Richtext/roof_workers.jpg",
  "/assets/images/Richtext/roof_workers2.jpg", 
  "/assets/images/Richtext/roof_workers3.webp"
];

// =============================================
// Helper function to derive local state from props
// =============================================
const deriveInitialLocalData = (richTextDataInput, currentBannerColor) => {
  const initial = richTextDataInput || {};
  
  // Initialize images with defaults if none provided
  let initialImages = initial.images || [];
  if (initialImages.length === 0) {
    initialImages = DEFAULT_IMAGES;
  }
  
  return {
    heroText: initial.heroText || "",
    accredited: initial.accredited || false,
    years_in_business: initial.years_in_business || "",
    bus_description: initial.bus_description || "",
    bus_description_second: initial.bus_description_second || "",
    cards: initial.cards?.map(c => ({ ...c, id: c.id || `card_${Math.random().toString(36).substr(2, 9)}`, icon: c.icon || 'Star', iconPack: c.iconPack || 'lucide', title: c.title || "Card Title", desc: c.desc || "Card description." })) || [],
    images: initialImages.map((img, index) => {
      if (typeof img === 'string') {
        return { 
          file: null, 
          url: img, 
          name: img.split('/').pop() || `Image ${index + 1}`, 
          originalUrl: img,
          id: `img_${Date.now()}_${index}`
        };
      }
      if (img && typeof img === 'object') {
        return { 
          file: img.file instanceof File ? img.file : null, 
          url: typeof img.url === 'string' ? img.url : '', 
          name: typeof img.name === 'string' ? img.name : (typeof img.url === 'string' ? img.url.split('/').pop() : `Image ${index + 1}`),
          originalUrl: typeof img.originalUrl === 'string' ? img.originalUrl : (typeof img.url === 'string' ? img.url : ''),
          id: img.id || `img_${Date.now()}_${index}`
        };
      }
      return { file: null, url: '', name: `Image ${index + 1}`, originalUrl: '', id: `img_${Date.now()}_${index}` };
    }),
    overlayImages: [...(initial.overlayImages || ["/assets/images/shake_img/1.png", "/assets/images/shake_img/2.png", "/assets/images/shake_img/3.png", "/assets/images/shake_img/4.png"])],
    steps: (initial.steps || []).map(step => ({
      ...step,
      id: step.id || `step_${Math.random().toString(36).substr(2, 9)}`,
      videoFile: step.videoFile || null, 
      videoSrc: step.videoFile ? URL.createObjectURL(step.videoFile) : (step.videoSrc || ''),
      videoFileName: step.videoFileName || (step.videoFile ? step.videoFile.name : (typeof step.videoSrc === 'string' ? step.videoSrc.split('/').pop() : '')),
      originalVideoUrl: step.originalVideoUrl || (typeof step.videoSrc === 'string' && !step.videoSrc.startsWith('blob:') ? step.videoSrc : null)
    })),
    backgroundColor: initial.backgroundColor || "#1e293b",
    styling: {
      desktopHeightVH: initial.styling?.desktopHeightVH || 45,
      mobileHeightVW: initial.styling?.mobileHeightVW || 75
    }
  };
};

/* 
=============================================
1) RICH-TEXT PREVIEW (Read-Only or Editable)
---------------------------------------------
Displays content. If not readOnly, allows inline editing of text fields and card icons/text.
=============================================
*/
function RichTextPreview({ richTextData, readOnly, bannerColor, openIconModalForCard, onRichTextDataChange, onAddCard, onRemoveCard }) {
  const [currentImageSlideshowIndex, setCurrentImageSlideshowIndex] = useState(0);
  const animationPlayedThisInstanceRef = useRef(false);
  const [playIntroAnimationForCards, setPlayIntroAnimationForCards] = useState(false);

  useEffect(() => {
    if (!animationPlayedThisInstanceRef.current) {
      setPlayIntroAnimationForCards(true); 
      animationPlayedThisInstanceRef.current = true;    
    } else {
      setPlayIntroAnimationForCards(false); 
    }
  }, []); 

  if (!richTextData) {
    return <p className="text-center py-4">No RichText data found.</p>;
  }

  const {
    heroText = "",
    bus_description = "",
    bus_description_second = "",
    cards = [],
    images = [],
    backgroundColor = "#1e293b",
    styling = { desktopHeightVH: 45, mobileHeightVW: 75 }
  } = richTextData || {};

  const handleFieldChange = (field, value) => {
    onRichTextDataChange({ ...richTextData, [field]: value });
  };

  const handleCardChange = (cardIndex, field, value) => {
    const updatedCards = richTextData.cards.map((card, idx) => 
      idx === cardIndex ? { ...card, [field]: value } : card
    );
    onRichTextDataChange({ ...richTextData, cards: updatedCards });
  };

  const slideshowImageSources = images.map(img => {
    if (img && typeof img === 'object' && img.url) {
        return img.url;
    }
    return '';
  }).filter(img => img);

  const displaySlideshowImages = slideshowImageSources.length > 0
    ? slideshowImageSources
    : ["/assets/images/Richtext/roof_workers.jpg"];

  useEffect(() => {
    if (displaySlideshowImages.length > 1) {
      const slideshowInterval = setInterval(() => {
        setCurrentImageSlideshowIndex(prevIndex => (prevIndex + 1) % displaySlideshowImages.length);
      }, 3000); 
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
    iconPack,
    icon: IconName,
    title,
    desc,
    index,
    overlayImages,
    playIntroAnimation,
    readOnlyCard,
    openIconModalForCard,
    onCardFieldChange,
    onRemoveCard
  }) {
    const IconToRender = Icons[IconName] || Icons.Star;
    
    const baseClasses =
      "relative bg-white p-2 rounded-lg shadow-lg flex flex-col items-center justify-center";
    
    const sizeClasses = 
      "w-full md:w-[24vw] " + 
      "min-h-[9vw] md:min-h-[7vw] lg:min-h-[6vw]";

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
      hidden: { opacity: 1, pointerEvents: 'auto' }, 
      visible: { 
        opacity: 0,
        pointerEvents: 'none', 
        transition: {
          duration: 0.5,
          ease: "easeOut",
          delay: (index * 0.2) + 0.8,
        },
      },
    };

    return (
      <motion.div
        className={`${baseClasses} ${sizeClasses} lg:-mx-2 group`}
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
          {IconToRender && <IconToRender className="text-white drop-shadow-lg w-6 h-6 md:w-8 md:h-8" />}
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
            {!readOnlyCard ? (
              <input
                type="text"
                value={title}
                onChange={(e) => onCardFieldChange(index, 'title', e.target.value)}
                className={TEXT_STYLES.cardTitle.editable}
              />
            ) : (
              <h3 className={TEXT_STYLES.cardTitle.readOnly}>
                {title}
              </h3>
            )}
          </div>

          <div className="relative w-full flex-grow" style={{ zIndex: 51 }}>
            {!readOnlyCard ? (
              <textarea
                value={desc}
                onChange={(e) => onCardFieldChange(index, 'desc', e.target.value)}
                className={TEXT_STYLES.cardDesc.editable}
                rows={3}
              />
            ) : (
              <p className={TEXT_STYLES.cardDesc.readOnly}>
                {desc}
              </p>
            )}
          </div>
        </div>
        {!readOnlyCard && (
            <button
                onClick={(e) => { e.stopPropagation(); onRemoveCard(index); }}
                className="absolute bottom-1 right-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 bg-white/30 hover:bg-white/50 rounded-full z-50"
                title="Remove Card"
            >
                <Icons.XCircle size={16} />
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
    overlayImages: PropTypes.array.isRequired,
    playIntroAnimation: PropTypes.bool.isRequired,
    readOnlyCard: PropTypes.bool.isRequired,
    openIconModalForCard: PropTypes.func,
    onCardFieldChange: PropTypes.func.isRequired,
    onRemoveCard: PropTypes.func,
  };

  const ImageSlideshow = () => {
    if (!displaySlideshowImages || displaySlideshowImages.length === 0) return null;
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

  const hasDescriptionContent = bus_description || bus_description_second || !readOnly;
  const hasSlideshowImages = displaySlideshowImages.length > 0;
  const hasCards = cards && cards.length > 0;

  // Calculate dynamic height based on styling
  const dynamicHeight = window.innerWidth < 768 
    ? `${styling.mobileHeightVW}vw` 
    : `${styling.desktopHeightVH}vh`;

  return (
    <div className="rich-text-preview-container mx-auto px-0 sm:px-6 flex flex-col z-40 relative ">
      {/* Section 1: Feature Cards - Placed above the image/text block */}
      {(hasCards || !readOnly) && (
        <div className="w-full px-2 sm:px-0  md:mt-2 -mb-2"> 
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[-2vh] md:gap-[-0.75rem] items-stretch">
            {cards.map((card, idx) => (
              <FeatureCard
                key={card.id || idx}
                iconPack={card.iconPack}
                icon={card.icon}
                title={card.title}
                desc={card.desc}
                index={idx}
                overlayImages={overlayImages}
                playIntroAnimation={playIntroAnimationForCards}
                readOnlyCard={readOnly}
                openIconModalForCard={openIconModalForCard}
                onCardFieldChange={handleCardChange}
                onRemoveCard={!readOnly ? onRemoveCard : undefined}
              />
            ))}
          </div>
          {!readOnly && (
            <div className="text-center mt-2 mb-1">
                <button
                    onClick={onAddCard}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-md shadow focus:outline-none focus:ring-1 focus:ring-green-400"
                >
                    <Icons.PlusCircle size={14} className="inline mr-1" /> Add Feature Card
                </button>
            </div>
          )}
        </div>
      )}

      {/* Section 2: Image Slideshow as Background with Overlaid Text */}
      {(hasSlideshowImages || heroText || hasDescriptionContent || !readOnly) && (
        <div 
          className="relative w-full group px-[10vw]"
          style={{ height: dynamicHeight }}
        >
          
          {hasSlideshowImages && <ImageSlideshow />}
          
          <div className="absolute inset-0 flex flex-col items-center text-center p-2 md:p-6 lg:p-8 bg-black/40 group-hover:bg-black/50 transition-colors duration-300">
            
            {(heroText || !readOnly) && (
              <div className="mb-2 md:mb-6 w-full">
                {!readOnly ? (
                  <textarea
                    value={heroText}
                    onChange={(e) => handleFieldChange('heroText', e.target.value)}
                    className={TEXT_STYLES.heroText.editable}
                    placeholder="Enter Hero Text..."
                    rows={2}
                  />
                ) : (
                  <h2 className={TEXT_STYLES.heroText.readOnly}>{heroText}</h2>
                )}
              </div>
            )}

            {hasDescriptionContent && (
              <div 
                className="flex-1 flex flex-col justify-center p-2 md:p-6 lg:p-8 rounded-lg shadow-xl w-full backdrop-blur-sm"
                style={{ backgroundColor: backgroundColor + 'BF' }} // Adding 75% opacity
              >
                <>
                  {(bus_description || !readOnly) && (
                    !readOnly ? (
                      <textarea
                        value={bus_description}
                        onChange={(e) => handleFieldChange('bus_description', e.target.value)}
                        className={TEXT_STYLES.busDescription.editable}
                        placeholder="Enter first business description..."
                        rows={3}
                      />
                    ) : (
                      <p className={TEXT_STYLES.busDescription.readOnly}>
                        {bus_description}
                      </p>
                    )
                  )}
                  {(bus_description_second || !readOnly) && (
                    !readOnly ? (
                      <textarea
                        value={bus_description_second}
                        onChange={(e) => handleFieldChange('bus_description_second', e.target.value)}
                        className={TEXT_STYLES.busDescriptionSecond.editable}
                        placeholder="Enter second business description..."
                        rows={3}
                      />
                    ) : (
                      <p className={TEXT_STYLES.busDescriptionSecond.readOnly}>
                        {bus_description_second}
                      </p>
                    )
                  )}
                </>
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
        iconPack: PropTypes.string,
    })),
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
};

// =============================================
// Control Components for Tabs (Simplified)
// =============================================

const RichTextColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorUpdate = (fieldName, colorValue) => {
    onControlsChange({ ...currentData, [fieldName]: colorValue });
  };

  return (
    <div className="p-3">
      <ThemeColorPicker
        label="Background Color (for text overlay box)"
        currentColorValue={currentData.backgroundColor || "#1e293b"}
        themeColors={themeColors}
        onColorChange={(fieldName, value) => handleColorUpdate('backgroundColor', value)}
        fieldName="backgroundColor"
      />
      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <h4 className="text-sm font-medium text-gray-600 mb-1">Note:</h4>
          <p className="text-xs text-gray-500">
              This color is used as the background for the text overlay box containing the business descriptions.
              The color will be applied with 75% opacity and backdrop blur for better text readability.
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

/* 
=============================================
3) MAIN EXPORT: RichTextBlock
---------------------------------------------
- Manages localData derived from richTextData prop.
- Calls onConfigChange when localData is modified.
- Renders RichTextPreview for display and inline editing.
- Exposes tabsConfig for TopStickyEditPanel.
=============================================
*/
export default function RichTextBlock({ 
  readOnly = false, 
  richTextData, 
  onConfigChange, 
  bannerColor,
  themeColors
}) {
  const [localData, setLocalData] = useState(() => deriveInitialLocalData(richTextData, bannerColor || richTextData?.backgroundColor));
  const prevReadOnlyRef = useRef(readOnly);

  const [isIconModalOpenForCards, setIsIconModalOpenForCards] = useState(false);
  const [editingCardIndexForIcon, setEditingCardIndexForIcon] = useState(null);

  useEffect(() => {
    const effectiveBackgroundColor = richTextData?.backgroundColor || bannerColor;
    setLocalData(deriveInitialLocalData(richTextData, effectiveBackgroundColor));
  }, [richTextData, bannerColor]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localData,
          images: localData.images.map(img => {
            if (img.file) { 
              return { 
                file: img.file,
                url: img.url,
                name: img.name,
                originalUrl: img.originalUrl,
                id: img.id
              }; 
            } else { 
              return { 
                url: img.originalUrl || img.url, 
                name: img.name,
                originalUrl: img.originalUrl || img.url,
                id: img.id
              }; 
            }
          })
        };
        dataToSave.images = dataToSave.images.map(img => {
            if (!img.file) {
                const { file, ...rest } = img;
                return rest;
            }
            return img;
        });

        console.log("[RichTextBlock onConfigChange Effect] dataToSave:", JSON.parse(JSON.stringify(dataToSave, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size, lastModified: v.lastModified}) : v)));
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = useCallback((updatedFieldsOrFunction) => {
    setLocalData(prevLocalData => {
      const newState = typeof updatedFieldsOrFunction === 'function' 
        ? updatedFieldsOrFunction(prevLocalData) 
        : { ...prevLocalData, ...updatedFieldsOrFunction };
      
      if (!readOnly && onConfigChange) {
        const liveDataToPropagate = {
          ...newState,
          images: newState.images.map(img => ({ 
            file: img.file,
            url: img.url, 
            name: img.name, 
            originalUrl: img.originalUrl,
            id: img.id
          }))
        };
        onConfigChange(liveDataToPropagate);
      }
      return newState;
    });
  }, [readOnly, onConfigChange]);
  
  const handleAddCard = useCallback(() => {
    handleLocalDataChange(prevData => {
      const newCard = {
        id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        icon: 'Star',
        iconPack: 'lucide',
        title: 'New Feature Card',
        desc: 'Enter a concise description for this new feature.',
      };
      return { ...prevData, cards: [...(prevData.cards || []), newCard] };
    });
  }, [handleLocalDataChange]);

  const handleRemoveCard = useCallback((indexToRemove) => {
    handleLocalDataChange(prevData => {
      const updatedCards = (prevData.cards || []).filter((_, i) => i !== indexToRemove);
      return { ...prevData, cards: updatedCards };
    });
  }, [handleLocalDataChange]);

  const openIconModalForCardCallback = useCallback((cardIndex) => {
    setEditingCardIndexForIcon(cardIndex);
    setIsIconModalOpenForCards(true);
  }, []);

  const handleCardIconSelection = useCallback((pack, iconName) => {
    if (editingCardIndexForIcon !== null) {
      handleLocalDataChange(prevLocalData => {
        const updatedCards = prevLocalData.cards.map((card, idx) =>
          idx === editingCardIndexForIcon ? { ...card, icon: iconName, iconPack: pack } : card
        );
        return { ...prevLocalData, cards: updatedCards };
      });
    }
    setIsIconModalOpenForCards(false);
    setEditingCardIndexForIcon(null);
  }, [editingCardIndexForIcon, handleLocalDataChange]);

  useEffect(() => {
    const imageUrlsToRevoke = (localData.images || [])
      .map(img => img.url)
      .filter(url => typeof url === 'string' && url.startsWith('blob:'));

    return () => {
      imageUrlsToRevoke.forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [localData.images]);

  return (
    <>
      <RichTextPreview 
        richTextData={localData} 
        readOnly={readOnly}
        bannerColor={localData.backgroundColor}
        openIconModalForCard={!readOnly ? openIconModalForCardCallback : undefined}
        onRichTextDataChange={handleLocalDataChange}
        onAddCard={!readOnly ? handleAddCard : undefined}
        onRemoveCard={!readOnly ? handleRemoveCard : undefined}
      />
      {!readOnly && isIconModalOpenForCards && (
        <IconSelectorModal
          isOpen={isIconModalOpenForCards}
          onClose={() => {
            setIsIconModalOpenForCards(false);
            setEditingCardIndexForIcon(null);
          }}
          onSelectIcon={handleCardIconSelection}
          currentSelection={{
            pack: editingCardIndexForIcon !== null && localData.cards[editingCardIndexForIcon]?.iconPack,
            icon: editingCardIndexForIcon !== null && localData.cards[editingCardIndexForIcon]?.icon
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
};

RichTextBlock.tabsConfig = (localData, onControlsChange, themeColors) => {
  const tabs = {};

  // Images Tab (using PanelImagesController)
  tabs.images = (props) => {
    console.log("[RichTextBlock tabsConfig] localData.images for PanelImagesController:", JSON.stringify(localData.images)); // DEBUG LOG with stringify
    return (
      <PanelImagesController 
        {...props} 
        currentData={localData} 
        onControlsChange={onControlsChange} 
        imageArrayFieldName="images" 
        getItemName={(item, idx) => item.name || `Slideshow Image ${idx + 1}`}
      />
    );
  }

  // Colors Tab
  tabs.colors = (props) => <RichTextColorControls 
                            {...props} 
                            currentData={localData} 
                            onControlsChange={onControlsChange} 
                            themeColors={themeColors} 
                         />;

  // Styling Tab
  tabs.styling = (props) => <PanelStylingController 
                            {...props} 
                            currentData={localData} 
                            onControlsChange={onControlsChange} 
                          />;

  return tabs;
};
