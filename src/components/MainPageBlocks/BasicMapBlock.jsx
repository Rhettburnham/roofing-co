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

// Register ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// to do this needs to be centered where the lat is currentl seem up and to the right
const CustomMarkerIcon = L.icon({
  iconUrl: "/assets/images/clipped-cowboy.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15], // Center the icon properly
  popupAnchor: [0, -20],
  className: "invert-icon", // Add class to make it white
});

const DropMarker = memo(({ position }) => {
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
      icon={CustomMarkerIcon}
      ref={markerRef}
      style={{ filter: "invert(0)" }}
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
      <div className="flex flex-row justify-center items-center text-[5.5vhw] md:text-[6.5vh] text-gray-50/80">
        <IconComp className="w-full h-full" />
        <p className="ml-2 text-xs md:text-base font-semibold text-yellow-100">
          {count}
        </p>
      </div>
      <div className="flex gap-1">
        <p className="whitespace-nowrap text-sm md:text-sm font-semibold text-white mt-1">
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
            <IconComponent className="w-4 h-4 md:w-6 md:h-6 mb-0.5 md:mb-1 text-white" />
            <div className="text-sm md:text-lg font-bold text-white">
              {stat.value}
            </div>
            <div className="text-[1.8vw] md:text-sm text-white font-medium line-clamp-1">
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
function BasicMapPreview({ mapData }) {
  if (!mapData) {
    return <p>No map data found.</p>;
  }

  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [mapActive, setMapActive] = useState(false);
  const statsDivRef = useRef(null);
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
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.id === 'titleAnimation') {
        trigger.kill();
      }
    });

    // Define different animations for small vs medium+ viewports
    if (isSmallScreen) {
      // Small viewport: Slide in from right when 30% from bottom of viewport
      gsap.set(titleRef.current, { 
        x: '100vw', // Start off-screen to the right
        opacity: 0
      });
      
      gsap.to(titleRef.current, {
        x: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          id: 'titleAnimation',
          trigger: sectionRef.current,
          start: "bottom 70%", // Trigger when bottom of section is 30% from bottom (70% down viewport)
          toggleActions: "play none none none",
          once: true,
          // markers: true, // Uncomment for debugging
        }
      });
    } else {
      // Medium+ viewport: Animate from current left position to center when scrolled 40% down vp
      const parentWidth = titleRef.current.parentNode.offsetWidth;
      const titleWidth = titleRef.current.offsetWidth;
      const targetX = (parentWidth / 2) - (titleWidth / 2) - 44; // Center position accounting for padding

      gsap.to(titleRef.current, {
        x: targetX,
        duration: 1.2,
        ease: "power2.inOut",
        scrollTrigger: {
          id: 'titleAnimation',
          trigger: sectionRef.current,
          start: "top 40%", // Trigger when top of section reaches 40% down the viewport
          toggleActions: "play none none none",
          once: true,
          // markers: true, // Uncomment for debugging
        }
      });
    }

    return () => {
      // Cleanup
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.id === 'titleAnimation') {
          trigger.kill();
        }
      });
    };
  }, [isSmallScreen, titleRef, sectionRef]);

  const renderServiceHoursTable = () => (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-white p-1 md:p-0">
      <table className="w-full border-collapse border border-gray-300 shadow-sm">
        <thead className="bg-gray-700 sticky top-0">
          <tr>
            <th className="py-1 md:py-2 px-2 md:px-4 text-white text-[2.5vw] md:text-sm font-semibold">
              Day
            </th>
            <th className="py-1 md:py-2 px-2 md:px-4 text-white text-[2.5vw] md:text-sm font-semibold">
              Hours
            </th>
          </tr>
        </thead>
        <tbody className="text-center">
          {serviceHours.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 border border-gray-300 text-[2.8vw] md:text-sm font-medium text-gray-800">
                {item.day}
              </td>
              <td className="py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 border border-gray-300 text-[2.8vw] md:text-sm text-gray-800">
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
        <div
          className={`flex ${isSmallScreen ? "justify-center" : "justify-start pl-11"}`}
        >
          {/* Title with animation */}
          <h1 
            ref={(el) => { titleRef.current = el; }}
            className="text-[3vh] md:text-[4vh] font-normal text-black text-center font-serif title-animation"
          >
            Are we in your area?
          </h1>
        </div>
        <div className="relative flex flex-col md:flex-row gap-4 px-10 md:px-6 h-auto md:h-[40vh] md:justify-between w-full">
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
                <div className="absolute bottom-0 w-full bg-banner text-center text-white font-semibold z-10 py-2">
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
          <div className="flex flex-col w-full md:w-[43%]">
            <button
              type="button"
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="dark_button bg-gray-700 rounded-t-xl py-1 md:py-2 items-center justify-center text-white text-[2vh] transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif z-30 relative"
              style={{ willChange: 'transform' }}
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>
            <div
              className="relative h-[30vh] md:h-[calc(40vh-2.5rem)] rounded-b-xl overflow-hidden"
              ref={statsDivRef}
            >
              <WindowStrings
                isVisible={isServiceHoursVisible}
                isSmallScreen={isSmallScreen}
              />
              {/* Stats background and content */}
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  <img
                    src="/assets/images/stats_background.jpg"
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <StatsPanel isSmallScreen={isSmallScreen} stats={stats} />
                </div>
              </div>
              
              {/* Service hours overlay */}
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white rounded-b-xl
                  transition-transform duration-500 ease-in-out
                  ${isServiceHoursVisible ? "translate-y-0" : "translate-y-[-101%]"}
                `}
                style={{ willChange: 'transform' }}
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

function BasicMapEditorPanel({ localMap, setLocalMap, onSave }) {
  const [mapActive, setMapActive] = useState(false);
  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
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

  const renderServiceHoursTable = () => (
    <div className="w-full h-full flex items-center justify-center overflow-auto bg-white p-1 md:p-0">
      <table className="w-full border-collapse border border-gray-300 shadow-sm">
        <thead className="bg-gray-700 sticky top-0">
          <tr>
            <th className="py-1 md:py-2 px-2 md:px-4 text-white text-[2.5vw] md:text-sm font-semibold">
              Day
            </th>
            <th className="py-1 md:py-2 px-2 md:px-4 text-white text-[2.5vw] md:text-sm font-semibold">
              Hours
            </th>
          </tr>
        </thead>
        <tbody className="text-center">
          {localMap.serviceHours.map((item, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 border border-gray-300 text-[2.8vw] md:text-sm font-medium text-gray-800">
                {item.day}
              </td>
              <td className="py-[0.8vh] md:py-[1.2vh] px-2 md:px-4 border border-gray-300 text-[2.8vw] md:text-sm text-gray-800">
                {item.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const handleStatChange = (i, newStat) => {
    const updated = [...localMap.stats];
    updated[i] = newStat;
    setLocalMap((p) => ({ ...p, stats: updated }));
  };

  const handleRemoveStat = (i) => {
    const updated = [...localMap.stats];
    updated.splice(i, 1);
    setLocalMap((p) => ({ ...p, stats: updated }));
  };

  const handleAddStat = () => {
    setLocalMap((p) => ({
      ...p,
      stats: [
        ...p.stats,
        { title: "New Stat", value: 99, icon: "FaQuestionCircle" },
      ],
    }));
  };

  return (
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Map Editor</h1>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Layout: Map + Stats + Service Hours */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left side: Map config & preview */}
        <div className="flex-1 space-y-4">
          {/* Form inputs for address, phone, radius */}
          <div className="flex flex-col md:flex-row gap-2">
            <label className="block">
              <span className="block text-sm mb-1">Address:</span>
              <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded w-full"
                value={localMap.address || ""}
                onChange={(e) =>
                  setLocalMap((p) => ({ ...p, address: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">Phone:</span>
              <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded w-full"
                value={localMap.telephone || ""}
                onChange={(e) =>
                  setLocalMap((p) => ({ ...p, telephone: e.target.value }))
                }
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">Radius:</span>
              <input
                type="number"
                className="bg-gray-700 px-2 py-1 rounded w-full"
                value={localMap.circleRadius || 0}
                onChange={(e) =>
                  setLocalMap((p) => ({
                    ...p,
                    circleRadius: parseInt(e.target.value, 10),
                  }))
                }
              />
            </label>
          </div>

          {/* Editable map preview */}
          <div className="relative h-[40vh] md:h-[50vh] w-full">
            <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative">
              <MapContainer
                center={localMap.center || [0, 0]}
                zoom={localMap.zoomLevel || 5}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={mapActive}
                className="z-0"
              >
                <TileLayer
                  url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=cN6b03TNjAiJuVEdoMNh"
                  attribution="&copy; MapTiler"
                />
                {localMap.center && (
                  <Circle
                    center={localMap.center}
                    radius={localMap.circleRadius || 0}
                    pathOptions={{
                      color: "transparent",
                      weight: 0,
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                )}
                {localMap.center && <DropMarker position={localMap.center} />}
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

              <div className="absolute bottom-0 w-full bg-banner text-center  z-10">
                <div className="font-semibold text-base font-serif leading-tight">
                  {localMap.address}
                </div>
                <div className="text-sm text-gray-200 font-bold font-serif leading-tight">
                  <a href={`tel:${localMap.telephone?.replace(/[^0-9]/g, "")}`}>
                    {localMap.telephone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Stats + Service Hours */}
        <div className="flex-1 space-y-4">
          {/* Stats Editor */}
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-sm font-semibold mb-2">Stats Editor</h4>
            <div className="max-h-[22vh] overflow-auto">
              {localMap.stats?.map((stat, i) => (
                <StatItemEditor
                  key={i}
                  stat={stat}
                  onChange={(newVal) => handleStatChange(i, newVal)}
                  onRemove={() => handleRemoveStat(i)}
                />
              ))}
            </div>
            <button
              onClick={handleAddStat}
              className="bg-blue-600 text-white text-xs px-2 py-1 rounded mt-2"
            >
              + Add Stat
            </button>
          </div>

          {/* Service Hours Editor */}
          <div className="bg-gray-800 p-3 rounded relative">
            <button
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-xs relative z-30"
              style={{ willChange: 'transform' }}
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>
            <div className="relative overflow-hidden h-[30vh] md:h-[40vh]" ref={statsDivRef}>
              <WindowStrings
                isVisible={isServiceHoursVisible}
                isSmallScreen={isSmallScreen}
              />
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white rounded
                  transition-transform duration-500 ease-in-out
                  ${isServiceHoursVisible ? "translate-y-0" : "translate-y-[-101%]"}
                `}
                style={{ willChange: 'transform' }}
              >
                {renderServiceHoursTable()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------
   4) MAIN EXPORT
   If readOnly = true => BasicMapPreview
   If readOnly = false => BasicMapEditorPanel
-----------------------------------------------------*/
export default function BasicMapBlock({
  readOnly = false,
  mapData,
  onConfigChange,
}) {
  // Initialize local editor state
  const [localMapData, setLocalMapData] = useState(() => {
    if (!mapData) {
      return {
        center: [0, 0],
        zoomLevel: 5,
        circleRadius: 0,
        address: "",
        telephone: "",
        serviceHours: [],
        stats: [],
      };
    }
    return {
      ...mapData,
      serviceHours: mapData.serviceHours?.map((sh) => ({ ...sh })) || [],
      stats: mapData.stats?.map((st) => ({ ...st })) || [],
    };
  });

  const handleSave = () => {
    onConfigChange?.(localMapData);
  };

  if (readOnly) {
    return <BasicMapPreview mapData={mapData} />;
  }

  return (
    <BasicMapEditorPanel
      localMap={localMapData}
      setLocalMap={setLocalMapData}
      onSave={handleSave}
    />
  );
}
