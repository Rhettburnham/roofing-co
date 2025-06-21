import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
  useLayoutEffect,
} from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as FaIcons from "react-icons/fa";
import IconSelectorModal from "../common/IconSelectorModal";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";
import PropTypes from "prop-types";

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

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

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
  // If it's a File object directly (less common for this helper, but defensive)
  if (imageValue instanceof File) return URL.createObjectURL(imageValue);
  return defaultPath;
};

// Helper to initialize image state: handles string path or {file, url, name, originalUrl} object
const initializeImageState = (imageConfig, defaultStaticPath) => {
  let file = null;
  let url = defaultStaticPath;
  let name = defaultStaticPath.split('/').pop();
  let originalUrl = defaultStaticPath; // Default originalUrl is the static default path

  if (typeof imageConfig === 'string') {
    url = imageConfig;
    name = imageConfig.split('/').pop();
    originalUrl = imageConfig; // String path is the original
  } else if (imageConfig && typeof imageConfig === 'object') {
    // Use provided url for display, which could be a blob or a path
    url = imageConfig.url || defaultStaticPath;
    name = imageConfig.name || url.split('/').pop();
    file = imageConfig.file || null; // Preserve file if it exists (e.g. from active editing state)
    
    // Determine originalUrl: prioritize existing originalUrl, then a non-blob url, then defaultStaticPath
    if (imageConfig.originalUrl) {
      originalUrl = imageConfig.originalUrl;
    } else if (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:')) {
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

const StatsPanel = memo(({ stats, readOnly, onStatTextChange, onStatIconClick, statsTextColor, statCardBackgroundColor, statsTextSettings }) => {
  const displayStats = [...(stats || [])];
  while (displayStats.length < 4 && !readOnly) { // Only add placeholders if not readOnly and less than 4, or always show 4 if readOnly and less than 4 initially
      displayStats.push({ value: '0', title: 'New Stat', icon: 'FaAward' });
  }
  const gridStats = displayStats.slice(0, 4);
  const currentStatsTextColor = statsTextColor || '#FFFFFF';
  const statsStyle = getTextStyles(statsTextSettings);

  return (
    <div className={`w-full h-full grid gap-1 md:gap-2 grid-cols-2 grid-rows-2 text-center p-1 md:p-2`}>
      {gridStats.map((stat, index) => {
        const IconComponent = FaIcons[stat.icon] || FaIcons.FaAward;
        return (
          <div key={stat.id || index} className="flex flex-col items-center justify-center bg-white/30 rounded-lg p-1 shadow-md h-full w-full">
            <div className={`p-1 rounded-full ${!readOnly ? 'cursor-pointer hover:bg-white/20' : ''} transition-colors`} onClick={() => !readOnly && onStatIconClick && onStatIconClick(index)} title={!readOnly ? "Click to change icon" : ""}>
              <IconComponent className="w-8 h-8 md:w-6 md:h-6 md:mb-1" style={{color: currentStatsTextColor}} />
            </div>
            {readOnly ? (
                <div className="text-lg md:text-lg font-bold" style={{...statsStyle, color: statsStyle.color || currentStatsTextColor}}>{stat.value}</div>
            ) : (
                <input type="text" style={{...statsStyle, color: statsStyle.color || currentStatsTextColor}} className="text-lg md:text-lg font-bold bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300" value={stat.value || ""} onChange={(e) => onStatTextChange && onStatTextChange(index, 'value', e.target.value)} placeholder="Value"/>
            )}
            {readOnly ? (
                <div className="text-[3vw] md:text-sm font-medium line-clamp-1" style={{...statsStyle, color: statsStyle.color || currentStatsTextColor}}>{stat.title || stat.label}</div>
            ) : (
                <input type="text" style={{...statsStyle, color: statsStyle.color || currentStatsTextColor}} className="text-[3vw] md:text-sm font-medium line-clamp-1 bg-transparent text-center w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300" value={stat.title || stat.label || ""} onChange={(e) => onStatTextChange && onStatTextChange(index, 'title', e.target.value)} placeholder="Title"/>
            )}
          </div>
        );
      })}
    </div>
  );
});

// Window strings component
const WindowStrings = memo(({ isVisible, color1, color2 }) => {
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
          <div className="w-[4px] h-[27vh]" style={{ backgroundColor: color1 || '#374151' }}></div>
          <div
            className="w-[30px] h-[40px]"
            style={{
              backgroundColor: color2 || '#1f2937',
              clipPath: "polygon(40% 0%, 60% 0%, 80% 100%, 20% 100%)",
              borderRadius: "0px 0px 8px 8px",
            }}
          ></div>
        </div>

        {/* Right side */}
        <div ref={rightRef} className="flex flex-col items-center">
          <div className="w-[4px] h-[27vh]" style={{ backgroundColor: color1 || '#374151' }}></div>
          <div
            className="w-[30px] h-[40px]"
            style={{
              backgroundColor: color2 || '#1f2937',
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
  const [statsPanelHeight, setStatsPanelHeight] = useState(0);
  const titleRef = useRef(null);
  const sectionRef = useRef(null);
  const statsPanelRef = useRef(null);
  const buttonRef = useRef(null); // Add ref for the button

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
    hideHoursButtonText,
    styling = { desktopHeightVH: 30, mobileHeightVW: 40 },
    statCardBackgroundColor,
    serviceHoursEvenRowBg,
    serviceHoursOddRowBg,
    serviceHoursTextColor,
    windowStringColor1,
    windowStringColor2,
    titleTextSettings,
    bannerTextSettings,
    statsTextSettings,
    serviceHoursTextSettings,
    buttonTextSettings,
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

  useLayoutEffect(() => {
    if (isSmallScreen && statsPanelRef.current) {
      setStatsPanelHeight(statsPanelRef.current.offsetHeight);
    } else {
      setStatsPanelHeight(0);
    }
  }, [isSmallScreen, mapData.stats, readOnly]);

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
    <div className="w-full h-full flex flex-col" style={{ color: serviceHoursTextColor || '#1f2937' }}>
      {/* Container for rows, using flex to distribute space */}
      {serviceHours.map((item, idx) => (
        <div
          key={item.id || idx}
          className="flex border-b border-gray-300 flex-grow" // Each row will grow to fill space
          style={{ backgroundColor: idx % 2 === 0 ? (serviceHoursEvenRowBg || '#f9fafb') : (serviceHoursOddRowBg || '#ffffff') }}
        >
          <div className="w-1/2 py-2 px-2 md:px-4 text-[2.8vw] md:text-sm font-medium text-left border-r border-gray-300 flex items-center">
            {readOnly ? <span style={getTextStyles(serviceHoursTextSettings)}>{item.day}</span> : (
              <input 
                type="text" 
                value={item.day || ''}
                onChange={(e) => onServiceHourChange && onServiceHourChange(idx, 'day', e.target.value)}
                className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0.5 placeholder-gray-400"
                placeholder="Day"
                style={getTextStyles(serviceHoursTextSettings)}
              />
            )}
          </div>
          <div className="w-1/2 py-2 px-2 md:px-4 text-[2.8vw] md:text-sm text-left flex items-center">
            {readOnly ? <span style={getTextStyles(serviceHoursTextSettings)}>{item.time}</span> : (
              <input 
                type="text" 
                value={item.time || ''}
                onChange={(e) => onServiceHourChange && onServiceHourChange(idx, 'time', e.target.value)}
                className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-0.5 placeholder-gray-400"
                placeholder="Time"
                style={getTextStyles(serviceHoursTextSettings)}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const currentBannerBgColor = bannerBackgroundColor || '#1f2937';
  const currentBannerTextColor = bannerTextColor || '#FFFFFF';
  const currentShowHoursText = showHoursButtonText || "Show Hours";
  const currentHideHoursText = hideHoursButtonText || "Hide Hours";

  // Calculate dynamic height based on styling
  const dynamicMapHeight = isSmallScreen 
    ? 'auto'
    : `${styling.desktopHeightVH}vh`;

  return (
    <section ref={sectionRef}>
      <div className="py-4 px-[4vw]">
        <div className="relative flex flex-col md:flex-row gap-4 px-10 md:px-6 md:justify-between w-full" style={!isSmallScreen ? { height: dynamicMapHeight } : {}}> 
          {/* Left: Map */}
          <div className="flex flex-col w-full md:w-[55%]" style={isSmallScreen ? { height: dynamicMapHeight } : {}}>
            <div className="relative h-full w-full z-10 aspect-video md:aspect-auto"> {/* Changed to full height */}
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative">
                {/* Title with animation - conditionally editable - MOVED HERE */}
                {readOnly ? (
                  <h1
                    ref={titleRef}
                    className="absolute top-2 left-1 text-[2.5vh] md:text-[2.5vh] font-normal text-white font-serif title-animation z-20 p-2 bg-banner bg-opacity-30 pl-6 -ml-4 rounded"
                    style={getTextStyles(titleTextSettings)}
                  >
                    {title || "Are we in your area?"}
                  </h1>
                ) : (
                  <input
                    type="text"
                    ref={titleRef}
                    className="absolute top-2 left-1 text-[2.5vh] md:text-[2.5vh] font-normal text-white font-serif z-20 p-2 bg-transparent pl-6 -ml-4 focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded placeholder-gray-300"
                    value={title || ""}
                    onChange={(e) => onInlineChange('title', e.target.value)}
                    placeholder="Section Title"
                    style={{...getTextStyles(titleTextSettings), mixBlendMode: 'difference'}} // Helps with visibility over varied map parts
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
                      <div className="font-semibold text-[2.5vw] md:text-[2.3vh] leading-tight text-left" style={getTextStyles(bannerTextSettings)}>
                        {address}
                      </div>
                      <div className="text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight text-right">
                        <a href={`tel:${telephone?.replace(/[^0-9]/g, "")}`} style={getTextStyles(bannerTextSettings)}>
                          {telephone}
                        </a>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-[2.5vw] md:text-[2.3vh] leading-tight text-left flex-grow">
                        <input 
                          type="text"
                          className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                          value={address || ""}
                          onChange={(e) => onInlineChange('address', e.target.value)}
                          placeholder="Address"
                          style={getTextStyles(bannerTextSettings)}
                        />
                      </div>
                      <div className="text-[2.5vw] md:text-[2vh] text-white font-semibold leading-tight text-right ml-4">
                        <input 
                          type="text"
                          className="bg-transparent w-full text-right focus:outline-none focus:ring-1 focus:ring-yellow-300 rounded px-1 placeholder-gray-300"
                          value={telephone || ""}
                          onChange={(e) => onInlineChange('telephone', e.target.value)}
                          placeholder="Telephone"
                          style={getTextStyles(bannerTextSettings)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Right: Stats + Service Hours - Stats conditionally editable */} 
          <div className="relative flex flex-col w-full md:w-[43%]">
            <button
              ref={buttonRef}
              type="button"
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="relative dark_button bg-gray-700 rounded-t-xl py-1 md:py-2 px-4 flex justify-end items-center w-full text-white transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif z-30"
              style={{ willChange: "transform" }}
            >
              <span className="font-serif text-[2vh]" style={getTextStyles(buttonTextSettings)}>
                {isServiceHoursVisible ? currentHideHoursText : currentShowHoursText}
              </span>
            </button>
            <div 
              className="relative rounded-b-xl overflow-hidden flex-grow"
              style={isSmallScreen ? { minHeight: statsPanelHeight ? `${statsPanelHeight}px` : 'auto' } : {}}
            >
              <WindowStrings
                isVisible={isServiceHoursVisible}
                color1={windowStringColor1}
                color2={windowStringColor2}
              />
              {/* Stats background and content - conditionally editable stats */}
              <div className="relative inset-0 z-10 w-full h-full">
                <div className="absolute inset-0">
                  <img
                    src={getDisplayUrl(statsBackgroundImage, "/assets/images/stats_background.jpg")}
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div ref={statsPanelRef} className={`relative w-full h-full flex items-center justify-center overflow-hidden ${readOnly ? '' : 'p-1 md:p-2'}`}> 
                  <StatsPanel 
                    stats={stats} 
                    readOnly={readOnly} 
                    onStatTextChange={onStatTextChange} 
                    onStatIconClick={onStatIconClick} 
                    statsTextColor={statsTextColor} 
                    statCardBackgroundColor={statCardBackgroundColor}
                    statsTextSettings={statsTextSettings}
                  />
                </div>
              </div>
            </div>

            {/* Service hours overlay - positioned absolutely relative to button */}
            <div
              className={`
                absolute left-0 right-0 z-40
                bg-white rounded-b-xl border border-gray-200 shadow-lg
                transition-all duration-500 ease-in-out
                ${isServiceHoursVisible 
                  ? "opacity-100 translate-y-0 pointer-events-auto" 
                  : "opacity-0 -translate-y-4 pointer-events-none"
                }
              `}
              style={{ 
                willChange: "transform, opacity",
                top: buttonRef.current ? `${buttonRef.current.offsetHeight}px` : '40px',
                maxHeight: isSmallScreen ? '50vh' : '40vh',
                overflowY: 'auto'
              }}
            >
              {renderServiceHoursTable()}
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

// =============================================
// Control Components for Tabs
// =============================================

const BasicMapColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorUpdate = (fieldName, colorValue) => {
    onControlsChange({ ...currentData, [fieldName]: colorValue });
  };

  return (
    <div className="p-3 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Banner Text Color:"
          currentColorValue={currentData.bannerTextColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('bannerTextColor', value)}
          fieldName="bannerTextColor"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Banner Background:"
          currentColorValue={currentData.bannerBackgroundColor || '#1f2937'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('bannerBackgroundColor', value)}
          fieldName="bannerBackgroundColor"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Stats Panel Text Color:"
          currentColorValue={currentData.statsTextColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('statsTextColor', value)}
          fieldName="statsTextColor"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Stat Card Background:"
          currentColorValue={currentData.statCardBackgroundColor || 'rgba(255, 255, 255, 0.3)'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('statCardBackgroundColor', value)}
          fieldName="statCardBackgroundColor"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Service Hours - Text:"
          currentColorValue={currentData.serviceHoursTextColor || '#1f2937'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('serviceHoursTextColor', value)}
          fieldName="serviceHoursTextColor"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Service Hours - Even Row:"
          currentColorValue={currentData.serviceHoursEvenRowBg || '#f9fafb'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('serviceHoursEvenRowBg', value)}
          fieldName="serviceHoursEvenRowBg"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Service Hours - Odd Row:"
          currentColorValue={currentData.serviceHoursOddRowBg || '#ffffff'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('serviceHoursOddRowBg', value)}
          fieldName="serviceHoursOddRowBg"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Window String 1:"
          currentColorValue={currentData.windowStringColor1 || '#374151'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('windowStringColor1', value)}
          fieldName="windowStringColor1"
          className="text-xs"
        />
        <ThemeColorPicker
          label="Window String 2:"
          currentColorValue={currentData.windowStringColor2 || '#1f2937'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorUpdate('windowStringColor2', value)}
          fieldName="windowStringColor2"
          className="text-xs"
        />
      </div>
    </div>
  );
};

const BasicMapStylingControls = ({ currentData, onControlsChange }) => {
  const handleFieldChange = (field, value, isCoordinate = false, coordIndex = 0) => {
    if (isCoordinate) {
      const newCenter = [...(currentData.center || [0,0])];
      newCenter[coordIndex] = parseFloat(value) || 0;
      onControlsChange({ ...currentData, center: newCenter });
    } else if (field === 'zoomLevel' || field === 'circleRadius') {
      onControlsChange({ ...currentData, [field]: parseInt(value, 10) || 0 });
    } else if (field === 'styling') {
      onControlsChange({ ...currentData, styling: { ...currentData.styling, ...value } });
    } else {
      onControlsChange({ ...currentData, [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      {/* Height Controls using PanelStylingController */}
      <div>
        <PanelStylingController
          currentData={currentData}
          onControlsChange={onControlsChange}
          blockType="BasicMapBlock"
          controlType="height"
        />
      </div>

      {/* Map-specific settings */}
      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-base font-medium text-gray-700 mb-3">Map View Settings</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Latitude:</span>
            <input 
              type="number" 
              step="any" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              value={currentData.center?.[0] || 0} 
              onChange={(e) => handleFieldChange('center', e.target.value, true, 0)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Longitude:</span>
            <input 
              type="number" 
              step="any" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              value={currentData.center?.[1] || 0} 
              onChange={(e) => handleFieldChange('center', e.target.value, true, 1)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Zoom Level:</span>
            <input 
              type="number" 
              min="1" 
              max="20" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              value={currentData.zoomLevel || 5} 
              onChange={(e) => handleFieldChange('zoomLevel', e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Circle Radius (m):</span>
            <input 
              type="number" 
              min="0" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              value={currentData.circleRadius || 0} 
              onChange={(e) => handleFieldChange('circleRadius', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-base font-medium text-gray-700 mb-3">Button Text</h3>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Show Hours Text:</span>
            <input 
              type="text" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              placeholder="Show Hours" 
              value={currentData.showHoursButtonText || ''} 
              onChange={(e) => handleFieldChange('showHoursButtonText', e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-gray-600 block mb-1">Hide Hours Text:</span>
            <input 
              type="text" 
              className="bg-gray-100 px-3 py-2 rounded w-full text-gray-800 focus:ring-blue-500 focus:border-blue-500 text-sm" 
              placeholder="Hide Hours" 
              value={currentData.hideHoursButtonText || ''} 
              onChange={(e) => handleFieldChange('hideHoursButtonText', e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg">
        <h3 className="text-base font-medium text-gray-700 mb-3">Stats Management</h3>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Stats can be edited directly in the preview. Maximum 4 stats allowed.</p>
          <div className="text-sm text-gray-500">
            Current stats: {(currentData.stats || []).length}/4
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==============================================
   BASIC MAP FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for BasicMap text elements
=============================================== */
const BasicMapFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleSettingsChange = (fieldPrefix, newSettings) => {
    onControlsChange({
      ...currentData,
      [fieldPrefix]: {
        ...currentData[fieldPrefix],
        ...newSettings
      }
    });
  };

  const fontFields = [
    { prefix: 'titleTextSettings', label: 'Title Text' },
    { prefix: 'bannerTextSettings', label: 'Banner Text (Address/Phone)' },
    { prefix: 'statsTextSettings', label: 'Stats Text' },
    { prefix: 'serviceHoursTextSettings', label: 'Service Hours Text' },
    { prefix: 'buttonTextSettings', label: 'Hours Button Text' },
  ];

  return (
    <div className="bg-white text-gray-800 p-4 rounded">
      <h3 className="text-lg font-semibold mb-4">Font Settings</h3>
      <div className="space-y-6">
        {fontFields.map(({ prefix, label }) => (
          <div key={prefix} className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">{label}</h4>
            <PanelFontController
              label={`${label} Font`}
              currentData={currentData}
              onControlsChange={onControlsChange}
              fieldPrefix={prefix}
              themeColors={themeColors}
            />
          </div>
        ))}
      </div>
    </div>
  );
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
  const [localData, setLocalData] = useState(
    () =>
      mapData || {
        title: "",
        center: { lat: 33.35, lng: -84.78 },
        zoomLevel: 11,
        circleRadius: 5047,
        address: "",
        mapHeightVH: 60,
        mapHeightVW: 100,
        markerIcon: initializeImageState(null, "/assets/images/hero/clipped.png"),
        stats: [],
        serviceHours: [],
        styling: {
          titleColor: "#000000",
          addressColor: "#555555",
          circleColor: "#ff0000",
          statsTextColor: "#FFFFFF",
          statCardBackgroundColor: "rgba(0, 0, 0, 0.5)",
          serviceHoursBackgroundColor: "rgba(255, 255, 255, 0.8)",
          serviceHoursTextColor: "#000000",
          serviceHoursHighlightColor: "#ffc107",
        },
        textSettings: {
          title: {},
          address: {},
          stats: {},
          serviceHours: {},
        },
      }
  );
  const [activeStatIndex, setActiveStatIndex] = useState(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const prevMapDataRef = useRef();
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    const newConfigString = JSON.stringify(mapData);
    const oldConfigString = JSON.stringify(prevMapDataRef.current);
  
    if (newConfigString !== oldConfigString) {
      prevMapDataRef.current = mapData;
  
      setLocalData((prevLocal) => {
        const newLocal = { ...prevLocal, ...mapData };
        if (mapData.markerIcon) {
          newLocal.markerIcon = initializeImageState(mapData.markerIcon, "/assets/images/hero/clipped.png");
        }
        return newLocal;
      });
    }
  }, [mapData]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("BasicMapBlock: Editing finished. Calling onConfigChange.");
        onConfigChange(localData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      if (newState.stats && newState.stats.length > 4) newState.stats = newState.stats.slice(0, 4);
      
      if (!readOnly && onConfigChange) {
        onConfigChange(newState);
      }
      
      return newState;
    });
  };

  const handleStatIconEditClick = (statIndex) => {
    if (readOnly) return;
    setActiveStatIndex(statIndex);
    setIsIconModalOpen(true);
  };

  const handleIconSelectionForStat = (pack, iconName) => {
    if (activeStatIndex !== null) {
        handleLocalDataChange(prev => {
            const newStats = [...(prev.stats || [])];
            if (newStats[activeStatIndex]) {
                newStats[activeStatIndex] = { ...newStats[activeStatIndex], icon: iconName };
            }
            return { ...prev, stats: newStats };
        });
    }
    setIsIconModalOpen(false);
    setActiveStatIndex(null);
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
    const updatedStats = [...localData.stats];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    handleLocalDataChange({ stats: updatedStats });
  };
  
  if (readOnly) {
    return <BasicMapPreview mapData={localData} readOnly={true} />;
  }
  
  return (
    <>
      <BasicMapPreview 
        mapData={localData} 
        readOnly={false}
        onInlineChange={handleInlineChange}
        onStatTextChange={handleStatTextChange}
        onStatIconClick={handleStatIconEditClick} 
        onServiceHourChange={handleServiceHourLocalChange}
      />
      <IconSelectorModal
        isOpen={isIconModalOpen}
        onClose={() => setIsIconModalOpen(false)}
        onSelectIcon={handleIconSelectionForStat}
        currentIcon={
          activeStatIndex !== null && localData.stats[activeStatIndex]
            ? localData.stats[activeStatIndex].icon
            : "FaAward"
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
BasicMapBlock.tabsConfig = (currentData, onControlsChange, themeColors) => {
  const tabs = {};

  // Images Tab - Using standardized PanelImagesController
  tabs.images = (props) => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">Marker Icon</h3>
        <PanelImagesController
          currentData={{ 
            images: currentData.markerIcon ? [currentData.markerIcon] : []
          }}
          onControlsChange={(updatedData) => {
            const images = updatedData.images || [];
            const markerIcon = images.length > 0 ? images[0] : null;
            onControlsChange({ ...currentData, markerIcon });
          }}
          imageArrayFieldName="images"
          getItemName={() => 'Map Marker Icon'}
          maxImages={1}
        />
      </div>
      
      <div>
        <h3 className="text-base font-medium text-gray-700 mb-3">Stats Panel Background</h3>
        <PanelImagesController
          currentData={{ 
            images: currentData.statsBackgroundImage ? [currentData.statsBackgroundImage] : []
          }}
          onControlsChange={(updatedData) => {
            const images = updatedData.images || [];
            const statsBackgroundImage = images.length > 0 ? images[0] : null;
            onControlsChange({ ...currentData, statsBackgroundImage });
          }}
          imageArrayFieldName="images"
          getItemName={() => 'Stats Background Image'}
          maxImages={1}
        />
      </div>
    </div>
  );

  // Colors Tab
  tabs.colors = (props) => (
    <BasicMapColorControls 
      {...props} 
      currentData={currentData} 
      onControlsChange={onControlsChange} 
      themeColors={themeColors} 
    />
  );

  // Styling Tab
  tabs.styling = (props) => (
    <BasicMapStylingControls 
      {...props} 
      currentData={currentData} 
      onControlsChange={onControlsChange}
    />
  );

  // Fonts Tab
  tabs.fonts = (props) => (
    <BasicMapFontsControls 
      {...props} 
      currentData={currentData} 
      onControlsChange={onControlsChange}
      themeColors={themeColors}
    />
  );

  return tabs;
};

export default BasicMapBlock;
