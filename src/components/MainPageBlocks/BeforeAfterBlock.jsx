// BeforeAfterBlock.jsx
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return imageValue.url;
  }
  if (typeof imageValue === 'string') {
    if (imageValue.startsWith('/') || imageValue.startsWith('blob:') || imageValue.startsWith('data:')) {
      return imageValue;
    }
    return `/${imageValue.replace(/^\.\//, "")}`;
  }
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
  console.log("[initializeImageState] Called with:", 
    {
      imageConfig: typeof imageConfig === 'object' && imageConfig?.file instanceof File ? { ...imageConfig, file: '[File Object]' } : imageConfig,
      defaultPath
    }
  );

  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath?.split('/').pop() || 'default.jpg';
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (imageConfig && typeof imageConfig === 'object') {
    // If imageConfig is an object, it might be from a previous state or a new upload
    urlToDisplay = imageConfig.url || defaultPath;
    nameToStore = imageConfig.name || urlToDisplay?.split('/').pop() || 'default.jpg';
    fileObject = imageConfig.file || null; // Preserve file object if it exists
    // Crucially, preserve originalUrl if it already exists in imageConfig, otherwise use the determined urlToDisplay or defaultPath
    originalUrlToStore = imageConfig.originalUrl || (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:') ? imageConfig.url : defaultPath) ;
  } else if (typeof imageConfig === 'string') {
    // If imageConfig is a string, it's an initial path
    urlToDisplay = imageConfig;
    nameToStore = imageConfig.split('/').pop() || 'default.jpg';
    originalUrlToStore = imageConfig; // This path is the original
  }
  
  return { 
    file: fileObject, 
    url: urlToDisplay, // This could be a path or a blob URL for preview
    name: nameToStore,
    originalUrl: originalUrlToStore // The persistent original path
  }; 
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
  const boxesRef = useRef([]);
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Local states for modal and card flipping
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // Initialize viewStates as an object to hold state for each card
  const [viewStates, setViewStates] = useState({});

  // Safely destructure data and ensure paths are properly formatted
  const { 
    sectionTitle = "BEFORE & AFTER", 
    items = [],
    overlayTextColor = "#FFFFFF",
    toggleButtonBgColor = "#1e293b",
    toggleButtonTextColor = "#FFFFFF",
    toggleButtonHoverBgColor = "#FFFFFF",
    toggleButtonHoverTextColor = "#000000"
  } = beforeAfterData || {};
  const showNailAnimation = beforeAfterData?.showNailAnimation !== undefined ? beforeAfterData.showNailAnimation : true; // Default to true
  console.log(`[BeforeAfterPreview] Instance created/re-rendered. Initial showNailAnimation prop from beforeAfterData: ${showNailAnimation}`);

  // Initialize viewStates when items change
  useEffect(() => {
    const initialViewStates = {};
    items.forEach((_, index) => {
      initialViewStates[index] = "before"; // Default to 'before'
    });
    setViewStates(initialViewStates);
  }, [items]);

  // Use getDisplayUrl for formattedItems
  // Ensure default paths are robust
  const formattedItems = items.map((item, index) => ({
    ...item,
    id: item.id || `item-preview-${index}`,
    beforeDisplayUrl: getDisplayUrl(item.before, "/assets/images/beforeafter/default_before.jpg"),
    afterDisplayUrl: getDisplayUrl(item.after, "/assets/images/beforeafter/default_after.jpg"),
  }));

  const handleBoxClick = (item) => {
    // In edit mode, clicking the card might be for editing, not opening modal
    // Or, keep modal functionality but ensure it doesn't interfere with text editing clicks.
    // For now, modal is primary for read-only, can be re-evaluated.
    if (readOnly) {
        setSelectedImages({
            before: item.beforeDisplayUrl,
            after: item.afterDisplayUrl,
            shingle: item.shingle,
            sqft: item.sqft
        });
        setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  const toggleCardViewState = (index) => {
    // Allow toggling view even in edit mode for the preview.
    setViewStates((prevStates) => ({
      ...prevStates,
      [index]: prevStates[index] === "before" ? "after" : "before",
    }));
  };

  // GSAP animations
  useEffect(() => {
    const nailElement = nailRef.current;
    const textElement = textRef.current;
    const headerElement = headerRef.current;

    console.log(`[BeforeAfterPreview GSAP Effect] Running. showNailAnimation: ${showNailAnimation}`);

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
      console.log("[BeforeAfterPreview GSAP Effect] Applied nail animation timeline.");
    } else {
      gsap.set(nailElement, { opacity: 0 });
      gsap.set(textElement, { x: "-50%", opacity: 1 });
      console.log("[BeforeAfterPreview GSAP Effect] Set nail opacity to 0 and text position because showNailAnimation is false.");
    }

    // Cleanup on unmount or when showNailAnimation changes
    return () => {
      console.log(`[BeforeAfterPreview GSAP Effect] Cleanup. showNailAnimation was: ${showNailAnimation}`);
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === headerElement && (st.animation?.targets?.includes(nailElement) || st.animation?.targets?.includes(textElement))) {
          st.kill();
        }
      });
      gsap.killTweensOf([nailElement, textElement]);
    };
  }, [showNailAnimation]); // Only depend on showNailAnimation

  // Box animations - separate effect
  useEffect(() => {
    if (!items.length) return;

    console.log(`[BeforeAfterPreview Box Animations Effect] Running. items count: ${items.length}`);

    // Box animations
    const boxEls = boxesRef.current.filter((box) => box !== null);

    // Decide how many columns you want - now 3 for md+
    const numCols = 3;

    const calculateOrder = (index, cols) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      // Example approach to create a "reverse" wave for the box animations
      return cols - col + row;
    };

    const sortedBoxes = boxEls
      .map((box, index) => ({
        element: box,
        order: calculateOrder(index, numCols),
        index,
      }))
      .sort((a, b) => b.order - a.order);

    // Initialize box states
    sortedBoxes.forEach(({ element }) => {
      gsap.set(element, {
        x: window.innerWidth,
        opacity: 0,
      });
      gsap.set(element.querySelector(".overlay-text"), {
        opacity: 0,
      });
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
        .to(
          element,
          {
            x: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          },
          `>-0.5`
        )
        .to(
          overlayText,
          {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out",
          },
          "<+=0.3"
        );
    });

    // Initial setup for cards (without scroll trigger)
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

      // Initial positions
      gsap.set(beforeImage, {
        rotationY: 0,
        zIndex: 2,
      });
      gsap.set(afterImage, {
        rotationY: 180,
        zIndex: 1,
      });
    });

    // Cleanup for box animations
    return () => {
      console.log(`[BeforeAfterPreview Box Animations Effect] Cleanup.`);
      // Kill box-related scroll triggers
      ScrollTrigger.getAll().forEach(st => { 
        if(boxEls.includes(st.trigger)) st.kill(); 
      });
      gsap.killTweensOf(boxEls.map(b => b?.querySelector?.(".overlay-text")).filter(Boolean));
      gsap.killTweensOf(boxEls);
    };
  }, [items]); // Only depend on items

  // Handle view state changes for card flipping
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
  }, [viewStates, items]); // items dependency added for safety if card count changes

  return (
    <>
      <section className="relative w-full overflow-hidden h-full">
        {/* Header / Title */}
        <div
          ref={headerRef}
          className="relative flex items-center py-6 md:py-10 md:pb-10 w-full "
        >
          <div
            ref={nailRef}
            className="absolute left-[25%] md:left-[17%] w-[30%] h-[15vh] md:h-[5vh] flex items-center z-50"
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
              <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-serif items-center py-3 z-30 text-center">
                {sectionTitle}
              </h2>
            ) : (
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => onSectionTitleChange && onSectionTitleChange(e.target.value)}
                className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-serif items-center py-3 z-30 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 min-w-[300px] md:min-w-[400px]"
                placeholder="Section Title"
              />
            )}
          </div>
        </div>

        {/* Gallery Grid - Now 3 columns on md+ */}
        <div className="w-full flex items-center justify-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:space-x-4 px-2 md:px-5 md:pb-5">
            {formattedItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => (boxesRef.current[index] = el)}
                className="relative flex flex-col md:flex-row items-center justify-between w-full"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => handleBoxClick(item)}
                >
                  <div
                    className="card w-[80vw] h-[50vw] md:w-[27vw] md:h-[15vw]"
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
                  {/* Individual Toggle Button for each card - Blue, larger, and positioned to spill over */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardViewState(index);
                    }}
                    className="absolute -top-1 -right-1 z-10 px-3 py-2 rounded-md text-sm md:text-xl font-semibold transition-all transform hover:scale-105 focus:outline-none shadow-lg bg-blue-500 text-white hover:bg-blue-600"
                    style={{
                      boxShadow: "3px 3px 8px rgba(0,0,0,0.6)"
                    }}
                  >
                    {viewStates[index] === "before"
                      ? "Before"
                      : "After"}
                  </button>
                  {/* Move info to the bottom left of image with padding */}
                  <div className="overlay-text absolute bottom-0 left-0 pt-1 pl-2 md:pt-2 md:pl-3  ">
                    <div className="flex flex-col bg-black bg-opacity-50 rounded -space-y-1 items-start text-white text-left leading-tight">
                      {readOnly ? (
                        <>
                          <span 
                            className="font-bold text-[5vw] md:text-xl whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] mb-0"
                            style={{ color: overlayTextColor }}
                          >
                            {item.shingle}
                          </span>
                          <span 
                            className="font-semibold text-[5vw] md:text-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                            style={{ color: overlayTextColor }}
                          >
                            {item.sqft}
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={item.shingle || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "shingle", e.target.value)}
                            className="font-bold text-[5vw] md:text-xl whitespace-nowrap bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 mb-0 w-full placeholder-gray-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                            placeholder="Shingle Type"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: overlayTextColor }}
                          />
                          <input
                            type="text"
                            value={item.sqft || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "sqft", e.target.value)}
                            className="font-semibold text-[5vw] md:text-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 w-full placeholder-gray-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)]"
                            placeholder="Sqft"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: overlayTextColor }}
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
                    style={{ maxHeight: '60vh' }}
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
                    style={{ maxHeight: '60vh' }}
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
  // Log the received beforeAfterData prop
  console.log("[BeforeAfterBlock Render/Prop Receive] beforeAfterData prop:", 
    JSON.parse(JSON.stringify(beforeAfterData, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size, inProp: true}) : v))
  );

  const [localData, setLocalData] = useState(() => {
    const initialConfig = beforeAfterData || {};
    const initialShowNailAnimation = initialConfig.showNailAnimation !== undefined ? initialConfig.showNailAnimation : true;
    console.log(`[BeforeAfterBlock useState init] initialConfig.showNailAnimation: ${initialConfig.showNailAnimation}, Resolved to: ${initialShowNailAnimation}`);
    return {
      sectionTitle: initialConfig.sectionTitle || "GALLERY",
      showNailAnimation: initialShowNailAnimation,
      overlayTextColor: initialConfig.overlayTextColor || "#FFFFFF",
      toggleButtonBgColor: initialConfig.toggleButtonBgColor || "#1e293b",
      toggleButtonTextColor: initialConfig.toggleButtonTextColor || "#FFFFFF",
      toggleButtonHoverBgColor: initialConfig.toggleButtonHoverBgColor || "#FFFFFF",
      toggleButtonHoverTextColor: initialConfig.toggleButtonHoverTextColor || "#000000",
      items: (initialConfig.items || []).map((item, index) => ({
        ...item,
        id: item.id || `item_init_${index}_${Date.now()}`,
        before: initializeImageState(item.before, "/assets/images/beforeafter/default_before.jpg"),
        after: initializeImageState(item.after, "/assets/images/beforeafter/default_after.jpg"),
      })),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (beforeAfterData) {
      setLocalData(prevLocalData => {
        const defaultTitle = "GALLERY";
        const defaultShingle = "";
        const defaultSqft = "";

        const resolvedSectionTitle =
          (prevLocalData.sectionTitle !== undefined && prevLocalData.sectionTitle !== (beforeAfterData.sectionTitle || defaultTitle) && prevLocalData.sectionTitle !== defaultTitle)
          ? prevLocalData.sectionTitle
          : (beforeAfterData.sectionTitle || defaultTitle);
        
        const resolvedOverlayTextColor = beforeAfterData.overlayTextColor || prevLocalData.overlayTextColor || "#FFFFFF";
        const resolvedToggleButtonBgColor = beforeAfterData.toggleButtonBgColor || prevLocalData.toggleButtonBgColor || "#1e293b";
        const resolvedToggleButtonTextColor = beforeAfterData.toggleButtonTextColor || prevLocalData.toggleButtonTextColor || "#FFFFFF";
        const resolvedToggleButtonHoverBgColor = beforeAfterData.toggleButtonHoverBgColor || prevLocalData.toggleButtonHoverBgColor || "#FFFFFF";
        const resolvedToggleButtonHoverTextColor = beforeAfterData.toggleButtonHoverTextColor || prevLocalData.toggleButtonHoverTextColor || "#000000";

        const newItems = (beforeAfterData.items || []).map((newItemFromProp, index) => {
          const oldItemFromLocal = prevLocalData.items?.find(pi => pi.id === newItemFromProp.id) || 
                                   prevLocalData.items?.[index] || 
                                   { shingle: "", sqft: "", before: initializeImageState(null), after: initializeImageState(null), id: `item_fallback_${index}_${Date.now()}` };

          // --- Refined image state merging ---
          let newBeforeImg;
          if (oldItemFromLocal.before?.file && oldItemFromLocal.before.url?.startsWith('blob:')) {
            // If local state has a File/blob, and prop doesn't specify a *different* file or a non-blob URL, keep local.
            if (newItemFromProp.before?.file || (typeof newItemFromProp.before?.url === 'string' && !newItemFromProp.before.url.startsWith('blob:'))) {
              // Prop has a new file or a persistent URL, so use that. Revoke old local blob if different.
              if (oldItemFromLocal.before.url !== newItemFromProp.before.url) {
                 URL.revokeObjectURL(oldItemFromLocal.before.url);
              }
              newBeforeImg = initializeImageState(newItemFromProp.before, oldItemFromLocal.before?.originalUrl || oldItemFromLocal.before?.url);
            } else {
              newBeforeImg = oldItemFromLocal.before; // Keep existing local File/blob
            }
          } else {
            // Local state is not a File/blob, or no local state, so initialize from prop.
             if (oldItemFromLocal.before?.url?.startsWith('blob:')) { // Ensure any previous blob is cleaned if prop overrides
                URL.revokeObjectURL(oldItemFromLocal.before.url);
            }
            newBeforeImg = initializeImageState(newItemFromProp.before, oldItemFromLocal.before?.originalUrl || oldItemFromLocal.before?.url);
          }

          let newAfterImg;
          if (oldItemFromLocal.after?.file && oldItemFromLocal.after.url?.startsWith('blob:')) {
            if (newItemFromProp.after?.file || (typeof newItemFromProp.after?.url === 'string' && !newItemFromProp.after.url.startsWith('blob:'))) {
              if (oldItemFromLocal.after.url !== newItemFromProp.after.url) {
                URL.revokeObjectURL(oldItemFromLocal.after.url);
              }
              newAfterImg = initializeImageState(newItemFromProp.after, oldItemFromLocal.after?.originalUrl || oldItemFromLocal.after?.url);
            } else {
              newAfterImg = oldItemFromLocal.after; // Keep existing local File/blob
            }
          } else {
            if (oldItemFromLocal.after?.url?.startsWith('blob:')) { // Ensure any previous blob is cleaned if prop overrides
                URL.revokeObjectURL(oldItemFromLocal.after.url);
            }
            newAfterImg = initializeImageState(newItemFromProp.after, oldItemFromLocal.after?.originalUrl || oldItemFromLocal.after?.url);
          }
          // --- End refined image state merging ---
          
          const resolvedShingle = 
            (oldItemFromLocal.shingle !== undefined && oldItemFromLocal.shingle !== (newItemFromProp.shingle || defaultShingle) && oldItemFromLocal.shingle !== defaultShingle)
            ? oldItemFromLocal.shingle
            : (newItemFromProp.shingle || defaultShingle);

          const resolvedSqft =
            (oldItemFromLocal.sqft !== undefined && oldItemFromLocal.sqft !== (newItemFromProp.sqft || defaultSqft) && oldItemFromLocal.sqft !== defaultSqft)
            ? oldItemFromLocal.sqft
            : (newItemFromProp.sqft || defaultSqft);

          return {
            ...newItemFromProp,
            id: newItemFromProp.id || oldItemFromLocal.id,
            before: newBeforeImg,
            after: newAfterImg,
            shingle: resolvedShingle,
            sqft: resolvedSqft,
          };
        });
        
        // Log newItems before setting localData
        console.log("[BeforeAfterBlock useEffect beforeAfterData] Computed newItems before setLocalData:", 
          JSON.parse(JSON.stringify(newItems, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size, inNewItems: true}) : v))
        );

        const resolvedShowNailAnimation = beforeAfterData.showNailAnimation !== undefined
                                     ? beforeAfterData.showNailAnimation
                                     : (prevLocalData.showNailAnimation !== undefined
                                          ? prevLocalData.showNailAnimation
                                          : true);
        return {
          sectionTitle: resolvedSectionTitle,
          items: newItems,
          showNailAnimation: resolvedShowNailAnimation,
          overlayTextColor: resolvedOverlayTextColor,
          toggleButtonBgColor: resolvedToggleButtonBgColor,
          toggleButtonTextColor: resolvedToggleButtonTextColor,
          toggleButtonHoverBgColor: resolvedToggleButtonHoverBgColor,
          toggleButtonHoverTextColor: resolvedToggleButtonHoverTextColor,
        };
      });
    }
  }, [beforeAfterData]); // MODIFIED: Only depends on beforeAfterData prop

  useEffect(() => {
    return () => {
      localData.items.forEach(item => {
        if (item.before?.file && item.before.url?.startsWith('blob:')) URL.revokeObjectURL(item.before.url);
        if (item.after?.file && item.after.url?.startsWith('blob:')) URL.revokeObjectURL(item.after.url);
      });
    };
  }, [localData.items]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("[BeforeAfterBlock onConfigChange Effect] Editing finished. Calling onConfigChange.");
        const dataToSave = {
            ...localData,
            items: localData.items.map(item => {
                // For each image (before, after), pass the full state if a file exists (includes File & originalUrl)
                // Otherwise, pass an object with just the url (which should be the originalUrl or a pasted one)
                const beforeImageState = item.before?.file 
                    ? { ...item.before } // Pass the whole object {file, name, url (blob), originalUrl}
                    : { url: item.before?.originalUrl || item.before?.url }; // Fallback to url if originalUrl somehow missing
                
                const afterImageState = item.after?.file
                    ? { ...item.after } // Pass the whole object {file, name, url (blob), originalUrl}
                    : { url: item.after?.originalUrl || item.after?.url };

                return {
                    ...item,
                    before: beforeImageState,
                    after: afterImageState,
                };
            }),
            showNailAnimation: localData.showNailAnimation,
            overlayTextColor: localData.overlayTextColor,
            toggleButtonBgColor: localData.toggleButtonBgColor,
            toggleButtonTextColor: localData.toggleButtonTextColor,
            toggleButtonHoverBgColor: localData.toggleButtonHoverBgColor,
            toggleButtonHoverTextColor: localData.toggleButtonHoverTextColor,
        };
        console.log("[BeforeAfterBlock onConfigChange Effect] dataToSave:", JSON.parse(JSON.stringify(dataToSave, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size}) : v)));
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
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
  };

  return (
    <BeforeAfterPreview 
      beforeAfterData={localData} 
      readOnly={readOnly}
      onSectionTitleChange={!readOnly ? (newTitle) => {
        handleLocalDataChange(prev => ({ ...prev, sectionTitle: newTitle }));
      } : undefined}
      onItemTextChange={!readOnly ? (index, field, value) => {
        handleLocalDataChange(prev => {
          const updatedItems = [...prev.items];
          if (updatedItems[index]) {
            updatedItems[index] = { ...updatedItems[index], [field]: value };
          }
          return { ...prev, items: updatedItems };
        });
      } : undefined}
    />
  );
}

