// src/components/MainPageBlocks/ButtonBlock.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";

// Add ticker registration to keep animations running during scrolling
gsap.registerPlugin();
// Force GSAP to use requestAnimationFrame which is more reliable during scrolling
gsap.ticker.lagSmoothing(0);

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

// Helper function to derive local state from props
const deriveInitialLocalData = (buttonDataInput) => {
  const initial = buttonDataInput || {};

  // Initialize images with proper structure
  let initialImages = [];
  const defaultImages = [
    "/assets/images/roof_slideshow/i4.jpeg",
    "/assets/images/roof_slideshow/i8.webp",
    "/assets/images/roof_slideshow/i5.jpeg",
  ];

  // Check if images array already exists and is valid
  if (
    initial.images &&
    Array.isArray(initial.images) &&
    initial.images.length > 0
  ) {
    initialImages = initial.images.map((img, index) => {
      if (typeof img === "string") {
        return {
          file: null,
          url: img,
          name: img.split("/").pop() || `Image ${index + 1}`,
          originalUrl: img,
          id: `img_existing_${Date.now()}_${index}`,
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
          id: img.id || `img_existing_${Date.now()}_${index}`,
        };
      }
      return {
        file: null,
        url: "",
        name: `Image ${index + 1}`,
        originalUrl: "",
        id: `img_existing_${Date.now()}_${index}`,
      };
    });
  } else {
    // Initialize from default images
    initialImages = defaultImages.map((imgPath, index) => ({
      file: null,
      url: imgPath,
      name: imgPath.split("/").pop() || `Carousel Image ${index + 1}`,
      originalUrl: imgPath,
      id: `img_default_${Date.now()}_${index}`,
    }));
  }

  return {
    text: initial.text || "About Us",
    buttonLink: initial.buttonLink || "/about",
    variant: initial.variant || "slide",
    slideDuration: initial.slideDuration || 40,
    images: initialImages,
    styling: {
      desktopHeightVH: initial.styling?.desktopHeightVH ?? 20,
      mobileHeightVW: initial.styling?.mobileHeightVW ?? 35,
      slideDuration:
        initial.slideDuration || initial.styling?.slideDuration || 40,
      buttonSize: initial.buttonSize || initial.styling?.buttonSize || "large",
      animationSpeed:
        initial.animationSpeed || initial.styling?.animationSpeed || "normal",
    },
    textSettings: initial.textSettings || {
      fontFamily: "Inter, sans-serif",
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 0.5,
      textAlign: "center",
      color: "#FFFFFF",
    },
  };
};

