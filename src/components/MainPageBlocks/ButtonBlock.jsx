// src/components/MainPageBlocks/ButtonBlock.jsx
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin();

/* ======================================================
   READ-ONLY VIEW: ButtonPreview
   ------------------------------------------------------
   This component shows the button as a preview.
   It uses GSAP for the sliding carousel and uses the
   passed-in button configuration values.
========================================================= */
function ButtonPreview({ buttonconfig }) {
  const navigate = useNavigate();
  const imageRef = useRef([]);
  const [image, setImage] = useState({ imageId: 0 });
  const { imageId } = image;
  const slideDuration = 3.5;

  if (!buttonconfig) {
    return <p>No data found.</p>;
  }

  // Destructure the button config (using images rather than “slides”)
  const { text, buttonLink, images = [] } = buttonconfig;

  // Duplicate the images array to create a seamless looping carousel.
  const duplicatedSlides = [...images, ...images];

  useEffect(() => {
    gsap.to("#slider", {
      transform: `translateX(${-50 * imageId}%)`,
      duration: slideDuration,
      ease: "power2.inOut",
      onComplete: () => {
        // When we reach the end (i.e. after the original set of images),
        // reset the translation back to 0.
        if (imageId === images.length) {
          gsap.set("#slider", { transform: `translateX(0%)` });
          setImage({ imageId: 0 });
        }
      },
    });
  }, [imageId, images.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setImage((prev) => ({
        ...prev,
        imageId: prev.imageId + 1,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    navigate(buttonLink);
  };

  return (
    <div className="flex flex-col relative w-full">
      {/* Top gradient section */}
      <div className="relative bg-hover-color h-[1vh] z-30 w-full">
        <div className="absolute bottom-0 right-0 left-0 h-[0.75vh] bg-hover-color" />
      </div>

      {/* Main content */}
      <div className="bg-white z-40">
        <div className="relative overflow-hidden z-30">
          {/* Fixed Centered Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
            <button
              className="text-white hover:text-black hover:bg-white font-rye text-xl md:text-3xl font-semibold px-4 py-2 md:px-8 md:py-4 rounded-lg shadow-lg dark_button"
              onClick={handleClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "inset 0 0 15px 1px rgba(0,0,0,0.8)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
              }}
            >
              <div>{text || "About Us"}</div>
            </button>
          </div>

          {/* Image Carousel Wrapper with fixed height */}
          <div className="relative h-[15vh] overflow-hidden">
            <div className="flex" id="slider">
              {duplicatedSlides.map((src, i) => (
                <div key={i} className="flex-shrink-0">
                  <div className="relative sm:w-[70vw] w-[88vw] md:h-[24vh] sm:h-[20vh] h-[15vh]">
                    <div className="flex items-center justify-center overflow-hidden w-full h-full relative">
                      <img
                        src={src}
                        alt={`Slide ${i}`}
                        className="w-full h-full object-cover pointer-events-none"
                        ref={(el) => (imageRef.current[i] = el)}
                      />
                      {/* Grey Overlay */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient section */}
      <div className="relative bottom-0 right-0 left-0 bg-hover-color h-[1vh] z-30 w-full">
        <div className="absolute top-0 right-0 left-0 h-[0.75vh] bg-hover-color" />
      </div>
    </div>
  );
}

/* ======================================================
   EDITOR VIEW: ButtonEditorPanel
   ------------------------------------------------------
   This component lets the admin change the button text,
   the link, and the images used in the carousel. Changes
   are kept in local state until the user clicks “Save.”
========================================================= */
function ButtonEditorPanel({ localButton, setLocalButton, onSave }) {
  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Button Editor</h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Editable Button Text */}
      <div className="mb-6">
        <label className="block text-sm mb-1">Button Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={localButton.text || ""}
          onChange={(e) =>
            setLocalButton((prev) => ({
              ...prev,
              text: e.target.value,
            }))
          }
        />
      </div>

      {/* Editable Button Link */}
      <div className="mb-6">
        <label className="block text-sm mb-1">Button Link:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={localButton.buttonLink || ""}
          onChange={(e) =>
            setLocalButton((prev) => ({
              ...prev,
              buttonLink: e.target.value,
            }))
          }
        />
      </div>

      {/* Editable Images List */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Images</h2>
        {localButton.images.map((img, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded mb-3 relative">
            <button
              onClick={() => {
                const updated = [...localButton.images];
                updated.splice(index, 1);
                setLocalButton((prev) => ({
                  ...prev,
                  images: updated,
                }));
              }}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Image URL:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={img || ""}
                onChange={(e) => {
                  const updated = [...localButton.images];
                  updated[index] = e.target.value;
                  setLocalButton((prev) => ({ ...prev, images: updated }));
                }}
              />
            </label>
          </div>
        ))}
        <button
          onClick={() => {
            const updated = [
              ...localButton.images,
              "/assets/images/placeholder.png",
            ];
            setLocalButton((prev) => ({ ...prev, images: updated }));
          }}
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
        >
          + Add Image
        </button>
      </div>
    </div>
  );
}

/* ======================================================
   MAIN COMPONENT: ButtonBlock
   ------------------------------------------------------
   Initializes its local state from the provided button
   configuration. When in read-only mode it shows the preview;
   when in edit mode it shows both a live preview (using local state)
   and the editor panel so changes are immediately visible.
========================================================= */
export default function ButtonBlock({ readOnly = false, buttonconfig, onConfigChange }) {
  const [localButton, setLocalButton] = useState(() => {
    if (!buttonconfig) {
      return {
        text: "",
        buttonLink: "",
        images: [],
      };
    }
    return {
      ...buttonconfig,
      images: buttonconfig.images ? [...buttonconfig.images] : [],
    };
  });

  // Callback to save the changes back to the parent.
  const handleSave = () => {
    onConfigChange?.(localButton);
  };

  if (readOnly) {
    return <ButtonPreview buttonconfig={buttonconfig} />;
  }

  return (
    <div>
      {/* Live Preview Section */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">Live Preview</h2>
        <ButtonPreview buttonconfig={localButton} />
      </div>
      {/* Editor Panel */}
      <ButtonEditorPanel
        localButton={localButton}
        setLocalButton={setLocalButton}
        onSave={handleSave}
      />
    </div>
  );
}
