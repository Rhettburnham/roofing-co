import React, { useRef, useState, useEffect, memo } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as FaIcons from "react-icons/fa";
import IconSelectorModal from "../common/IconSelectorModal";
import PropTypes from "prop-types";

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === "string") return imageValue;
  if (typeof imageValue === "object" && imageValue.url) return imageValue.url;
  // If it's a File object directly (less common for this helper, but defensive)
  if (imageValue instanceof File) return URL.createObjectURL(imageValue);
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url, name, originalUrl} object
const initializeImageState = (imageConfig, defaultStaticPath) => {
  let file = null;
  let url = defaultStaticPath;
  let name = defaultStaticPath.split("/").pop();
  let originalUrl = defaultStaticPath; // Default originalUrl is the static default path

  if (typeof imageConfig === "string") {
    url = imageConfig;
    name = imageConfig.split("/").pop();
    originalUrl = imageConfig; // String path is the original
  } else if (imageConfig && typeof imageConfig === "object") {
    // Use provided url for display, which could be a blob or a path
    url = imageConfig.url || defaultStaticPath;
    name = imageConfig.name || url.split("/").pop();
    file = imageConfig.file || null; // Preserve file if it exists (e.g. from active editing state)

    // Determine originalUrl: prioritize existing originalUrl, then a non-blob url, then defaultStaticPath
    if (imageConfig.originalUrl) {
      originalUrl = imageConfig.originalUrl;
    } else if (
      typeof imageConfig.url === "string" &&
      !imageConfig.url.startsWith("blob:")
    ) {
      originalUrl = imageConfig.url;
    } else {
      originalUrl = defaultStaticPath; // Fallback to static default if url is blob or missing
    }
  }
  return { file, url, name, originalUrl };
};

// to do this needs to be centered where the lat is currentl seem up and to the right
const CustomMarkerIcon = (iconUrl) =>
  L.icon({
    iconUrl: getDisplayUrl(iconUrl, "/assets/images/hero/clipped.png"),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -20],
  });

const DropMarker = memo(({ position, iconUrl }) => {
  const markerRef = useRef(null);

  // Debug log for icon URL
  console.log("Using marker icon:", iconUrl);

  useEffect(() => {
    if (markerRef.current) {
      gsap.from(markerRef.current.getElement(), {
        y: -100,
        duration: 1,
        ease: "bounce.out",
      });
    }

    return () => {
      if (markerRef.current) {
        gsap.killTweensOf(markerRef.current.getElement());
      }
    };
  }, []);

  return (
    <Marker
      position={position}
      icon={CustomMarkerIcon(iconUrl)}
      ref={markerRef}
    />
  );
});

const MapInteractionHandler = memo(({ mapActive }) => {
  const map = useMap();

  useEffect(() => {
    if (!mapActive) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if (map.tap) map.tap.enable();
    }
  }, [mapActive, map]);

  return null;
});