/* ======================================================
   BUTTON PREVIEW (Read-Only or Editable)
   ------------------------------------------------------
   This component shows the button as a preview with
   inline editing capabilities for text only.
========================================================= */
function ButtonPreview({ buttonData, readOnly, onButtonDataChange }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [images, setImages] = useState([]);
  const slideDuration = buttonData?.slideDuration || 40;
  const variant = buttonData?.variant || "slide";
  const animRef = useRef(null);

  const handleFieldChange = (field, value) => {
    onButtonDataChange({ ...buttonData, [field]: value });
  };

  useEffect(() => {
    if (!buttonData) return;
    const { images = [] } = buttonData;
    const formattedImages = images
      .map((img) => {
        if (typeof img === "string") {
          return img.startsWith("/") ? img : `/${img.replace(/^\.\//, "")}`;
        } else if (img && img.url) {
          return img.url;
        }
        return "";
      })
      .filter(Boolean);
    setImages(formattedImages);
  }, [buttonData]);

  // Animation function to handle different variants
  const createAnimation = useCallback(() => {
    if (!images.length || !sliderRef.current) return;

    const ctx = gsap.context(() => {
      const actualDuration = slideDuration > 0 ? slideDuration : 5;

      if (animRef.current) animRef.current.kill();

      // Reset initial state
      gsap.set(sliderRef.current, { x: 0, opacity: 1, scale: 1, y: 0 });

      switch (variant) {
        case "fade":
          // Slide animation - moves 500px every 2 seconds
          animRef.current = gsap.to(sliderRef.current, {
            x: "-=500",
            ease: "none",
            duration: 2,
            repeat: -1,
            force3D: true,
            overwrite: true,
            modifiers: {
              x: (x_value) => {
                const x = parseFloat(x_value);
                if (!sliderRef.current) {
                  return "0px";
                }
                const totalWidth = sliderRef.current.scrollWidth / 2;
                let modX = x % totalWidth;
                if (modX > 0) {
                  modX -= totalWidth;
                }
                return modX + "px";
              },
            },
            onUpdate: () => {
              gsap.ticker.tick();
            },
          });
          break;

        case "slide":
        default:
          // Default slide animation (horizontal sliding)
          const slideMovementDistance = 300;
          animRef.current = gsap.to(sliderRef.current, {
            x: `-=${slideMovementDistance}`,
            ease: "none",
            duration: actualDuration,
            repeat: -1,
            force3D: true,
            overwrite: true,
            modifiers: {
              x: (x_value) => {
                const x = parseFloat(x_value);
                if (!sliderRef.current) {
                  return "0px";
                }
                const totalWidth = sliderRef.current.scrollWidth / 2;
                let modX = x % totalWidth;
                if (modX > 0) {
                  modX -= totalWidth;
                }
                return modX + "px";
              },
            },
            onUpdate: () => {
              gsap.ticker.tick();
            },
          });
          break;
      }

      if (animRef.current && animRef.current.eventCallback) {
        animRef.current.eventCallback("onUpdate", () => {
          if (animRef.current && animRef.current.paused())
            animRef.current.play();
        });
      }
    });

    return () => {
      if (animRef.current) animRef.current.kill();
      ctx.revert();
    };
  }, [images, slideDuration, variant]);

  useEffect(() => {
    return createAnimation();
  }, [createAnimation]);

  useEffect(() => {
    const handleResize = () => {
      if (animRef.current && animRef.current.restart)
        animRef.current.restart(true);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleClick = () => {
    if (buttonData && buttonData.buttonLink) {
      navigate(buttonData.buttonLink);
    }
  };

  // Get button size classes based on the styling config
  const getButtonSizeClasses = (buttonSize) => {
    const sizeVariants = {
      small: {
        text: "text-lg md:text-xl",
        padding: "px-3 py-1.5 md:px-4 md:py-2",
        roundedness: "rounded-md",
      },
      medium: {
        text: "text-xl md:text-2xl",
        padding: "px-4 py-2 md:px-5 md:py-2",
        roundedness: "rounded-lg",
      },
      large: {
        text: "text-2xl md:text-3xl",
        padding: "px-6 py-3 md:px-8 md:py-4",
        roundedness: "rounded-xl",
      },
      "extra-large": {
        text: "text-3xl md:text-4xl",
        padding: "px-8 py-4 md:px-12 md:py-6",
        roundedness: "rounded-2xl",
      },
    };

    return sizeVariants[buttonSize] || sizeVariants["medium"];
  };

  if (!buttonData) {
    return <p className="text-center p-4">No button configuration found.</p>;
  }

  const { text = "About Us", buttonLink = "/about", styling = {}, textSettings = {} } = buttonData;
  const buttonSize = styling.buttonSize || "medium";
  const buttonSizeClasses = getButtonSizeClasses(buttonSize);
  const textStyles = getTextStyles(textSettings);

  // Calculate dynamic height based on styling - following HeroBlock pattern
  const { desktopHeightVH = 20, mobileHeightVW = 35 } = styling;
  const dynamicHeight = window.innerWidth < 768 ? `${mobileHeightVW}vw` : `${desktopHeightVH}vh`;

  return (
    <div className="flex flex-col relative w-full mt-0 pt-0">
      <div className="">
        <div className="relative overflow-hidden z-30">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
            {!readOnly ? (
              <div className="text-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleFieldChange("text", e.target.value)}
                  className={`hover:text-black hover:bg-white ${buttonSizeClasses.padding} ${buttonSizeClasses.roundedness} shadow-lg bg-accent border-2 border-white/30 focus:border-white focus:outline-none text-center`}
                  placeholder="Button Text"
                  style={textStyles}
                />
              </div>
            ) : (
              <button
                className={`hover:text-black hover:bg-white ${buttonSizeClasses.padding} ${buttonSizeClasses.roundedness} shadow-lg dark_button bg-accent transition-all duration-200`}
                onClick={handleClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "inset 0 0 15px 1px rgba(0,0,0,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)";
                }}
                style={textStyles}
              >
                <div>{text}</div>
              </button>
            )}
          </div>
          <div
            className="relative overflow-hidden w-full"
            style={{ height: dynamicHeight }}
          >
            <div className="absolute top-0 left-0 w-full h-[1vh] z-20">
              <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
            </div>
            <div className="flex" ref={sliderRef}>
              {images.concat(images).map((src, index) => (
                <div key={`slide-${index}`} className="flex-shrink-0">
                  <div 
                    className="relative overflow-hidden"
                    style={{ 
                      width: window.innerWidth < 768 ? '88vw' : '70vw',
                      height: dynamicHeight
                    }}
                  >
                    <img
                      src={src}
                      alt={`Slide ${index}`}
                      className="w-full h-full object-cover pointer-events-none"
                      loading={index < 3 ? "eager" : "lazy"}
                      style={{ height: dynamicHeight }}
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[1vh] z-20">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ButtonPreview.propTypes = {
  buttonData: PropTypes.object.isRequired,
  readOnly: PropTypes.bool,
  onButtonDataChange: PropTypes.func.isRequired,
};

// =============================================
// Tab Control Components
// =============================================

const ButtonImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  return (
    <div className="p-4">
      <PanelImagesController
        currentData={currentData}
        onControlsChange={onControlsChange}
        imageArrayFieldName="images"
        getItemName={(item, idx) => item.name || `Carousel Image ${idx + 1}`}
      />
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium text-gray-600 mb-2">
          Image Guidelines:
        </h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>
            • Images will be used as a background carousel behind the button
          </li>
          <li>• Recommended size: 1200x600px or similar aspect ratio</li>
          <li>• Images will have a dark overlay applied automatically</li>
          <li>• At least 3 images recommended for smooth animation</li>
        </ul>
      </div>
    </div>
  );
};

ButtonImagesControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

const ButtonStylingControls = ({
  currentData,
  onControlsChange,
  animationDurationOptions,
  buttonSizeOptions,
}) => {
  const handleSlideDurationChange = (value) => {
    onControlsChange({
      ...currentData,
      slideDuration: value,
      styling: {
        ...currentData.styling,
        slideDuration: value,
      },
    });
  };

  const handleButtonSizeChange = (value) => {
    onControlsChange({
      ...currentData,
      buttonSize: value,
      styling: {
        ...currentData.styling,
        buttonSize: value,
      },
    });
  };

  const handleAnimationSpeedChange = (value) => {
    onControlsChange({
      ...currentData,
      animationSpeed: value,
      styling: {
        ...currentData.styling,
        animationSpeed: value,
      },
    });
  };

  const handleVariantChange = (value) => {
    onControlsChange({
      ...currentData,
      variant: value,
    });
  };

  const handleButtonLinkChange = (value) => {
    onControlsChange({
      ...currentData,
      buttonLink: value,
    });
  };

  // Use provided options or defaults
  const finalAnimationDurationOptions = animationDurationOptions || {
    min: 10,
    max: 200,
    default: 40,
  };

  const finalButtonSizeOptions = buttonSizeOptions || [
    {
      value: "small",
      label: "Small",
      description: "Compact button for subtle call-to-action",
    },
    {
      value: "medium",
      label: "Medium",
      description: "Standard button size for most use cases",
    },
    {
      value: "large",
      label: "Large",
      description: "Prominent button for primary actions",
    },
    {
      value: "extra-large",
      label: "Extra Large",
      description: "Maximum impact button for hero sections",
    },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Button Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Link
        </label>
        <input
          type="text"
          value={currentData.buttonLink || ""}
          onChange={(e) => handleButtonLinkChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter destination URL (e.g., /about, /services)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Use relative paths (e.g., /about) or external URLs (e.g., https://example.com)
        </p>
      </div>

      {/* Animation Variant */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Animation Variant
        </label>
        <select
          value={currentData.variant || "slide"}
          onChange={(e) => handleVariantChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="slide">Slide - Horizontal sliding carousel</option>
          <option value="fade">Fast Slide - 500px every 2 seconds</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Choose between different animation styles for the background images
        </p>
      </div>

      {/* Height Controls using PanelStylingController */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Block Height</h4>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ButtonBlock"
          controlType="height"
        />
      </div>

      {/* Animation Duration Controls using PanelStylingController */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Animation Duration
        </h4>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ButtonBlock"
          controlType="animationDuration"
          animationDurationOptions={finalAnimationDurationOptions}
        />
      </div>

      {/* Button Size Controls using PanelStylingController */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Size</h4>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ButtonBlock"
          controlType="buttonSize"
          buttonSizeOptions={finalButtonSizeOptions}
        />
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
        <h4 className="text-sm font-medium text-gray-600 mb-1">Tips:</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>
            • Adjust height to match your design needs (10-25vh for desktop)
          </li>
          <li>
            • Slower slide duration creates a more relaxed viewing experience
          </li>
          <li>• Try different variants: Slide for classic movement, Fade for smooth transitions</li>
          <li>• Large button size works well for call-to-action sections</li>
        </ul>
      </div>
    </div>
  );
};

ButtonStylingControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  animationDurationOptions: PropTypes.object,
  buttonSizeOptions: PropTypes.array,
};

/* ==============================================
   BUTTON FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Button text elements
=============================================== */
const ButtonFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-bold mb-6 text-center text-gray-800 border-b pb-3">Font Settings</h3>
      <div className="space-y-6 mt-4">
        <div className="bg-gray-50 p-4 rounded-md border">
          <PanelFontController
            label="Button Text Style"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="textSettings"
            themeColors={themeColors}
          />
        </div>
      </div>
    </div>
  );
};

/* ======================================================
   MAIN COMPONENT: ButtonBlock
   ------------------------------------------------------
   Manages local state and renders preview with inline editing
========================================================= */
export default function ButtonBlock({
  readOnly = false,
  buttonconfig = {
    text: "About Us",
    buttonLink: "/about",
    variant: "slide",
    slideDuration: 40,
    images: [],
  },
  onConfigChange = () => {},
  themeColors,
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(buttonconfig)
  );
  const prevButtonConfigRef = useRef();

  useEffect(() => {
    // Deep compare to avoid unnecessary re-renders
    const newConfigString = JSON.stringify(buttonconfig);
    const oldConfigString = JSON.stringify(prevButtonConfigRef.current);

    if (newConfigString !== oldConfigString) {
      prevButtonConfigRef.current = buttonconfig; // Update ref

      setLocalData((prevLocal) => {
        const incomingImages = buttonconfig?.images || [];
        const localImages = prevLocal.images || [];

        // Check if incoming images are just an array of strings
        const areIncomingImagesStrings = incomingImages.every(
          (img) => typeof img === "string"
        );

        if (areIncomingImagesStrings) {
          // Sync from a simple array of URLs
          const mergedImages = localImages
            .map((localImg) => {
              if (incomingImages.includes(localImg.originalUrl)) {
                return localImg; // Keep local object if URL matches
              }
              return null;
            })
            .filter(Boolean);

          incomingImages.forEach((url) => {
            if (!mergedImages.some((img) => img.originalUrl === url)) {
              mergedImages.push({
                file: null,
                url: url,
                name: url.split("/").pop(),
                originalUrl: url,
                id: `new_img_${Date.now()}_${Math.random()}`,
              });
            }
          });

          return { ...deriveInitialLocalData(buttonconfig), images: mergedImages };
        } else {
          // Sync from an array of image objects (the new standard)
          return deriveInitialLocalData(buttonconfig);
        }
      });
    }
  }, [buttonconfig]);

  const handleButtonDataChange = (newData) => {
    setLocalData(newData);
    onConfigChange(newData);
  };

  const MemoizedButtonPreview = useCallback(
    () => (
      <ButtonPreview
        buttonData={localData}
        readOnly={readOnly}
        onButtonDataChange={handleButtonDataChange}
      />
    ),
    [localData, readOnly, handleButtonDataChange]
  );

  if (readOnly) {
    return <MemoizedButtonPreview />;
  }

  return (
    <div>
      <MemoizedButtonPreview />
    </div>
  );
}

ButtonBlock.propTypes = {
  readOnly: PropTypes.bool,
  buttonconfig: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    variant: PropTypes.string,
    slideDuration: PropTypes.number,
    images: PropTypes.array, // Can be strings or objects
    styling: PropTypes.object,
    textSettings: PropTypes.object,
  }),
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.object,
};

// Tab configuration for BottomStickyEditPanel
ButtonBlock.tabsConfig = (blockData, onUpdate, themeColors, animationDurationOptions, buttonSizeOptions) => ({
  images: (props) => (
    <ButtonImagesControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  styling: (props) => (
    <ButtonStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      animationDurationOptions={animationDurationOptions}
      buttonSizeOptions={buttonSizeOptions}
    />
  ),
  fonts: (props) => (
    <ButtonFontsControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
});
