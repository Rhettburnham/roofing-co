// BeforeAfterBlock.jsx
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Helper to get display URL from string path or {url, file} object
// This helper is now defined at the top level of the file
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return imageValue.url;
  }
  // If it's a string, ensure it starts with a slash or is a blob/data URL
  if (typeof imageValue === 'string') {
    if (imageValue.startsWith('/') || imageValue.startsWith('blob:') || imageValue.startsWith('data:')) {
      return imageValue;
    }
    // Attempt to normalize relative paths, assuming they are from assets root if not starting with ./
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
  const formattedItems = items.map(item => ({
    ...item,
    id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
    before: getDisplayUrl(item.before, "/assets/images/beforeafter/default_before.jpg"),
    after: getDisplayUrl(item.after, "/assets/images/beforeafter/default_after.jpg"),
  }));

  const handleBoxClick = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  const toggleCardViewState = (index) => {
    setViewStates((prevStates) => ({
      ...prevStates,
      [index]: prevStates[index] === "before" ? "after" : "before",
    }));
  };

  // GSAP animations
  useEffect(() => {
    if (!items.length) return;

    const nailElement = nailRef.current;
    const textElement = textRef.current;

    // Initial states
    gsap.set(nailElement, {
      x: "120vw",
      opacity: 1,
    });
    gsap.set(textElement, {
      opacity: 0,
      x: "100%",
    });

    // HeaderRef timeline - trigger when header is at 20% of viewport
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 50%", // Changed from 80% to 20% to trigger when div appears at 20% of viewport
        end: "top 50%", // Adjusted to match new trigger approach
        toggleActions: "play none none none", // Play once when entering trigger area
        markers: false,
        once: true, // Added to ensure it only plays once
      },
    });

    masterTimeline
      .to(nailElement, {
        x: 0,
        duration: 1,
        ease: "power2.out",
      })
      .to(
        textElement,
        {
          opacity: 1,
          duration: 0.5,
        },
        "+=0.2"
      )
      .to(
        [nailElement, textElement],
        {
          x: (index) => (index === 0 ? "-10vw" : "-50%"),
          duration: 0.8,
          ease: "power2.inOut",
        },
        "+=0.3"
      );
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

    // Cleanup on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [items]);

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
            {formattedItems.map((img, index) => (
              <div
                key={img.id}
                ref={(el) => (boxesRef.current[index] = el)}
                className="relative flex flex-col md:flex-row items-center justify-between w-full"
              >
                <div
                  className="relative cursor-pointer"
                  // onClick={() => handleBoxClick(img)} // Keep or remove based on desired modal behavior
                >
                  <div
                    className="card w-[25vw] aspect-[4/3]"
                    onClick={() => handleBoxClick(img)}
                  >
                    <img
                      src={img.before}
                      alt={`Before ${index + 1}`}
                      className="before absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                    <img
                      src={img.after}
                      alt={`After ${index + 1}`}
                      className="after absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  {/* Individual Toggle Button for each card */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal from opening when clicking the button
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
                            {img.shingle}
                          </span>
                          <span className="font-semibold text-[2.5vw] md:text-lg text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                            {img.sqft}
                          </span>
                        </>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={img.shingle || ""}
                            onChange={(e) => onItemTextChange && onItemTextChange(index, "shingle", e.target.value)}
                            className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 mb-0 w-full text-white placeholder-gray-300 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                            placeholder="Shingle Type"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <input
                            type="text"
                            value={img.sqft || ""}
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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative w-[85vw] h-[75vh] md:h-[80vh] bg-white rounded-lg p-4 md:p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none z-10"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <div className="flex flex-col md:flex-row justify-between items-center flex-grow gap-3 md:gap-4 overflow-hidden">
              <div className="relative w-full md:w-1/2 h-[45%] md:h-full flex flex-col">
                <h4 className="text-lg font-semibold mb-1 md:mb-2 text-center md:text-left">
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
              <div className="relative w-full md:w-1/2 h-[45%] md:h-full flex flex-col">
                <h4 className="text-lg font-semibold mb-1 md:mb-2 text-center md:text-left">
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
function BeforeAfterEditorPanel({ localData, setLocalData, onSave }) {
  const { items = [] } = localData;

  const handleAddItem = () => {
    const newItem = {
      id: `new_${Date.now()}`,
      before: initializeImageState(null, "/assets/images/beforeafter/default_before.jpg"),
      after: initializeImageState(null, "/assets/images/beforeafter/default_after.jpg"),
      shingle: "New Shingle Type",
      sqft: "0000 sqft",
    };
    setLocalData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (index) => {
    const itemToRemove = items[index];
    // Revoke blob URLs if they exist for the item being removed
    if (itemToRemove.before && typeof itemToRemove.before === 'object' && itemToRemove.before.url && itemToRemove.before.url.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.before.url);
    }
    if (itemToRemove.after && typeof itemToRemove.after === 'object' && itemToRemove.after.url && itemToRemove.after.url.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.after.url);
    }

    const updated = [...items];
    updated.splice(index, 1);
    setLocalData((prev) => ({
      ...prev,
      items: updated,
    }));
  };

  const handleChangeItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setLocalData((prev) => ({
      ...prev,
      items: updated,
    }));
  };

  /**
   * Handles file uploads for before/after images
   * Stores both the URL for display and the file object for the ZIP
   *
   * @param {number} index - The index of the item in the items array
   * @param {string} field - The field to update ('before' or 'after')
   * @param {File} file - The uploaded file
   */
  const handleImageUpload = (index, field, file) => {
    if (!file) return;

    // Revoke old blob URL if exists for this specific image field
    const currentItem = items[index];
    if (currentItem && currentItem[field] && typeof currentItem[field] === 'object' && currentItem[field].url && currentItem[field].url.startsWith('blob:')) {
      URL.revokeObjectURL(currentItem[field].url);
    }

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store an object containing both the file and its URL
    handleChangeItem(index, field, { file: file, url: fileURL, name: file.name });
  };

  /**
   * Gets the display URL from either a string URL or an object with a URL property
   *
   * @param {string|Object} value - The value to extract URL from
   * @returns {string|null} - The URL to display
   */
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Edit Gallery Images & Items
        </h1>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Manage Gallery Items & Images</h2>
        {items.map((item, index) => (
          <div key={item.id || index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
            <button
              onClick={() => handleRemoveItem(index)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-700"
            >
              Remove
            </button>

            <p className="text-sm text-gray-600 mb-2">Editing Images for: {item.shingle || "Item"} ({item.sqft || "Details"})</p>

            {/* Before Image Upload */}
            <label className="block text-sm mb-1 text-gray-700">
              Before Image:
              <input
                type="file"
                accept="image/*"
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(index, "before", file);
                  }
                }}
              />
            </label>
            {getDisplayUrl(item.before) && (
              <img
                src={getDisplayUrl(item.before)}
                alt="Before Preview"
                className="mt-2 h-24 w-24 object-cover rounded shadow bg-gray-200 p-1"
              />
            )}
            <input
                type="text"
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500"
                placeholder="Or paste direct image URL (e.g., /assets/img.png)"
                value={(item.before && (typeof item.before === 'string' ? item.before : item.before.url)) || ''}
                onChange={(e) => {
                    const newImageValue = e.target.value;
                    const oldImageState = item.before;
                    if (oldImageState && typeof oldImageState === 'object' && oldImageState.url && oldImageState.url.startsWith('blob:')) {
                        if (newImageValue !== oldImageState.url) { URL.revokeObjectURL(oldImageState.url); }
                    }
                    handleChangeItem(index, 'before', { file: null, url: newImageValue, name: newImageValue.split('/').pop() });
                }}
            />

            {/* After Image Upload */}
            <label className="block text-sm mb-1 mt-2 text-gray-700">
              After Image:
              <input
                type="file"
                accept="image/*"
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(index, "after", file);
                  }
                }}
              />
            </label>
            {getDisplayUrl(item.after) && (
              <img
                src={getDisplayUrl(item.after)}
                alt="After Preview"
                className="mt-2 h-24 w-24 object-cover rounded shadow bg-gray-200 p-1"
              />
            )}
             <input
                type="text"
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500"
                placeholder="Or paste direct image URL (e.g., /assets/img.png)"
                value={(item.after && (typeof item.after === 'string' ? item.after : item.after.url)) || ''}
                onChange={(e) => {
                    const newImageValue = e.target.value;
                    const oldImageState = item.after;
                    if (oldImageState && typeof oldImageState === 'object' && oldImageState.url && oldImageState.url.startsWith('blob:')) {
                        if (newImageValue !== oldImageState.url) { URL.revokeObjectURL(oldImageState.url); }
                    }
                    handleChangeItem(index, 'after', { file: null, url: newImageValue, name: newImageValue.split('/').pop() });
                }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddItem}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
        >
          Add New Item
        </button>
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
  if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) {
    return imageConfig; // Already in {file, url, name?} format
  }
  if (typeof imageConfig === 'string') {
    return { file: null, url: imageConfig, name: imageConfig.split('/').pop() }; 
  }
  return { file: null, url: defaultPath, name: defaultPath.split('/').pop() }; 
};

