// BeforeAfterBlock.jsx
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const { sectionTitle = "BEFORE & AFTER", items = [] } = beforeAfterData || {};
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
    if (!items.length) return;

    console.log(`[BeforeAfterPreview GSAP Effect] Running. showNailAnimation: ${showNailAnimation}, items count: ${items.length}`);

    const nailElement = nailRef.current;
    const textElement = textRef.current;
    const headerElement = headerRef.current; // Added for clarity in cleanup

    // Kill any existing ScrollTriggers associated with these elements
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === headerElement && (st.animation?.targets?.includes(nailElement) || st.animation?.targets?.includes(textElement))) {
        st.kill();
      }
    });
    // Kill any active tweens on these elements
    gsap.killTweensOf([nailElement, textElement]);

    // Initial states reset before applying new logic
    gsap.set(nailElement, { x: "120vw", opacity: 1 });
    gsap.set(textElement, { opacity: 0, x: "100%" });

    if (showNailAnimation) {
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: headerElement, // Use headerElement
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

    // Box animations
    const boxEls = boxesRef.current.filter((box) => box !== null);

    // Decide how many columns you want - now always 3
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

    // Cleanup on unmount or when showNailAnimation changes
    return () => {
      console.log(`[BeforeAfterPreview GSAP Effect] Cleanup. showNailAnimation was: ${showNailAnimation}`);
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === headerElement && (st.animation?.targets?.includes(nailElement) || st.animation?.targets?.includes(textElement))) {
          st.kill();
        }
      });
      gsap.killTweensOf([nailElement, textElement]);
      //Potentially kill box animations too if they get re-triggered undesirably
      //ScrollTrigger.getAll().forEach(st => { if(boxEls.includes(st.trigger)) st.kill(); });
      //gsap.killTweensOf(boxEls.map(b => b.querySelector(".overlay-text")));
      //gsap.killTweensOf(boxEls);
    };
  }, [items, showNailAnimation]); // Added showNailAnimation dependency

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
      <section className="relative w-full overflow-hidden ">
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
                transform: "scale(3) scaleX(-1)",
                transformOrigin: "left center",
              }}
            />
          </div>
          <div
            ref={textRef}
            className="absolute left-1/2 z-10 flex flex-row items-center"
          >
            {readOnly ? (
              <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-rye items-center py-3 z-30 text-center">
                {sectionTitle}
              </h2>
            ) : (
              <input
                type="text"
                value={sectionTitle}
                onChange={(e) => onSectionTitleChange && onSectionTitleChange(e.target.value)}
                className="text-[6vw] md:text-[4vh] text-black font-normal font-condensed font-rye items-center py-3 z-30 text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-2 min-w-[300px] md:min-w-[400px]"
                placeholder="Section Title"
              />
            )}
          </div>
        </div>

        {/* Gallery Grid - Now always 3 columns */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-3 gap-8 md:space-x-14 px-2 md:px-5 md:pb-5">
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
                    className="card w-[25vw] aspect-[4/3]"
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
                    className="absolute top-2 right-2 z-10 px-2 py-1 bg-banner text-white rounded-md text-xs md:text-sm transition-all transform hover:scale-105 hover:shadow-lg hover:bg-white hover:text-black"
                  >
                    {viewStates[index] === "before"
                      ? "After"
                      : "Before"}
                  </button>
                  {/* Move info to the top left of image with padding */}
                  <div className="overlay-text absolute top-0 left-0 pt-1 pl-2 md:pt-2 md:pl-3 w-full pr-12">
                    <div className="flex flex-col items-start text-white text-left leading-tight">
                      {readOnly ? (
                        <>
                          <span className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] mb-0">
                            {item.shingle}
                          </span>
                          <span className="font-semibold text-[2.5vw] md:text-lg text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                            {item.sqft}
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={item.shingle || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "shingle", e.target.value)}
                            className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 mb-0 w-full text-white placeholder-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                            placeholder="Shingle Type"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            type="text"
                            value={item.sqft || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "sqft", e.target.value)}
                            className="font-semibold text-[2.5vw] md:text-lg bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 w-full text-white placeholder-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
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
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg p-4 md:p-6 flex flex-col overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none z-10"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row justify-between items-stretch flex-grow gap-3 md:gap-4 overflow-hidden">
              <div className="relative w-full md:w-1/2 flex flex-col h-1/2 md:h-full">
                <h4 className="text-lg font-semibold mb-1 md:mb-2 text-center">
                  Before
                </h4>
                <div className="relative flex-grow">
                  <img
                    src={selectedImages.before}
                    alt="Before"
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>
              <div className="relative w-full md:w-1/2 flex flex-col h-1/2 md:h-full">
                <h4 className="text-lg font-semibold mb-1 md:mb-2 text-center">
                  After
                </h4>
                <div className="relative flex-grow">
                  <img
                    src={selectedImages.after}
                    alt="After"
                    className="absolute top-0 left-0 w-full h-full object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 md:mt-4 text-center">
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
   2) BEFORE-AFTER EDITOR PANEL (Editing Mode)
   ----------------------------------------------
   This panel now uses file inputs for the before and after images.
