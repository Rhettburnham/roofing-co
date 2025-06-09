import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import IconSelectorModal from "../common/IconSelectorModal"; // Import IconSelectorModal here for the panel
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import { slugify } from "../../utils/slugify"; // Import slugify
import PanelStylingController from "../common/PanelStylingController";

// Icons
import {
  FaTools,
  FaFan,
  FaPaintRoller,
  FaTint,
  FaHome as FaHomeIcon, // Renamed to avoid conflict if a LucideHome is also used directly
  FaBuilding,
  FaWarehouse,
  FaSmog, // Alternative to FaChimney
  FaBroom,
  FaHardHat,
  FaQuestionCircle, // For default/error icon
} from "react-icons/fa";
import * as LucideIcons from "lucide-react"; // Import all of Lucide

// Filter out non-component exports from LucideIcons
const { createLucideIcon, ...FilteredLucideIcons } = LucideIcons;

const iconPacks = {
  lucide: FilteredLucideIcons,
  fa: {
    // Manually list Fa icons to be used or import * as FaIconsModule and assign.
    FaTools,
    FaFan,
    FaPaintRoller,
    FaTint,
    FaHomeIcon: FaHomeIcon, // For home-related services
    FaBuilding,
    FaWarehouse,
    FaSmog,
    FaBroom,
    FaHardHat,
    FaQuestionCircle,
  },
};

// Helper function to resolve icon name strings to React components
function resolveIcon(iconName, iconPack = "fa") {
  if (!iconName || !iconPack) return iconPacks.fa.FaQuestionCircle; // Default icon
  const selectedIconPack = iconPacks[iconPack.toLowerCase()];
  if (!selectedIconPack) {
    console.warn(
      'Icon pack "' + iconPack + '" not found. Defaulting to FaQuestionCircle.'
    );
    return iconPacks.fa.FaQuestionCircle; // Pack not found
  }
  const IconComponent = selectedIconPack[iconName];
  if (!IconComponent) {
    console.warn(
      'Icon "' +
        iconName +
        '" not found in pack "' +
        iconPack +
        '". Defaulting to FaQuestionCircle.'
    );
    return iconPacks.fa.FaQuestionCircle; // Icon not found in pack
  }
  return IconComponent;
}

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath.split("/").pop();
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (imageConfig && typeof imageConfig === "object") {
    urlToDisplay = imageConfig.url || defaultPath;
    nameToStore = imageConfig.name || urlToDisplay.split("/").pop();
    fileObject = imageConfig.file || null;
    originalUrlToStore =
      imageConfig.originalUrl ||
      (typeof imageConfig.url === "string" &&
      !imageConfig.url.startsWith("blob:")
        ? imageConfig.url
        : defaultPath);
  } else if (typeof imageConfig === "string") {
    urlToDisplay = imageConfig;
    nameToStore = imageConfig.split("/").pop();
    originalUrlToStore = imageConfig;
  }

  return {
    file: fileObject,
    url: urlToDisplay,
    name: nameToStore,
    originalUrl: originalUrlToStore,
  };
};

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === "string") return imageValue; // Assumes string is a direct URL or path
  if (typeof imageValue === "object" && imageValue.url) return imageValue.url; // Handles {file, url, name}
  return defaultPath;
};

// GSAP ANIMATION VARIANTS (defined once)
const containerVariants = {
  enter: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
  exit: { transition: { staggerChildren: 0.07, staggerDirection: 1 } },
};

const itemVariants = {
  initial: { opacity: 0, x: "-50%" },
  enter: { opacity: 1, x: "0%", transition: { duration: 0.3 } },
  exit: { opacity: 0, x: "100%", transition: { duration: 0.3 } },
};

