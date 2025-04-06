// BeforeAfterBlock.jsx
import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/* ==============================================
   1) BEFORE-AFTER PREVIEW (Read-Only)
   ----------------------------------------------
   Displays the gallery with GSAP animations.
   Expects props.beforeAfterData = {
     sectionTitle: string,
     items: [
       { before, after, shingle, sqft }, ...
     ]
   }
=============================================== */
function BeforeAfterPreview({ beforeAfterData }) {
  const boxesRef = useRef([]);
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Local states for modal and card flipping
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewState, setViewState] = useState("before");

  // Safely destructure data and ensure paths are properly formatted
  const { sectionTitle = "BEFORE & AFTER", items = [] } = beforeAfterData || {};

  // Format paths to ensure they start with / if they don't already
  const formattedItems = items.map((item) => ({
    ...item,
    before: item.before?.startsWith("/")
      ? item.before
      : `/${item.before?.replace(/^\.\//, "")}`,
    after: item.after?.startsWith("/")
      ? item.after
      : `/${item.after?.replace(/^\.\//, "")}`,
  }));

  const handleBoxClick = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  const toggleViewState = () => {
    setViewState((prev) => (prev === "before" ? "after" : "before"));
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

    // HeaderRef timeline - trigger when header comes into view
    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 80%",
        end: "top 50%",
        toggleActions: "play none none none",
        markers: false,
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

    boxEls.forEach((box) => {
      if (!box) return;
      const cardElement = box.querySelector(".card");
      if (!cardElement) return;

      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");
      if (!beforeImage || !afterImage) return;

      // Create flip animation between states
      if (viewState === "after") {
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
  }, [viewState]);

  return (
    <>
      <section className="relative w-full overflow-visible bg-gradient-to-b from-black to-white">
        {/* Header / Title */}
        <div
          ref={headerRef}
          className="relative flex items-center py-6 md:py-8 md:pb-14 w-full overflow-hidden"
        >
          <div
            ref={nailRef}
            className="absolute left-[25%] md:left-[17%] w-[30%] h-[15vh] md:h-[5vh]"
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
            <h2 className="text-[6vw] md:text-[7vh] text-white font-normal font-condensed font-rye mt-2 py-3 z-30 text-center">
              {sectionTitle}
            </h2>
            <button
              onClick={toggleViewState}
              className="absolute -right-80 mt-2 px-6 py-2  bg-banner text-white rounded-lg transition-all transform hover:scale-105 hover:shadow-lg border border-white"
            >
              {viewState === "before" ? "See After" : "See Before"}
            </button>
          </div>
        </div>

        {/* Gallery Grid - Now always 3 columns */}
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 md:pb-10">
            {formattedItems.map((img, index) => (
              <div
                key={index}
                ref={(el) => (boxesRef.current[index] = el)}
                className="relative flex flex-col md:flex-row items-center"
              >
                <div
                  className="relative cursor-pointer"
                  onClick={() => handleBoxClick(img)}
                >
                  <div className="card w-[25vw] aspect-[4/3]">
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
                  {/* Move info to the right of image with padding */}
                  <div className="overlay-text absolute bottom-0 right-0 pl-3 px-3 py-1 md:px-4 md:py-2">
                    <div className="flex flex-col items-start text-white text-left leading-tight">
                      <span className="font-bold text-[2.5vw] md:text-xl whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {img.shingle}
                      </span>
                      <span className="font-semibold text-[2.5vw] md:text-lg text-gray-200 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                        {img.sqft}
                      </span>
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
            className="relative w-[90vw] h-[80vh] md:h-[85vh] bg-white rounded-lg p-4 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>

            <h3 className="text-xl md:text-2xl font-bold mb-4">
              Before / After
            </h3>

            <div className="flex flex-col md:flex-row justify-between items-center h-[85%] gap-4">
              <div className="relative w-full md:w-1/2 h-[40%] md:h-full">
                <h4 className="text-lg font-semibold mb-2">Before</h4>
                <img
                  src={selectedImages.before}
                  alt="Before"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="relative w-full md:w-1/2 h-[40%] md:h-full">
                <h4 className="text-lg font-semibold mb-2">After</h4>
                <img
                  src={selectedImages.after}
                  alt="After"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="font-bold text-xl">{selectedImages.shingle}</p>
              <p className="text-gray-700">{selectedImages.sqft}</p>
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
  const { sectionTitle = "", items = [] } = localData;

  const handleAddItem = () => {
    const newItem = {
      before: "/assets/images/beforeafter/default_before.jpg",
      after: "/assets/images/beforeafter/default_after.jpg",
      shingle: "New Shingle Type",
      sqft: "0000 sqft",
    };
    setLocalData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const handleRemoveItem = (index) => {
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

    // Create a URL for display
    const fileURL = URL.createObjectURL(file);

    // Store just the URL for display
    handleChangeItem(index, field, fileURL);
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
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Before/After Editor
        </h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Section Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={sectionTitle}
          onChange={(e) =>
            setLocalData((prev) => ({ ...prev, sectionTitle: e.target.value }))
          }
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Gallery Items</h2>
        {items.map((item, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded mb-3 relative">
            <button
              onClick={() => handleRemoveItem(index)}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>

            {/* Before Image Upload */}
            <label className="block text-sm mb-1">
              Before Image:
              <input
                type="file"
                accept="image/*"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(index, "before", file);
                  }
                }}
              />
            </label>
            {item.before && (
              <img
                src={item.before}
                alt="Before"
                className="mt-2 h-24 rounded shadow"
              />
            )}

            {/* After Image Upload */}
            <label className="block text-sm mb-1">
              After Image:
              <input
                type="file"
                accept="image/*"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(index, "after", file);
                  }
                }}
              />
            </label>
            {item.after && (
              <img
                src={item.after}
                alt="After"
                className="mt-2 h-24 rounded shadow"
              />
            )}

            {/* Shingle Type */}
            <label className="block text-sm mb-1">
              Shingle Type:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={item.shingle}
                onChange={(e) =>
                  handleChangeItem(index, "shingle", e.target.value)
                }
              />
            </label>

            {/* Square Footage */}
            <label className="block text-sm mb-1">
              Square Footage:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={item.sqft}
                onChange={(e) =>
                  handleChangeItem(index, "sqft", e.target.value)
                }
              />
            </label>
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
export default function BeforeAfterBlock({
  readOnly = false,
  beforeAfterData,
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    if (!beforeAfterData) {
      return { sectionTitle: "GALLERY", items: [] };
    }
    return {
      sectionTitle: beforeAfterData.sectionTitle || "GALLERY",
      items: (beforeAfterData.items || []).map((item) => ({ ...item })),
    };
  });

  const handleSave = () => {
    onConfigChange?.(localData);
  };

  if (readOnly) {
    return <BeforeAfterPreview beforeAfterData={beforeAfterData} />;
  }
  return (
    <BeforeAfterEditorPanel
      localData={localData}
      setLocalData={setLocalData}
      onSave={handleSave}
    />
  );
}
