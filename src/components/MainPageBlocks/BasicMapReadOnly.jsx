// src/components/MainPageBlocks/BasicMapReadOnly.jsx

import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import * as FaIcons from "react-icons/fa";

/* The same custom Leaflet icon & helper subcomponents you had */
const CustomMarkerIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

function DropMarker({ position }) {
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
  return <Marker position={position} icon={CustomMarkerIcon} ref={markerRef} />;
}

function MapInteractionHandler({ mapActive }) {
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
}

function StatItem({ iconName, title, value }) {
  const IconComp = FaIcons[iconName] || FaIcons.FaQuestionCircle;
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
    <div className="flex items-center space-x-3">
      <div className="text-[5.5vh] md:text-[8.5vh] text-dark_button flex-shrink-0 text-gray-200/90">
        <IconComp className="w-full h-full" />
      </div>
      <div>
        <p className="text-base md:text-xl font-semibold text-yellow-600">{count}</p>
        <p className="text-[3vw] md:text-sm font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}

function StatsPanel({ isSmallScreen, stats }) {
  const containerClasses = `
    grid gap-6 p-4
    ${isSmallScreen ? "text-xs" : "text-base"}
    grid-cols-2
  `;
  return (
    <div className={containerClasses}>
      {stats.map((item, idx) => (
        <StatItem
          key={idx}
          iconName={item.icon}
          title={item.title}
          value={item.value}
        />
      ))}
    </div>
  );
}

/** The main read-only subcomponent */
export default function BasicMapReadOnly({ mapData }) {
  // The same states/logic from your read-only branch
  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [mapActive, setMapActive] = useState(false);

  const {
    center,
    zoomLevel,
    circleRadius,
    address,
    telephone,
    serviceHours,
    stats,
  } = mapData;

  // track screen size
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
    <section className="bg-gradient-to-t from-white from-50% to-black pb-2">
      <div className="pb-2">
        <div className="flex justify-start pl-11">
          <h1 className="text-[3vh] md:text-[5vh] font-normal text-gray-200/50 text-center font-serif">
            Are we in your area?
          </h1>
        </div>

        <div className="relative flex flex-col md:flex-row gap-4 px-4 md:px-8 h-[80vh] md:h-[45vh]">
          {/* Left: The map */}
          <div className="flex flex-col">
            <div className="relative h-[40vh] md:h-full w-full md:w-[60vw] z-10">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                <MapContainer
                  center={center}
                  zoom={zoomLevel}
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
                    radius={circleRadius}
                    pathOptions={{
                      color: "black",
                      weight: 1,
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
                    <FaIcons.FaMapMarkerAlt className="text-white opacity-75" size={30} />
                    <p className="mt-2 text-white text-sm font-serif">
                      Click to interact with the map
                    </p>
                  </div>
                )}

                {/* bottom overlay: address + phone */}
                <div className="absolute bottom-0 w-full bg-hover-color text-center text-gray-200 py-1 z-10">
                  <div className="font-semibold text-[4vw] md:text-[2.5vh] font-serif">
                    {address}
                  </div>
                  <div className="text-[3vw] text-gray-200 font-bold md:text-[2vh] font-serif">
                    <a href={`tel:${telephone.replace(/[^0-9]/g, "")}`}>
                      📞 {telephone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats + Service hours toggle */}
          <div className="flex flex-col">
            <button
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="
                w-full dark_button rounded-t-xl md:py-2
                items-center justify-center text-white
                text-[6vw] md:text-[5vh]
                transition-all duration-300
                drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                font-serif
              "
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>

            <div className="relative h-[30vh] md:h-[50vh] md:w-[35vw] w-full rounded-b-xl overflow-hidden">
              {/* Stats BG + Panel */}
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  <img
                    src="/assets/images/stats_background.jpg"
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>
                <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                  <StatsPanel isSmallScreen={isSmallScreen} stats={stats} />
                </div>
              </div>

              {/* hours table slides up/down */}
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white border-t border-gray-300
                  drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]
                  transition-transform duration-300 ease-in-out
                  ${
                    isServiceHoursVisible ? "translate-y-0" : "translate-y-full"
                  }
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