// SERVICE SLIDER COMPONENT
export default function ServiceSliderBlock({
  readOnly = false,
  config = {},
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = config || {};
    const ensureOriginalTitle = (services) =>
      (services || []).map((s) => ({
        ...s,
        id: s.id || slugify(s.originalTitle || s.title),
        originalTitle: s.originalTitle || s.title,
        iconPack: s.iconPack || "fa",
      }));

    // Default residential services with proper image paths
    const defaultResidentialServices = [
      {
        id: "roof-installation",
        title: "Roof Installation",
        originalTitle: "Roof Installation",
        icon: "FaTools",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_1.jpeg",
        subtitle: "Professional Installation"
      },
      {
        id: "roof-repair",
        title: "Roof Repair",
        originalTitle: "Roof Repair",
        icon: "FaHardHat",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_2.jpeg",
        subtitle: "Expert Repairs"
      },
      {
        id: "maintenance",
        title: "Maintenance",
        originalTitle: "Maintenance",
        icon: "FaBroom",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_3.jpeg",
        subtitle: "Regular Maintenance"
      },
      {
        id: "inspection",
        title: "Inspection",
        originalTitle: "Inspection",
        icon: "FaFan",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_4.jpg",
        subtitle: "Thorough Inspection"
      }
    ];

    // Default commercial services with copy images
    const defaultCommercialServices = [
      {
        id: "commercial-installation",
        title: "Commercial Installation",
        originalTitle: "Commercial Installation",
        icon: "FaBuilding",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_1 copy.jpeg",
        subtitle: "Large Scale Installation"
      },
      {
        id: "commercial-repair",
        title: "Commercial Repair",
        originalTitle: "Commercial Repair",
        icon: "FaWarehouse",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_2 copy.jpeg",
        subtitle: "Industrial Repairs"
      },
      {
        id: "commercial-maintenance",
        title: "Commercial Maintenance",
        originalTitle: "Commercial Maintenance",
        icon: "FaSmog",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_3 copy.jpeg",
        subtitle: "Commercial Upkeep"
      },
      {
        id: "commercial-inspection",
        title: "Commercial Inspection",
        originalTitle: "Commercial Inspection",
        icon: "FaPaintRoller",
        iconPack: "fa",
        image: "/personal/old/img/main_page_images/ServiceSliderBlock/service_4 copy.jpg",
        subtitle: "Professional Assessment"
      }
    ];

    return {
      ...initialConfig,
      title: initialConfig.title || "Services",
      residentialButtonText:
        initialConfig.residentialButtonText || "Residential",
      commercialButtonText: initialConfig.commercialButtonText || "Commercial",

      residentialButtonIcon: initialConfig.residentialButtonIcon || {
        pack: "lucide",
        name: "Home",
      },
      commercialButtonIcon: initialConfig.commercialButtonIcon || {
        pack: "lucide",
        name: "Building2",
      },

      activeButtonConfig: initialConfig.activeButtonConfig || {
        bgColor: initialConfig.activeButtonBgColor || "#FF5733",
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      inactiveButtonConfig: initialConfig.inactiveButtonConfig || {
        bgColor: initialConfig.inactiveButtonBgColor || "#6c757d",
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },
      serviceItemConfig: initialConfig.serviceItemConfig || {
        bgColor: "#1F2937",
        textColor: "#FFFFFF",
        iconColor: "#FFFFFF",
      },

      residentialServices: ensureOriginalTitle(
        initialConfig.residentialServices?.length > 0 
          ? initialConfig.residentialServices 
          : defaultResidentialServices
      ),
      commercialServices: ensureOriginalTitle(
        initialConfig.commercialServices?.length > 0 
          ? initialConfig.commercialServices 
          : defaultCommercialServices
      ),
      largeResidentialImg: initializeImageState(
        initialConfig.largeResidentialImg,
        "/assets/images/main_image_expanded.jpg"
      ),
      largeCommercialImg: initializeImageState(
        initialConfig.largeCommercialImg,
        "/assets/images/commercialservices.jpg"
      ),
      isCommercial: initialConfig.isCommercial || false,

      // New styling options
      styling: {
        hasGradient: initialConfig.styling?.hasGradient || false,
        shadowVariant: initialConfig.styling?.shadowVariant || "default",
        desktopHeightVH: initialConfig.styling?.desktopHeightVH || 30,
        mobileHeightVW: initialConfig.styling?.mobileHeightVW || 50,
        gradientConfig: initialConfig.styling?.gradientConfig || {
          startColor: "#FF5733",
          endColor: "#FF8C42",
          direction: "to right",
        },
        ...initialConfig.styling,
      },
    };
  });

  const [currentEditDisplayType, setCurrentEditDisplayType] = useState(
    localData.isCommercial ? "commercial" : "residential"
  );
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingServiceInfo, setEditingServiceInfo] = useState({
    type: null,
    index: null,
    field: null,
  });
  const [hasInitialAnimationPlayed, setHasInitialAnimationPlayed] =
    useState(false);
  const [initialAnimationControls, setInitialAnimationControls] = useState({});

  const prevReadOnlyRef = useRef(readOnly);
  const componentRef = useRef(null);

  // Initial pulse animation effect - triggers when component is 70% visible
  useEffect(() => {
    if (!hasInitialAnimationPlayed && readOnly && !localData.isCommercial) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
              const residentialServices = localData.residentialServices || [];
              const numServices = residentialServices.length;

              if (numServices > 0) {
                const animationSequence = () => {
                  const controls = {};

                  // Initialize all items in rest state
                  residentialServices.forEach((_, index) => {
                    controls[index] = {
                      scale: 1,
                      borderRadius: "50%",
                      iconOpacity: 1,
                      imgOpacity: 0,
                    };
                  });
                  setInitialAnimationControls(controls);

                  // Staggered expand animation (left to right)
                  for (let i = 0; i < numServices; i++) {
                    // Open each item with staggered timing
                    setTimeout(() => {
                      setInitialAnimationControls((prev) => ({
                        ...prev,
                        [i]: {
                          scale: 1.15,
                          borderRadius: "10%",
                          iconOpacity: 0,
                          imgOpacity: 1,
                        },
                      }));
                    }, i * 500); // 0.3s expand + 0.2s wait = 0.5s stagger

                    // Close each item 3 seconds after it opened (staggered closing)
                    setTimeout(
                      () => {
                        setInitialAnimationControls((prev) => ({
                          ...prev,
                          [i]: {
                            scale: 1,
                            borderRadius: "50%",
                            iconOpacity: 1,
                            imgOpacity: 0,
                          },
                        }));
                      },
                      i * 500 + 3000
                    ); // Open time + 3 seconds
                  }

                  // Clean up after the last animation is complete
                  setTimeout(
                    () => {
                      setInitialAnimationControls({});
                    },
                    (numServices - 1) * 500 + 3000 + 300
                  ); // Last open + 3s + transition time
                };

                animationSequence();
                setHasInitialAnimationPlayed(true);
                observer.disconnect(); // Stop observing after animation starts
              }
            }
          });
        },
        {
          threshold: 0.7, // Trigger when 70% of component is visible
          rootMargin: "0px",
        }
      );

      if (componentRef.current) {
        observer.observe(componentRef.current);
      }

      return () => observer.disconnect();
    }
  }, [
    hasInitialAnimationPlayed,
    readOnly,
    localData.isCommercial,
    localData.residentialServices,
  ]);

  useEffect(() => {
    if (config) {
      setLocalData((prevLocalData) => {
        const newResImg = initializeImageState(
          config.largeResidentialImg,
          prevLocalData.largeResidentialImg?.url ||
            "/assets/images/main_image_expanded.jpg"
        );
        const newComImg = initializeImageState(
          config.largeCommercialImg,
          prevLocalData.largeCommercialImg?.url ||
            "/assets/images/commercialservices.jpg"
        );

        if (
          prevLocalData.largeResidentialImg?.file &&
          prevLocalData.largeResidentialImg.url?.startsWith("blob:") &&
          prevLocalData.largeResidentialImg.url !== newResImg.url
        ) {
          URL.revokeObjectURL(prevLocalData.largeResidentialImg.url);
        }
        if (
          prevLocalData.largeCommercialImg?.file &&
          prevLocalData.largeCommercialImg.url?.startsWith("blob:") &&
          prevLocalData.largeCommercialImg.url !== newComImg.url
        ) {
          URL.revokeObjectURL(prevLocalData.largeCommercialImg.url);
        }

        const mergeServices = (propServices, localServices) => {
          return (propServices || localServices || []).map((serviceConfig) => {
            const localService = localServices?.find(
              (s) =>
                (s.id || slugify(s.originalTitle || s.title)) ===
                (serviceConfig.id ||
                  slugify(serviceConfig.originalTitle || serviceConfig.title))
            );
            const title =
              localService &&
              localService.title !== serviceConfig.title &&
              localService.title !== (config.title || "")
                ? localService.title
                : serviceConfig.title || "";
            const originalTitle =
              serviceConfig.originalTitle ||
              localService?.originalTitle ||
              title;
            return {
              ...serviceConfig,
              id:
                serviceConfig.id || localService?.id || slugify(originalTitle),
              icon:
                serviceConfig.icon !== undefined
                  ? serviceConfig.icon
                  : localService?.icon || "FaTools",
              iconPack:
                serviceConfig.iconPack !== undefined
                  ? serviceConfig.iconPack
                  : localService?.iconPack || "fa",
              title: title,
              originalTitle: originalTitle,
            };
          });
        };

        const newResidentialServices = mergeServices(
          config.residentialServices,
          prevLocalData.residentialServices
        );
        const newCommercialServices = mergeServices(
          config.commercialServices,
          prevLocalData.commercialServices
        );

        const updatedData = {
          ...prevLocalData,
          ...config,

          title:
            prevLocalData.title !== config.title &&
            prevLocalData.title !== (config.title || "Services")
              ? prevLocalData.title
              : config.title || "Services",
          residentialButtonText:
            prevLocalData.residentialButtonText !==
              config.residentialButtonText &&
            prevLocalData.residentialButtonText !==
              (config.residentialButtonText || "Residential")
              ? prevLocalData.residentialButtonText
              : config.residentialButtonText || "Residential",
          commercialButtonText:
            prevLocalData.commercialButtonText !==
              config.commercialButtonText &&
            prevLocalData.commercialButtonText !==
              (config.commercialButtonText || "Commercial")
              ? prevLocalData.commercialButtonText
              : config.commercialButtonText || "Commercial",

          residentialButtonIcon: config.residentialButtonIcon ||
            prevLocalData.residentialButtonIcon || {
              pack: "lucide",
              name: "Home",
            },
          commercialButtonIcon: config.commercialButtonIcon ||
            prevLocalData.commercialButtonIcon || {
              pack: "lucide",
              name: "Building2",
            },

          activeButtonConfig: config.activeButtonConfig ||
            prevLocalData.activeButtonConfig || {
              bgColor: "#FF5733",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            },
          inactiveButtonConfig: config.inactiveButtonConfig ||
            prevLocalData.inactiveButtonConfig || {
              bgColor: "#6c757d",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            },
          serviceItemConfig: config.serviceItemConfig ||
            prevLocalData.serviceItemConfig || {
              bgColor: "#1F2937",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            },

          residentialServices: newResidentialServices,
          commercialServices: newCommercialServices,

          largeResidentialImg: newResImg,
          largeCommercialImg: newComImg,
          isCommercial:
            config.isCommercial !== undefined
              ? config.isCommercial
              : prevLocalData.isCommercial,
        };
        return updatedData;
      });
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === true && readOnly === false) {
      setCurrentEditDisplayType(
        localData.isCommercial ? "commercial" : "residential"
      );
    }
    prevReadOnlyRef.current = readOnly; // Update ref after comparison
  }, [readOnly, localData.isCommercial]);

  useEffect(() => {
    // This effect now only handles committing changes when exiting edit mode.
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log(
          "ServiceSliderBlock: Exiting edit mode. Calling onConfigChange."
        );
        const dataToSave = { ...localData };

        // Ensure image data is prepared correctly for saving
        if (localData.largeResidentialImg?.file) {
          dataToSave.largeResidentialImg = { ...localData.largeResidentialImg };
        } else {
          dataToSave.largeResidentialImg = {
            url:
              localData.largeResidentialImg?.originalUrl ||
              localData.largeResidentialImg?.url,
            name:
              localData.largeResidentialImg?.name ||
              (
                localData.largeResidentialImg?.originalUrl ||
                localData.largeResidentialImg?.url
              )
                ?.split("/")
                .pop(),
          };
        }

        if (localData.largeCommercialImg?.file) {
          dataToSave.largeCommercialImg = { ...localData.largeCommercialImg };
        } else {
          dataToSave.largeCommercialImg = {
            url:
              localData.largeCommercialImg?.originalUrl ||
              localData.largeCommercialImg?.url,
            name:
              localData.largeCommercialImg?.name ||
              (
                localData.largeCommercialImg?.originalUrl ||
                localData.largeCommercialImg?.url
              )
                ?.split("/")
                .pop(),
          };
        }
        onConfigChange(dataToSave);
      }
    }
    // prevReadOnlyRef.current is updated in the other useEffect for readOnly
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData((prevState) => {
      const newState =
        typeof updater === "function"
          ? updater(prevState)
          : { ...prevState, ...updater };
      if (newState.hasOwnProperty("isCommercial")) {
        setCurrentEditDisplayType(
          newState.isCommercial ? "commercial" : "residential"
        );
      }
      // If not in readOnly mode, call onConfigChange immediately with the new state
      if (!readOnly && onConfigChange) {
        const dataToSave = { ...newState };
        if (newState.largeResidentialImg?.file) {
          dataToSave.largeResidentialImg = { ...newState.largeResidentialImg };
        } else {
          dataToSave.largeResidentialImg = {
            url:
              newState.largeResidentialImg?.originalUrl ||
              newState.largeResidentialImg?.url,
            name:
              newState.largeResidentialImg?.name ||
              (
                newState.largeResidentialImg?.originalUrl ||
                newState.largeResidentialImg?.url
              )
                ?.split("/")
                .pop(),
          };
        }
        if (newState.largeCommercialImg?.file) {
          dataToSave.largeCommercialImg = { ...newState.largeCommercialImg };
        } else {
          dataToSave.largeCommercialImg = {
            url:
              newState.largeCommercialImg?.originalUrl ||
              newState.largeCommercialImg?.url,
            name:
              newState.largeCommercialImg?.name ||
              (
                newState.largeCommercialImg?.originalUrl ||
                newState.largeCommercialImg?.url
              )
                ?.split("/")
                .pop(),
          };
        }
        onConfigChange(dataToSave);
      }
      return newState;
    });
  };

  const openIconModalForServiceItem = (serviceType, index) => {
    if (readOnly) return;
    setEditingServiceInfo({
      type: serviceType,
      index: index,
      field: "serviceItem",
    });
    setIsIconModalOpen(true);
  };

  const handleIconSelectAndSave = (pack, iconName) => {
    if (
      editingServiceInfo.field === "serviceItem" &&
      editingServiceInfo.type &&
      editingServiceInfo.index !== null
    ) {
      const serviceListKey =
        editingServiceInfo.type === "residential"
          ? "residentialServices"
          : "commercialServices";
      handleLocalDataChange((prev) => {
        const updatedServices = [...(prev[serviceListKey] || [])];
        if (updatedServices[editingServiceInfo.index]) {
          updatedServices[editingServiceInfo.index] = {
            ...updatedServices[editingServiceInfo.index],
            icon: iconName,
            iconPack: pack,
          };
        }
        return { ...prev, [serviceListKey]: updatedServices };
      });
    }
    setIsIconModalOpen(false);
    setEditingServiceInfo({ type: null, index: null, field: null });
  };

  const displayType = readOnly
    ? localData.isCommercial
      ? "commercial"
      : "residential"
    : currentEditDisplayType;
  const servicesForDisplay =
    displayType === "commercial"
      ? localData.commercialServices || []
      : localData.residentialServices || [];
  const wrapperClassName = `w-full bg-black relative ${readOnly ? "mt-3" : ""}`;

  // Get shadow classes based on variant
  const getShadowClasses = (variant) => {
    switch (variant) {
      case "soft":
        return "shadow-lg";
      case "medium":
        return "shadow-xl drop-shadow-md";
      case "strong":
        return "shadow-2xl drop-shadow-lg";
      default:
        return "shadow-md";
    }
  };

  // Get button style based on gradient settings
  const getButtonStyle = (isActive) => {
    const config = isActive
      ? localData.activeButtonConfig
      : localData.inactiveButtonConfig;

    if (localData.styling?.hasGradient && isActive) {
      const { startColor, endColor, direction } =
        localData.styling.gradientConfig || {};
      return {
        background: `linear-gradient(${direction || "to right"}, ${startColor || config.bgColor}, ${endColor || config.bgColor})`,
        color: config.textColor,
      };
    }

    return {
      backgroundColor: config.bgColor,
      color: config.textColor,
    };
  };

  // Calculate dynamic height based on styling
  const dynamicHeight =
    window.innerWidth < 768
      ? `${localData.styling?.mobileHeightVW || 50}vw`
      : `${localData.styling?.desktopHeightVH || 30}vh`;

  /* ---------------------------------------------------------------------
     TOGGLE BUTTONS (Residential  | Commercial)
     ------------------------------------------------------------------*/
  // Rectangle buttons that jut out from the left and animate when active
  const commonButtonClass =
    "flex pr-3 py-2  pl-6 my-1 rounded-r-md shadow-lg transform origin-right transition-all duration-300 font-serif";
  const activeButtonClass = "scale-110 translate-x-4 text-white";
  const inactiveButtonClass = "bg-gray-600 text-white opacity-80";

  // Mobile-specific button classes (smaller, rounded left corners, less padding)
  const mobileButtonClass =
    "flex px-2 py-1 my-1 rounded-l-md rounded-r-md shadow-lg transform origin-right transition-all duration-300 font-serif";
  const mobileActiveButtonClass = "scale-105 text-white";
  const mobileInactiveButtonClass = "bg-gray-600 text-white opacity-80";

  // Default placeholder used when a service hover image is not provided
  const DEFAULT_SERVICE_HOVER_IMG = "/assets/images/clipped.png";

  const renderPreview = () => (
    <div className={wrapperClassName} ref={componentRef}>
      {/* Small Screen */}
      <div className="block md:hidden relative w-full">
        <div
          className="overflow-hidden w-full relative"
          style={{ height: dynamicHeight }}
        >
          <motion.div
            animate={{ x: displayType === "commercial" ? "-50%" : "0%" }}
            transition={{ duration: 0.8 }}
            className="flex w-[200%] h-full"
          >
            <img
              src={getDisplayUrl(localData.largeResidentialImg)}
              alt="Residential Services"
              className="w-1/2 h-full object-cover"
            />
            <img
              src={getDisplayUrl(localData.largeCommercialImg)}
              alt="Commercial Services"
              className="w-1/2 h-full object-cover"
            />
          </motion.div>
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-[9.5vh] bg-black z-10 pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
        {/*  ------------------  TOGGLE BUTTONS (SMALL)  ------------------ */}
        <div className="absolute top-[2vh] left-0 right-0 z-30 flex flex-row justify-center items-center space-x-4 px-4">
          <motion.button
            onClick={() =>
              readOnly
                ? handleLocalDataChange((prev) => ({
                    ...prev,
                    isCommercial: false,
                  }))
                : setCurrentEditDisplayType("residential")
            }
            style={getButtonStyle(displayType === "residential")}
            className={`${mobileButtonClass} ${displayType === "residential" ? mobileActiveButtonClass : mobileInactiveButtonClass}`}
            animate={{ scale: displayType === "residential" ? 1.05 : 1 }}
          >
            {React.createElement(
              resolveIcon(
                localData.residentialButtonIcon.name,
                localData.residentialButtonIcon.pack
              ),
              {
                className: "mr-1",
                size: 14,
                style: {
                  color:
                    displayType === "residential"
                      ? localData.activeButtonConfig.iconColor
                      : localData.inactiveButtonConfig.iconColor,
                },
              }
            )}
            {readOnly ? (
              <p className="text-[3.5vw] font-sans">
                {localData.residentialButtonText}
              </p>
            ) : (
              <input
                type="text"
                value={localData.residentialButtonText}
                onChange={(e) =>
                  handleLocalDataChange((prev) => ({
                    ...prev,
                    residentialButtonText: e.target.value,
                  }))
                }
                className="text-[3.5vw] font-sans bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1"
                placeholder="Residential"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </motion.button>
          <motion.button
            onClick={() =>
              readOnly
                ? handleLocalDataChange((prev) => ({
                    ...prev,
                    isCommercial: true,
                  }))
                : setCurrentEditDisplayType("commercial")
            }
            style={getButtonStyle(displayType === "commercial")}
            className={`${mobileButtonClass} ${displayType === "commercial" ? mobileActiveButtonClass : mobileInactiveButtonClass}`}
            animate={{ scale: displayType === "commercial" ? 1.05 : 1 }}
          >
            {React.createElement(
              resolveIcon(
                localData.commercialButtonIcon.name,
                localData.commercialButtonIcon.pack
              ),
              {
                className: "mr-1",
                size: 14,
                style: {
                  color:
                    displayType === "commercial"
                      ? localData.activeButtonConfig.iconColor
                      : localData.inactiveButtonConfig.iconColor,
                },
              }
            )}
            {readOnly ? (
              <p className="text-[3.5vw] font-sans">
                {localData.commercialButtonText}
              </p>
            ) : (
              <input
                type="text"
                value={localData.commercialButtonText}
                onChange={(e) =>
                  handleLocalDataChange((prev) => ({
                    ...prev,
                    commercialButtonText: e.target.value,
                  }))
                }
                className="text-[3.5vw] font-sans bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1"
                placeholder="Commercial"
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </motion.button>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-start pt-[15vh] p-2 z-20">
          {" "}
          {/* Adjusted pt for button row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={
                displayType === "commercial"
                  ? "commercial-services"
                  : "residential-services"
              }
              className="grid grid-cols-2 gap-x-4 gap-y-8 w-full px-4" // Changed to grid-cols-2 and added gap-y, w-full, px-4
              variants={containerVariants}
              initial="initial"
              animate="enter"
              exit="exit"
            >
              {servicesForDisplay
                .slice()
                .reverse()
                .map((service, index_reversed) => {
                  const originalIndex =
                    servicesForDisplay.length - 1 - index_reversed;
                  const serviceId =
                    service.id ||
                    slugify(service.originalTitle || service.title);
                  // Link generation for read-only mode
                  const serviceLink = readOnly
                    ? `/services/${displayType}/${serviceId}`
                    : undefined;

                  const hoverVariants = {
                    rest: { scale: 1, borderRadius: "50%" },
                    hover: {
                      scale: 1.15,
                      borderRadius: "10%",
                      transition: { duration: 0.3 },
                    },
                  };
                  const iconFade = {
                    rest: { opacity: 1 },
                    hover: { opacity: 0, transition: { duration: 0.15 } },
                  };
                  const imgFade = {
                    rest: { opacity: 0 },
                    hover: {
                      opacity: 1,
                      transition: { delay: 0.15, duration: 0.2 },
                    },
                  };

                  const serviceContent = (
                    <motion.div
                      onClick={() =>
                        !readOnly &&
                        openIconModalForServiceItem(displayType, originalIndex)
                      }
                      className={`relative overflow-hidden dark_button flex-col w-full h-28 flex items-center justify-center text-white text-[6vh] ${!readOnly ? "cursor-pointer" : "cursor-default"} ${getShadowClasses(localData.styling?.shadowVariant || "default")}`}
                      style={{
                        backgroundColor: localData.serviceItemConfig.bgColor,
                      }}
                      variants={hoverVariants}
                      initial="rest"
                      whileHover="hover"
                      animate={
                        initialAnimationControls[originalIndex]
                          ? {
                              scale:
                                initialAnimationControls[originalIndex].scale,
                              borderRadius:
                                initialAnimationControls[originalIndex]
                                  .borderRadius,
                            }
                          : undefined
                      }
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div
                        variants={iconFade}
                        className="z-10"
                        animate={
                          initialAnimationControls[originalIndex]
                            ? {
                                opacity:
                                  initialAnimationControls[originalIndex]
                                    .iconOpacity,
                              }
                            : undefined
                        }
                        transition={{ duration: 0.15 }}
                      >
                        {React.createElement(
                          resolveIcon(service.icon, service.iconPack),
                          {
                            className: "w-[5vw] h-[5vw] md:w-10 md:h-10",
                            style: {
                              color: localData.serviceItemConfig.iconColor,
                            },
                          }
                        )}
                      </motion.div>
                      <motion.img
                        variants={imgFade}
                        src={service.image || DEFAULT_SERVICE_HOVER_IMG}
                        alt="service"
                        className="absolute inset-0 w-full h-full object-cover"
                        animate={
                          initialAnimationControls[originalIndex]
                            ? {
                                opacity:
                                  initialAnimationControls[originalIndex]
                                    .imgOpacity,
                              }
                            : undefined
                        }
                        transition={{ delay: 0.15, duration: 0.2 }}
                      />
                      {readOnly ? (
                        <h3
                          className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                          style={{
                            color: localData.serviceItemConfig.textColor,
                          }}
                        >
                          {service.title}
                        </h3>
                      ) : (
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => {
                            const serviceListKey =
                              displayType === "residential"
                                ? "residentialServices"
                                : "commercialServices";
                            handleLocalDataChange((prev) => {
                              const updatedServices = [
                                ...(prev[serviceListKey] || []),
                              ];
                              if (updatedServices[originalIndex]) {
                                updatedServices[originalIndex] = {
                                  ...updatedServices[originalIndex],
                                  title: e.target.value,
                                };
                              }
                              return {
                                ...prev,
                                [serviceListKey]: updatedServices,
                              };
                            });
                          }}
                          className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-left "
                          placeholder="Title"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: localData.serviceItemConfig.textColor,
                          }}
                        />
                      )}
                      {/* Extra sub text reveal */}
                      <motion.span
                        variants={imgFade}
                        className="absolute bottom-2 text-xs text-white drop-shadow"
                      >
                        {service.subtitle || "More Info"}
                      </motion.span>
                    </motion.div>
                  );

                  return (
                    <motion.div
                      key={serviceId || originalIndex}
                      variants={itemVariants}
                      className="flex flex-col items-center"
                    >
                      {readOnly && serviceLink ? (
                        <Link to={serviceLink} className="block w-full">
                          {serviceContent}
                        </Link>
                      ) : (
                        serviceContent
                      )}
                    </motion.div>
                  );
                })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Large Screen */}
      <div className="hidden md:block overflow-hidden">
        <div className="relative w-full" style={{ height: dynamicHeight }}>
          <motion.div
            animate={{ x: displayType === "commercial" ? "-50%" : "0%" }}
            transition={{ duration: 1 }}
            className="flex w-[200%] h-full"
          >
            <img
              src={getDisplayUrl(localData.largeResidentialImg)}
              alt="Residential Services"
              className="w-1/2 h-full object-cover"
            />
            <img
              src={getDisplayUrl(localData.largeCommercialImg)}
              alt="Commercial Services"
              className="w-1/2 h-full object-cover"
            />
          </motion.div>
          <div className="absolute -top-5 w-full flex justify-center">
            {readOnly ? (
              <h2 className="relative z-40 text-white text-[8vh] tracking-wider font-serif first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] select-none">
                {localData.title}
              </h2>
            ) : (
              <input
                type="text"
                value={localData.title}
                onChange={(e) =>
                  handleLocalDataChange((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                className="relative z-40 text-white text-[8vh] tracking-wider font-serif bg-transparent text-left px-2 min-w-[50vw]"
                placeholder="Section Title"
              />
            )}
          </div>
          {/*  ------------------  TOGGLE BUTTONS (LARGE)  ------------------ */}
          <div className="absolute top-2 left-0 z-30 flex flex-col">
            <motion.button
              onClick={() =>
                readOnly
                  ? handleLocalDataChange((prev) => ({
                      ...prev,
                      isCommercial: false,
                    }))
                  : setCurrentEditDisplayType("residential")
              }
              style={getButtonStyle(displayType === "residential")}
              className={`${commonButtonClass} ${displayType === "residential" ? activeButtonClass : inactiveButtonClass}`}
              animate={{
                x: displayType === "residential" ? 12 : 0,
                scale: displayType === "residential" ? 1.1 : 1,
              }}
            >
              {React.createElement(
                resolveIcon(
                  localData.residentialButtonIcon.name,
                  localData.residentialButtonIcon.pack
                ),
                {
                  className: "mr-2",
                  size: 24,
                  style: { color: localData.activeButtonConfig.iconColor },
                }
              )}
              {readOnly ? (
                localData.residentialButtonText
              ) : (
                <input
                  type="text"
                  value={localData.residentialButtonText}
                  onChange={(e) =>
                    handleLocalDataChange((prev) => ({
                      ...prev,
                      residentialButtonText: e.target.value,
                    }))
                  }
                  className="bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1"
                  placeholder="Residential"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.button>
            <motion.button
              onClick={() =>
                readOnly
                  ? handleLocalDataChange((prev) => ({
                      ...prev,
                      isCommercial: true,
                    }))
                  : setCurrentEditDisplayType("commercial")
              }
              style={getButtonStyle(displayType === "commercial")}
              className={`${commonButtonClass} ${displayType === "commercial" ? activeButtonClass : inactiveButtonClass}`}
              animate={{
                x: displayType === "commercial" ? 12 : 0,
                scale: displayType === "commercial" ? 1.1 : 1,
              }}
            >
              {React.createElement(
                resolveIcon(
                  localData.commercialButtonIcon.name,
                  localData.commercialButtonIcon.pack
                ),
                {
                  className: "mr-2",
                  size: 24,
                  style: { color: localData.activeButtonConfig.iconColor },
                }
              )}
              {readOnly ? (
                localData.commercialButtonText
              ) : (
                <input
                  type="text"
                  value={localData.commercialButtonText}
                  onChange={(e) =>
                    handleLocalDataChange((prev) => ({
                      ...prev,
                      commercialButtonText: e.target.value,
                    }))
                  }
                  className="bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1"
                  placeholder="Commercial"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.button>
          </div>
          <div className="absolute inset-0 flex items-center justify-center ">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  displayType === "commercial"
                    ? "commercial-lg-services"
                    : "residential-lg-services"
                }
                className="grid grid-cols-4 gap-[5.5vw]"
                variants={containerVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {servicesForDisplay
                  .slice()
                  .reverse()
                  .map((service, index_reversed) => {
                    const originalIndex =
                      servicesForDisplay.length - 1 - index_reversed;
                    const serviceId =
                      service.id ||
                      slugify(service.originalTitle || service.title);
                    const serviceLink = readOnly
                      ? `/services/${displayType}/${serviceId}`
                      : undefined;

                    const hoverVariants = {
                      rest: { scale: 1, borderRadius: "50%" },
                      hover: {
                        scale: 1.15,
                        borderRadius: "10%",
                        transition: { duration: 0.3 },
                      },
                    };
                    const iconFade = {
                      rest: { opacity: 1 },
                      hover: { opacity: 0, transition: { duration: 0.15 } },
                    };
                    const imgFade = {
                      rest: { opacity: 0 },
                      hover: {
                        opacity: 1,
                        transition: { delay: 0.15, duration: 0.2 },
                      },
                    };

                    const serviceContent = (
                      <motion.div
                        onClick={() =>
                          !readOnly &&
                          openIconModalForServiceItem(
                            displayType,
                            originalIndex
                          )
                        }
                        className={`relative overflow-hidden dark_button flex-col w-28 h-28 flex items-center justify-center text-white text-[6vh] ${!readOnly ? "cursor-pointer" : "cursor-default"} ${getShadowClasses(localData.styling?.shadowVariant || "default")}`}
                        style={{
                          backgroundColor: localData.serviceItemConfig.bgColor,
                        }}
                        variants={hoverVariants}
                        initial="rest"
                        whileHover="hover"
                        animate={
                          initialAnimationControls[originalIndex]
                            ? {
                                scale:
                                  initialAnimationControls[originalIndex].scale,
                                borderRadius:
                                  initialAnimationControls[originalIndex]
                                    .borderRadius,
                              }
                            : undefined
                        }
                        transition={{ duration: 0.3 }}
                      >
                        <motion.div
                          variants={iconFade}
                          className="z-10"
                          animate={
                            initialAnimationControls[originalIndex]
                              ? {
                                  opacity:
                                    initialAnimationControls[originalIndex]
                                      .iconOpacity,
                                }
                              : undefined
                          }
                          transition={{ duration: 0.15 }}
                        >
                          {React.createElement(
                            resolveIcon(service.icon, service.iconPack),
                            {
                              className: "w-[5vw] h-[5vw] md:w-10 md:h-10",
                              style: {
                                color: localData.serviceItemConfig.iconColor,
                              },
                            }
                          )}
                        </motion.div>
                        <motion.img
                          variants={imgFade}
                          src={service.image || DEFAULT_SERVICE_HOVER_IMG}
                          alt="service"
                          className="absolute inset-0 w-full h-full object-cover"
                          animate={
                            initialAnimationControls[originalIndex]
                              ? {
                                  opacity:
                                    initialAnimationControls[originalIndex]
                                      .imgOpacity,
                                }
                              : undefined
                          }
                          transition={{ delay: 0.15, duration: 0.2 }}
                        />
                        {readOnly ? (
                          <h3
                            className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
                            style={{
                              color: localData.serviceItemConfig.textColor,
                            }}
                          >
                            {service.title}
                          </h3>
                        ) : (
                          <input
                            type="text"
                            value={service.title}
                            onChange={(e) => {
                              const serviceListKey =
                                displayType === "residential"
                                  ? "residentialServices"
                                  : "commercialServices";
                              handleLocalDataChange((prev) => {
                                const updatedServices = [
                                  ...(prev[serviceListKey] || []),
                                ];
                                if (updatedServices[originalIndex]) {
                                  updatedServices[originalIndex] = {
                                    ...updatedServices[originalIndex],
                                    title: e.target.value,
                                  };
                                }
                                return {
                                  ...prev,
                                  [serviceListKey]: updatedServices,
                                };
                              });
                            }}
                            className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded w-full truncate"
                            placeholder="Title"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              color: localData.serviceItemConfig.textColor,
                            }}
                          />
                        )}
                      </motion.div>
                    );
                    return (
                      <motion.div
                        key={serviceId || originalIndex}
                        variants={itemVariants}
                        className="flex flex-col items-center"
                      >
                        {readOnly && serviceLink ? (
                          <Link to={serviceLink} className="block">
                            {serviceContent}
                          </Link>
                        ) : (
                          serviceContent
                        )}
                      </motion.div>
                    );
                  })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );

  // Determine current icon pack and name for the modal, depending on what's being edited
  let modalIconPack = "fa";
  let modalIconName = null;
  if (
    editingServiceInfo.field === "serviceItem" &&
    editingServiceInfo.type &&
    editingServiceInfo.index !== null
  ) {
    const serviceListKey =
      editingServiceInfo.type === "residential"
        ? "residentialServices"
        : "commercialServices";
    modalIconPack =
      localData[serviceListKey]?.[editingServiceInfo.index]?.iconPack || "fa";
    modalIconName = localData[serviceListKey]?.[editingServiceInfo.index]?.icon;
  } else if (editingServiceInfo.field === "residentialButtonIcon") {
    modalIconPack = localData.residentialButtonIcon?.pack || "lucide";
    modalIconName = localData.residentialButtonIcon?.name;
  } else if (editingServiceInfo.field === "commercialButtonIcon") {
    modalIconPack = localData.commercialButtonIcon?.pack || "lucide";
    modalIconName = localData.commercialButtonIcon?.name;
  }

  if (readOnly) {
    return renderPreview();
  }

  return (
    <>
      {renderPreview()}
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectAndSave}
        currentIconPack={modalIconPack}
        currentIconName={modalIconName}
      />
    </>
  );
}

// Expose tabsConfig for TopStickyEditPanel
ServiceSliderBlock.tabsConfig = (
  blockCurrentData,
  onControlsChange,
  themeColors
) => {
  return {
    images: (props) => (
      <ServiceSliderImagesControls
        {...props}
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
        themeColors={themeColors}
      />
    ),
    colors: (props) => (
      <ServiceSliderColorControls
        {...props}
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
        themeColors={themeColors}
      />
    ),
    styling: (props) => (
      <ServiceSliderStylingControls
        {...props}
        currentData={blockCurrentData}
        onControlsChange={onControlsChange}
      />
    ),
  };
};

/* ==============================================
   SERVICE SLIDER IMAGES CONTROLS
   ----------------------------------------------
   Handles image uploads for service banners and individual service hover images
=============================================== */
const ServiceSliderImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  // Handle changes for residential image array
  const handleResidentialImageChange = (updatedData) => {
    const images = updatedData.images || [];
    if (images.length > 0) {
      onControlsChange({
        ...currentData,
        largeResidentialImg: images[0], // Take the first (and only) image
      });
    } else {
      onControlsChange({
        ...currentData,
        largeResidentialImg: initializeImageState(
          null,
          "/assets/images/main_image_expanded.jpg"
        ),
      });
    }
  };

  // Handle changes for commercial image array
  const handleCommercialImageChange = (updatedData) => {
    const images = updatedData.images || [];
    if (images.length > 0) {
      onControlsChange({
        ...currentData,
        largeCommercialImg: images[0], // Take the first (and only) image
      });
    } else {
      onControlsChange({
        ...currentData,
        largeCommercialImg: initializeImageState(
          null,
          "/assets/images/commercialservices.jpg"
        ),
      });
    }
  };

  // Handle changes for residential service hover images
  const handleResidentialServiceImagesChange = (updatedData) => {
    const images = updatedData.images || [];
    const updatedServices = [...(currentData.residentialServices || [])];
    
    // Update each service with its corresponding image
    images.forEach((image, index) => {
      if (updatedServices[index]) {
        updatedServices[index] = {
          ...updatedServices[index],
          image: image.url || image.originalUrl || updatedServices[index].image
        };
      }
    });

    onControlsChange({
      ...currentData,
      residentialServices: updatedServices,
    });
  };

  // Handle changes for commercial service hover images
  const handleCommercialServiceImagesChange = (updatedData) => {
    const images = updatedData.images || [];
    const updatedServices = [...(currentData.commercialServices || [])];
    
    // Update each service with its corresponding image
    images.forEach((image, index) => {
      if (updatedServices[index]) {
        updatedServices[index] = {
          ...updatedServices[index],
          image: image.url || image.originalUrl || updatedServices[index].image
        };
      }
    });

    onControlsChange({
      ...currentData,
      commercialServices: updatedServices,
    });
  };

  // Convert single image objects to array format for PanelImagesController
  const residentialImageData = {
    images: currentData.largeResidentialImg
      ? [currentData.largeResidentialImg]
      : [],
  };

  const commercialImageData = {
    images: currentData.largeCommercialImg
      ? [currentData.largeCommercialImg]
      : [],
  };

  // Convert service images to array format for PanelImagesController
  const residentialServiceImagesData = {
    images: (currentData.residentialServices || []).map((service, index) => {
      // Use proper file extensions for default images
      const getDefaultImagePath = (index) => {
        const extensions = ['.jpeg', '.jpeg', '.jpeg', '.jpg']; // service_4 uses .jpg
        return `/personal/old/img/main_page_images/ServiceSliderBlock/service_${index + 1}${extensions[index]}`;
      };
      
      return {
        url: service.image || getDefaultImagePath(index),
        name: `${service.title} Hover Image`,
        originalUrl: service.image || getDefaultImagePath(index),
        file: null,
        id: `res_service_${index}_${service.id || index}`
      };
    })
  };

  const commercialServiceImagesData = {
    images: (currentData.commercialServices || []).map((service, index) => {
      // Use proper file extensions for copy images
      const getDefaultCopyImagePath = (index) => {
        const extensions = ['.jpeg', '.jpeg', '.jpeg', '.jpg']; // service_4 copy uses .jpg
        return `/personal/old/img/main_page_images/ServiceSliderBlock/service_${index + 1} copy${extensions[index]}`;
      };
      
      return {
        url: service.image || getDefaultCopyImagePath(index),
        name: `${service.title} Hover Image`,
        originalUrl: service.image || getDefaultCopyImagePath(index),
        file: null,
        id: `com_service_${index}_${service.id || index}`
      };
    })
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Service Images</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Residential Banner Image
          </h4>
          <PanelImagesController
            currentData={residentialImageData}
            onControlsChange={handleResidentialImageChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) => item.name || "Residential Banner"}
            maxImages={1}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Commercial Banner Image
          </h4>
          <PanelImagesController
            currentData={commercialImageData}
            onControlsChange={handleCommercialImageChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) => item.name || "Commercial Banner"}
            maxImages={1}
          />
        </div>

        <div>
          <div className="flex flex-row ">
            <h4 className="text-sm font-medium text-gray-700 ">
              Residential Service Hover Images
            </h4>
            <p className="text-xs text-gray-500 ">
              These images appear when hovering over each residential service item.
            </p>
          </div>
          <PanelImagesController
            currentData={residentialServiceImagesData}
            onControlsChange={handleResidentialServiceImagesChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) => {
              const serviceName = currentData.residentialServices?.[idx]?.title || `Service ${idx + 1}`;
              return `${serviceName} Hover Image`;
            }}
            maxImages={8}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Commercial Service Hover Images
          </h4>
          <p className="text-xs text-gray-500 mb-2">
            These images appear when hovering over each commercial service item.
          </p>
          <PanelImagesController
            currentData={commercialServiceImagesData}
            onControlsChange={handleCommercialServiceImagesChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) => {
              const serviceName = currentData.commercialServices?.[idx]?.title || `Service ${idx + 1}`;
              return `${serviceName} Hover Image`;
            }}
            maxImages={8}
          />
        </div>
      </div>

    </div>
  );
};

