import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import IconSelectorModal from "../common/IconSelectorModal"; // Import IconSelectorModal here for the panel
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelFontController from "../common/PanelFontController";
import { slugify } from "../../utils/slugify"; // Import slugify
import PanelStylingController from "../common/PanelStylingController";
import DynamicIconRenderer from "../common/DynamicIconRenderer";
import { Home, Building2, HelpCircle } from "lucide-react";

// Helper to convert hex to rgba
const hexToRgba = (hex, alpha) => {
    if (!hex || hex.length < 7) hex = '#000000'; // fallback to black
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return `rgba(0, 0, 0, ${alpha})`;
    }

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Get shadow styles based on variant and color
const getShadowStyles = (variant, color) => {
  const shadowColor = color || '#000000'; // Default to black if no color is provided

  switch (variant) {
    case "soft": // shadow-lg
      return { boxShadow: `0 10px 15px -3px ${hexToRgba(shadowColor, 0.1)}, 0 4px 6px -4px ${hexToRgba(shadowColor, 0.1)}` };
    case "medium": // shadow-xl
      return { boxShadow: `0 20px 25px -5px ${hexToRgba(shadowColor, 0.1)}, 0 8px 10px -6px ${hexToRgba(shadowColor, 0.1)}` };
    case "strong": // shadow-2xl
      return { boxShadow: `0 25px 50px -12px ${hexToRgba(shadowColor, 0.25)}` };
    default: // shadow-md
      return { boxShadow: `0 4px 6px -1px ${hexToRgba(shadowColor, 0.1)}, 0 2px 4px -2px ${hexToRgba(shadowColor, 0.1)}` };
  }
};

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

// HELPER to initialize image state
const initializeImageState = (img, defaultUrl) => {
  if (img?.file instanceof File) {
    const localUrl = URL.createObjectURL(img.file);
    return {
      ...img,
      url: localUrl,
      originalUrl: img.url, // Preserve original URL if it exists
    };
  }
  return {
    url: img?.url || defaultUrl,
    name: img?.name || defaultUrl.split("/").pop(),
    file: null,
    originalUrl: img?.url || defaultUrl,
  };
};