// Expose tabsConfig for TopStickyEditPanel
BeforeAfterBlock.tabsConfig = (blockCurrentData, onControlsChange, themeColors) => {
  return {
    images: (props) => (
      <BeforeAfterImagesControls 
        {...props} 
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
        themeColors={themeColors}
      />
    ),
    colors: (props) => (
      <BeforeAfterColorControls 
        {...props} 
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
        themeColors={themeColors} 
      />
    ),
    styling: (props) => (
      <BeforeAfterStylingControls
        {...props}
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
      />
    ),
  };
};

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
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-center">
                <span className="text-xs text-gray-500">Before</span>
                {getDisplayUrl(item.before) && (
                  <img 
                    src={getDisplayUrl(item.before)} 
                    alt="Before" 
                    className="w-full h-16 object-cover rounded border mt-1"
                  />
                )}
              </div>
              <div className="text-center">
                <span className="text-xs text-gray-500">After</span>
                {getDisplayUrl(item.after) && (
                  <img 
                    src={getDisplayUrl(item.after)} 
                    alt="After" 
                    className="w-full h-16 object-cover rounded border mt-1"
                  />
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1">Shingle Type:</label>
                <input
                  type="text"
                  value={item.shingle || ""}
                  onChange={(e) => {
                    const updatedItems = [...items];
                    updatedItems[index] = { ...updatedItems[index], shingle: e.target.value };
                    onControlsChange({ items: updatedItems });
                  }}
                  className="w-full bg-white border border-gray-300 px-2 py-1 rounded text-xs"
                  placeholder="Enter shingle type"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Square Feet:</label>
                <input
                  type="text"
                  value={item.sqft || ""}
                  onChange={(e) => {
                    const updatedItems = [...items];
                    updatedItems[index] = { ...updatedItems[index], sqft: e.target.value };
                    onControlsChange({ items: updatedItems });
                  }}
                  className="w-full bg-white border border-gray-300 px-2 py-1 rounded text-xs"
                  placeholder="Enter square feet"
                />
              </div>
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
    <PanelStylingController
      currentData={currentData}
      onControlsChange={onControlsChange}
      blockType="BeforeAfterBlock"
      controlType="animations"
    />
  );
};
