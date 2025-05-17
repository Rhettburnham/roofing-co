import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as FaIcons from "react-icons/fa";
import IconSelectorModal from "../common/IconSelectorModal";

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return imageValue.url;
  }
  if (typeof imageValue === 'string') {
    // Check if it's already a full URL or a blob/data URI
    if (imageValue.startsWith('http') || imageValue.startsWith('blob:') || imageValue.startsWith('data:') || imageValue.startsWith('/')) {
      return imageValue;
    }
    // Assume it's a relative path that needs a leading slash if part of assets
    return `/${imageValue.replace(/^\.\//, "")}`;
  }
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url} object
const initializeImageState = (imageConfig, defaultPath) => {
  if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) {
    return imageConfig; // Already in {file, url} format
  }
  if (typeof imageConfig === 'string') {
    return { file: null, url: imageConfig }; // It's a path
  }
  return { file: null, url: defaultPath }; // Default
};

// to do this needs to be centered where the lat is currentl seem up and to the right
const CustomMarkerIcon = (iconUrl) =>
  L.icon({
    iconUrl: iconUrl || "/assets/images/hero/clipped.png",
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon properly
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
const StatItem = memo(({ iconName, title, value }) => {
  const IconComp = useMemo(
    () => FaIcons[iconName] || FaIcons.FaQuestionCircle,
    [iconName]
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startValue = 0;
    let startTime = null;
    const duration = 2000;
    let animationFrameId = null;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(
        progress * (value - startValue) + startValue
      );
      setCount(currentValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(tick);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex flex-row justify-center items-center text-gray-50/80">
        <IconComp className="w-full h-full" />
        <p className="ml-2  font-semibold text-yellow-100">{count}</p>
      </div>
      <div className="flex gap-1">
        <p className="whitespace-nowrap  font-semibold text-white mt-1">
          {title}
        </p>
      </div>
    </div>
  );
});

const StatsPanel = memo(({ isSmallScreen, stats }) => {
  // Ensure we always have exactly 4 stats for a 2x2 grid
  const displayStats = [...stats];

  // If we have fewer than 4 stats, add placeholders to maintain the 2x2 grid
  while (displayStats.length < 4) {
    displayStats.push({
      value: "0",
      label: "Placeholder",
      icon: "FaAward",
      title: "Placeholder",
    });
  }

  // If we have more than 4, just use the first 4
  const gridStats = displayStats.slice(0, 4);

  return (
    <div
      className={`
      w-full h-full grid gap-1 md:gap-2 
      grid-cols-2 
      text-center p-1 md:p-2
    `}
    >
      {gridStats.map((stat, index) => {
        const IconComponent = FaIcons[stat.icon] || FaIcons.FaAward;
        return (
          <div
            key={index}
            className="flex flex-col items-center justify-center bg-white/30 rounded-lg p-1 shadow-md h-full"
          >
            <IconComponent className="w-8 h-8 md:w-6 md:h-6  md:mb-1 text-white" />
            <div className="text-lg md:text-lg font-bold text-white">
              {stat.value}
            </div>
            <div className="text-[3vw] md:text-sm text-white font-medium line-clamp-1">
              {stat.title || stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
});

// Window strings component
const WindowStrings = memo(({ isVisible, isSmallScreen }) => {
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // Simple movement amount
  const moveAmount = "5vh";

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
  }, [isVisible]);

  return (
    <div className="absolute md:right-[3%] right-0 -top-[15vh] z-30 pointer-events-none h-full">
      <div className="flex md:space-x-2 space-x-0">
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
    </div>
  );
});

// Removed `max-h-[75vh] overflow-auto` to allow full height on smaller screens and avoid vertical scrolling.
function BasicMapPreview({ 
  mapData, 
  readOnly = true, 
  onInlineChange, 
  onStatTextChange, 
  onStatIconClick 
}) {
  if (!mapData) {
    return <p>No map data found.</p>;
  }

  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [mapActive, setMapActive] = useState(false);
  const titleRef = useRef(null);
  const sectionRef = useRef(null);

  const {
    center,
    zoomLevel,
    circleRadius,
    address,
    telephone,
    serviceHours = [],
    stats = [],
    markerIcon,
    title,
    statsBackgroundImage,
  } = mapData;

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

  // Title animation using ScrollTrigger
  useEffect(() => {
    if (!titleRef.current || !sectionRef.current) return;

    // Clear any existing animations
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.id === "titleAnimation") {
        trigger.kill();
      }
    });

    // Define different animations for small vs medium+ viewports
    if (isSmallScreen) {
      // Small viewport: Slide in from right when 30% from bottom of viewport
      gsap.set(titleRef.current, {
        x: "100vw", // Start off-screen to the right
        opacity: 0,
      });

      gsap.to(titleRef.current, {
        x: "50%", // Center horizontally
        xPercent: -50, // Adjust for width of element
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          id: "titleAnimation",
          trigger: sectionRef.current,
          start: "bottom 70%", // Trigger when bottom of section is 30% from bottom (70% down viewport)
          toggleActions: "play none none none",
          once: true,
        },
      });
    } else {
      // Medium+ viewport: Center the title
      gsap.set(titleRef.current, {
        x: 0,
        opacity: 0,
      });

      gsap.to(titleRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          id: "titleAnimation",
          trigger: sectionRef.current,
          start: "top 40%", // Trigger when top of section reaches 40% down the viewport
          toggleActions: "play none none none",
          once: true,
        },
      });
    }

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === "titleAnimation") {
          trigger.kill();
        }
      });
    };
  }, [isSmallScreen, titleRef, sectionRef]);

  const renderServiceHoursTable = () => (
    <div className="w-full h-full flex flex-col p-1 md:p-0">
      <table className="w-full">
        {" "}
        {/* No outer border, parent sliding div has it */}
        <tbody className="text-gray-800">
          {serviceHours.map((item, idx) => (
            <tr
              key={idx}
              className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-300`}
            >
              <td className="w-1/2 py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 text-[2.8vw] md:text-sm font-medium text-left border-r border-gray-300">
                {item.day}
              </td>
              <td className="w-1/2 py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 text-[2.8vw] md:text-sm text-gray-800 text-left">
                {item.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="overflow-hidden" ref={sectionRef}>
      <div className="pb-2">
        <div className="flex justify-center">
          {/* Title with animation - conditionally editable */}
          {readOnly ? (
            <h1
              ref={titleRef}
              className="text-[3vh] md:text-[4vh] font-normal text-black font-serif title-animation text-center"
            >
              {title || "Are we in your area?"}
            </h1>
          ) : (
            <input
              type="text"
              ref={titleRef} // GSAP might still target this for initial animation even if it's an input
              className="text-[3vh] md:text-[4vh] font-normal text-black font-serif text-center w-full bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1"
              value={title || ""}
              onChange={(e) => onInlineChange('title', e.target.value)}
              placeholder="Section Title"
            />
          )}
        </div>
        <div className="relative flex flex-col md:flex-row gap-4 px-10 md:px-6 h-auto md:h-[40vh] md:justify-between w-full mt-4"> {/* Added mt-4 for spacing after title */}
          {/* Left: Map */}
          <div className="flex flex-col w-full md:w-[55%]">
            <div className="relative h-[22vh] md:h-full w-full z-10">
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
                  <DropMarker position={center} iconUrl={getDisplayUrl(markerIcon, "/assets/images/hero/clipped.png")} />
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
                {/* Bottom overlay: address + phone - conditionally editable */}
                <div className="absolute bottom-0 w-full bg-banner text-white font-semibold z-10 py-2 px-3 flex justify-between items-center">
                  {readOnly ? (
                    <>
                      <div className="font-semibold text-[2.5vw] md:text-[2vh] leading-tight text-left">
                        {address}
                      </div>
                      <div className="text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight text-right">
                        <a href={`tel:${telephone?.replace(/[^0-9]/g, "")}`}>
                          {telephone}
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <input 
                        type="text"
                        className="bg-transparent font-semibold text-[2.5vw] md:text-[2vh] leading-tight text-left w-3/5 focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 text-white placeholder-gray-300"
                        value={address || ""}
                        onChange={(e) => onInlineChange('address', e.target.value)}
                        placeholder="Address"
                      />
                      <input 
                        type="text"
                        className="bg-transparent text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight text-right w-2/5 focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                        value={telephone || ""}
                        onChange={(e) => onInlineChange('telephone', e.target.value)}
                        placeholder="Telephone"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Right: Stats + Service Hours - Stats conditionally editable */} 
          <div className="flex flex-col w-full md:w-[43%]">
            <button
              type="button"
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="dark_button bg-gray-700 rounded-t-xl py-1 md:py-2 px-4 flex justify-center items-center w-full text-white transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif z-30 relative"
              style={{ willChange: "transform" }}
            >
              <span className="font-serif text-[2vh]">
                {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
              </span>
            </button>
            <div 
              className="relative h-[30vh] md:h-[calc(40vh-2.5rem)] rounded-b-xl overflow-hidden"
            >
              <WindowStrings
                isVisible={isServiceHoursVisible}
                isSmallScreen={isSmallScreen}
              />
              {/* Stats background and content - conditionally editable stats */}
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  <img
                    src={getDisplayUrl(statsBackgroundImage, "/assets/images/stats_background.jpg")}
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${readOnly ? '' : 'p-1 md:p-2'}`}> 
                  {readOnly ? (
                    <StatsPanel isSmallScreen={isSmallScreen} stats={stats} />
                  ) : (
                    <div className="w-full h-full grid gap-1 md:gap-2 grid-cols-2 text-center">
                      {(stats || []).slice(0, 4).map((stat, index) => {
                        const IconComponent = FaIcons[stat.icon] || FaIcons.FaAward;
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center justify-center bg-white/30 rounded-lg p-1 shadow-md h-full"
                          >
                            <div 
                              className="cursor-pointer p-1 rounded-full hover:bg-white/20 transition-colors"
                              onClick={() => onStatIconClick(index)}
                              title="Click to change icon"
                            >
                              <IconComponent className="w-8 h-8 md:w-6 md:h-6 md:mb-1 text-white" />
                            </div>
                            <input
                              type="text" 
                              className="text-lg md:text-lg font-bold text-white bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                              value={stat.value}
                              onChange={(e) => onStatTextChange(index, 'value', e.target.value)}
                              placeholder="Value"
                            />
                            <input
                              type="text"
                              className="text-[3vw] md:text-sm text-white font-medium line-clamp-1 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                              value={stat.title || stat.label}
                              onChange={(e) => onStatTextChange(index, 'title', e.target.value)}
                              placeholder="Title"
                            />
                          </div>
                        );
                      })}
                      {/* Placeholder for adding new stats if functionality is desired here */}
                    </div>
                  )}
                </div>
              </div>

              {/* Service hours overlay - remains read-only in this preview, edited in BasicMapEditorPanel */}
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white rounded-b-xl
                  transition-transform duration-500 ease-in-out
                  ${isServiceHoursVisible ? "translate-y-0" : "translate-y-[-101%]"}
                `}
                style={{ willChange: "transform" }}
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

/* --------------------------------------------------
   EDITOR SUBCOMPONENTS
-----------------------------------------------------*/
function StatItemEditor({ stat, onChange, onRemove }) {
  const IconComp = FaIcons[stat.icon] || FaIcons.FaQuestionCircle;

  return (
    <div className="relative bg-white p-2 rounded mb-2 w-[90%] md:w-[80%]">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
      >
        Remove
      </button>
      <div className="flex items-center space-x-3">
        <IconComp className="text-[7vh] text-gray-800" />
        <div>
          <p className="text-base md:text-xl font-semibold text-yellow-600">
            {stat.value}
          </p>
          <p className="text-sm font-semibold text-black">{stat.title}</p>
        </div>
      </div>
      <div className="mt-2 border-t pt-2">
        <label className="block text-xs mb-1">
          Title:
          <input
            type="text"
            className="w-full bg-gray-200 rounded px-2 py-1"
            value={stat.title}
            onChange={(e) => onChange({ ...stat, title: e.target.value })}
          />
        </label>
        <label className="block text-xs mb-1">
          Value:
          <input
            type="number"
            className="w-full bg-gray-200 rounded px-2 py-1"
            value={stat.value}
            onChange={(e) =>
              onChange({ ...stat, value: parseInt(e.target.value, 10) })
            }
          />
        </label>
        <label className="block text-xs mb-1">
          Icon (e.g. FaUsers):
          <input
            type="text"
            className="w-full bg-gray-200 rounded px-2 py-1"
            value={stat.icon}
            onChange={(e) => onChange({ ...stat, icon: e.target.value })}
          />
        </label>
      </div>
    </div>
  );
}

function BasicMapEditorPanel({ localMap, setLocalMap, onSave, onStatIconEditClick, statsBackgroundImage, markerIcon }) {
  const [mapActive, setMapActive] = useState(false);

  // Debug log for marker icon in editor
  console.log("Editor marker icon:", localMap.markerIcon);
  console.log("Editor stats background:", localMap.statsBackgroundImage);

  const handleInlineChange = (field, value) => {
    setLocalMap(prev => ({ ...prev, [field]: value }));
  };

  const handleStatTextChange = (statIndex, field, value) => {
    setLocalMap(prev => {
      const newStats = [...prev.stats];
      newStats[statIndex] = { ...newStats[statIndex], [field]: value };
      return { ...prev, stats: newStats };
    });
  };
  
  const handleServiceHourChange = (index, field, value) => {
    setLocalMap(prev => {
      const newServiceHours = [...prev.serviceHours];
      newServiceHours[index] = { ...newServiceHours[index], [field]: value };
      return { ...prev, serviceHours: newServiceHours };
    });
  };
  
  const handleStatsBackgroundImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const oldUrl = localMap.statsBackgroundImage?.url;
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      const fileURL = URL.createObjectURL(file);
      setLocalMap((prev) => ({
        ...prev,
        statsBackgroundImage: { file: file, url: fileURL, name: file.name },
      }));
    }
  };

  const handleMarkerIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const oldUrl = localMap.markerIcon?.url;
      if (oldUrl && oldUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldUrl);
      }
      const fileURL = URL.createObjectURL(file);
      setLocalMap((prev) => ({
        ...prev,
        markerIcon: { file: file, url: fileURL, name: file.name },
      }));
    }
  };

  const renderServiceHoursEditorTable = () => (
    <div className="w-full h-full flex flex-col p-1 md:p-0 overflow-auto">
      <table className="w-full">
        <thead className="bg-gray-700 text-white">
          <tr>
            <th className="py-2 px-2 md:px-4 text-left text-xs font-medium">Day</th>
            <th className="py-2 px-2 md:px-4 text-left text-xs font-medium">Time</th>
            <th className="py-2 px-1 text-left text-xs font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-300">
          {localMap.serviceHours?.map((item, idx) => (
            <tr
              key={idx}
              className={`${idx % 2 === 0 ? "bg-gray-650" : "bg-gray-600"} border-b border-gray-500`}
            >
              <td className="py-1 px-2 md:px-4 border-r border-gray-500">
                <input
                  type="text"
                  value={item.day}
                  onChange={(e) => handleServiceHourChange(idx, 'day', e.target.value)}
                  className="bg-transparent w-full text-xs focus:outline-none"
                />
              </td>
              <td className="py-1 px-2 md:px-4">
                <input
                  type="text"
                  value={item.time}
                  onChange={(e) => handleServiceHourChange(idx, 'time', e.target.value)}
                  className="bg-transparent w-full text-xs focus:outline-none"
                />
              </td>
              <td className="py-1 px-1 text-center">
                <button
                  onClick={() => {
                    const updatedHours = [...localMap.serviceHours];
                    updatedHours.splice(idx, 1);
                    setLocalMap(prev => ({ ...prev, serviceHours: updatedHours }));
                  }}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => {
          setLocalMap(prev => ({
            ...prev,
            serviceHours: [...prev.serviceHours, { day: "New Day", time: "09:00 AM - 5:00 PM" }]
          }));
        }}
        className="bg-blue-600 text-white text-xs px-2 py-1 rounded mt-2 self-start"
      >
        + Add Hours
      </button>
    </div>
  );

  return (
    <div className="bg-black text-white p-4 rounded">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Map Editor</h1>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save & Close
        </button>
      </div>

      {/* Layout: Map Config (Marker, Radius, BG Image) + Service Hours */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side: Map config */}
        <div className="flex-1 space-y-4 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-3">Map Configuration</h3>
          <label className="block">
            <span className="block text-sm mb-1 font-medium text-gray-300">Center Latitude:</span>
            <input
              type="number"
              step="any"
              className="bg-gray-700 px-3 py-2 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500"
              value={localMap.center?.[0] || 0}
              onChange={(e) => setLocalMap(p => ({ ...p, center: [parseFloat(e.target.value), p.center?.[1] || 0] }))}
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1 font-medium text-gray-300">Center Longitude:</span>
            <input
              type="number"
              step="any"
              className="bg-gray-700 px-3 py-2 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500"
              value={localMap.center?.[1] || 0}
              onChange={(e) => setLocalMap(p => ({ ...p, center: [p.center?.[0] || 0, parseFloat(e.target.value)] }))}
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1 font-medium text-gray-300">Zoom Level:</span>
            <input
              type="number"
              className="bg-gray-700 px-3 py-2 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500"
              value={localMap.zoomLevel || 5}
              onChange={(e) => setLocalMap(p => ({ ...p, zoomLevel: parseInt(e.target.value, 10) }))}
            />
          </label>
          <label className="block">
            <span className="block text-sm mb-1 font-medium text-gray-300">Circle Radius (meters):</span>
            <input
              type="number"
              className="bg-gray-700 px-3 py-2 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500"
              value={localMap.circleRadius || 0}
              onChange={(e) =>
                setLocalMap((p) => ({
                  ...p,
                  circleRadius: parseInt(e.target.value, 10),
                }))
              }
            />
          </label>

          {/* Marker Icon input */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
            <label className="block w-full">
              <span className="block text-sm mb-1 font-medium text-gray-300">Map Marker Icon:</span>
              <input
                type="file"
                accept="image/*"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                onChange={handleMarkerIconUpload}
              />
              {getDisplayUrl(localMap.markerIcon) && (
                <img
                  src={getDisplayUrl(localMap.markerIcon)}
                  alt="Marker Icon Preview"
                  className="mt-2 h-16 w-16 object-contain rounded bg-gray-600 p-1"
                />
              )}
              <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded w-full mt-2 text-xs"
                placeholder="Or paste direct image URL (e.g., /assets/icon.png)"
                value={typeof localMap.markerIcon === 'string' ? localMap.markerIcon : (localMap.markerIcon?.url || '')}
                onChange={(e) => {
                  const oldUrl = localMap.markerIcon?.url;
                  if (oldUrl && oldUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(oldUrl);
                  }
                  setLocalMap(prev => ({ ...prev, markerIcon: { file: null, url: e.target.value } }));
                 }}
              />
            </label>
          </div>
          
          {/* Stats Background Image input */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
            <label className="block w-full">
              <span className="block text-sm mb-1 font-medium text-gray-300">Stats Panel Background Image:</span>
              <input
                type="file"
                accept="image/*"
                className="bg-gray-700 px-2 py-1 rounded w-full text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                onChange={handleStatsBackgroundImageUpload}
              />
              {getDisplayUrl(localMap.statsBackgroundImage) && (
                <img
                  src={getDisplayUrl(localMap.statsBackgroundImage)}
                  alt="Stats Background Preview"
                  className="mt-2 h-24 w-auto object-contain rounded bg-gray-600 p-1"
                />
              )}
               <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded w-full mt-2 text-xs"
                placeholder="Or paste direct image URL (e.g., /assets/stats_bg.jpg)"
                value={typeof localMap.statsBackgroundImage === 'string' ? localMap.statsBackgroundImage : (localMap.statsBackgroundImage?.url || '')}
                onChange={(e) => {
                  const oldUrl = localMap.statsBackgroundImage?.url;
                  if (oldUrl && oldUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(oldUrl);
                  }
                  setLocalMap(prev => ({ ...prev, statsBackgroundImage: { file: null, url: e.target.value } }));
                 }}
              />
            </label>
          </div>
        </div>

        {/* Right side: Service Hours Editor */}
        <div className="flex-1 space-y-4 p-4 bg-gray-800 rounded-lg">
           <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-3">Service Hours Editor</h3>
           {renderServiceHoursEditorTable()}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   4) MAIN EXPORT
   If readOnly = true => BasicMapPreview
   If readOnly = false => BasicMapEditorPanel + BasicMapPreview (for inline edits)
-----------------------------------------------------*/
export default function BasicMapBlock({
  readOnly = false,
  mapData,
  onConfigChange,
}) {
  // Add console log to debug incoming mapData
  console.log("BasicMapBlock received mapData:", mapData);

  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingStatIndex, setEditingStatIndex] = useState(null);

  // Initialize local editor state
  const [localMapData, setLocalMapData] = useState(() => {
    const initialConfig = mapData || {};
    return {
      ...initialConfig,
      title: initialConfig.title || "Are we in your area?",
      center: initialConfig.center || [0, 0],
      zoomLevel: initialConfig.zoomLevel || 5,
      circleRadius: initialConfig.circleRadius || 0,
      address: initialConfig.address || "",
      telephone: initialConfig.telephone || "",
      serviceHours: initialConfig.serviceHours?.map((sh) => ({ ...sh })) || [],
      stats: initialConfig.stats?.map((st) => ({ ...st })) || [],
      markerIcon: initializeImageState(initialConfig.markerIcon, "/assets/images/hero/clipped.png"),
      statsBackgroundImage: initializeImageState(initialConfig.statsBackgroundImage, "/assets/images/stats_background.jpg"),
    };
  });

  useEffect(() => {
    if (mapData) {
      setLocalMapData(prevLocalMapData => {
        const newMarkerIconState = initializeImageState(mapData.markerIcon, "/assets/images/hero/clipped.png");
        const newStatsBgImageState = initializeImageState(mapData.statsBackgroundImage, "/assets/images/stats_background.jpg");

        // Revoke old blob URL for markerIcon if it exists and is different
        if (prevLocalMapData.markerIcon && prevLocalMapData.markerIcon.url && prevLocalMapData.markerIcon.url.startsWith('blob:') && prevLocalMapData.markerIcon.url !== newMarkerIconState.url) {
          URL.revokeObjectURL(prevLocalMapData.markerIcon.url);
        }
        // Revoke old blob URL for statsBackgroundImage if it exists and is different
        if (prevLocalMapData.statsBackgroundImage && prevLocalMapData.statsBackgroundImage.url && prevLocalMapData.statsBackgroundImage.url.startsWith('blob:') && prevLocalMapData.statsBackgroundImage.url !== newStatsBgImageState.url) {
          URL.revokeObjectURL(prevLocalMapData.statsBackgroundImage.url);
        }

        return {
          ...prevLocalMapData,
          ...mapData,
          title: mapData.title || prevLocalMapData.title || "Are we in your area?",
          serviceHours: mapData.serviceHours?.map((sh) => ({ ...sh })) || prevLocalMapData.serviceHours || [],
          stats: mapData.stats?.map((st) => ({ ...st })) || prevLocalMapData.stats || [],
          markerIcon: newMarkerIconState,
          statsBackgroundImage: newStatsBgImageState,
        };
      });
    }
  }, [mapData]);

  const handleSave = () => {
    // Create a deep copy for cleaning, to avoid mutating localMapData directly
    // especially if it contains File objects that shouldn't be in the JSON
    const dataToSave = JSON.parse(JSON.stringify(localMapData));

    // Clean markerIcon
    if (dataToSave.markerIcon && typeof dataToSave.markerIcon === 'object' && dataToSave.markerIcon.url) {
        // If it was a file upload, we save the URL (which might be a blob URL or a path if user pasted)
        // The actual file saving to a persistent store or CDN would happen elsewhere (e.g. in a backend or a build step)
        // For now, we ensure that if it was a {file, url} object, we save the url string.
        // If the url is a blob, the parent component (OneForm) will handle zipping the File object.
        // Here, we ensure the config itself stores the reference path/URL.
        if (localMapData.markerIcon.file) { // if there was a file object
            dataToSave.markerIcon = localMapData.markerIcon.url; // Keep blob or actual URL
        } else { // if it was just a URL string or an object with only URL
            dataToSave.markerIcon = localMapData.markerIcon.url || localMapData.markerIcon;
        }
    } else if (typeof dataToSave.markerIcon === 'string') {
        // it's already a string, do nothing
    } else {
        dataToSave.markerIcon = "/assets/images/hero/clipped.png"; // Fallback
    }

    // Clean statsBackgroundImage
    if (dataToSave.statsBackgroundImage && typeof dataToSave.statsBackgroundImage === 'object' && dataToSave.statsBackgroundImage.url) {
        if (localMapData.statsBackgroundImage.file) {
             dataToSave.statsBackgroundImage = localMapData.statsBackgroundImage.url;
        } else {
            dataToSave.statsBackgroundImage = localMapData.statsBackgroundImage.url || localMapData.statsBackgroundImage;
        }
    } else if (typeof dataToSave.statsBackgroundImage === 'string') {
        // it's already a string
    } else {
        dataToSave.statsBackgroundImage = "/assets/images/stats_background.jpg"; // Fallback
    }
    
    // Pass the original localMapData (with File objects if any) to onConfigChange
    // The OneForm component is responsible for extracting File objects for zipping.
    console.log("BasicMapBlock saving data (original with potential Files):", localMapData);
    onConfigChange?.(localMapData); // Pass the version with File objects for zipping
  };
  
  // This function will be passed to BasicMapEditorPanel's setLocalMap prop
  // It updates the local state and then calls onConfigChange for auto-saving behavior
  const setLocalMapDataAndPropagate = (updater) => {
    let newData;
    setLocalMapData(currentData => {
      newData = typeof updater === 'function' ? updater(currentData) : updater;
      return newData;
    });
    if (onConfigChange) {
        console.log("Propagating changes from BasicMapBlock editor via setLocalMapDataAndPropagate:", newData);
        onConfigChange(newData);
    }
  };

  const handleStatIconClick = (statIndex) => {
    setEditingStatIndex(statIndex);
    setIsIconModalOpen(true);
  };

  const handleIconSelect = (pack, iconName) => {
    if (editingStatIndex !== null) {
      setLocalMapDataAndPropagate(prev => {
        const newStats = [...prev.stats];
        newStats[editingStatIndex] = { ...newStats[editingStatIndex], icon: iconName };
        return { ...prev, stats: newStats };
      });
    }
    setIsIconModalOpen(false);
    setEditingStatIndex(null);
  };

  if (readOnly) {
    // Pass mapData directly, BasicMapPreview will use getDisplayUrl for markerIcon & statsBg
    return <BasicMapPreview mapData={mapData} readOnly={true} />;
  }

  // When not readOnly, BasicMapPreview will show editable fields.
  // BasicMapEditorPanel will show other configurations.
  return (
    <>
      <BasicMapPreview 
        mapData={localMapData} 
        readOnly={false}
        onInlineChange={(field, value) => setLocalMapDataAndPropagate(prev => ({ ...prev, [field]: value }))}
        onStatTextChange={(index, field, value) => setLocalMapDataAndPropagate(prev => {
          const currentStats = prev.stats || [];
          const newStats = [...currentStats];
          // Ensure the stat object exists
          if (!newStats[index]) newStats[index] = { icon: 'FaAward', value: '', title: '' }; 
          newStats[index] = { ...newStats[index], [field]: value };
          return { ...prev, stats: newStats };
        })}
        onStatIconClick={handleStatIconClick} 
      />
      <BasicMapEditorPanel
        localMap={localMapData}
        setLocalMap={setLocalMapDataAndPropagate} 
        onSave={handleSave}
      />
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelect}
        currentIconPack="fa" 
        currentIconName={editingStatIndex !== null && localMapData.stats[editingStatIndex] ? localMapData.stats[editingStatIndex].icon : null}
      />
    </>
  );
}