export default function BeforeAfterBlock({
  readOnly = false,
  beforeAfterData,
  onConfigChange,
}) {
 
  const [localData, setLocalDataState] = useState(() => {
    const initialConfig = beforeAfterData || {};
    return {
      sectionTitle: initialConfig.sectionTitle || "GALLERY",
      items: (initialConfig.items || []).map((item, index) => ({
        ...item,
        id: item.id || `item_${index}_${Date.now()}`,
        before: initializeImageState(item.before, "/assets/images/beforeafter/default_before.jpg"),
        after: initializeImageState(item.after, "/assets/images/beforeafter/default_after.jpg"),
      })),
    };
  });

  useEffect(() => {
    if (beforeAfterData) {
      setLocalDataState(prevLocalData => {
        const newItems = (beforeAfterData.items || []).map((newItem, index) => {
          const oldItem = prevLocalData.items[index] || {};
          const newBeforeImg = initializeImageState(newItem.before, "/assets/images/beforeafter/default_before.jpg");
          const newAfterImg = initializeImageState(newItem.after, "/assets/images/beforeafter/default_after.jpg");

          // Revoke old blob URLs if they exist and are different
          if (oldItem.before && oldItem.before.url && oldItem.before.url.startsWith('blob:') && oldItem.before.url !== newBeforeImg.url) {
            URL.revokeObjectURL(oldItem.before.url);
          }
          if (oldItem.after && oldItem.after.url && oldItem.after.url.startsWith('blob:') && oldItem.after.url !== newAfterImg.url) {
            URL.revokeObjectURL(oldItem.after.url);
          }

          return {
            ...newItem,
            id: newItem.id || oldItem.id || `item_update_${index}_${Date.now()}`,
            before: newBeforeImg,
            after: newAfterImg,
          };
        });

        return {
          ...prevLocalData, // Keep other potential top-level fields from localData
          ...beforeAfterData, // Overwrite with all fields from beforeAfterData, including sectionTitle
          sectionTitle: beforeAfterData.sectionTitle || prevLocalData.sectionTitle || "GALLERY",
          items: newItems,
        };
      });
    }
  }, [beforeAfterData]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      localData.items.forEach(item => {
        if (item.before && item.before.url && item.before.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.before.url);
        }
        if (item.after && item.after.url && item.after.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.after.url);
        }
      });
    };
  }, [localData.items]);

  const updateAndPropagateChanges = (updater) => {
    setLocalDataState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      if (onConfigChange) {
        onConfigChange(newState);
      }
      return newState;
    });
  };

  if (readOnly) {
    return <BeforeAfterPreview beforeAfterData={beforeAfterData} readOnly={true} />;
  }
  
  return (
    <>
      <BeforeAfterPreview 
        beforeAfterData={localData} 
        readOnly={false}
        onSectionTitleChange={(newTitle) => {
          updateAndPropagateChanges(prev => ({ ...prev, sectionTitle: newTitle }));
        }}
        onItemTextChange={(index, field, value) => {
          updateAndPropagateChanges(prev => {
            const updatedItems = [...prev.items];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            return { ...prev, items: updatedItems };
          });
        }}
      />
      <BeforeAfterEditorPanel
        localData={localData}
        setLocalData={updateAndPropagateChanges}
        onSave={() => onConfigChange?.(localData)}
      />
    </>
  );
}
