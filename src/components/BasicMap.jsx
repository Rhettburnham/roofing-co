import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import { FaUsers, FaCalendarAlt, FaHandshake, FaHome, FaMapMarkerAlt } from "react-icons/fa";

const CustomMarkerIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const DropMarker = ({ position, icon }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      gsap.from(markerRef.current.getElement(), {
        y: -100,
        duration: 0.6,
        ease: "bounce.out",
      });
    }
  }, []);

  return <Marker position={position} icon={icon} ref={markerRef} />;
};

const StatsPanel = ({ isSmallScreen }) => {
  const statsData = [
    { title: "Employees", value: 25, icon: <FaUsers className="w-full h-full" /> },
    { title: "Years of Service", value: 10, icon: <FaCalendarAlt className="w-full h-full" /> },
    { title: "Customers Served", value: 500, icon: <FaHandshake className="w-full h-full" /> },
    { title: "Roofs Repaired", value: 300, icon: <FaHome className="w-full h-full" /> },
  ];

  const containerClasses = `
    grid gap-6 p-4
    ${isSmallScreen ? "text-xs" : "text-base"}
    grid-cols-2
  `;

  return (
    <div className={containerClasses}>
      {statsData.map((item, idx) => (
        <StatItem key={idx} icon={item.icon} title={item.title} value={item.value} />
      ))}
    </div>
  );
};

const StatItem = ({ icon, title, value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startValue = 0;
    let startTime = Date.now();
    const duration = 2000;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * (value - startValue) + startValue);

      setCount(currentValue);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <div className="flex items-center space-x-3 pt-5">
      <div className="text-[6.5vh] text-dark_button flex-shrink-0 text-faint-color">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-red-200 md:text-red-200">{count}</p>
        <p className="text-sm font-semibold text-white md:text-white">{title}</p>
      </div>
    </div>
  );
};

const MapInteractionHandler = ({ mapActive }) => {
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
};