const ServiceCard = ({
  service,
  isMobile,
  readOnly,
  onIconClick,
  onTitleChange,
  initialAnimationControls,
  serviceItemConfig,
  shadowVariant,
  shadowColor,
  textSettings,
}) => {
  const { icon, iconPack, title, image, subtitle } = service;
  const { bgColor, textColor, iconColor } = serviceItemConfig;
  const { titleTextSettings, subtitleTextSettings } = textSettings || {};

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

  return (
    <motion.div
      onClick={onIconClick}
      className={`relative overflow-hidden dark_button flex-col flex items-center justify-center text-white text-[6vh] ${
        !readOnly ? "cursor-pointer" : "cursor-default"
      } ${
        isMobile
          ? "w-20 h-20"
          : `w-28 h-28`
      }`}
      style={{ 
        backgroundColor: bgColor,
        ...(isMobile ? {} : getShadowStyles(shadowVariant || "default", shadowColor)) 
      }}
      variants={hoverVariants}
      initial="rest"
      whileHover="hover"
      animate={initialAnimationControls || undefined}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        variants={iconFade}
        className="z-10"
        animate={
          initialAnimationControls
            ? { opacity: initialAnimationControls.iconOpacity }
            : undefined
        }
        transition={{ duration: 0.15 }}
      >
        <DynamicIconRenderer
          pack={iconPack}
          name={icon}
          fallback={HelpCircle}
          size={isMobile ? 32 : 40}
          style={{ color: iconColor }}
        />
      </motion.div>
      <motion.img
        variants={imgFade}
        src={image || "/assets/images/clipped.png"}
        alt="service"
        className="absolute inset-0 w-full h-full object-cover"
        animate={
          initialAnimationControls
            ? { opacity: initialAnimationControls.imgOpacity }
            : undefined
        }
        transition={{ delay: 0.15, duration: 0.2 }}
      />
      {readOnly ? (
        <h3
          className="mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]"
          style={{ color: textColor, ...getTextStyles(titleTextSettings) }}
        >
          {title}
        </h3>
      ) : (
        <input
          type="text"
          value={title}
          onChange={onTitleChange}
          className={`mt-1 text-white text-lg drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] bg-transparent w-full ${
            isMobile
              ? "text-left"
              : "text-center focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded truncate"
          }`}
          placeholder="Title"
          onClick={(e) => e.stopPropagation()}
          style={{ color: textColor, ...getTextStyles(titleTextSettings) }}
        />
      )}
      {isMobile && (
        <motion.span
          variants={imgFade}
          className="absolute bottom-2 text-xs text-white drop-shadow"
          style={getTextStyles(subtitleTextSettings)}
        >
          {subtitle || "More Info"}
        </motion.span>
      )}
    </motion.div>
  );
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

      variant: initialConfig.variant || "split-image",
      
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
        ...initialConfig.styling,
        hasGradient: initialConfig.styling?.hasGradient || false,
        shadowVariant: initialConfig.styling?.shadowVariant || "default",
        shadowColor: initialConfig.styling?.shadowColor || '#000000',
        desktopHeightVH: initialConfig.styling?.desktopHeightVH || 30,
        mobileHeightVW: initialConfig.styling?.mobileHeightVW || 50,
        gradientConfig: initialConfig.styling?.gradientConfig || {
          startColor: "#FF5733",
          endColor: "#FF8C42",
          direction: "to right",
        },
        leftPanelBgColor: initialConfig.styling?.leftPanelBgColor || '#1f2937', // for split-image variant
        hoveredDescriptionBgColor: initialConfig.styling?.hoveredDescriptionBgColor || 'rgba(0, 0, 0, 0.5)',
        hoveredTitleColor: initialConfig.styling?.hoveredTitleColor || '#FFFFFF',
      },
      titleTextSettings: initialConfig.titleTextSettings || {
        fontFamily: "'Oswald', sans-serif",
        fontSize: 56,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: 2,
        textAlign: "center",
        color: "#FFFFFF"
      },
      buttonTextSettings: initialConfig.buttonTextSettings || {
        fontFamily: "'Montserrat', sans-serif",
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 1.5,
        letterSpacing: 0.5,
        textAlign: "center",
        color: "#FFFFFF"
      },
      serviceTitleTextSettings: initialConfig.serviceTitleTextSettings || {
        fontFamily: "'Lato', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: 0.1,
        textAlign: "center",
        color: "#FFFFFF"
      },
      serviceSubtitleTextSettings: initialConfig.serviceSubtitleTextSettings || {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: 0.2,
        textAlign: "center",
        color: "#E5E7EB"
      }
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
  const [hoveredService, setHoveredService] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  const prevReadOnlyRef = useRef(readOnly);
  const componentRef = useRef(null);
  const sliderRef = useRef(null);

  const handleServiceHover = (service) => {
    setHoveredService(service);
    if (service && service.image) {
      setActiveImage({
        id: service.id,
        url: service.image,
        title: service.title,
      });
    }
  };

  const handleServiceLeave = () => {
    setHoveredService(null);
    setActiveImage(null);
  };

  const handleMouseMove = (e) => {
    if (!sliderRef.current) return;
    const { left, top, width, height } =
      sliderRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    const image = sliderRef.current.querySelector("img");
    if (image) {
      image.style.transition = "transform 0.1s ease-out";
      image.style.transform = `scale(1.1) translateX(${x * -20}px) translateY(${y * -10}px)`;
    }
  };
  
  const handleMouseLeaveForParallax = () => {
    if (!sliderRef.current) return;
    const image = sliderRef.current.querySelector("img");
    if (image) {
      image.style.transition = "transform 0.5s ease-in-out";
      image.style.transform = `scale(1.1) translateX(0px) translateY(0px)`;
    }
  };

  const largeImageToDisplay = localData.isCommercial
    ? localData.largeCommercialImg
    : localData.largeResidentialImg;

  const getDisplayUrl = (service, fallbackImage) => {
    const defaultUrl = "/assets/images/clipped.png";
    if (service?.file) return URL.createObjectURL(service.file);
    if (service?.url) return service.url;
    if (fallbackImage?.file) return URL.createObjectURL(fallbackImage.file);
    if (fallbackImage?.url) return fallbackImage.url;
    return defaultUrl;
  };
  
  const getGradientStyle = () => {
    const styling = localData.styling;
    if (!styling?.hasGradient) {
      return {};
    }
    const {
      startColor = "#FF5733",
      endColor = "#FF8C42",
      direction = "to right",
    } = styling.gradientConfig || {};
    return {
      background: `linear-gradient(${direction || 'to right'}, ${startColor || '#FF5733'}, ${endColor || '#FF8C42'})`,
      opacity: 0.6,
    };
  };

  const renderClassicCardsVariant = () => {
    return (
      <div
        ref={componentRef}
        className={`${wrapperClassName}`}
        style={{ 
          backgroundColor: localData.backgroundColor || "#000000",
          ...getShadowStyles(localData.styling?.shadowVariant, localData.styling?.shadowColor)
        }}
      >
        {/* Common background image slider */}
        <motion.div
          animate={{
            x:
              window.innerWidth < 768
                ? displayType === "commercial"
                  ? "-100%"
                  : "0%"
                : displayType === "commercial"
                ? "-50%"
                : "0%",
          }}
          transition={{ duration: 1 }}
          className="flex w-[200%] h-full absolute inset-0"
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
        <div 
          className="absolute inset-0 md:hidden"
          style={{ backgroundColor: localData.imageOverlayColor || "rgba(0, 0, 0, 0.1)" }}
        ></div>

        {/* Small Screen */}
        <div className="md:hidden">
          <div className="relative w-full" style={{ height: dynamicHeight }}>
            <div className="absolute top-2 right-2 flex space-x-2">
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
                className={`${mobileButtonClass} ${
                  displayType === "residential"
                    ? mobileActiveButtonClass
                    : mobileInactiveButtonClass
                }`}
              >
                <DynamicIconRenderer
                  pack={localData.residentialButtonIcon.pack}
                  name={localData.residentialButtonIcon.name}
                  fallback={Home}
                  size={14}
                  style={{ color: localData.activeButtonConfig.iconColor }}
                />
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
                className={`${mobileButtonClass} ${
                  displayType === "commercial"
                    ? mobileActiveButtonClass
                    : mobileInactiveButtonClass
                }`}
              >
                <DynamicIconRenderer
                  pack={localData.commercialButtonIcon.pack}
                  name={localData.commercialButtonIcon.name}
                  fallback={Building2}
                  size={14}
                  style={{ color: localData.activeButtonConfig.iconColor }}
                />
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={
                  displayType === "commercial"
                    ? "commercial-sm-services"
                    : "residential-sm-services"
                }
                className="absolute inset-0 grid grid-cols-4 place-items-center"
                variants={containerVariants}
                initial="initial"
                animate="enter"
                exit="exit"
              >
                {servicesForDisplay.map((service, originalIndex) => {
                  const serviceId =
                    service.id ||
                    slugify(service.originalTitle || service.title);
                  const serviceLink = readOnly
                    ? `/services/${displayType}/${serviceId}`
                    : undefined;

                  const serviceContent = (
                    <ServiceCard
                      service={service}
                      isMobile={true}
                      readOnly={readOnly}
                      onIconClick={() =>
                        !readOnly &&
                        openIconModalForServiceItem(displayType, originalIndex)
                      }
                      onTitleChange={(e) => {
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
                      initialAnimationControls={
                        initialAnimationControls[originalIndex]
                          ? {
                              scale:
                                initialAnimationControls[originalIndex].scale,
                              borderRadius:
                                initialAnimationControls[originalIndex]
                                  .borderRadius,
                              iconOpacity:
                                initialAnimationControls[originalIndex]
                                  .iconOpacity,
                              imgOpacity:
                                initialAnimationControls[originalIndex]
                                  .imgOpacity,
                            }
                          : undefined
                      }
                      serviceItemConfig={localData.serviceItemConfig}
                      textSettings={{
                        titleTextSettings: localData.serviceTitleTextSettings,
                        subtitleTextSettings: localData.serviceSubtitleTextSettings,
                      }}
                      shadowVariant={
                        localData.styling?.shadowVariant || "default"
                      }
                      shadowColor={localData.styling?.shadowColor}
                    />
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
            <div className="absolute -top-5 w-full flex justify-center">
              {readOnly ? (
                <h2 
                  className="relative z-40 text-[8vh] tracking-wider font-serif first:drop-shadow-[0_2.2px_2.2px_rgba(0,0,0,1.8)] select-none"
                  style={{ color: localData.titleColor || "#FFFFFF" }}
                >
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
                  className="relative z-40 text-[8vh] tracking-wider font-serif bg-transparent text-left px-2 min-w-[50vw]"
                  style={{ color: localData.titleColor || "#FFFFFF" }}
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
                className={`${commonButtonClass} ${
                  displayType === "residential"
                    ? activeButtonClass
                    : inactiveButtonClass
                }`}
                animate={{
                  x: displayType === "residential" ? 12 : 0,
                  scale: displayType === "residential" ? 1.1 : 1,
                }}
              >
                <DynamicIconRenderer
                  pack={localData.residentialButtonIcon.pack}
                  name={localData.residentialButtonIcon.name}
                  fallback={Home}
                  className="mr-2"
                  size={24}
                  style={{ color: localData.activeButtonConfig.iconColor }}
                />

                {readOnly ? (
                  <span style={getTextStyles(localData.buttonTextSettings)}>{localData.residentialButtonText}</span>
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
                    style={getTextStyles(localData.buttonTextSettings)}
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
                className={`${commonButtonClass} ${
                  displayType === "commercial"
                    ? activeButtonClass
                    : inactiveButtonClass
                }`}
                animate={{
                  x: displayType === "commercial" ? 12 : 0,
                  scale: displayType === "commercial" ? 1.1 : 1,
                }}
              >
                <DynamicIconRenderer
                  pack={localData.commercialButtonIcon.pack}
                  name={localData.commercialButtonIcon.name}
                  fallback={Building2}
                  className="mr-2"
                  size={24}
                  style={{ color: localData.activeButtonConfig.iconColor }}
                />
                {readOnly ? (
                  <span style={getTextStyles(localData.buttonTextSettings)}>{localData.commercialButtonText}</span>
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
                    style={getTextStyles(localData.buttonTextSettings)}
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

                      const serviceContent = (
                        <ServiceCard
                          service={service}
                          isMobile={false}
                          readOnly={readOnly}
                          onIconClick={() =>
                            !readOnly &&
                            openIconModalForServiceItem(
                              displayType,
                              originalIndex
                            )
                          }
                          onTitleChange={(e) => {
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
                          initialAnimationControls={
                            initialAnimationControls[originalIndex]
                              ? {
                                  scale:
                                    initialAnimationControls[originalIndex]
                                      .scale,
                                  borderRadius:
                                    initialAnimationControls[originalIndex]
                                      .borderRadius,
                                  iconOpacity:
                                    initialAnimationControls[originalIndex]
                                      .iconOpacity,
                                  imgOpacity:
                                    initialAnimationControls[originalIndex]
                                      .imgOpacity,
                                }
                              : undefined
                          }
                          serviceItemConfig={localData.serviceItemConfig}
                          textSettings={{
                            titleTextSettings: localData.serviceTitleTextSettings,
                            subtitleTextSettings: localData.serviceSubtitleTextSettings,
                          }}
                          shadowVariant={
                            localData.styling?.shadowVariant || "default"
                          }
                          shadowColor={localData.styling?.shadowColor}
                        />
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
  };
  
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
          variant: config.variant || prevLocalData.variant || "split-image",
          titleTextSettings: config.titleTextSettings || prevLocalData.titleTextSettings || {
            fontFamily: "'Oswald', sans-serif",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: 2,
            textAlign: "center",
            color: "#FFFFFF"
          },
          buttonTextSettings: config.buttonTextSettings || prevLocalData.buttonTextSettings || {
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.5,
            letterSpacing: 0.5,
            textAlign: "center",
            color: "#FFFFFF"
          },
          serviceTitleTextSettings: config.serviceTitleTextSettings || prevLocalData.serviceTitleTextSettings || {
            fontFamily: "'Lato', sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: 0.1,
            textAlign: "center",
            color: "#FFFFFF"
          },
          serviceSubtitleTextSettings: config.serviceSubtitleTextSettings || prevLocalData.serviceSubtitleTextSettings || {
            fontFamily: "'Lato', sans-serif",
            fontSize: 12,
            fontWeight: 400,
            lineHeight: 1.4,
            letterSpacing: 0.2,
            textAlign: "center",
            color: "#E5E7EB"
          }
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
  const wrapperClassName = `w-full relative ${readOnly ? "mt-3" : ""}`;

  // Get button style based on gradient settings
  const getButtonStyle = (isActive) => {
    const config = isActive
      ? localData.activeButtonConfig
      : localData.inactiveButtonConfig;

    if (localData.styling?.hasGradient && isActive) {
      const { startColor, endColor, direction } =
        localData.styling.gradientConfig || {};
      return {
        background: `linear-gradient(${direction || 'to right'}, ${startColor || config.bgColor}, ${endColor || config.bgColor})`,
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

  const renderSplitImageVariant = () => {
    const splitCommonButtonClass = "flex items-center justify-center px-2 py-1.5 md:px-3 rounded-md shadow-md transition-all duration-300 text-sm md:text-base";
    const splitActiveButtonClass = "scale-105";
    const splitInactiveButtonClass = "opacity-80";

    return (
    <div className="flex flex-col md:flex-row h-full" style={{ backgroundColor: localData.backgroundColor || "#000000" }}>
      {/* Left side: Buttons and service list */}
      <div 
        className={`w-full md:w-2/5 text-white p-4 md:p-6 flex flex-col justify-between`}
        style={{ 
            backgroundColor: localData.styling?.leftPanelBgColor,
            ...getShadowStyles(localData.styling?.shadowVariant, localData.styling?.shadowColor) 
        }}
      >
        <div>
          <h2 
            className="text-2xl md:text-3xl font-bold mb-4 md:mb-6"
            style={{ color: localData.titleColor || "#FFFFFF" }}
          >
            {localData.title}
          </h2>
          <div className="grid grid-cols-2 gap-2 md:gap-4 mb-4 md:mb-6">
            <motion.button
              onClick={() => handleLocalDataChange(d => ({ ...d, isCommercial: false }))}
              style={getButtonStyle(!localData.isCommercial)}
              className={`${splitCommonButtonClass} ${!localData.isCommercial ? splitActiveButtonClass : splitInactiveButtonClass}`}
              animate={{ scale: !localData.isCommercial ? 1.05 : 1 }}
            >
              <DynamicIconRenderer
                pack={localData.residentialButtonIcon?.pack}
                name={localData.residentialButtonIcon?.name}
                fallback={Home}
                className="mr-1 md:mr-2"
                size={16}
                style={{ color: (!localData.isCommercial ? localData.activeButtonConfig : localData.inactiveButtonConfig).iconColor }}
              />
              {readOnly ? (
                <span style={getTextStyles(localData.buttonTextSettings)}>{localData.residentialButtonText}</span>
              ) : (
                <input
                  type="text"
                  value={localData.residentialButtonText}
                  onChange={(e) =>
                    handleLocalDataChange((prev) => ({ ...prev, residentialButtonText: e.target.value }))
                  }
                  className="bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 w-full text-center"
                  placeholder="Residential"
                  onClick={(e) => e.stopPropagation()}
                  style={getTextStyles(localData.buttonTextSettings)}
                />
              )}
            </motion.button>
            <motion.button
              onClick={() => handleLocalDataChange(d => ({ ...d, isCommercial: true }))}
              style={getButtonStyle(localData.isCommercial)}
              className={`${splitCommonButtonClass} ${localData.isCommercial ? splitActiveButtonClass : splitInactiveButtonClass}`}
              animate={{ scale: localData.isCommercial ? 1.05 : 1 }}
            >
              <DynamicIconRenderer
                pack={localData.commercialButtonIcon?.pack}
                name={localData.commercialButtonIcon?.name}
                fallback={Building2}
                className="mr-1 md:mr-2"
                size={16}
                style={{ color: (localData.isCommercial ? localData.activeButtonConfig : localData.inactiveButtonConfig).iconColor }}
              />
              {readOnly ? (
                <span style={getTextStyles(localData.buttonTextSettings)}>{localData.commercialButtonText}</span>
              ) : (
                <input
                  type="text"
                  value={localData.commercialButtonText}
                  onChange={(e) =>
                    handleLocalDataChange((prev) => ({ ...prev, commercialButtonText: e.target.value }))
                  }
                  className="bg-transparent focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 w-full text-center"
                  placeholder="Commercial"
                  onClick={(e) => e.stopPropagation()}
                  style={getTextStyles(localData.buttonTextSettings)}
                />
              )}
            </motion.button>
          </div>
          <motion.div
            key={localData.isCommercial ? "commercial" : "residential"}
            variants={containerVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="space-y-2"
          >
            {(localData.isCommercial ? localData.commercialServices : localData.residentialServices).map(
              (service) => (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  onMouseEnter={() => handleServiceHover(service)}
                  onMouseLeave={handleServiceLeave}
                >
                  <Link
                    to={service.link || "#"}
                    className="flex items-center p-3 rounded-lg transition-colors"
                    style={{ 
                      backgroundColor: localData.serviceItemConfig?.bgColor, 
                      color: localData.serviceItemConfig?.textColor 
                    }}
                  >
                    <DynamicIconRenderer 
                      pack={service.iconPack}
                      name={service.icon}
                      fallback={HelpCircle}
                      size={20}
                      className="mr-3"
                      style={{ color: localData.serviceItemConfig?.iconColor }}
                    />
                    <span className="font-medium text-sm md:text-base">{service.title}</span>
                  </Link>
                </motion.div>
              )
            )}
          </motion.div>
        </div>
      </div>

      {/* Right side: Image display */}
      <div className="w-full md:w-3/5 relative overflow-hidden h-[50vw] md:h-auto" ref={sliderRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeaveForParallax}>
        <AnimatePresence>
          <motion.img
            key={activeImage?.id || 'background'}
            src={getDisplayUrl(activeImage, largeImageToDisplay)}
            alt={activeImage?.title || (localData.isCommercial ? "Commercial Services" : "Residential Services")}
            className="absolute top-0 left-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div 
          className="absolute inset-0"
          style={getGradientStyle()}
        />
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: localData.imageOverlayColor || "rgba(0, 0, 0, 0.2)" }}
        />
        {hoveredService && (
          <motion.div
            className="absolute bottom-4 left-4 right-4 backdrop-blur-sm text-white p-4 rounded-lg"
            style={{ backgroundColor: localData.styling?.hoveredDescriptionBgColor }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <h3 className="text-xl font-bold" style={{ color: localData.styling?.hoveredTitleColor }}>{hoveredService.title}</h3>
            {hoveredService.subtitle && (
              <p 
                className="text-sm"
                style={{ color: localData.descriptionColor || "#FFFFFF" }}
              >
                {hoveredService.subtitle}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
  };

  const renderPreview = () => {
    switch(localData.variant) {
      case 'classic-cards':
        return renderClassicCardsVariant();
      case 'split-image':
      default:
        return renderSplitImageVariant();
    }
  };

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

// Expose tabsConfig for BottomStickyEditPanel
ServiceSliderBlock.tabsConfig = (blockData, onUpdate, themeColors) => ({
  general: (props) => (
    <div className="p-4 space-y-4">
      {/* Add any additional general settings you want to include */}
    </div>
  ),
  images: (props) => (
    <ServiceSliderImagesControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  colors: (props) => (
    <ServiceSliderColorControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  styling: (props) => (
    <ServiceSliderStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  fonts: (props) => (
    <ServiceSliderFontsControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
});

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

      <div className="space-y-6">
        <div>

          <PanelImagesController
            currentData={residentialImageData}
            onControlsChange={handleResidentialImageChange}
            imageArrayFieldName="images"
            getItemName={(item, idx) => item.name || "Residential Banner"}
            maxImages={1}
          />
        </div>

        <div>
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
  const handleNestedColorChange = (configKey, field, value) => {
    onControlsChange({
      [configKey]: {
        ...(currentData[configKey] || {}),
        [field]: value,
      },
    });
  };

  const handleStylingColorChange = (field, value) => {
    onControlsChange({
      styling: {
        ...(currentData.styling || {}),
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

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Background & Overlay Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker
              label="Main Background:"
              currentColorValue={
                currentData.backgroundColor || "#000000"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                onControlsChange({ backgroundColor: value })
              }
              fieldName="backgroundColor"
            />
            <ThemeColorPicker
              label="Image Overlay:"
              currentColorValue={
                currentData.imageOverlayColor || "rgba(0, 0, 0, 0.2)"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                onControlsChange({ imageOverlayColor: value })
              }
              fieldName="imageOverlayColor"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Title & Text Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker
              label="Section Title:"
              currentColorValue={
                currentData.titleColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                onControlsChange({ titleColor: value })
              }
              fieldName="titleColor"
            />
            <ThemeColorPicker
              label="Service Description:"
              currentColorValue={
                currentData.descriptionColor || "#FFFFFF"
              }
              themeColors={themeColors}
              onColorChange={(field, value) =>
                onControlsChange({ descriptionColor: value })
              }
              fieldName="descriptionColor"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3 text-gray-700 border-b pb-1">
            Split-Image Variant Colors
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemeColorPicker
                label="Left Panel Background:"
                currentColorValue={currentData.styling?.leftPanelBgColor || '#1f2937'}
                themeColors={themeColors}
                onColorChange={(field, value) => handleStylingColorChange('leftPanelBgColor', value)}
                fieldName="leftPanelBgColor"
            />
            <ThemeColorPicker
                label="Hovered Info Background:"
                currentColorValue={currentData.styling?.hoveredDescriptionBgColor || 'rgba(0, 0, 0, 0.5)'}
                themeColors={themeColors}
                onColorChange={(field, value) => handleStylingColorChange('hoveredDescriptionBgColor', value)}
                fieldName="hoveredDescriptionBgColor"
            />
            <ThemeColorPicker
                label="Hovered Info Title:"
                currentColorValue={currentData.styling?.hoveredTitleColor || '#FFFFFF'}
                themeColors={themeColors}
                onColorChange={(field, value) => handleStylingColorChange('hoveredTitleColor', value)}
                fieldName="hoveredTitleColor"
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
const ServiceSliderStylingControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleGradientConfigChange = (field, value) => {
    const newGradientConfig = { ...(currentData.styling?.gradientConfig || {}), [field]: value };
    handleStylingChange('gradientConfig', newGradientConfig);
  };

  const handleStylingChange = (field, value) => {
    const newStyling = { ...(currentData.styling || {}), [field]: value };
    onControlsChange({ styling: newStyling });
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
          controlType="shadow"
        />
      </div>

      <div className="p-4 bg-gray-800 text-white rounded-lg">
          <ThemeColorPicker
              label="Shadow Color:"
              currentColorValue={currentData.styling?.shadowColor || '#000000'}
              themeColors={themeColors}
              onColorChange={(field, value) => handleStylingChange('shadowColor', value)}
              fieldName="shadowColor"
          />
      </div>

      {/* Variant Selector */}
      <div>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="ServiceSliderBlock"
          controlType="variants"
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
                <ThemeColorPicker
                  label="Start Color:"
                  currentColorValue={
                    currentData.styling?.gradientConfig?.startColor || "#FF5733"
                  }
                  themeColors={themeColors}
                  onColorChange={(field, value) =>
                    handleGradientConfigChange("startColor", value)
                  }
                  fieldName="gradientStartColor"
                />
              </div>
              <div>
                <ThemeColorPicker
                  label="End Color:"
                  currentColorValue={
                    currentData.styling?.gradientConfig?.endColor || "#FF8C42"
                  }
                  themeColors={themeColors}
                  onColorChange={(field, value) =>
                    handleGradientConfigChange("endColor", value)
                  }
                  fieldName="gradientEndColor"
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

/* ==============================================
   SERVICE SLIDER FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for ServiceSlider text elements
=============================================== */
const ServiceSliderFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Font Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Section Title Font
          </h4>
          <PanelFontController
            label="Title Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="titleTextSettings"
            themeColors={themeColors}
          />
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Button Text Font
          </h4>
          <PanelFontController
            label="Button Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="buttonTextSettings"
            themeColors={themeColors}
          />
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Service Title Font
          </h4>
          <PanelFontController
            label="Service Title Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="serviceTitleTextSettings"
            themeColors={themeColors}
          />
        </div>

        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Service Subtitle Font
          </h4>
          <PanelFontController
            label="Service Subtitle Font"
            currentData={currentData}
            onControlsChange={onControlsChange}
            fieldPrefix="serviceSubtitleTextSettings"
            themeColors={themeColors}
          />
        </div>
      </div>
    </div>
  );
};
