// src/components/MainPageBlocks/ButtonBlock.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";

// Add ticker registration to keep animations running during scrolling
gsap.registerPlugin();
// Force GSAP to use requestAnimationFrame which is more reliable during scrolling
gsap.ticker.lagSmoothing(0);

// Helper function to derive local state from props
const deriveInitialLocalData = (buttonDataInput) => {
  const initial = buttonDataInput || {};

  // Initialize images with proper structure, following HeroBlock pattern
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
    console.log("[ButtonBlock] Using existing images array from prop");
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
    // Initialize from default images - create proper image objects for all defaults
    console.log("[ButtonBlock] Initializing with default images");
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
      animationType:
        initial.animationType || initial.styling?.animationType || "slide",
    },
  };
};

/* ======================================================
   BUTTON PREVIEW (Read-Only or Editable)
   ------------------------------------------------------
   This component shows the button as a preview with
   inline editing capabilities for text and link.
========================================================= */
function ButtonPreview({ buttonData, readOnly, onButtonDataChange }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [images, setImages] = useState([]);
  const slideDuration = buttonData?.slideDuration || 40;
  const animationType =
    buttonData?.animationType || buttonData?.styling?.animationType || "slide";
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

  // Animation function to handle different animation types
  const createAnimation = useCallback(() => {
    if (!images.length || !sliderRef.current) return;

    const ctx = gsap.context(() => {
      const actualDuration = slideDuration > 0 ? slideDuration : 5;

      if (animRef.current) animRef.current.kill();

      // Reset initial state
      gsap.set(sliderRef.current, { x: 0, opacity: 1, scale: 1, y: 0 });

      switch (animationType) {
        case "fade":
          // Fade animation - cycles through images with opacity
          animRef.current = gsap
            .timeline({ repeat: -1 })
            .to(sliderRef.current, { opacity: 0, duration: actualDuration / 4 })
            .set(sliderRef.current, { x: "-=300px" })
            .to(sliderRef.current, { opacity: 1, duration: actualDuration / 4 })
            .to({}, { duration: actualDuration / 2 }); // pause
          break;

        case "zoom":
          // Zoom animation - scales while sliding
          const zoomMovementDistance = 300;
          animRef.current = gsap
            .timeline({ repeat: -1 })
            .to(sliderRef.current, {
              x: `-=${zoomMovementDistance}`,
              scale: 1.1,
              ease: "none",
              duration: actualDuration / 2,
              modifiers: {
                x: (x_value) => {
                  const x = parseFloat(x_value);
                  if (!sliderRef.current) return "0px";
                  const totalWidth = sliderRef.current.scrollWidth / 2;
                  let modX = x % totalWidth;
                  if (modX > 0) modX -= totalWidth;
                  return modX + "px";
                },
              },
            })
            .to(sliderRef.current, {
              scale: 1,
              duration: actualDuration / 2,
              ease: "power2.out",
            });
          break;

        case "slideUp":
          // Slide up animation
          animRef.current = gsap
            .timeline({ repeat: -1 })
            .to(sliderRef.current, {
              y: "-=100px",
              duration: actualDuration / 3,
              ease: "power2.inOut",
            })
            .to(sliderRef.current, {
              y: "+=100px",
              duration: actualDuration / 3,
              ease: "power2.inOut",
            })
            .to({}, { duration: actualDuration / 3 }); // pause
          break;

        case "slideDown":
          // Slide down animation
          animRef.current = gsap
            .timeline({ repeat: -1 })
            .to(sliderRef.current, {
              y: "+=100px",
              duration: actualDuration / 3,
              ease: "power2.inOut",
            })
            .to(sliderRef.current, {
              y: "-=100px",
              duration: actualDuration / 3,
              ease: "power2.inOut",
            })
            .to({}, { duration: actualDuration / 3 }); // pause
          break;

        case "slide":
        default:
          // Default slide animation (existing behavior)
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
  }, [images, slideDuration, animationType]);

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

  const { text = "About Us", buttonLink = "/about", styling = {} } = buttonData;
  const buttonSize = styling.buttonSize || "medium";
  const buttonSizeClasses = getButtonSizeClasses(buttonSize);

  // Calculate dynamic height based on styling
  const dynamicHeight =
    window.innerWidth < 768
      ? `${buttonData?.styling?.mobileHeightVW ?? 10}vw`
      : `${buttonData?.styling?.desktopHeightVH ?? 20}vh`;

  return (
    <div className="flex flex-col relative w-full mt-0 pt-0">
      <div className="z-40">
        <div className="relative overflow-hidden z-30">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
            {!readOnly ? (
              <div className="space-y-2 text-center">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleFieldChange("text", e.target.value)}
                  className={`text-white hover:text-black hover:bg-white font-sans font-bold ${buttonSizeClasses.text} ${buttonSizeClasses.padding} ${buttonSizeClasses.roundedness} shadow-lg bg-accent border-2 border-white/30 focus:border-white focus:outline-none text-center`}
                  placeholder="Button Text"
                />
                <input
                  type="text"
                  value={buttonLink}
                  onChange={(e) =>
                    handleFieldChange("buttonLink", e.target.value)
                  }
                  className="text-xs text-white bg-black/50 px-2 py-1 rounded focus:outline-none focus:bg-black/70 text-center"
                  placeholder="Button Link"
                />
                <div className="text-xs text-white/60 mt-1">
                  Size:{" "}
                  {buttonSize.charAt(0).toUpperCase() + buttonSize.slice(1)}
                </div>
              </div>
            ) : (
              <button
                className={`text-white hover:text-black hover:bg-white font-sans font-bold ${buttonSizeClasses.text} ${buttonSizeClasses.padding} ${buttonSizeClasses.roundedness} shadow-lg dark_button bg-accent transition-all duration-200`}
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
            )}
          </div>
          <div
            className="relative overflow-hidden"
            style={{ height: dynamicHeight }}
          >
            <div className="absolute top-0 left-0 w-full h-[1vh] z-20">
              <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
            </div>
            <div className="flex" ref={sliderRef}>
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
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                    </div>
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
  console.log(
    "[ButtonImagesControls] currentData.images for PanelImagesController:",
    currentData.images
  ); // DEBUG LOG
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

  const handleAnimationTypeChange = (value) => {
    onControlsChange({
      ...currentData,
      animationType: value,
      styling: {
        ...currentData.styling,
        animationType: value,
      },
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

      {/* Divider */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Animation Settings
        </h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Animation Speed
        </label>
        <select
          value={
            currentData.animationSpeed ||
            currentData.styling?.animationSpeed ||
            "normal"
          }
          onChange={(e) => handleAnimationSpeedChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Animation Type
        </label>
        <select
          value={
            currentData.animationType ||
            currentData.styling?.animationType ||
            "slide"
          }
          onChange={(e) => handleAnimationTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="fade">Fade</option>
          <option value="zoom">Zoom</option>
          <option value="slideUp">Slide Up</option>
          <option value="slideDown">Slide Down</option>
          <option value="slide">Slide</option>
        </select>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-md border">
        <h4 className="text-sm font-medium text-gray-600 mb-1">Color Note:</h4>
        <p className="text-xs text-gray-500 mb-2">
          Button colors are controlled by the global theme. The button uses the
          "accent" color from your site's color palette.
        </p>
        <h4 className="text-sm font-medium text-gray-600 mb-1">Tips:</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>
            • Adjust height to match your design needs (10-25vh for desktop)
          </li>
          <li>
            • Slower slide duration creates a more relaxed viewing experience
          </li>
          <li>
            • Try different animation types: Slide (classic), Fade (smooth),
            Zoom (dynamic), Slide Up/Down (vertical movement)
          </li>
          <li>• Faster animation speed creates more dynamic movement</li>
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
    slideDuration: 40,
    images: [],
  },
  onConfigChange = () => {},
  themeColors,
}) {
  const [localData, setLocalData] = useState(() =>
    deriveInitialLocalData(buttonconfig)
  );
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (buttonconfig) {
      console.log(
        "[ButtonBlock] useEffect for buttonconfig sync. Incoming buttonconfig.images:",
        buttonconfig.images
      );
      setLocalData((prevLocal) => {
        console.log(
          "[ButtonBlock] Inside setLocalData for prop sync. Prev prevLocal.images:",
          prevLocal.images
        );

        // Image update logic from prop - robust handling like HeroBlock
        let newImagesState = [...(prevLocal.images || [])];
        const defaultImagesLocal = [
          "/assets/images/roof_slideshow/i4.jpeg",
          "/assets/images/roof_slideshow/i8.webp",
          "/assets/images/roof_slideshow/i5.jpeg",
        ];

        // Check if incoming prop has images array
        if (
          buttonconfig.images &&
          Array.isArray(buttonconfig.images) &&
          buttonconfig.images.length > 0
        ) {
          console.log("[ButtonBlock] Syncing from prop images array");
          // Clean up existing blob URLs if they're different
          const currentLocalImages = prevLocal.images || [];
          currentLocalImages.forEach((localImg) => {
            if (localImg.url && localImg.url.startsWith("blob:")) {
              const foundIncoming = buttonconfig.images.find(
                (propImg) => propImg.url === localImg.url
              );
              if (!foundIncoming) {
                URL.revokeObjectURL(localImg.url);
              }
            }
          });

          newImagesState = buttonconfig.images.map((propImg, index) => {
            if (typeof propImg === "string") {
              return {
                id: `img_sync_string_${index}_${Date.now()}`,
                url: propImg,
                file: null,
                name: propImg.split("/").pop() || `Image ${index + 1}`,
                originalUrl: propImg,
              };
            }
            return {
              id: propImg.id || `img_sync_${index}_${Date.now()}`,
              url:
                propImg.url ||
                defaultImagesLocal[index] ||
                defaultImagesLocal[0],
              file: propImg.file instanceof File ? propImg.file : null,
              name:
                propImg.name ||
                propImg.url?.split("/").pop() ||
                `Image ${index + 1}`,
              originalUrl:
                propImg.originalUrl ||
                (typeof propImg.url === "string" &&
                !propImg.url.startsWith("blob:")
                  ? propImg.url
                  : defaultImagesLocal[index] || defaultImagesLocal[0]),
            };
          });
        } else if (!buttonconfig.hasOwnProperty("images")) {
          // No images property provided, keep existing state
          newImagesState = prevLocal.images || [];
        } else {
          // Empty images array provided, or images is null - initialize with defaults
          console.log(
            "[ButtonBlock] Empty images provided, initializing with defaults"
          );
          newImagesState = defaultImagesLocal.map((imgPath, index) => ({
            id: `img_default_sync_${Date.now()}_${index}`,
            url: imgPath,
            file: null,
            name: imgPath.split("/").pop() || `Carousel Image ${index + 1}`,
            originalUrl: imgPath,
          }));
        }

        const newMergedData = {
          ...prevLocal,
          text:
            buttonconfig.text !== undefined
              ? buttonconfig.text
              : prevLocal.text,
          buttonLink:
            buttonconfig.buttonLink !== undefined
              ? buttonconfig.buttonLink
              : prevLocal.buttonLink,
          slideDuration:
            buttonconfig.slideDuration !== undefined
              ? buttonconfig.slideDuration
              : prevLocal.slideDuration,
          images: newImagesState,
          styling: {
            ...prevLocal.styling,
            desktopHeightVH:
              buttonconfig.styling?.desktopHeightVH !== undefined
                ? buttonconfig.styling.desktopHeightVH
                : prevLocal.styling?.desktopHeightVH,
            mobileHeightVW:
              buttonconfig.styling?.mobileHeightVW !== undefined
                ? buttonconfig.styling.mobileHeightVW
                : prevLocal.styling?.mobileHeightVW,
            slideDuration:
              buttonconfig.slideDuration !== undefined
                ? buttonconfig.slideDuration
                : buttonconfig.styling?.slideDuration !== undefined
                  ? buttonconfig.styling.slideDuration
                  : prevLocal.styling?.slideDuration,
            buttonSize:
              buttonconfig.buttonSize !== undefined
                ? buttonconfig.buttonSize
                : buttonconfig.styling?.buttonSize !== undefined
                  ? buttonconfig.styling.buttonSize
                  : prevLocal.styling?.buttonSize,
            animationSpeed:
              buttonconfig.animationSpeed !== undefined
                ? buttonconfig.animationSpeed
                : buttonconfig.styling?.animationSpeed !== undefined
                  ? buttonconfig.styling.animationSpeed
                  : prevLocal.styling?.animationSpeed,
            animationType:
              buttonconfig.animationType !== undefined
                ? buttonconfig.animationType
                : buttonconfig.styling?.animationType !== undefined
                  ? buttonconfig.styling.animationType
                  : prevLocal.styling?.animationType,
          },
        };
        console.log(
          "[ButtonBlock] Updated localData from prop sync. New merged images:",
          newMergedData.images
        );
        return newMergedData;
      });
    }
  }, [buttonconfig]);

  useEffect(() => {
    return () => {
      localData.images.forEach((img) => {
        if (
          img &&
          typeof img === "object" &&
          img.url &&
          img.url.startsWith("blob:")
        ) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [localData.images]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localData,
          images: localData.images
            .map((imgData) => {
              if (imgData && typeof imgData === "object") {
                if (imgData.file instanceof File) {
                  return {
                    file: imgData.file,
                    url: imgData.url,
                    name: imgData.name,
                    originalUrl: imgData.originalUrl,
                  };
                } else if (imgData.originalUrl) {
                  return {
                    url: imgData.originalUrl,
                    name: imgData.name,
                    originalUrl: imgData.originalUrl,
                  };
                } else if (imgData.url && !imgData.url.startsWith("blob:")) {
                  return {
                    url: imgData.url,
                    name: imgData.name,
                    originalUrl: imgData.url,
                  };
                }
              }
              return null;
            })
            .filter((img) => img !== null),
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = useCallback(
    (updatedFieldsOrFunction) => {
      setLocalData((prevState) => {
        const newState =
          typeof updatedFieldsOrFunction === "function"
            ? updatedFieldsOrFunction(prevState)
            : { ...prevState, ...updatedFieldsOrFunction };

        if (!readOnly && onConfigChange) {
          const liveDataToPropagate = {
            ...newState,
            images: newState.images.map((imgData) => ({
              file: imgData.file,
              url: imgData.url,
              name: imgData.name,
              originalUrl: imgData.originalUrl,
              id: imgData.id,
            })),
          };
          onConfigChange(liveDataToPropagate);
        }

        return newState;
      });
    },
    [readOnly, onConfigChange]
  );

  return (
    <ButtonPreview
      buttonData={localData}
      readOnly={readOnly}
      onButtonDataChange={handleLocalDataChange}
    />
  );
}

ButtonBlock.propTypes = {
  readOnly: PropTypes.bool,
  buttonconfig: PropTypes.object,
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.object,
};

// Tab configuration for TopStickyEditPanel
ButtonBlock.tabsConfig = (localData, onControlsChange, themeColors) => {
  const tabs = {};

  // Define animation duration options for ButtonBlock
  const animationDurationOptions = {
    min: 10,
    max: 200,
    default: 40,
  };

  // Define button size options for ButtonBlock
  const buttonSizeOptions = [
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

  // Images Tab (using PanelImagesController)
  tabs.images = (props) => (
    <ButtonImagesControls
      {...props}
      currentData={localData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  // Styling Tab
  tabs.styling = (props) => (
    <ButtonStylingControls
      {...props}
      currentData={localData}
      onControlsChange={onControlsChange}
      animationDurationOptions={animationDurationOptions}
      buttonSizeOptions={buttonSizeOptions}
    />
  );

  return tabs;
};
