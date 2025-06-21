// BeforeAfterBlock.jsx
import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelImageSectionController from "../common/PanelImageSectionController";
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { GripVertical } from 'lucide-react';
import { initializeImageState } from '../../utils/imageUtils';
import { useConfig } from "../../context/ConfigContext";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
    if (imageValue && typeof imageValue === 'object' && imageValue.url) {
        return imageValue.url;
    }
    if (typeof imageValue === 'string') {
        if (imageValue.startsWith('/') || imageValue.startsWith('blob:') || imageValue.startsWith('data:')) {
            return imageValue;
        }
        // Ensure it doesn't add a double slash if the path is like 'assets/...'
        const path = imageValue.replace(/^\//, '');
        return `/${path.replace(/^\.\//, "")}`;
    }
    return defaultPath;
};

/* ==============================================
   1) BEFORE-AFTER PREVIEW (Read-Only)
   ----------------------------------------------
   Displays the gallery with GSAP animations.
   Expects props.beforeAfterData = {
     sectionTitle: string,
     items: [
       { id, before, after, shingle, sqft }, ...
     ]
   }
=============================================== */
function BeforeAfterPreview({ beforeAfterData, readOnly = true, onSectionTitleChange, onItemTextChange }) {
  const { virtualFS } = useConfig() || {};
  const boxesRef = useRef([]);
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Local states for modal and card flipping
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Initialize viewStates as an object to hold state for each card
  const [viewStates, setViewStates] = useState({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Safely destructure data and ensure paths are properly formatted
  const { 
    sectionTitle = "BEFORE & AFTER", 
    items = [],
    overlayTextColor = "#FFFFFF",
    toggleButtonBgColor = "#1e293b",
    toggleButtonTextColor = "#FFFFFF",
    toggleButtonHoverBgColor = "#FFFFFF",
    toggleButtonHoverTextColor = "#000000",
    sectionTitleTextSettings,
    overlayShingleTextSettings,
    overlaySqftTextSettings,
    styling = {},
  } = beforeAfterData || {};
  const showNailAnimation = beforeAfterData?.showNailAnimation !== undefined ? beforeAfterData.showNailAnimation : true; // Default to true

  // Memoize formatted items to prevent unnecessary recalculations
  const formattedItems = useMemo(() => {
    return items.map((item, index) => ({
      ...item,
      id: item.id || `item-preview-${index}`,
      beforeDisplayUrl: getDisplayUrl(item.before, "/assets/images/beforeafter/default_before.jpg"),
      afterDisplayUrl: getDisplayUrl(item.after, "/assets/images/beforeafter/default_after.jpg"),
    }));
  }, [items]);

  // Initialize viewStates when items change
  useEffect(() => {
    const initialViewStates = {};
    items.forEach((_, index) => {
      initialViewStates[index] = "before"; // Default to 'before'
    });
    setViewStates(initialViewStates);
  }, [items.length]); // Only depend on items count

  // Memoize handlers to prevent unnecessary re-renders
  const handleBoxClick = useCallback((item) => {
    if (readOnly) {
        setSelectedImages({
            before: item.beforeDisplayUrl,
            after: item.afterDisplayUrl,
            shingle: item.shingle,
            sqft: item.sqft
        });
        setShowModal(true);
    }
  }, [readOnly]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedImages(null);
  }, []);

  const toggleCardViewState = useCallback((index) => {
    setViewStates((prevStates) => ({
      ...prevStates,
      [index]: prevStates[index] === "before" ? "after" : "before",
    }));
  }, []);

  // GSAP animations - memoized to prevent recreation
  useEffect(() => {
    const nailElement = nailRef.current;
    const textElement = textRef.current;
    const headerElement = headerRef.current;

    if (!nailElement || !textElement || !headerElement) return;

    // Kill any existing ScrollTriggers associated with these elements
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === headerElement && (st.animation?.targets?.includes(nailElement) || st.animation?.targets?.includes(textElement))) {
        st.kill();
      }
    });
    // Kill any active tweens on these elements
    gsap.killTweensOf([nailElement, textElement]);

    if (showNailAnimation) {
      // Initial states for animation
      gsap.set(nailElement, { x: "120vw", opacity: 1 });
      gsap.set(textElement, { opacity: 0, x: "100%" });

      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: headerElement,
          start: "top 50%",
          end: "top 50%", 
          toggleActions: "play none none none",
          markers: false,
          once: true, 
        },
      });

      masterTimeline
        .to(nailElement, { x: 0, duration: 1, ease: "power2.out" })
        .to(textElement, { opacity: 1, duration: 0.5 }, "+=0.2")
        .to([nailElement, textElement], { x: (index) => (index === 0 ? "-10vw" : "-50%"), duration: 0.8, ease: "power2.inOut" }, "+=0.3");
    } else {
      gsap.set(nailElement, { opacity: 0 });
      gsap.set(textElement, { x: "-50%", opacity: 1 });
    }

    // Cleanup on unmount or when showNailAnimation changes
    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === headerElement && (st.animation?.targets?.includes(nailElement) || st.animation?.targets?.includes(textElement))) {
          st.kill();
        }
      });
      gsap.killTweensOf([nailElement, textElement]);
    };
  }, [showNailAnimation]); // Only depend on showNailAnimation

  // Box animations - separate effect with proper cleanup
  useEffect(() => {
    if (!formattedItems.length) return;

    const boxEls = boxesRef.current.filter((box) => box !== null);
    if (!boxEls.length) return;

    // Kill any existing scroll triggers and tweens on these boxes before creating new ones
    ScrollTrigger.getAll().forEach(st => { 
        if(boxEls.includes(st.trigger)) st.kill(); 
    });
    gsap.killTweensOf(boxEls);
    gsap.killTweensOf(boxEls.map(b => b?.querySelector?.(".overlay-text")).filter(Boolean));

    if (readOnly) {
      // Box animations for live site
      const numCols = 3; // Decide how many columns you want

      const calculateOrder = (index, cols) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return cols - col + row;
      };

      const sortedBoxes = boxEls
        .map((box, index) => ({ element: box, order: calculateOrder(index, numCols), index }))
        .sort((a, b) => b.order - a.order);

      // Initialize box states for animation
      sortedBoxes.forEach(({ element }) => {
        gsap.set(element, { x: window.innerWidth, opacity: 0 });
        gsap.set(element.querySelector(".overlay-text"), { opacity: 0 });
      });

      const boxesTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: boxEls[0],
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      sortedBoxes.forEach(({ element }) => {
        const overlayText = element.querySelector(".overlay-text");
        boxesTimeline
          .to(element, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, ">-0.5")
          .to(overlayText, { opacity: 1, duration: 0.2, ease: "power2.out" }, "<+=0.3");
      });
    } else {
      // In editor mode (not readOnly), just make the boxes visible without animation
      boxEls.forEach(box => {
          gsap.set(box, { x: 0, opacity: 1 });
          gsap.set(box.querySelector(".overlay-text"), { opacity: 1 });
      });
    }

    // Initial setup for cards (applies to both modes)
    boxEls.forEach((box) => {
      if (!box) return;
      const cardElement = box.querySelector(".card");
      if (!cardElement) return;

      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");
      if (!beforeImage || !afterImage) return;

      // Set initial states with proper 3D transforms
      gsap.set(cardElement, {
        perspective: 1000,
        transformStyle: "preserve-3d",
      });
      gsap.set([beforeImage, afterImage], {
        backfaceVisibility: "hidden",
        position: "absolute",
        width: "100%",
        height: "100%",
      });
      gsap.set(beforeImage, { rotationY: 0, zIndex: 2 });
      gsap.set(afterImage, { rotationY: 180, zIndex: 1 });
    });

    // Cleanup logic is handled by killing tweens/triggers at the start of the effect
    return () => {
      ScrollTrigger.getAll().forEach(st => { 
        if(boxEls.includes(st.trigger)) st.kill(); 
      });
      gsap.killTweensOf(boxEls);
      gsap.killTweensOf(boxEls.map(b => b?.querySelector?.(".overlay-text")).filter(Boolean));
    };
  }, [formattedItems, readOnly]); // Rerun if items change or readOnly state changes

  // Handle view state changes for card flipping - memoized
  useEffect(() => {
    const boxEls = boxesRef.current.filter((box) => box !== null);

    boxEls.forEach((box, index) => {
      if (!box) return;
      const cardElement = box.querySelector(".card");
      if (!cardElement) return;

      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");
      if (!beforeImage || !afterImage) return;

      // Create flip animation based on the individual card's state
      if (viewStates[index] === "after") {
        gsap.to(beforeImage, {
          rotationY: -180,
          duration: 0.4,
          ease: "power2.inOut",
        });
        gsap.to(afterImage, {
          rotationY: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else {
        gsap.to(beforeImage, {
          rotationY: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
        gsap.to(afterImage, {
          rotationY: 180,
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    });
  }, [viewStates]); // Only depend on viewStates

  return (
    <>
      <section className="relative w-full overflow-hidden h-full"
      style={{
          minHeight: isMobile
            ? `${styling.mobileHeightVW || 150}vw`
            : `${styling.desktopHeightVH || 100}vh`,
        }}> 
        {/* Header / Title */}
        <div
          ref={headerRef}
          className="relative flex items-center py-6 md:py-10 md:pb-10 w-full "
        >
          <div
            ref={nailRef}
            className="absolute left-[25%] md:left-[17%] w-[30%] h-[5vh] flex items-center z-50"
          >
            <div
              className="w-full h-full dynamic-shadow"
              style={{
                backgroundImage: "url('/assets/images/nail.png')",
                backgroundPosition: "left center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                transform: "scale(3.6) scaleX(-1)",
                transformOrigin: "left center",
                filter: "drop-shadow(5px 5px 5px rgba(0,0,0,0.7))"
              }}
            />
          </div>
          <div
            ref={textRef}
            className="absolute left-1/2 z-10 flex flex-row items-center"
          >
            {readOnly ? (
              <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-serif items-center py-3 z-30 text-center" style={getTextStyles(sectionTitleTextSettings)}>
                {sectionTitle}
              </h2>
            ) : (
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => onSectionTitleChange && onSectionTitleChange(e.target.value)}
                className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-serif items-center py-3 z-30 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 min-w-[300px] md:min-w-[400px]"
                placeholder="Section Title"
                style={getTextStyles(sectionTitleTextSettings)}
              />
            )}
          </div>
        </div>

        {/* Gallery Grid - Now always 3 columns */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 md:pb-10">
            {formattedItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => (boxesRef.current[index] = el)}
                className="relative flex flex-col md:flex-row items-center"
              >
                <div className="relative cursor-pointer">
                  <div
                    className="card w-[25vw] aspect-[4/3]"
                    onClick={() => handleBoxClick(item)}
                  >
                    <img
                      src={item.beforeDisplayUrl}
                      alt={`Before ${index + 1}`}
                      className="before absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                    <img
                      src={item.afterDisplayUrl}
                      alt={`After ${index + 1}`}
                      className="after absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  {/* Individual Toggle Button for each card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardViewState(index);
                    }}
                    className="absolute top-2 right-2 z-10 px-2 py-1 bg-blue-500 text-white rounded-md text-xs md:text-sm transition-all transform hover:scale-105 hover:shadow-lg border border-white"
                  >
                    {viewStates[index] === "before"
                      ? "Before"
                      : "After"}
                  </button>
                  {/* Move info to the right of image with padding */}
                  <div className="overlay-text absolute bottom-0 right-0 pl-3 px-3 py-1 md:px-4 md:py-2">
                    <div className="flex flex-col items-start text-white text-left leading-tight">
                      {readOnly ? (
                        <>
                          <span className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                            {item.shingle}
                          </span>
                          <span className="font-semibold text-[2.5vw] md:text-lg text-gray-200 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                            {item.sqft}
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={item.shingle || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "shingle", e.target.value)}
                            className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 mb-0 w-full placeholder-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                            placeholder="Shingle Type"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            type="text"
                            value={item.sqft || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "sqft", e.target.value)}
                            className="font-semibold text-[2.5vw] md:text-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 w-full placeholder-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                            placeholder="Sqft"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedImages && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000] p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-lg p-4 md:p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none z-10"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row justify-between items-center flex-grow gap-4 md:gap-6 min-h-0">
              <div className="w-full md:w-1/2 flex flex-col min-h-0">
                <h4 className="text-lg font-semibold mb-2 text-center">
                  Before
                </h4>
                <div className="flex-grow flex items-center justify-center min-h-0">
                  <img
                    src={selectedImages.before}
                    alt="Before"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              </div>
              <div className="w-full md:w-1/2 flex flex-col min-h-0">
                <h4 className="text-lg font-semibold mb-2 text-center">
                  After
                </h4>
                <div className="flex-grow flex items-center justify-center min-h-0">
                  <img
                    src={selectedImages.after}
                    alt="After"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center flex-shrink-0">
              <p className="font-bold text-lg md:text-xl">
                {selectedImages.shingle}
              </p>
              <p className="text-gray-700 text-base md:text-lg">
                {selectedImages.sqft}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ==============================================
   MAIN EXPORT: BEFORE-AFTER BLOCK
   ----------------------------------------------
   Toggles between preview (read-only) and editor panel.
=============================================== */
export default function BeforeAfterBlock({
  readOnly = false,
  beforeAfterData,
  onConfigChange,
  themeColors,
}) {
  const [localData, setLocalData] = useState({
    sectionTitle: "",
    items: [],
    showNailAnimation: true,
    styling: {},
  });

  const prevBeforeAfterDataRef = useRef();

  // Effect to sync localData with prop changes, crucial for editor updates
  useEffect(() => {
    const newConfigString = JSON.stringify(beforeAfterData);
    const oldConfigString = JSON.stringify(prevBeforeAfterDataRef.current);

    if (newConfigString !== oldConfigString) {
      prevBeforeAfterDataRef.current = beforeAfterData; // Update ref

      const initialShowNail = beforeAfterData?.showNailAnimation !== undefined
        ? beforeAfterData.showNailAnimation
        : true;

      setLocalData({
        ...beforeAfterData,
        showNailAnimation: initialShowNail,
        items: (beforeAfterData.items || []).map((item, index) => ({
          ...item,
          id: item.id || `item-local-${index}`,
          before: initializeImageState(item.before),
          after: initializeImageState(item.after),
        })),
      });
    }
  }, [beforeAfterData]);

  // Handler to update local state and propagate changes up
  const handleLocalDataChange = useCallback(
    (updater) => {
      setLocalData(prevState => {
        const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
        console.log('[BeforeAfterBlock handleLocalDataChange] prevState.showNailAnimation:', prevState.showNailAnimation, 'newState.showNailAnimation:', newState.showNailAnimation);
        
        // Live update for non-readOnly mode
        if (!readOnly && typeof onConfigChange === 'function') {
          const dataToSave = {
            ...newState,
            items: newState.items.map(item => {
              const beforeImageState = item.before?.file 
                ? { ...item.before }
                : { url: item.before?.originalUrl || item.before?.url };
              
              const afterImageState = item.after?.file
                ? { ...item.after }
                : { url: item.after?.originalUrl || item.after?.url };

              return {
                ...item,
                before: beforeImageState,
                after: afterImageState,
              };
            }),
          };
          onConfigChange(dataToSave);
        }
        
        return newState;
      });
    },
    [readOnly, onConfigChange]
  );

  const handleSectionTitleChange = useCallback(
    (e) => {
      handleLocalDataChange({ sectionTitle: e.target.value });
    },
    [handleLocalDataChange]
  );

  const handleItemTextChange = useCallback(
    (index, field, value) => {
      const updatedItems = [...localData.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      handleLocalDataChange({ items: updatedItems });
    },
    [localData.items, handleLocalDataChange]
  );
  
  const handleImagesChange = useCallback((newItems) => {
    handleLocalDataChange({ items: newItems });
  }, [handleLocalDataChange]);

  // Memoize controls to prevent re-renders unless necessary
  // This hook must always be called, regardless of readOnly state
  const MemoizedControls = useMemo(
    () => {
      return {
        images: (props) => (
          <BeforeAfterImagesControls 
            {...props} 
            currentData={localData}
            onControlsChange={handleImagesChange}
            themeColors={themeColors}
          />
        ),
        gallery: (props) => (
          <PanelImageSectionController
            {...props}
            currentData={localData}
            onControlsChange={handleImagesChange}
            controlType="gallery"
            blockType="BeforeAfterBlock"
            imageConfig={{
              label: 'Before/After Gallery',
              itemLabel: 'Pair',
              arrayFieldName: 'items',
              generateName: (index, blockType) => `beforeafter_pair_${index + 1}`,
              acceptedTypes: 'image/*',
              maxFileSize: 8 * 1024 * 1024, // 8MB
              defaultPath: '/assets/images/beforeafter/'
            }}
          />
        ),
        colors: (props) => (
          <BeforeAfterColorControls 
            {...props} 
            currentData={localData}
            onControlsChange={handleLocalDataChange}
            themeColors={themeColors} 
          />
        ),
        styling: (props) => (
          <BeforeAfterStylingControls
            {...props}
            currentData={localData}
            onControlsChange={handleLocalDataChange}
          />
        ),
        fonts: (props) => (
          <BeforeAfterFontsControls
            {...props}
            currentData={localData}
            onControlsChange={handleLocalDataChange}
            themeColors={themeColors}
          />
        ),
      };
    },
    [localData, handleImagesChange, handleLocalDataChange, themeColors]
  );

  if (readOnly) {
    return (
      <BeforeAfterPreview
        beforeAfterData={beforeAfterData}
        readOnly={true}
      />
    );
  }

  return (
    <BeforeAfterPreview 
      beforeAfterData={localData} 
      readOnly={readOnly}
      onSectionTitleChange={handleSectionTitleChange}
      onItemTextChange={handleItemTextChange}
    />
  );
}

/* ==============================================
   BEFORE-AFTER IMAGES CONTROLS
   ----------------------------------------------
   Handles image uploads for before/after gallery
=============================================== */
const BeforeAfterImagesControls = ({ currentData, onControlsChange, themeColors }) => {
  const { items = [] } = currentData;

  // Convert items to images array format for PanelImagesController
  const imagesArray = items.flatMap((item, itemIndex) => [
    {
      id: `before_${item.id || itemIndex}`,
      url: getDisplayUrl(item.before, "/assets/images/beforeafter/default_before.jpg"),
      file: item.before?.file || null,
      name: `Before ${itemIndex + 1}`,
      originalUrl: item.before?.originalUrl || "/assets/images/beforeafter/default_before.jpg",
      itemIndex,
      type: 'before'
    },
    {
      id: `after_${item.id || itemIndex}`,
      url: getDisplayUrl(item.after, "/assets/images/beforeafter/default_after.jpg"),
      file: item.after?.file || null,
      name: `After ${itemIndex + 1}`,
      originalUrl: item.after?.originalUrl || "/assets/images/beforeafter/default_after.jpg",
      itemIndex,
      type: 'after'
    }
  ]);

  const handleImagesChange = (newImagesArray) => {
    // Group images by itemIndex
    const imagesByItem = {};
    newImagesArray.forEach(img => {
      const index = img.itemIndex || 0;
      if (!imagesByItem[index]) {
        imagesByItem[index] = {};
      }
      imagesByItem[index][img.type] = img;
    });

    // Create new items array
    const newItems = [];
    const maxIndex = Math.max(...Object.keys(imagesByItem).map(Number), items.length - 1);
    
    for (let i = 0; i <= maxIndex; i++) {
      const existingItem = items[i] || {};
      const beforeImg = imagesByItem[i]?.before;
      const afterImg = imagesByItem[i]?.after;
      
      // Only create item if we have at least one image or if it already exists
      if (beforeImg || afterImg || existingItem.id) {
        newItems.push({
          id: existingItem.id || `item_${i}_${Date.now()}`,
          before: beforeImg ? {
            file: beforeImg.file,
            url: beforeImg.url,
            name: beforeImg.name,
            originalUrl: beforeImg.originalUrl
          } : (existingItem.before || initializeImageState(null, "/assets/images/beforeafter/default_before.jpg")),
          after: afterImg ? {
            file: afterImg.file,
            url: afterImg.url,
            name: afterImg.name,
            originalUrl: afterImg.originalUrl
          } : (existingItem.after || initializeImageState(null, "/assets/images/beforeafter/default_after.jpg")),
          shingle: existingItem.shingle || "",
          sqft: existingItem.sqft || ""
        });
      }
    }

    onControlsChange({ items: newItems });
  };

  const handleAddPair = () => {
    const newItem = {
      id: `new_item_${Date.now()}`,
      before: initializeImageState(null, "/assets/images/beforeafter/default_before.jpg"),
      after: initializeImageState(null, "/assets/images/beforeafter/default_after.jpg"),
      shingle: "New Shingle",
      sqft: "0 sqft",
    };
    onControlsChange({ items: [...items, newItem] });
  };

  const handleRemovePair = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove?.before?.url?.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.before.url);
    if (itemToRemove?.after?.url?.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.after.url);
    onControlsChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Gallery Images</h3>
        <PanelImagesController
          currentData={{ images: imagesArray }}
          onControlsChange={(data) => handleImagesChange(data.images || [])}
          imageArrayFieldName="images"
          maxImages={20}
          allowMultiple={true}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-medium text-gray-700">Gallery Items ({items.length})</h4>
          <button
            onClick={handleAddPair}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            + Add Pair
          </button>
        </div>
        
        {items.map((item, index) => (
          <div key={item.id || index} className="bg-gray-100 p-2 rounded border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-gray-600">Item {index + 1}</span>
              <button
                onClick={() => handleRemovePair(index)}
                className="bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No gallery items yet. Add a before/after pair to get started.
          </div>
        )}
      </div>
    </div>
  );
};

/* ==============================================
   BEFORE-AFTER COLOR CONTROLS
   ----------------------------------------------
   Handles color customization for text and buttons
=============================================== */
const BeforeAfterColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Color Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Overlay Text Color:"
          currentColorValue={currentData.overlayTextColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="overlayTextColor"
        />
        <ThemeColorPicker
          label="Toggle Button Background:"
          currentColorValue={currentData.toggleButtonBgColor || '#1e293b'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="toggleButtonBgColor"
        />
        <ThemeColorPicker
          label="Toggle Button Text Color:"
          currentColorValue={currentData.toggleButtonTextColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="toggleButtonTextColor"
        />
        <ThemeColorPicker
          label="Toggle Hover Background:"
          currentColorValue={currentData.toggleButtonHoverBgColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="toggleButtonHoverBgColor"
        />
        <ThemeColorPicker
          label="Toggle Hover Text:"
          currentColorValue={currentData.toggleButtonHoverTextColor || '#000000'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="toggleButtonHoverTextColor"
        />
      </div>
    </div>
  );
};

/* ==============================================
   BEFORE-AFTER STYLING CONTROLS
   ----------------------------------------------
   Handles styling options like nail animation
=============================================== */
const BeforeAfterStylingControls = ({ currentData, onControlsChange }) => {
  return (
    <div className="space-y-6 p-4">
      <PanelStylingController
        currentData={currentData}
        onControlsChange={onControlsChange}
        blockType="BeforeAfterBlock"
        controlType="animations"
      />
      <PanelStylingController
        currentData={currentData}
        onControlsChange={onControlsChange}
        blockType="BeforeAfterBlock"
        controlType="sizing"
      />
    </div>
  );
};

/* ==============================================
   BEFORE-AFTER FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Before/After text elements
=============================================== */
const BeforeAfterFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Font Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Section Title Font
          </h4>
          <PanelFontController
            label="Title Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="sectionTitleTextSettings"
            themeColors={themeColors}
          />
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Overlay Shingle Text Font
          </h4>
          <PanelFontController
            label="Shingle Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="overlayShingleTextSettings"
            themeColors={themeColors}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Overlay Sqft Text Font
          </h4>
          <PanelFontController
            label="Sqft Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="overlaySqftTextSettings"
            themeColors={themeColors}
          />
        </div>
      </div>
    </div>
  );
};

// Tab configuration for BottomStickyEditPanel
BeforeAfterBlock.tabsConfig = (blockData, onUpdate, themeColors) => ({
  images: (props) => (
    <BeforeAfterImagesControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  gallery: (props) => (
    <PanelImageSectionController
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      controlType="gallery"
      blockType="BeforeAfterBlock"
      imageConfig={{
        label: 'Before/After Gallery',
        itemLabel: 'Pair',
        arrayFieldName: 'items',
        generateName: (index, blockType) => `beforeafter_pair_${index + 1}`,
        acceptedTypes: 'image/*',
        maxFileSize: 8 * 1024 * 1024, // 8MB
        defaultPath: '/assets/images/beforeafter/'
      }}
    />
  ),
  colors: (props) => (
    <BeforeAfterColorControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors} 
    />
  ),
  styling: (props) => (
    <BeforeAfterStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
    />
  ),
  fonts: (props) => (
    <BeforeAfterFontsControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
});

// Export the control components for use in MainPageForm.jsx
export {
  BeforeAfterImagesControls,
  BeforeAfterColorControls,
  BeforeAfterStylingControls,
  BeforeAfterFontsControls
};
