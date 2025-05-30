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
import ThemeColorPicker from "../common/ThemeColorPicker";

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
  if (imageConfig && typeof imageConfig === 'object' && imageConfig.url) {
    return { ...imageConfig, name: imageConfig.name || imageConfig.url.split('/').pop() }; 
  }
  if (typeof imageConfig === 'string') {
    return { file: null, url: imageConfig, name: imageConfig.split('/').pop() }; 
  }
  return { file: null, url: defaultPath, name: defaultPath.split('/').pop() }; 
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

const StatsPanel = memo(({ stats, readOnly, onStatTextChange, onStatIconClick, statsTextColor }) => {
  const displayStats = [...(stats || [])];
  while (displayStats.length < 4 && !readOnly) { // Only add placeholders if not readOnly and less than 4, or always show 4 if readOnly and less than 4 initially
      displayStats.push({ value: '0', title: 'New Stat', icon: 'FaAward' });
  }
  const gridStats = displayStats.slice(0, 4);
  const currentStatsTextColor = statsTextColor || '#FFFFFF';

  return (
    <div className={`w-full h-full grid gap-1 md:gap-2 grid-cols-2 text-center p-1 md:p-2`}>
      {gridStats.map((stat, index) => {
        const IconComponent = FaIcons[stat.icon] || FaIcons.FaAward;
        return (
          <div key={stat.id || index} className="flex flex-col items-center justify-center bg-white/30 rounded-lg p-1 shadow-md h-full">
            <div className={`p-1 rounded-full ${!readOnly ? 'cursor-pointer hover:bg-white/20' : ''} transition-colors`} onClick={() => !readOnly && onStatIconClick && onStatIconClick(index)} title={!readOnly ? "Click to change icon" : ""}>
              <IconComponent className="w-8 h-8 md:w-6 md:h-6 md:mb-1" style={{color: currentStatsTextColor}} />
            </div>
            {readOnly ? (
                <div className="text-lg md:text-lg font-bold" style={{color: currentStatsTextColor}}>{stat.value}</div>
            ) : (
                <input type="text" style={{color: currentStatsTextColor}} className="text-lg md:text-lg font-bold text-white bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300" value={stat.value || ""} onChange={(e) => onStatTextChange && onStatTextChange(index, 'value', e.target.value)} placeholder="Value"/>
            )}
            {readOnly ? (
                <div className="text-[3vw] md:text-sm font-medium line-clamp-1" style={{color: currentStatsTextColor}}>{stat.title || stat.label}</div>
            ) : (
                <input type="text" style={{color: currentStatsTextColor}} className="text-[3vw] md:text-sm text-white font-medium line-clamp-1 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300" value={stat.title || stat.label || ""} onChange={(e) => onStatTextChange && onStatTextChange(index, 'title', e.target.value)} placeholder="Title"/>
            )}
          </div>
        );
      })}
    </div>
  );
});