/* --------------------------------------------------
   READ-ONLY SUBCOMPONENTS
-----------------------------------------------------*/
const StatsPanel = memo(function StatsPanel({
  stats,
  readOnly,
  onStatTextChange,
  onStatIconClick,
  statsTextColor,
}) {
  const displayStats = [...(stats || [])];
  while (displayStats.length < 4 && !readOnly) {
    displayStats.push({ value: "0", title: "New Stat", icon: "FaAward" });
  }
  const gridStats = displayStats.slice(0, 4);
  const currentStatsTextColor = statsTextColor || "#FFFFFF";

  return (
    <div
      className={`w-full h-full grid gap-2 md:gap-3 grid-cols-2 text-center p-2 md:p-3`}
    >
      {gridStats.map((stat, index) => {
        const IconComponent = FaIcons[stat.icon] || FaIcons.FaAward;
        return (
          <div
            key={stat.id || index}
            className="flex flex-col items-center justify-center bg-white/30 rounded-lg p-2 md:p-3 shadow-md h-full"
          >
            <div
              className={`p-2 rounded-full ${!readOnly ? "cursor-pointer hover:bg-white/20" : ""} transition-colors`}
              onClick={() =>
                !readOnly && onStatIconClick && onStatIconClick(index)
              }
              title={!readOnly ? "Click to change icon" : ""}
            >
              <IconComponent
                className="w-6 h-6 md:w-8 md:h-8 mb-2"
                style={{ color: currentStatsTextColor }}
              />
            </div>
            {readOnly ? (
              <div
                className="text-xl md:text-2xl font-bold mb-1"
                style={{ color: currentStatsTextColor }}
              >
                {stat.value}
              </div>
            ) : (
              <input
                type="text"
                style={{ color: currentStatsTextColor }}
                className="text-xl md:text-2xl font-bold text-white bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300 mb-1"
                value={stat.value || ""}
                onChange={(e) =>
                  onStatTextChange &&
                  onStatTextChange(index, "value", e.target.value)
                }
                placeholder="Value"
              />
            )}
            {readOnly ? (
              <div
                className="text-sm md:text-base font-medium line-clamp-1"
                style={{ color: currentStatsTextColor }}
              >
                {stat.title || stat.label}
              </div>
            ) : (
              <input
                type="text"
                style={{ color: currentStatsTextColor }}
                className="text-sm md:text-base text-white font-medium line-clamp-1 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                value={stat.title || stat.label || ""}
                onChange={(e) =>
                  onStatTextChange &&
                  onStatTextChange(index, "title", e.target.value)
                }
                placeholder="Title"
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

StatsPanel.displayName = "StatsPanel";
StatsPanel.propTypes = {
  stats: PropTypes.array,
  readOnly: PropTypes.bool,
  onStatTextChange: PropTypes.func,
  onStatIconClick: PropTypes.func,
  statsTextColor: PropTypes.string,
};

// Window strings component
const WindowStrings = memo(function WindowStrings({
  isVisible,
  isSmallScreen,
}) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Simple movement amount
  const moveAmount = isSmallScreen ? "3vh" : "5vh";

  useEffect(() => {
    // Simple toggle animation
    if (isVisible) {
      // LEFT GOES UP
      gsap.to(leftRef.current, {
        y: `-${moveAmount}`,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      });

      // RIGHT GOES DOWN
      gsap.to(rightRef.current, {
        y: moveAmount,
        duration: 1.5,
        ease: "elastic.out(1, 0.5)",
      });
    } else {
      // BOTH RETURN TO ORIGINAL
      gsap.to(leftRef.current, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
      });
      gsap.to(rightRef.current, {
        y: 0,
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }, [isVisible, moveAmount]);

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Left side */}
      <div ref={leftRef} className="flex flex-col items-center">
        <div className="w-[4px] h-[27vh] bg-gray-700"></div>
        <div
          className="w-[30px] h-[40px] bg-gray-800"
          style={{
            clipPath: "polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)",
            borderRadius: "0px 0px 8px 8px",
          }}
        ></div>
      </div>

      {/* Right side */}
      <div ref={rightRef} className="flex flex-col items-center">
        <div className="w-[4px] h-[27vh] bg-gray-700"></div>
        <div
          className="w-[30px] h-[40px] bg-gray-800"
          style={{
            clipPath: "polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)",
            borderRadius: "0px 0px 8px 8px",
          }}
        ></div>
      </div>
    </div>
  );
});

WindowStrings.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
};

// Removed `max-h-[75vh] overflow-auto` to allow full height on smaller screens and avoid vertical scrolling.
function BasicMapPreview({
  mapData,
  readOnly = true,
  onStatTextChange,
  onStatIconClick,
}) {
  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [mapActive, setMapActive] = useState(false);
  const statsDivRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 768;
      setIsSmallScreen(smallScreen);
      if (!smallScreen) {
        setIsServiceHoursVisible(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mapData) {
    return <p>No map data found.</p>;
  }

  const {
    center,
    zoomLevel,
    circleRadius,
    address,
    telephone,
    serviceHours = [],
    stats = [],
  } = mapData;

  const renderServiceHoursTable = () => (
    <table
      className={`w-full h-full rounded-xl border border-gray-300 bg-white text-center ${
        isSmallScreen ? "text-xs" : "text-sm"
      }`}
    >
      <tbody>
        {serviceHours.map((item, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? "faint-color" : ""}>
            <td className="py-2 px-2 border border-gray-300">{item.day}</td>
            <td className="py-2 px-2 border border-gray-300">{item.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <section className="overflow-hidden">
      <div className="pb-4">
        <div
          className={`flex ${isSmallScreen ? "justify-center" : "justify-start pl-8 md:pl-12"}`}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal text-black text-center font-serif">
            Are we in your area?
          </h1>
        </div>
        <div className="relative flex flex-col md:flex-row gap-6 px-6 md:px-8 lg:px-12 h-auto md:h-[45vh]">
          {/* Left: Map */}
          <div className="flex flex-col w-full md:w-[60%]">
            <div className="relative h-[35vh] md:h-[45vh] w-full z-10">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative">
                <MapContainer
                  center={center}
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={mapActive}
                  className="z-0"
                >
                  <TileLayer
                    url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=cN6b03TNjAiJuVEdoMNh"
                    attribution="&copy; MapTiler"
                  />
                  <Circle
                    center={center}
                    radius={circleRadius}
                    pathOptions={{
                      color: "transparent",
                      weight: 0,
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                  <DropMarker position={center} />
                  <MapInteractionHandler mapActive={mapActive} />
                </MapContainer>
                {!mapActive && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-20 flex flex-row items-start justify-center cursor-pointer pt-4"
                    onClick={() => setMapActive(true)}
                  >
                    <FaIcons.FaMapMarkerAlt
                      className="text-white opacity-75"
                      size={30}
                    />
                    <p className="mt-2 text-white text-sm font-serif">
                      Click to interact with the map
                    </p>
                  </div>
                )}
                {/* Bottom overlay: address + phone */}
                <div className="absolute bottom-0 w-full bg-banner text-center text-white font-semibold z-10">
                  <div className="font-semibold text-[2.5vw] md:text-[2vh] leading-tight">
                    {address}
                  </div>
                  <div className="text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight">
                    <a href={`tel:${telephone?.replace(/[^0-9]/g, "")}`}>
                      {telephone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Stats + Service Hours */}
          <div className="flex flex-col w-full md:w-[40%]">
            <button
              type="button"
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="dark_button bg-gray-700 rounded-t-xl py-2 md:py-3 items-center justify-center text-white text-base md:text-lg transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif z-20 relative"
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>
            <div
              className="relative h-[35vh] md:h-[45vh] rounded-b-xl overflow-hidden"
              ref={statsDivRef}
            >
              <WindowStrings
                isVisible={isServiceHoursVisible}
                isSmallScreen={isSmallScreen}
              />
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  <img
                    src="/assets/images/stats_background.jpg"
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <StatsPanel
                    stats={stats}
                    readOnly={readOnly}
                    onStatTextChange={onStatTextChange}
                    onStatIconClick={onStatIconClick}
                  />
                </div>
              </div>
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white border-t border-gray-300
                  transition-transform duration-500 ease-in-out
                  h-full
                  ${isServiceHoursVisible ? "translate-y-0" : "translate-y-[-100%]"}
                `}
              >
                {renderServiceHoursTable()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

BasicMapPreview.propTypes = {
  mapData: PropTypes.shape({
    center: PropTypes.arrayOf(PropTypes.number),
    zoomLevel: PropTypes.number,
    circleRadius: PropTypes.number,
    address: PropTypes.string,
    telephone: PropTypes.string,
    serviceHours: PropTypes.array,
    stats: PropTypes.array,
  }),
  readOnly: PropTypes.bool,
  onStatTextChange: PropTypes.func,
  onStatIconClick: PropTypes.func,
};

/* --------------------------------------------------
   EDITOR SUBCOMPONENTS
-----------------------------------------------------*/

// =============================================
// Control Components for Tabs
// =============================================

const BasicMapColorControls = ({ currentData, onControlsChange }) => {
  const handleColorChange = (field, value) => {
    onControlsChange({
      ...currentData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Marker Color:</label>
        <input
          type="color"
          value={currentData.markerColor || "#000000"}
          onChange={(e) => handleColorChange("markerColor", e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Circle Color:</label>
        <input
          type="color"
          value={currentData.circleColor || "#000000"}
          onChange={(e) => handleColorChange("circleColor", e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
    </div>
  );
};

BasicMapColorControls.propTypes = {
  currentData: PropTypes.shape({
    markerColor: PropTypes.string,
    circleColor: PropTypes.string,
  }).isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

const BasicMapStylingControls = ({ currentData, onControlsChange }) => {
  const handleFieldChange = (
    field,
    value,
    isCoordinate = false,
    coordIndex = 0
  ) => {
    if (isCoordinate) {
      const newCenter = [...currentData.center];
      newCenter[coordIndex] = parseFloat(value);
      onControlsChange({ ...currentData, center: newCenter });
    } else {
      onControlsChange({ ...currentData, [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Center Latitude:</label>
        <input
          type="number"
          value={currentData.center[0]}
          onChange={(e) => handleFieldChange("center", e.target.value, true, 0)}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Center Longitude:</label>
        <input
          type="number"
          value={currentData.center[1]}
          onChange={(e) => handleFieldChange("center", e.target.value, true, 1)}
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Zoom Level:</label>
        <input
          type="number"
          value={currentData.zoomLevel}
          onChange={(e) =>
            handleFieldChange("zoomLevel", parseInt(e.target.value))
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Circle Radius (meters):</label>
        <input
          type="number"
          value={currentData.circleRadius}
          onChange={(e) =>
            handleFieldChange("circleRadius", parseInt(e.target.value))
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Desktop Height (vh):</label>
        <input
          type="number"
          value={currentData.styling.desktopHeightVH}
          onChange={(e) =>
            handleFieldChange("styling", {
              ...currentData.styling,
              desktopHeightVH: parseInt(e.target.value),
            })
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Mobile Height (vw):</label>
        <input
          type="number"
          value={currentData.styling.mobileHeightVW}
          onChange={(e) =>
            handleFieldChange("styling", {
              ...currentData.styling,
              mobileHeightVW: parseInt(e.target.value),
            })
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
      </div>
    </div>
  );
};

BasicMapStylingControls.propTypes = {
  currentData: PropTypes.shape({
    center: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomLevel: PropTypes.number.isRequired,
    circleRadius: PropTypes.number.isRequired,
    styling: PropTypes.shape({
      desktopHeightVH: PropTypes.number.isRequired,
      mobileHeightVW: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

const BasicMapImageControls = ({ currentData, onControlsChange }) => {
  const handleImageFileChange = (field, file) => {
    if (!file) return;
    const currentImageState = currentData[field];

    // Revoke old blob URL if one exists
    if (
      currentImageState &&
      currentImageState.url &&
      currentImageState.url.startsWith("blob:")
    ) {
      URL.revokeObjectURL(currentImageState.url);
    }

    const fileURL = URL.createObjectURL(file);
    onControlsChange({
      ...currentData,
      [field]: {
        file: file,
        url: fileURL,
        name: file.name,
        originalUrl: currentImageState?.originalUrl || file.name,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Marker Icon:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleImageFileChange("markerIcon", e.target.files[0])
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {currentData.markerIcon?.url && (
          <img
            src={currentData.markerIcon.url}
            alt="Marker Icon"
            className="mt-2 h-8 w-auto"
          />
        )}
      </div>
      <div>
        <label className="block text-sm mb-1">Background Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            handleImageFileChange("backgroundImage", e.target.files[0])
          }
          className="w-full bg-gray-700 px-2 py-1 rounded"
        />
        {currentData.backgroundImage?.url && (
          <img
            src={currentData.backgroundImage.url}
            alt="Background"
            className="mt-2 h-20 w-auto"
          />
        )}
      </div>
    </div>
  );
};

const BasicMapControls = ({ currentData, onControlsChange }) => {
  return (
    <div className="space-y-6">
      <BasicMapStylingControls
        currentData={currentData}
        onControlsChange={onControlsChange}
      />
      <BasicMapColorControls
        currentData={currentData}
        onControlsChange={onControlsChange}
      />
      <BasicMapImageControls
        currentData={currentData}
        onControlsChange={onControlsChange}
      />
    </div>
  );
};

BasicMapControls.propTypes = {
  currentData: PropTypes.shape({
    center: PropTypes.arrayOf(PropTypes.number).isRequired,
    zoomLevel: PropTypes.number.isRequired,
    circleRadius: PropTypes.number.isRequired,
    styling: PropTypes.shape({
      desktopHeightVH: PropTypes.number.isRequired,
      mobileHeightVW: PropTypes.number.isRequired,
    }).isRequired,
    markerColor: PropTypes.string,
    circleColor: PropTypes.string,
    markerIcon: PropTypes.shape({
      file: PropTypes.object,
      url: PropTypes.string,
      name: PropTypes.string,
      originalUrl: PropTypes.string,
    }),
    backgroundImage: PropTypes.shape({
      file: PropTypes.object,
      url: PropTypes.string,
      name: PropTypes.string,
      originalUrl: PropTypes.string,
    }),
  }).isRequired,
  onControlsChange: PropTypes.func.isRequired,
};

/* --------------------------------------------------
   4) MAIN EXPORT
   If readOnly = true => BasicMapPreview
   If readOnly = false => BasicMapPreview (for inline edits) with tabsConfig
-----------------------------------------------------*/
function BasicMapBlock({
  readOnly = false,
  mapData,
  onConfigChange,
  themeColors,
}) {
  // Add console log to debug incoming mapData
  console.log("BasicMapBlock received mapData:", mapData);

  const [localMapData, setLocalMapData] = useState(() => {
    const initialConfig = mapData || {};
    let centerArray = [34.0522, -118.2437]; // Default center
    if (initialConfig.center) {
      if (
        Array.isArray(initialConfig.center) &&
        initialConfig.center.length === 2
      ) {
        centerArray = initialConfig.center;
      } else if (
        typeof initialConfig.center === "object" &&
        initialConfig.center.lat !== undefined &&
        initialConfig.center.lng !== undefined
      ) {
        centerArray = [initialConfig.center.lat, initialConfig.center.lng];
      }
    }

    return {
      title: initialConfig.title || "Are we in your area?",
      center: centerArray,
      zoomLevel: initialConfig.zoomLevel || 10,
      circleRadius: initialConfig.circleRadius || 5000,
      address: initialConfig.address || "123 Main St, Anytown, USA",
      telephone: initialConfig.telephone || "(555) 123-4567",
      serviceHours: (initialConfig.serviceHours || []).map((sh) => ({
        ...sh,
        id: sh.id || `sh_${Math.random().toString(36).substr(2, 5)}`,
      })),
      stats: (initialConfig.stats || [])
        .map((st, idx) => ({
          ...st,
          id: st.id || `stat_${idx}_${Date.now()}`,
          icon: st.icon || "FaAward",
        }))
        .slice(0, 4),
      markerIcon: initializeImageState(
        initialConfig.markerIcon,
        "/assets/images/hero/clipped.png"
      ),
      statsBackgroundImage: initializeImageState(
        initialConfig.statsBackgroundImage,
        "/assets/images/stats_background.jpg"
      ),
      bannerTextColor: initialConfig.bannerTextColor || "#FFFFFF",
      bannerBackgroundColor: initialConfig.bannerBackgroundColor || "#1f2937",
      statsTextColor: initialConfig.statsTextColor || "#FFFFFF",
      showHoursButtonText: initialConfig.showHoursButtonText || "Show Hours",
      hideHoursButtonText: initialConfig.hideHoursButtonText || "Hide Hours",
      styling: initialConfig.styling || {
        desktopHeightVH: 30,
        mobileHeightVW: 40,
      },
    };
  });

  const prevReadOnlyRef = useRef(readOnly);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingStatIndexForIcon, setEditingStatIndexForIcon] = useState(null);

  useEffect(() => {
    if (mapData) {
      setLocalMapData((prevLocal) => {
        const incomingData = { ...mapData }; // Clone mapData to safely modify

        // Transform center if it's an object in incomingData and not an array
        if (
          incomingData.center &&
          typeof incomingData.center === "object" &&
          !Array.isArray(incomingData.center)
        ) {
          if (
            incomingData.center.lat !== undefined &&
            incomingData.center.lng !== undefined
          ) {
            incomingData.center = [
              incomingData.center.lat,
              incomingData.center.lng,
            ];
          } else {
            // Malformed or incomplete center object, retain previous or default by deleting from incoming
            // so prevLocal.center (which is an array) is used.
            delete incomingData.center;
          }
        } else if (
          Array.isArray(incomingData.center) &&
          incomingData.center.length !== 2
        ) {
          // If it is an array but not a valid coordinate pair, remove it to use prevLocal.center
          delete incomingData.center;
        }

        const newMarkerIcon = initializeImageState(
          incomingData.markerIcon,
          prevLocal.markerIcon?.originalUrl || "/assets/images/hero/clipped.png" // Use existing originalUrl or static default
        );
        const newStatsBg = initializeImageState(
          incomingData.statsBackgroundImage,
          prevLocal.statsBackgroundImage?.originalUrl ||
            "/assets/images/stats_background.jpg" // Use existing originalUrl or static default
        );

        if (
          prevLocal.markerIcon?.file &&
          prevLocal.markerIcon.url?.startsWith("blob:") &&
          prevLocal.markerIcon.url !== newMarkerIcon.url
        ) {
          URL.revokeObjectURL(prevLocal.markerIcon.url);
        }
        if (
          prevLocal.statsBackgroundImage?.file &&
          prevLocal.statsBackgroundImage.url?.startsWith("blob:") &&
          prevLocal.statsBackgroundImage.url !== newStatsBg.url
        ) {
          URL.revokeObjectURL(prevLocal.statsBackgroundImage.url);
        }

        const newStatsList = (incomingData.stats || prevLocal.stats || [])
          .map((statFromProp, index) => {
            const localStat =
              prevLocal.stats?.find((s) => s.id === statFromProp.id) ||
              prevLocal.stats?.[index] ||
              {};
            const mergedStat = {
              ...localStat,
              ...statFromProp,
              id:
                statFromProp.id ||
                localStat.id ||
                `stat_update_${index}_${Date.now()}`,
              icon: statFromProp.icon || localStat.icon || "FaAward",
            };
            // Prioritize local unsaved changes for value and title if they differ from incoming prop and are not empty
            if (
              localStat.value !== statFromProp.value &&
              localStat.value !== (statFromProp.value || "")
            )
              mergedStat.value = localStat.value;
            else mergedStat.value = statFromProp.value || ""; // Default to prop or empty

            if (
              localStat.title !== statFromProp.title &&
              localStat.title !== (statFromProp.title || "")
            )
              mergedStat.title = localStat.title;
            else mergedStat.title = statFromProp.title || ""; // Default to prop or empty
            return mergedStat;
          })
          .slice(0, 4);

        return {
          ...prevLocal, // Start with previous local state
          ...incomingData, // Spread potentially modified incomingData (center is now an array or deleted)
          // Explicitly set fields that need careful merging or transformation
          title:
            prevLocal.title !== incomingData.title &&
            prevLocal.title !== (incomingData.title || "Are we in your area?")
              ? prevLocal.title
              : incomingData.title || "Are we in your area?",
          address:
            prevLocal.address !== incomingData.address &&
            prevLocal.address !== (incomingData.address || "")
              ? prevLocal.address
              : incomingData.address || "",
          telephone:
            prevLocal.telephone !== incomingData.telephone &&
            prevLocal.telephone !== (incomingData.telephone || "")
              ? prevLocal.telephone
              : incomingData.telephone || "",
          stats: newStatsList,
          serviceHours: (
            incomingData.serviceHours ||
            prevLocal.serviceHours ||
            []
          ).map((sh) => ({
            ...sh,
            id: sh.id || `sh_${Math.random().toString(36).substr(2, 5)}`,
          })),
          markerIcon: newMarkerIcon,
          statsBackgroundImage: newStatsBg,
          bannerTextColor:
            incomingData.bannerTextColor !== undefined
              ? incomingData.bannerTextColor
              : prevLocal.bannerTextColor,
          bannerBackgroundColor:
            incomingData.bannerBackgroundColor !== undefined
              ? incomingData.bannerBackgroundColor
              : prevLocal.bannerBackgroundColor,
          statsTextColor:
            incomingData.statsTextColor !== undefined
              ? incomingData.statsTextColor
              : prevLocal.statsTextColor,
          showHoursButtonText:
            incomingData.showHoursButtonText !== undefined
              ? incomingData.showHoursButtonText
              : prevLocal.showHoursButtonText,
          hideHoursButtonText:
            incomingData.hideHoursButtonText !== undefined
              ? incomingData.hideHoursButtonText
              : prevLocal.hideHoursButtonText,
          styling: incomingData.styling || prevLocal.styling,
        };
      });
    }
  }, [mapData]);

  useEffect(() => {
    return () => {
      // No file objects directly in localMapData for these anymore, so revocation logic for markerIcon/statsBg is not needed here.
      // If initializeImageState was changed to ONLY store URLs, this is fine.
      // If it CAN still store blobs (e.g. from an old config load), we might need to check localMapData.markerIcon.file etc.
      // For now, assuming initializeImageState in the main component will handle blobs if they come from 'mapData' prop only briefly.
    };
  }, []); // Removed dependencies localMapData.markerIcon, localMapData.statsBackgroundImage as they are now string URLs

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("BasicMapBlock: Editing finished. Calling onConfigChange.");
        // No need to check for .file for markerIcon/statsBackgroundImage as they are expected to be URLs/names
        onConfigChange(localMapData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localMapData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalMapData((prevState) => {
      const newState =
        typeof updater === "function"
          ? updater(prevState)
          : { ...prevState, ...updater };
      if (newState.stats && newState.stats.length > 4)
        newState.stats = newState.stats.slice(0, 4);

      if (!readOnly && onConfigChange) {
        onConfigChange(newState);
      }

      return newState;
    });
  };

  const handleStatIconEditClick = (statIndex) => {
    if (readOnly) return;
    setEditingStatIndexForIcon(statIndex);
    setIsIconModalOpen(true);
  };

  const handleIconSelectionForStat = (pack, iconName) => {
    if (editingStatIndexForIcon !== null) {
      handleLocalDataChange((prev) => {
        const newStats = [...(prev.stats || [])];
        if (newStats[editingStatIndexForIcon]) {
          newStats[editingStatIndexForIcon] = {
            ...newStats[editingStatIndexForIcon],
            icon: iconName,
          };
        }
        return { ...prev, stats: newStats };
      });
    }
    setIsIconModalOpen(false);
    setEditingStatIndexForIcon(null);
  };

  const handleInlineChange = (field, value) => {
    handleLocalDataChange({ [field]: value });
  };

  const handleServiceHourLocalChange = (index, field, value) => {
    handleLocalDataChange((prev) => {
      const newServiceHours = [...(prev.serviceHours || [])];
      // Ensure the service hour object exists
      while (newServiceHours.length <= index)
        newServiceHours.push({
          id: `sh_new_${newServiceHours.length}`,
          day: "",
          time: "",
        });
      if (newServiceHours[index]) {
        newServiceHours[index] = { ...newServiceHours[index], [field]: value };
      }
      return { ...prev, serviceHours: newServiceHours };
    });
  };

  const handleStatTextChange = (index, field, value) => {
    handleLocalDataChange((prev) => {
      const currentStats = prev.stats || [];
      const newStats = [...currentStats];
      while (newStats.length <= index && index < 4)
        newStats.push({
          id: `stat_new_${newStats.length}`,
          icon: "FaAward",
          value: "",
          title: "",
        });
      if (newStats[index])
        newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats.slice(0, 4) };
    });
  };

  if (readOnly) {
    return <BasicMapPreview mapData={localMapData} readOnly={true} />;
  }

  return (
    <>
      <BasicMapPreview
        mapData={localMapData}
        readOnly={false}
        onInlineChange={handleInlineChange}
        onStatTextChange={handleStatTextChange}
        onStatIconClick={handleStatIconEditClick}
        onServiceHourChange={handleServiceHourLocalChange}
      />
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectionForStat}
        currentIconPack="fa"
        currentIconName={
          editingStatIndexForIcon !== null &&
          localMapData.stats &&
          localMapData.stats[editingStatIndexForIcon]
            ? localMapData.stats[editingStatIndexForIcon].icon
            : null
        }
      />
    </>
  );
}

BasicMapBlock.propTypes = {
  readOnly: PropTypes.bool,
  mapData: PropTypes.object,
  onConfigChange: PropTypes.func,
  themeColors: PropTypes.object,
};

// Add tabsConfig to BasicMapBlock
BasicMapBlock.tabsConfig = (localData, onControlsChange, themeColors) => {
  const tabs = {};

  // Images Tab
  tabs.images = (props) => (
    <BasicMapImageControls
      {...props}
      currentData={localData}
      onControlsChange={onControlsChange}
    />
  );

  // Colors Tab
  tabs.colors = (props) => (
    <BasicMapColorControls
      {...props}
      currentData={localData}
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  // Styling Tab
  tabs.styling = (props) => (
    <BasicMapStylingControls
      {...props}
      currentData={localData}
      onControlsChange={onControlsChange}
    />
  );

  return tabs;
};

DropMarker.displayName = "DropMarker";
DropMarker.propTypes = {
  position: PropTypes.array.isRequired,
  iconUrl: PropTypes.any,
};

MapInteractionHandler.displayName = "MapInteractionHandler";
MapInteractionHandler.propTypes = {
  mapActive: PropTypes.bool.isRequired,
};

export default BasicMapBlock;
