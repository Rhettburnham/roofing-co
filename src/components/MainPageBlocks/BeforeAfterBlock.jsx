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
=============================================== */
function BeforeAfterPreview({ beforeAfterData }) {
  const boxesRef = useRef([]);
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Local states for modal
  const [selectedImages, setSelectedImages] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { sectionTitle = "", items = [] } = beforeAfterData || {};

  const handleBoxClick = (images) => {
    setSelectedImages(images);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedImages(null);
  };

  useEffect(() => {
    if (!items.length) return;
    const nailElement = nailRef.current;
    const textElement = textRef.current;

    gsap.set(nailElement, { x: "120vw", opacity: 1 });
    gsap.set(textElement, { opacity: 0, x: "100%" });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 50%",
        end: "top 65%",
        toggleActions: "play none none none",
      },
    });

    masterTimeline
      .to(nailElement, { x: 0, duration: 1, ease: "power2.out" })
      .to(textElement, { opacity: 1, duration: 0.5 }, "+=0.2")
      .to([nailElement, textElement], { x: (i) => (i === 0 ? "-10vw" : "-50%"), duration: 0.8, ease: "power2.inOut" }, "+=0.3");

    const boxEls = boxesRef.current.filter((box) => box !== null);
    const numCols = window.innerWidth >= 768 ? 3 : 2;
    const calculateOrder = (index, cols) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return cols - col + row;
    };
    const sortedBoxes = boxEls
      .map((box, index) => ({ element: box, order: calculateOrder(index, numCols), index }))
      .sort((a, b) => b.order - a.order);

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
        .to(element, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, `>-0.5`)
        .to(overlayText, { opacity: 1, duration: 0.2, ease: "power2.out" }, "<+=0.3");
    });

    boxEls.forEach((box) => {
      if (!box) return;
      const cardElement = box.querySelector(".card");
      if (!cardElement) return;
      const beforeImage = cardElement.querySelector(".before");
      const afterImage = cardElement.querySelector(".after");
      if (!beforeImage || !afterImage) return;
      gsap.set(cardElement, { perspective: 1000, transformStyle: "preserve-3d" });
      gsap.set([beforeImage, afterImage], { backfaceVisibility: "hidden", position: "absolute", width: "100%", height: "100%" });
      gsap.set(beforeImage, { rotationY: 0, zIndex: 2 });
      gsap.set(afterImage, { rotationY: 180, zIndex: 1 });
      gsap.timeline({
        scrollTrigger: {
          trigger: box,
          start: "top 60%",
          end: "top 40%",
          scrub: 0.5,
          toggleActions: "restart pause reverse pause",
        },
      })
        .to(beforeImage, { rotationY: -180, duration: 1, ease: "none" })
        .to(afterImage, { rotationY: 0, duration: 1, ease: "none" }, 0);
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [items]);

  return (
    <>
      <section className="relative w-full overflow-visible bg-gradient-to-b from-black to-white">
        <div ref={headerRef} className="relative flex items-center py-8 pb-14 w-full overflow-hidden">
          <div ref={nailRef} className="absolute left-[25%] md:left-[17%] w-[30%] h-[6vh] md:h-[5vh]">
            <div className="w-full h-full dynamic-shadow" style={{
              backgroundImage: "url('/assets/images/nail.png')",
              backgroundPosition: "left center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "scale(3) scaleX(-1)",
              transformOrigin: "left center",
            }} />
          </div>
          <div ref={textRef} className="absolute left-1/2 z-10">
            <h2 className="text-[6vw] md:text-[6vh] text-white  font-normal font-condensed font-rye mt-2 py-3 z-30">
              {sectionTitle}
            </h2>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 px-6 md:px-10 md:pb-4">
            {items.map((img, index) => (
              <div key={index} ref={(el) => (boxesRef.current[index] = el)} className="relative">
                <div className="relative cursor-pointer" style={{ perspective: "1000px" }} onClick={() => handleBoxClick(img)}>
                  <div className="card w-[30vw] md:w-[20vw] aspect-[4/3]" style={{ transformStyle: "preserve-3d", position: "relative" }}>
                    <img src={img.before} alt={`Before ${index + 1}`} className="before absolute top-0 left-0 w-full h-full object-cover rounded-lg" style={{ backfaceVisibility: "hidden" }} />
                    <img src={img.after} alt={`After ${index + 1}`} className="after absolute top-0 left-0 w-full h-full object-cover rounded-lg" style={{ backfaceVisibility: "hidden" }} />
                  </div>
                  <div className="overlay-text absolute bottom-0 left-0 px-3 py-1 md:px-4 md:py-0 opacity-0">
                    <div className="flex flex-col text-faint-color text-left leading-tight">
                      <span className=" whitespace-nowrap font-bold text-[3vw] text-sm drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,.8)]">
                        {img.shingle}
                      </span>
                      <span className="font-semibold text-[3vw] text-sm text-faint-color drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,.8)]">
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
      {showModal && selectedImages && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-[90vw] h-[90vh] bg-white rounded-lg p-4 md:p-8">
            <button
              className="absolute top-2 right-2 text-gray-700 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-300 focus:outline-none"
              onClick={closeModal}
              aria-label="Close Modal"
            >
              &times;
            </button>
            <div className="flex flex-col md:flex-row justify-between items-center h-full gap-4">
              <img src={selectedImages.before} alt="Before" className="w-full md:w-1/2 h-[40vh] md:h-full object-cover rounded-lg" />
              <img src={selectedImages.after} alt="After" className="w-full md:w-1/2 h-[40vh] md:h-full object-cover rounded-lg" />
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

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Before/After Editor</h1>
        <button type="button" onClick={onSave} className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold">
          Save
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Section Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={sectionTitle}
          onChange={(e) => setLocalData((prev) => ({ ...prev, sectionTitle: e.target.value }))}
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
                    const fileURL = URL.createObjectURL(file);
                    handleChangeItem(index, "before", fileURL);
                  }
                }}
              />
            </label>
            {item.before && (
              <img src={item.before} alt="Before" className="mt-2 h-24 rounded shadow" />
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
                    const fileURL = URL.createObjectURL(file);
                    handleChangeItem(index, "after", fileURL);
                  }
                }}
              />
            </label>
            {item.after && (
              <img src={item.after} alt="After" className="mt-2 h-24 rounded shadow" />
            )}

            {/* Shingle Type */}
            <label className="block text-sm mb-1">
              Shingle Type:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={item.shingle || ""}
                onChange={(e) => handleChangeItem(index, "shingle", e.target.value)}
              />
            </label>

            {/* Square Footage */}
            <label className="block text-sm mb-1">
              Square Footage:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={item.sqft || ""}
                onChange={(e) => handleChangeItem(index, "sqft", e.target.value)}
              />
            </label>
          </div>
        ))}

        <button onClick={handleAddItem} className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
          + Add Gallery Item
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
export default function BeforeAfterBlock({ readOnly = false, beforeAfterData, onConfigChange }) {
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
    <BeforeAfterEditorPanel localData={localData} setLocalData={setLocalData} onSave={handleSave} />
  );
}