// Window strings component
const WindowStrings = memo(({ isVisible }) => {
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
  onStatIconClick, 
  onServiceHourChange
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
    bannerTextColor,
    bannerBackgroundColor,
    statsTextColor,
    showHoursButtonText,
    hideHoursButtonText
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
      // Small viewport: Fade in
      gsap.set(titleRef.current, {
        opacity: 0,
      });

      gsap.to(titleRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          id: "titleAnimation",
          trigger: sectionRef.current,
          start: "bottom 70%", 
          toggleActions: "play none none none",
          once: true,
        },
      });
    } else {
      // Medium+ viewport: Fade in
      gsap.set(titleRef.current, {
        opacity: 0,
      });

      gsap.to(titleRef.current, {
        opacity: 1,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          id: "titleAnimation",
          trigger: sectionRef.current,
          start: "top 40%", 
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
    <div className="w-full h-full flex flex-col p-0 overflow-y-auto">
      <table className="w-full">
        {" "}
        {/* No outer border, parent sliding div has it */}
        <tbody className="text-gray-800">
          {serviceHours.map((item, idx) => (
            <tr
              key={item.id || idx}
              className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} border-b border-gray-300`}
            >
              <td className="w-1/2 py-[0.5vh] md:py-[.5vh] px-2 md:px-4 text-[2.8vw] md:text-sm font-medium text-left border-r border-gray-300">
                {readOnly ? item.day : (
                  <input 
                    type="text" 
                    value={item.day || ''}
                    onChange={(e) => onServiceHourChange && onServiceHourChange(idx, 'day', e.target.value)}
                    className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0.5 placeholder-gray-400"
                    placeholder="Day"
                  />
                )}
              </td>
              <td className="w-1/2 py-[0.5vh] md:py-[.5vh] px-2 md:px-4 text-[2.8vw] md:text-sm text-gray-800 text-left">
                {readOnly ? item.time : (
                  <input 
                    type="text" 
                    value={item.time || ''}
                    onChange={(e) => onServiceHourChange && onServiceHourChange(idx, 'time', e.target.value)}
                    className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0.5 placeholder-gray-400"
                    placeholder="Time"
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const currentBannerBgColor = bannerBackgroundColor || '#1f2937';
  const currentBannerTextColor = bannerTextColor || '#FFFFFF';
  const currentShowHoursText = showHoursButtonText || "Show Hours";
  const currentHideHoursText = hideHoursButtonText || "Hide Hours";

  return (
    <section className="overflow-hidden" ref={sectionRef}>
      <div className="py-4 px-[4vw]">
        <div className="relative flex flex-col md:flex-row gap-4 px-10 md:px-6 h-auto md:h-[30vh] md:justify-between w-full"> {/* Removed mt-4 */}
          {/* Left: Map */}
          <div className="flex flex-col w-full md:w-[55%]">
            <div className="relative h-[30vh] md:h-full w-full z-10"> {/* Swapped with stats/hours height, was h-[22vh] */}
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative">
                {/* Title with animation - conditionally editable - MOVED HERE */}
                {readOnly ? (
                  <h1
                    ref={titleRef}
                    className="absolute top-2 left-1 text-[2.5vh] md:text-[2.5vh] font-normal text-white font-serif title-animation z-20 p-2 bg-banner bg-opacity-30 pl-6 -ml-4 rounded"
                  >
                    {title || "Are we in your area?"}
                  </h1>
                ) : (
                  <input
                    type="text"
                    ref={titleRef}
                    className="absolute top-2 left-1 text-[2.5vh] md:text-[3vh] font-normal text-white font-serif z-20 p-2 bg-banner bg-opacity-30 pl-6 -ml-4 focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded placeholder-gray-300"
                    value={title || ""}
                    onChange={(e) => onInlineChange('title', e.target.value)}
                    placeholder="Section Title"
                    style={{mixBlendMode: 'difference'}} // Helps with visibility over varied map parts
                  />
                )}
                <MapContainer
                  center={center}
                  zoom={zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={mapActive}
                  zoomControl={false} // Removed zoom controls
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
                  <DropMarker position={center} iconUrl={markerIcon} />
                  <MapInteractionHandler mapActive={mapActive} />
                </MapContainer>
                {!mapActive && (
                  <div
                    className="absolute flex flex-col inset-0 bg-black bg-opacity-30 flex flex-row items-start justify-center cursor-pointer "
                    onClick={() => setMapActive(true)}
                  >
                    <p className="absolute left-1/2 -translate-x-1/2  mb-14  text-white text-base font-serif">
                      Click to interact with the map
                    </p>
                  </div>
                )}
                {/* Bottom overlay: address + phone - conditionally editable */}
                <div className="absolute bottom-0 w-full bg-banner text-white  z-10 py-2 px-3 flex justify-between items-center" style={{backgroundColor: currentBannerBgColor, color: currentBannerTextColor}}>
                  {readOnly ? (
                    <>
                      <div className=" text-[2.5vw] md:text-[2.3vh] leading-tight text-left">
                        {address}
                      </div>
                      <div className="text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight text-right">
                        <a href={`tel:${telephone?.replace(/[^0-9]/g, "")}`} style={{color: currentBannerTextColor}}>
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
              className="absolute dark_button bg-gray-700 rounded-t-xl py-1 md:py-2 px-4 flex justify-end items-center w-full text-white transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif z-30 relative"
              style={{ willChange: "transform" }}
            >
              <span className="font-serif text-[2vh]">
                {isServiceHoursVisible ? currentHideHoursText : currentShowHoursText}
              </span>
            </button>
            <div 
              className="relative h-[22vh] md:h-[calc(40vh-2.5rem)] rounded-b-xl overflow-hidden" // Swapped with map height, was h-[30vh]
            >
              <WindowStrings
                isVisible={isServiceHoursVisible}
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
                  <StatsPanel stats={stats} readOnly={readOnly} onStatTextChange={onStatTextChange} onStatIconClick={onStatIconClick} statsTextColor={statsTextColor} />
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

function BasicMapEditorPanel({ localMapData, onPanelChange, themeColors }) {
  const handleAddStat = () => {
    onPanelChange(prev => ({ ...prev, stats: [...(prev.stats || []), { id: `stat_new_${Date.now()}`, icon: 'FaAward', value: '0', title: 'New Stat'}] }));
  };

  const handleRemoveStat = (index) => {
    onPanelChange(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  };
  
  const handleMapFieldChange = (field, value, isCoordinate = false, coordIndex = 0) => {
    if (isCoordinate) {
        onPanelChange(prev => {
            const newCenter = [...(prev.center || [0,0])];
            newCenter[coordIndex] = parseFloat(value) || 0;
            return {...prev, center: newCenter };
        });
    } else if (field === 'zoomLevel' || field === 'circleRadius') {
        onPanelChange(prev => ({ ...prev, [field]: parseInt(value, 10) || 0 }));
    } else {
        onPanelChange(prev => ({ ...prev, [field]: value })); // For color strings etc.
    }
  };

  return (
    <div className="bg-black text-white p-3 rounded mt-0">
      <h2 className="text-lg font-semibold mb-2.5 border-b border-gray-700 pb-1.5">Map Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
        
        {/* Left Column */}
        <div className="space-y-2.5 pr-2 md:border-r border-gray-600">
          <h3 className="text-base font-medium text-gray-300">Map View</h3>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
            <label className="block text-xs">
              <span className="font-medium text-gray-400 block mb-0.5">Latitude:</span>
              <input type="number" step="any" className="bg-gray-700 px-2 py-1 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500 text-[11px]" value={localMapData.center?.[0] || 0} onChange={(e) => handleMapFieldChange('center', e.target.value, true, 0)}/>
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray-400 block mb-0.5">Longitude:</span>
              <input type="number" step="any" className="bg-gray-700 px-2 py-1 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500 text-[11px]" value={localMapData.center?.[1] || 0} onChange={(e) => handleMapFieldChange('center', e.target.value, true, 1)}/>
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray-400 block mb-0.5">Zoom:</span>
              <input type="number" className="bg-gray-700 px-2 py-1 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500 text-[11px]" value={localMapData.zoomLevel || 5} onChange={(e) => handleMapFieldChange('zoomLevel', e.target.value)}/>
            </label>
            <label className="block text-xs">
              <span className="font-medium text-gray-400 block mb-0.5">Radius (m):</span>
              <input type="number" className="bg-gray-700 px-2 py-1 rounded w-full text-white focus:ring-blue-500 focus:border-blue-500 text-[11px]" value={localMapData.circleRadius || 0} onChange={(e) => handleMapFieldChange('circleRadius', e.target.value)}/>
            </label>
          </div>

          <div className="pt-2 border-t border-gray-600 space-y-1.5">
            <h3 className="text-base font-medium text-gray-300 mt-1 mb-1">Banner Styling</h3>
            <ThemeColorPicker
              label="Banner Text Color:"
              currentColorValue={localMapData.bannerTextColor || '#FFFFFF'}
              themeColors={themeColors}
              onColorChange={handleMapFieldChange}
              fieldName="bannerTextColor"
              className="text-xs"
            />
            <ThemeColorPicker
              label="Banner Background:"
              currentColorValue={localMapData.bannerBackgroundColor || '#1f2937'}
              themeColors={themeColors}
              onColorChange={handleMapFieldChange}
              fieldName="bannerBackgroundColor"
              className="text-xs"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-gray-300">Display & Stats Styling</h3>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                <label className="block text-xs"><span className="font-medium text-gray-400 block mb-0.5">Show Hours Text:</span>
                <input type="text" className="bg-gray-700 px-2 py-1 rounded w-full text-[11px]" placeholder="Show Hours" value={localMapData.showHoursButtonText || ''} onChange={(e) => handleMapFieldChange('showHoursButtonText', e.target.value)}/>
                </label>
                <label className="block text-xs"><span className="font-medium text-gray-400 block mb-0.5">Hide Hours Text:</span>
                <input type="text" className="bg-gray-700 px-2 py-1 rounded w-full text-[11px]" placeholder="Hide Hours" value={localMapData.hideHoursButtonText || ''} onChange={(e) => handleMapFieldChange('hideHoursButtonText', e.target.value)}/>
                </label>
            </div>
            <ThemeColorPicker
              label="Stats Panel Text Color:"
              currentColorValue={localMapData.statsTextColor || '#FFFFFF'}
              themeColors={themeColors}
              onColorChange={handleMapFieldChange}
              fieldName="statsTextColor"
              className="text-xs"
            />
          </div>
          
          <div className="pt-2 border-t border-gray-600 mt-2.5">
            <h3 className="text-base font-medium text-gray-300 mb-1.5">Stats Items <span className="text-gray-500 text-[10px]">(Max 4, edit in preview)</span></h3>
             <div className="max-h-[150px] overflow-y-auto pr-1 text-[11px] space-y-1">
                {(localMapData.stats || []).slice(0,4).map((stat, index) => (
                    <div key={stat.id || index} className="bg-gray-700 p-1.5 rounded relative">
                        <button onClick={() => handleRemoveStat(index)} className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded-full text-[8px] leading-none hover:bg-red-700 w-3 h-3 flex items-center justify-center">X</button>
                        <p className="text-gray-300 truncate pr-3">V: {stat.value || 'N/A'}</p>
                        <p className="text-gray-300 truncate pr-3">T: {stat.title || 'N/A'}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">Icon: {stat.icon || 'FaAward'}</p>
                    </div>
                ))}
            </div>
            { (localMapData.stats?.length || 0) < 4 &&
                <button onClick={handleAddStat} className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded mt-1.5 self-start hover:bg-blue-700">+ Add Stat</button>
            }
          </div>
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
  themeColors,
}) {
  // Add console log to debug incoming mapData
  console.log("BasicMapBlock received mapData:", mapData);

  const [localMapData, setLocalMapData] = useState(() => {
    const initialConfig = mapData || {};
    let centerArray = [34.0522, -118.2437]; // Default center
    if (initialConfig.center) {
      if (Array.isArray(initialConfig.center) && initialConfig.center.length === 2) {
        centerArray = initialConfig.center;
      } else if (typeof initialConfig.center === 'object' && initialConfig.center.lat !== undefined && initialConfig.center.lng !== undefined) {
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
      serviceHours: (initialConfig.serviceHours || []).map(sh => ({ ...sh, id: sh.id || `sh_${Math.random().toString(36).substr(2, 5)}` })),
      stats: (initialConfig.stats || []).map((st, idx) => ({ ...st, id: st.id || `stat_${idx}_${Date.now()}`, icon: st.icon || 'FaAward' })).slice(0,4),
      markerIcon: initializeImageState(initialConfig.markerIcon, "/assets/images/hero/clipped.png"),
      statsBackgroundImage: initializeImageState(initialConfig.statsBackgroundImage, "/assets/images/stats_background.jpg"),
      bannerTextColor: initialConfig.bannerTextColor || '#FFFFFF',
      bannerBackgroundColor: initialConfig.bannerBackgroundColor || '#1f2937',
      statsTextColor: initialConfig.statsTextColor || '#FFFFFF',
      showHoursButtonText: initialConfig.showHoursButtonText || "Show Hours",
      hideHoursButtonText: initialConfig.hideHoursButtonText || "Hide Hours"
    };
  });

  const prevReadOnlyRef = useRef(readOnly);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [editingStatIndexForIcon, setEditingStatIndexForIcon] = useState(null);

  useEffect(() => {
    if (mapData) {
      setLocalMapData(prevLocal => {
        const incomingData = { ...mapData }; // Clone mapData to safely modify

        // Transform center if it's an object in incomingData and not an array
        if (incomingData.center && typeof incomingData.center === 'object' && !Array.isArray(incomingData.center)) {
            if (incomingData.center.lat !== undefined && incomingData.center.lng !== undefined) {
                incomingData.center = [incomingData.center.lat, incomingData.center.lng];
            } else {
                // Malformed or incomplete center object, retain previous or default by deleting from incoming
                // so prevLocal.center (which is an array) is used.
                delete incomingData.center; 
            }
        } else if (Array.isArray(incomingData.center) && incomingData.center.length !== 2) {
            // If it is an array but not a valid coordinate pair, remove it to use prevLocal.center
             delete incomingData.center;
        }


        const newMarkerIcon = initializeImageState(incomingData.markerIcon, prevLocal.markerIcon?.url);
        const newStatsBg = initializeImageState(incomingData.statsBackgroundImage, prevLocal.statsBackgroundImage?.url);
        
        if (prevLocal.markerIcon?.file && prevLocal.markerIcon.url?.startsWith('blob:') && prevLocal.markerIcon.url !== newMarkerIcon.url) {
            URL.revokeObjectURL(prevLocal.markerIcon.url);
        }
        if (prevLocal.statsBackgroundImage?.file && prevLocal.statsBackgroundImage.url?.startsWith('blob:') && prevLocal.statsBackgroundImage.url !== newStatsBg.url) {
            URL.revokeObjectURL(prevLocal.statsBackgroundImage.url);
        }

        const newStatsList = (incomingData.stats || prevLocal.stats || []).map((statFromProp, index) => {
          const localStat = prevLocal.stats?.find(s => s.id === statFromProp.id) || prevLocal.stats?.[index] || {};
          const mergedStat = {
            ...localStat,
            ...statFromProp,
            id: statFromProp.id || localStat.id || `stat_update_${index}_${Date.now()}`,
            icon: statFromProp.icon || localStat.icon || 'FaAward',
          };
          // Prioritize local unsaved changes for value and title if they differ from incoming prop and are not empty
          if (localStat.value !== statFromProp.value && localStat.value !== (statFromProp.value || "")) mergedStat.value = localStat.value;
          else mergedStat.value = statFromProp.value || ""; // Default to prop or empty
          
          if (localStat.title !== statFromProp.title && localStat.title !== (statFromProp.title || "")) mergedStat.title = localStat.title;
          else mergedStat.title = statFromProp.title || ""; // Default to prop or empty
          return mergedStat;
        }).slice(0,4);

        return {
          ...prevLocal, // Start with previous local state
          ...incomingData, // Spread potentially modified incomingData (center is now an array or deleted)
          // Explicitly set fields that need careful merging or transformation
          title: (prevLocal.title !== incomingData.title && prevLocal.title !== (incomingData.title || "Are we in your area?")) ? prevLocal.title : incomingData.title || "Are we in your area?",
          address: (prevLocal.address !== incomingData.address && prevLocal.address !== (incomingData.address || "")) ? prevLocal.address : incomingData.address || "",
          telephone: (prevLocal.telephone !== incomingData.telephone && prevLocal.telephone !== (incomingData.telephone || "")) ? prevLocal.telephone : incomingData.telephone || "",
          stats: newStatsList,
          serviceHours: (incomingData.serviceHours || prevLocal.serviceHours || []).map(sh => ({ ...sh, id: sh.id || `sh_${Math.random().toString(36).substr(2, 5)}` })),
          markerIcon: newMarkerIcon,
          statsBackgroundImage: newStatsBg,
          bannerTextColor: incomingData.bannerTextColor !== undefined ? incomingData.bannerTextColor : prevLocal.bannerTextColor,
          bannerBackgroundColor: incomingData.bannerBackgroundColor !== undefined ? incomingData.bannerBackgroundColor : prevLocal.bannerBackgroundColor,
          statsTextColor: incomingData.statsTextColor !== undefined ? incomingData.statsTextColor : prevLocal.statsTextColor,
          showHoursButtonText: incomingData.showHoursButtonText !== undefined ? incomingData.showHoursButtonText : prevLocal.showHoursButtonText,
          hideHoursButtonText: incomingData.hideHoursButtonText !== undefined ? incomingData.hideHoursButtonText : prevLocal.hideHoursButtonText
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
    setLocalMapData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      if (newState.stats && newState.stats.length > 4) newState.stats = newState.stats.slice(0, 4);
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
        handleLocalDataChange(prev => {
            const newStats = [...(prev.stats || [])];
            if (newStats[editingStatIndexForIcon]) {
                newStats[editingStatIndexForIcon] = { ...newStats[editingStatIndexForIcon], icon: iconName };
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
    handleLocalDataChange(prev => {
        const newServiceHours = [...(prev.serviceHours || [])];
        // Ensure the service hour object exists
        while(newServiceHours.length <= index) newServiceHours.push({ id: `sh_new_${newServiceHours.length}`, day: '', time: '' });
        if (newServiceHours[index]) {
            newServiceHours[index] = { ...newServiceHours[index], [field]: value };
        }
        return { ...prev, serviceHours: newServiceHours };
    });
  };

  const handleStatTextChange = (index, field, value) => {
    handleLocalDataChange(prev => {
      const currentStats = prev.stats || [];
      const newStats = [...currentStats];
      while(newStats.length <= index && index < 4) newStats.push({ id: `stat_new_${newStats.length}`, icon: 'FaAward', value: '', title: '' });
      if (newStats[index]) newStats[index] = { ...newStats[index], [field]: value };
      return { ...prev, stats: newStats.slice(0,4) }; 
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
      <BasicMapEditorPanel
        localMapData={localMapData}
        onPanelChange={handleLocalDataChange} 
        themeColors={themeColors}
      />
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onIconSelect={handleIconSelectionForStat}
        currentIconPack="fa" 
        currentIconName={editingStatIndexForIcon !== null && localMapData.stats && localMapData.stats[editingStatIndexForIcon] ? localMapData.stats[editingStatIndexForIcon].icon : null}
      />
    </>
  );
}