/* ==============================================
   SERVICE SLIDER COLOR CONTROLS
   ----------------------------------------------
   Handles color customization for buttons and text
=============================================== */
const ServiceSliderColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  const handleNestedColorChange = (configKey, field, value) => {
    onControlsChange({
      [configKey]: {
        ...(currentData[configKey] || {}),
        [field]: value,
      },
    });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Color Settings</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Active Button Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeColorPicker
              label="Background:"
              currentColorValue={
                currentData.activeButtonConfig?.bgColor || "#FF5733"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange("activeButtonConfig", "bgColor", value)
              }
              fieldName="activeButtonBgColor"
            />
            <ThemeColorPicker
              label="Text:"
              currentColorValue={
                currentData.activeButtonConfig?.textColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange(
                  "activeButtonConfig",
                  "textColor",
                  value
                )
              }
              fieldName="activeButtonTextColor"
            />
            <ThemeColorPicker
              label="Icon:"
              currentColorValue={
                currentData.activeButtonConfig?.iconColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange(
                  "activeButtonConfig",
                  "iconColor",
                  value
                )
              }
              fieldName="activeButtonIconColor"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Inactive Button Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeColorPicker
              label="Background:"
              currentColorValue={
                currentData.inactiveButtonConfig?.bgColor || "#6c757d"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange(
                  "inactiveButtonConfig",
                  "bgColor",
                  value
                )
              }
              fieldName="inactiveButtonBgColor"
            />
            <ThemeColorPicker
              label="Text:"
              currentColorValue={
                currentData.inactiveButtonConfig?.textColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange(
                  "inactiveButtonConfig",
                  "textColor",
                  value
                )
              }
              fieldName="inactiveButtonTextColor"
            />
            <ThemeColorPicker
              label="Icon:"
              currentColorValue={
                currentData.inactiveButtonConfig?.iconColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange(
                  "inactiveButtonConfig",
                  "iconColor",
                  value
                )
              }
              fieldName="inactiveButtonIconColor"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Service Item Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemeColorPicker
              label="Background:"
              currentColorValue={
                currentData.serviceItemConfig?.bgColor || "#1F2937"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange("serviceItemConfig", "bgColor", value)
              }
              fieldName="serviceItemBgColor"
            />
            <ThemeColorPicker
              label="Text:"
              currentColorValue={
                currentData.serviceItemConfig?.textColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange("serviceItemConfig", "textColor", value)
              }
              fieldName="serviceItemTextColor"
            />
            <ThemeColorPicker
              label="Icon:"
              currentColorValue={
                currentData.serviceItemConfig?.iconColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                handleNestedColorChange("serviceItemConfig", "iconColor", value)
              }
              fieldName="serviceItemIconColor"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==============================================
   SERVICE SLIDER STYLING CONTROLS
   ----------------------------------------------
   Simplified styling controls using standardized PanelStylingController
=============================================== */
const ServiceSliderStylingControls = ({ currentData, onControlsChange }) => {
  const handleGradientConfigChange = (field, value) => {
    onControlsChange({
      styling: {
        ...currentData.styling,
        gradientConfig: {
          ...(currentData.styling?.gradientConfig || {}),
          [field]: value,
        },
      },
    });
  };

  const handleStylingChange = (field, value) => {
    onControlsChange({
      styling: {
        ...currentData.styling,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Height Controls - Using Standard PanelStylingController */}
      <div>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ServiceSliderBlock"
          controlType="height"
        />
      </div>

      {/* Shadow Variants - Using Standard PanelStylingController */}
      <div>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ServiceSliderBlock"
          controlType="shadowVariants"
        />
      </div>

      {/* Gradient Controls */}
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-center">
          Button Gradient
        </h3>
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={currentData.styling?.hasGradient || false}
              onChange={(e) =>
                handleStylingChange("hasGradient", e.target.checked)
              }
              className="mr-2"
            />
            <span className="text-sm">Enable gradient for active buttons</span>
          </label>

          {currentData.styling?.hasGradient && (
            <div className="space-y-3 pl-4 border-l-2 border-blue-200">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Color:
                </label>
                <input
                  type="color"
                  value={
                    currentData.styling?.gradientConfig?.startColor || "#FF5733"
                  }
                  onChange={(e) =>
                    handleGradientConfigChange("startColor", e.target.value)
                  }
                  className="w-full h-10 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  End Color:
                </label>
                <input
                  type="color"
                  value={
                    currentData.styling?.gradientConfig?.endColor || "#FF8C42"
                  }
                  onChange={(e) =>
                    handleGradientConfigChange("endColor", e.target.value)
                  }
                  className="w-full h-10 rounded border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Direction:
                </label>
                <select
                  value={
                    currentData.styling?.gradientConfig?.direction || "to right"
                  }
                  onChange={(e) =>
                    handleGradientConfigChange("direction", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md"
                >
                  <option value="to right">Left to Right</option>
                  <option value="to left">Right to Left</option>
                  <option value="to bottom">Top to Bottom</option>
                  <option value="to top">Bottom to Top</option>
                  <option value="45deg">Diagonal (45°)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
