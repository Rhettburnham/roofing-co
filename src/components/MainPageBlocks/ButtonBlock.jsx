// src/components/MainPageBlocks/ButtonBlock.jsx
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

// Add ticker registration to keep animations running during scrolling
gsap.registerPlugin();
// Force GSAP to use requestAnimationFrame which is more reliable during scrolling
gsap.ticker.lagSmoothing(0);

/* ======================================================
   READ-ONLY VIEW: ButtonPreview
   ------------------------------------------------------
   This component shows the button as a preview.
   It uses GSAP for the sliding carousel and uses the
   passed-in button configuration values.
========================================================= */
function ButtonPreview({ buttonconfig }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [images, setImages] = useState([]);
  // Adjust the duration to control the speed of continuous scrolling
  const slideDuration = 60; // in seconds, adjust as needed
  const animRef = useRef(null);

  // Format images from config
  useEffect(() => {
    if (!buttonconfig) return;
    const { images = [] } = buttonconfig;
    const formattedImages = images.map((img) =>
      img.startsWith("/") ? img : `/${img.replace(/^\.\//, "")}`
    );
    setImages(formattedImages);
  }, [buttonconfig]);

  // Set up continuous scrolling animation
  useEffect(() => {
    if (!images.length || !sliderRef.current) return;

    // Create animation context that won't be affected by scroll
    const ctx = gsap.context(() => {
      // Wait until images are rendered and then get the width of one set of images
      const totalWidth = sliderRef.current.scrollWidth;
      // Because we duplicate the images for seamless looping,
      // the width of one full set is half the scrollWidth.
      const singleSetWidth = totalWidth / 2;

      // Kill any previous animations
      if (animRef.current) {
        animRef.current.kill();
      }

      // Create animation with force3D to improve performance
      animRef.current = gsap.to(sliderRef.current, {
        x: `-=${singleSetWidth}`,
        ease: "linear",
        duration: slideDuration,
        repeat: -1,
        force3D: true,
        // The modifier wraps the x value so that when it passes the width of one set,
        // it starts again at 0, resulting in a continuous loop.
        modifiers: {
          x: (x) => {
            const mod = parseFloat(x) % singleSetWidth;
            return mod + "px";
          },
        },
      });
    });

    // Proper cleanup
    return () => {
      if (animRef.current) {
        animRef.current.kill();
      }
      ctx.revert(); // Clean up GSAP context
    };
  }, [images, slideDuration]);

  // Add an intersection observer to pause/resume animation when out of view
  useEffect(() => {
    if (!sliderRef.current || !animRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Resume the animation when in view
            if (animRef.current) {
              animRef.current.play();
            }
          } else {
            // Pause the animation when out of view (optional for performance)
            // Remove this if you want animations to continue even when not visible
            // if (animRef.current) {
            //   animRef.current.pause();
            // }
          }
        });
      },
      { threshold: 0.1 } // Trigger when at least 10% of the element is visible
    );

    observer.observe(sliderRef.current);

    return () => {
      observer.disconnect();
    };
  }, [sliderRef.current, animRef.current]);

  const handleClick = () => {
    if (buttonconfig && buttonconfig.buttonLink) {
      navigate(buttonconfig.buttonLink);
    }
  };

  if (!buttonconfig) {
    return <p className="text-center p-4">No button configuration found.</p>;
  }

  // Get the text from config
  const { text = "About Us" } = buttonconfig;

  return (
    <div className="flex flex-col relative w-full mt-0 pt-0">
      {/* Top gradient: transparent to black */}
      <div className="relative h-[1vh] z-30 w-full mt-0 pt-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
      </div>

      {/* Main content */}
      <div className="z-40">
        <div className="relative overflow-hidden z-30">
          {/* Fixed Centered Button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
            <button
              className="text-white hover:text-black hover:bg-white font-sans text-xl font-bold md:text-2xl px-4 py-2 md:px-5 md:py-2 rounded-lg shadow-lg dark_button bg-accent"
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
              <div>{text}</div>
            </button>
          </div>

          {/* Image Carousel Wrapper with fixed height */}
          <div className="relative h-[10vh] overflow-hidden">
            <div className="flex" ref={sliderRef}>
              {/* Duplicate the images array for seamless looping */}
              {images.concat(images).map((src, index) => (
                <div key={`slide-${index}`} className="flex-shrink-0">
                  <div className="relative sm:w-[70vw] w-[88vw] md:h-[24vh] sm:h-[20vh] h-[15vh]">
                    <div className="flex items-center justify-center overflow-hidden w-full h-full relative">
                      <img
                        src={src}
                        alt={`Slide ${index}`}
                        className="w-full h-full object-cover pointer-events-none"
                        loading={index < 3 ? "eager" : "lazy"}
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

      {/* Bottom gradient: black to transparent */}
      <div className="relative h-[1vh] z-30 w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-black" />
      </div>
    </div>
  );
}

ButtonPreview.propTypes = {
  buttonconfig: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
};

/* ======================================================
   EDITOR VIEW: ButtonEditorPanel
   ------------------------------------------------------
   This component lets the admin change the button text,
   the link, and the images used in the carousel. Changes
   are kept in local state until the user clicks "Save."
========================================================= */
function ButtonEditorPanel({ localButton, setLocalButton, onSave }) {
  const [validationError, setValidationError] = useState("");

  const handleSaveClick = () => {
    // Validate the localButton data
    if (!localButton.text) {
      setValidationError("Button text is required");
      return;
    }

    if (!localButton.buttonLink) {
      setValidationError("Button link is required");
      return;
    }

    if (!localButton.images || localButton.images.length === 0) {
      setValidationError("At least one image is required");
      return;
    }

    // Clear any validation errors and save
    setValidationError("");
    onSave();
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-800 py-2 z-10">
        <h1 className="text-lg md:text-xl font-medium">Button Editor</h1>
        <button
          type="button"
          onClick={handleSaveClick}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white font-medium"
        >
          Save
        </button>
      </div>

      {/* Validation error message */}
      {validationError && (
        <div className="bg-red-500 text-white p-2 mb-4 rounded">
          {validationError}
        </div>
      )}

      {/* Editable Button Text */}
      <div className="mb-6">
        <label className="block text-sm mb-1 font-medium">Button Text:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-2 rounded text-white"
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
        <label className="block text-sm mb-1 font-medium">Button Link:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-2 rounded text-white"
          value={localButton.buttonLink || ""}
          onChange={(e) =>
            setLocalButton((prev) => ({
              ...prev,
              buttonLink: e.target.value,
            }))
          }
        />
        <div className="text-xs text-gray-400 mt-1">
          Example: /about for internal page or https://example.com for external
          site
        </div>
      </div>

      {/* Editable Images List */}
      <div>
        <h2 className="text-lg font-medium mb-2">Background Images</h2>
        <p className="text-sm text-gray-400 mb-3">
          Add background images for the carousel. These images will scroll
          behind the button.
        </p>

        {localButton.images &&
          localButton.images.map((img, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-3 relative">
              <button
                onClick={() => {
                  const updated = [...localButton.images];
                  updated.splice(index, 1);
                  setLocalButton((prev) => ({
                    ...prev,
                    images: updated,
                  }));
                }}
                className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-500"
              >
                Remove
              </button>
              <label className="block text-sm mb-1 font-medium">
                Image URL:
                <input
                  type="text"
                  className="w-full bg-gray-600 px-2 py-2 rounded mt-1 text-white"
                  value={img || ""}
                  onChange={(e) => {
                    const updated = [...localButton.images];
                    updated[index] = e.target.value;
                    setLocalButton((prev) => ({ ...prev, images: updated }));
                  }}
                />
              </label>
              {img && (
                <div className="mt-2 border border-gray-600 rounded overflow-hidden">
                  <img
                    src={
                      img.startsWith("/") ? img : `/${img.replace(/^\.\//, "")}`
                    }
                    alt={`Background ${index + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/images/placeholder.png";
                      e.target.alt = "Image not found";
                    }}
                  />
                </div>
              )}
            </div>
          ))}

        <button
          onClick={() => {
            const updated = [
              ...(localButton.images || []),
              "/assets/images/placeholder.png",
            ];
            setLocalButton((prev) => ({ ...prev, images: updated }));
          }}
          className="bg-gray-600 text-white text-sm px-3 py-2 rounded font-medium hover:bg-gray-500"
        >
          + Add Image
        </button>
      </div>
    </div>
  );
}

ButtonEditorPanel.propTypes = {
  localButton: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
  setLocalButton: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

/* ======================================================
   MAIN COMPONENT: ButtonBlock
   ------------------------------------------------------
   Initializes its local state from the provided button
   configuration. When in read-only mode it shows the preview;
   when in edit mode it shows both a live preview (using local state)
   and the editor panel so changes are immediately visible.
========================================================= */
export default function ButtonBlock({
  readOnly = false,
  buttonconfig = null,
  onConfigChange = () => {},
}) {
  const [localButton, setLocalButton] = useState(() => {
    if (!buttonconfig) {
      return {
        text: "About Us",
        buttonLink: "/about",
        images: [
          "/assets/images/placeholder.png",
          "/assets/images/placeholder.png",
        ],
      };
    }
    return { ...buttonconfig };
  });

  const handleSave = () => {
    if (onConfigChange) {
      onConfigChange(localButton);
    }
  };

  // If read-only mode, just show the preview
  if (readOnly) {
    return <ButtonPreview buttonconfig={buttonconfig} />;
  }

  // Otherwise show both editor and preview
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="md:w-1/2 order-2 md:order-1">
        <h3 className="text-sm text-gray-400 mb-2">Preview:</h3>
        <div className="border border-gray-300 rounded overflow-hidden">
          <ButtonPreview buttonconfig={localButton} />
        </div>
      </div>
      <div className="md:w-1/2 order-1 md:order-2">
        <ButtonEditorPanel
          localButton={localButton}
          setLocalButton={setLocalButton}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

ButtonBlock.propTypes = {
  readOnly: PropTypes.bool,
  buttonconfig: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }),
  onConfigChange: PropTypes.func,
};