=============================================== */
function BeforeAfterEditorPanel({ localData, onPanelChange }) {
  const { items = [] } = localData;

  const handleAddItem = () => {
    const newItem = {
      id: `new_item_${Date.now()}`,
      before: initializeImageState(null, "/assets/images/beforeafter/default_before.jpg"),
      after: initializeImageState(null, "/assets/images/beforeafter/default_after.jpg"),
      shingle: "New Shingle Type",
      sqft: "0000 sqft",
    };
    onPanelChange((prev) => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleRemoveItem = (index) => {
    const itemToRemove = items[index];
    if (itemToRemove?.before?.url?.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.before.url);
    if (itemToRemove?.after?.url?.startsWith('blob:')) URL.revokeObjectURL(itemToRemove.after.url);
    onPanelChange((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleItemImageChange = (index, field, file) => {
    if (!file) return;
    const currentItem = items[index];
    const currentImageFieldState = currentItem?.[field];

    if (currentImageFieldState?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageFieldState.url);
    }
    const fileURL = URL.createObjectURL(file);
    const updatedImageState = {
        file: file, 
        url: fileURL, 
        name: file.name, 
        originalUrl: currentImageFieldState?.originalUrl // Preserve originalUrl
    };
    
    onPanelChange(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: updatedImageState };
      return { ...prev, items: updatedItems };
    });
  };
  
  const handleItemImageUrlChange = (index, field, urlValue) => {
    const currentItem = items[index];
    const currentImageFieldState = currentItem?.[field];

    if (currentImageFieldState?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentImageFieldState.url);
    }
    // When pasting a URL, this becomes the new originalUrl as well, and file is null
    const updatedImageState = { 
        file: null, 
        url: urlValue, 
        name: urlValue.split('/').pop(),
        originalUrl: urlValue // New URL is the new original reference
    };
    onPanelChange(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: updatedImageState };
      return { ...prev, items: updatedItems };
    });
  };

  const handleToggleNailAnimation = () => {
    const currentShowState = localData.showNailAnimation !== undefined ? localData.showNailAnimation : true;
    const newShowState = !currentShowState;
    console.log(`[BeforeAfterEditorPanel] handleToggleNailAnimation: Current: ${currentShowState}, New: ${newShowState}`);
    onPanelChange({ showNailAnimation: newShowState });
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Manage Gallery Items</h2>
      </div>

      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
        {items.map((item, index) => (
          <div key={item.id || index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
            <button onClick={() => handleRemoveItem(index)} className="bg-red-500 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-600 z-10">Remove</button>
            <p className="text-sm text-gray-600 mb-2">Item: {item.shingle || `Item ${index+1}`} ({item.sqft || 'N/A'})</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs mb-1 text-gray-700">Before Image:</label>
                    <input type="file" accept="image/*" className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer" onChange={(e) => handleItemImageChange(index, "before", e.target.files?.[0])} />
                    <input type="text" className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500" placeholder="Or paste direct image URL" value={getDisplayUrl(item.before, '')} onChange={(e) => handleItemImageUrlChange(index, 'before', e.target.value)} />
                    {getDisplayUrl(item.before) && <img src={getDisplayUrl(item.before)} alt="Before Preview" className="mt-2 h-20 w-20 object-cover rounded shadow bg-gray-200 p-1"/>}
                </div>
                <div>
                    <label className="block text-xs mb-1 text-gray-700">After Image:</label>
                    <input type="file" accept="image/*" className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer" onChange={(e) => handleItemImageChange(index, "after", e.target.files?.[0])} />
                    <input type="text" className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500" placeholder="Or paste direct image URL" value={getDisplayUrl(item.after, '')} onChange={(e) => handleItemImageUrlChange(index, 'after', e.target.value)} />
                    {getDisplayUrl(item.after) && <img src={getDisplayUrl(item.after)} alt="After Preview" className="mt-2 h-20 w-20 object-cover rounded shadow bg-gray-200 p-1"/>}
                </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full mt-3 text-sm font-medium">+ Add Gallery Item</button>
      <div className="mt-4 pt-3 border-t">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.showNailAnimation !== undefined ? localData.showNailAnimation : true}
            onChange={handleToggleNailAnimation}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Show Nail Animation</span>
        </label>
      </div>
    </div>
  );
}

/* ==============================================
   3) MAIN EXPORT: BEFORE-AFTER BLOCK
   ----------------------------------------------
   Toggles between preview (read-only) and editor panel.
=============================================== */
// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath.split('/').pop();
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (imageConfig && typeof imageConfig === 'object') {
    // If imageConfig is an object, it might be from a previous state or a new upload
    urlToDisplay = imageConfig.url || defaultPath;
    nameToStore = imageConfig.name || urlToDisplay.split('/').pop();
    fileObject = imageConfig.file || null; // Preserve file object if it exists
    // Crucially, preserve originalUrl if it already exists in imageConfig, otherwise use the determined urlToDisplay or defaultPath
    originalUrlToStore = imageConfig.originalUrl || (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:') ? imageConfig.url : defaultPath) ;
  } else if (typeof imageConfig === 'string') {
    // If imageConfig is a string, it's an initial path
    urlToDisplay = imageConfig;
    nameToStore = imageConfig.split('/').pop();
    originalUrlToStore = imageConfig; // This path is the original
  }
  
  return { 
    file: fileObject, 
    url: urlToDisplay, // This could be a path or a blob URL for preview
    name: nameToStore,
    originalUrl: originalUrlToStore // The persistent original path
  }; 
};

export default function BeforeAfterBlock({
  readOnly = false,
  beforeAfterData,
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = beforeAfterData || {};
    const initialShowNailAnimation = initialConfig.showNailAnimation !== undefined ? initialConfig.showNailAnimation : true;
    console.log(`[BeforeAfterBlock useState init] initialConfig.showNailAnimation: ${initialConfig.showNailAnimation}, Resolved to: ${initialShowNailAnimation}`);
    return {
      sectionTitle: initialConfig.sectionTitle || "GALLERY",
      showNailAnimation: initialShowNailAnimation, // Initialize here
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

        const newItems = (beforeAfterData.items || []).map((newItemFromProp, index) => {
          const oldItemFromLocal = prevLocalData.items?.find(pi => pi.id === newItemFromProp.id) || 
                                   prevLocalData.items?.[index] || 
                                   { shingle: "", sqft: "", before: initializeImageState(null), after: initializeImageState(null), id: `item_fallback_${index}_${Date.now()}` };

          const newBeforeImg = initializeImageState(newItemFromProp.before, oldItemFromLocal.before?.originalUrl || oldItemFromLocal.before?.url);
          const newAfterImg = initializeImageState(newItemFromProp.after, oldItemFromLocal.after?.originalUrl || oldItemFromLocal.after?.url);

          if (oldItemFromLocal.before?.file && oldItemFromLocal.before.url?.startsWith('blob:') && 
              (oldItemFromLocal.before.url !== newBeforeImg.url || (newBeforeImg.url && !newBeforeImg.url.startsWith('blob:')))) {
            URL.revokeObjectURL(oldItemFromLocal.before.url);
          }
          if (oldItemFromLocal.after?.file && oldItemFromLocal.after.url?.startsWith('blob:') && 
              (oldItemFromLocal.after.url !== newAfterImg.url || (newAfterImg.url && !newAfterImg.url.startsWith('blob:')))) {
            URL.revokeObjectURL(oldItemFromLocal.after.url);
          }
          
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
        
        const resolvedShowNailAnimation = beforeAfterData.showNailAnimation !== undefined
                                     ? beforeAfterData.showNailAnimation
                                     : (prevLocalData.showNailAnimation !== undefined
                                          ? prevLocalData.showNailAnimation
                                          : true);
        return {
          sectionTitle: resolvedSectionTitle,
          items: newItems,
          showNailAnimation: resolvedShowNailAnimation,
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
      return newState;
    });
  };

  if (readOnly) {
    return <BeforeAfterPreview beforeAfterData={localData} readOnly={true} />;
  }
  
  return (
    <>
      <BeforeAfterPreview 
        beforeAfterData={localData} 
        readOnly={false}
        onSectionTitleChange={(newTitle) => {
          handleLocalDataChange(prev => ({ ...prev, sectionTitle: newTitle }));
        }}
        onItemTextChange={(index, field, value) => {
          handleLocalDataChange(prev => {
            const updatedItems = [...prev.items];
            if (updatedItems[index]) {
              updatedItems[index] = { ...updatedItems[index], [field]: value };
            }
            return { ...prev, items: updatedItems };
          });
        }}
      />
      <BeforeAfterEditorPanel
        localData={localData}
        onPanelChange={handleLocalDataChange} 
      />
    </>
  );
}