const BasicMap = () => {
  const mapRef = useRef();
  const [center] = useState({ lat: 33.800762207, lng: -84.308343 });
  const ZOOM_LEVEL = 12;

  const serviceHours = [
    { day: "Mon", time: "08:00 AM - 6:00 PM" },
    { day: "Tue", time: "08:00 AM - 6:00 PM" },
    { day: "Wed", time: "08:00 AM - 6:00 PM" },
    { day: "Thu", time: "08:00 AM - 6:00 PM" },
    { day: "Fri", time: "08:00 AM - 6:00 PM" },
    { day: "Sat", time: "08:00 AM - 6:00 PM" },
    { day: "Sun", time: "CLOSED" },
  ];

  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isTableVisibleMd, setIsTableVisibleMd] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);
  const [mapActive, setMapActive] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 768;
      setIsSmallScreen(smallScreen);

      if (!smallScreen) {
        // Reset states if switching to large screen
        setIsServiceHoursVisible(false);
        setIsTableVisibleMd(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    <section className="bg-gradient-to-b from-faint-color to-white">
      <div className="py-4">
        {/* Title for SMALL screens */}
        {isSmallScreen && (
          <div className="flex justify-center mb-2">
            <h1 className="text-[3vh] font-bold text-black text-center">
              Are we in your area?
            </h1>
          </div>
        )}

        <div className="relative flex flex-col md:flex-row md:gap-4 px-[4vw] md:px-8 pb-2">
          {/* Left Column: Map */}
          <div className="flex flex-col">
            <div
              className="relative w-full z-10 mb-2 md:mb-0 transition-all duration-300"
              style={{
                width: isSmallScreen ? "100%" : "calc(60vw - 32px)",
                height: isSmallScreen ? "40vh" : "50vh",
              }}
            >
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                <MapContainer
                  center={center}
                  zoom={ZOOM_LEVEL}
                  ref={mapRef}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  scrollWheelZoom={mapActive}
                >
                  <TileLayer
                    url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=cN6b03TNjAiJuVEdoMNh"
                    attribution="&copy; MapTiler"
                  />
                  <Circle
                    center={center}
                    radius={4047}
                    pathOptions={{
                      color: "black",
                      weight: 1,
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                  <DropMarker position={center} icon={CustomMarkerIcon} />
                  <MapInteractionHandler mapActive={mapActive} />
                </MapContainer>

                {/* Overlay to enable map interaction */}
                {!mapActive && (
                  <div
                    className="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => setMapActive(true)}
                    title="Click to interact with the map"
                  >
                    <FaMapMarkerAlt className="text-white opacity-75" size={40} />
                    <p className="mt-2 text-white text-sm">
                      Click to interact with the map
                    </p>
                  </div>
                )}

                {/* Bottom address/phone overlay */}
                <div className="absolute bottom-0 w-full dark-below-header text-white text-center py-1 z-10">
                  <div className="font-semibold text-[3vw] md:text-[2.5vh]">
                    1575 Clairmont Rd, Decatur, GA 30033
                  </div>
                  <div className="font-bold text-[3vw] md:text-[2vh]">
                    <a href="tel:4422363783">📞 (442)236-3783</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Title for LARGE screens */}
            {!isSmallScreen && (
              <div className="flex justify-center mt-4">
                <h1 className="text-[2vw] font-bold text-black">Are we in your area?</h1>
              </div>
            )}
          </div>

          {/* Right Column: Stats + Service Hours */}
          <div className="flex flex-col">
            {/* SMALL SCREENS */}
            {isSmallScreen ? (
              <>
                {/* Toggle button above the stats/table container */}
                <button
                  onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
                  className="
                    block 
                    w-full
                    md:hidden 
                    dark_button 
                    rounded-t-xl
                    items-center 
                    justify-center 
                    text-white 
                    text-2xl 
                    transition-all 
                    duration-300 
                    drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                    
                  "
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
                </button>

                {/* Container that holds BOTH Stats & Service Hours, same size, stacked */}
                <div
                  className="relative w-full rounded-b-xl overflow-hidden"
                  style={{
                    // Adjust this height as needed so both stats + table are fully visible
                    height: "40vh",
                  }}
                >
                  {/* Stats background & StatsPanel (z-10) */}
                  <div className="absolute inset-0 z-10">
                    {/* Background image */}
                    <div className="absolute inset-0">
                      <img
                        src="/assets/images/stats_background.jpg"
                        alt="Stats Background"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black opacity-20"></div>
                    </div>

                    {/* Stats content */}
                    <div className="relative w-full h-full  drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                      <StatsPanel isSmallScreen={true} />
                    </div>
                  </div>

                  {/* Service Hours Table (z-20) sliding over the stats */}
                  <div
                    className={`
                      absolute inset-0 
                      z-20 
                      bg-white 
                      border-t border-gray-300
                      drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                      transition-transform 
                      duration-300 
                      ease-in-out
                      ${isServiceHoursVisible ? "translate-y-0" : "translate-y-full"}
                    `}
                  >
                    {renderServiceHoursTable()}
                  </div>
                </div>
              </>
            ) : (
              /* LARGE SCREENS */
              <div
                className="relative w-full h-full flex items-center justify-center rounded-xl overflow-hidden"
                style={{
                  width: "calc(40vw - 32px)",
                  height: "50vh",
                }}
              >
                {/* Stats background + Panel */}
                <div className="absolute inset-0">
                  <img
                    src="/assets/images/stats_background.jpg"
                    alt="Stats Background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>

                <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center overflow-auto drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                  <StatsPanel isSmallScreen={false} />
                </div>

                {/* Slide-out table from right */}
                <div
                  className={`
                    absolute inset-y-0 right-0 
                    z-20 
                    bg-white 
                    w-full 
                    border-l
                    shadow-xl
                    rounded-xl
                    transition-transform 
                    duration-300 
                    ease-in-out
                    drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                    ${isTableVisibleMd ? "translate-x-0" : "translate-x-full"}
                  `}
                >
                  {renderServiceHoursTable()}
                </div>
              </div>
            )}

            {/* Toggle button for LARGE screens */}
            {!isSmallScreen && (
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsTableVisibleMd(!isTableVisibleMd)}
                  className="
                    dark_button
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-white
                    text-2xl
                    transition-all
                    duration-300
                    drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                    px-3
                    py-2
                    min-w-[160px]
                    min-h-[56px]
                  "
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "inset 0 0 25px 8px rgba(0,0,0,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {isTableVisibleMd ? "Hide Hours" : "Show Hours"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BasicMap;
