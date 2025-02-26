// src/components/MainPageBlocks/BasicMapEditor.jsx

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";
import * as FaIcons from "react-icons/fa";

// The same custom icon
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

// For the stats we show same layout, but also let them edit the “value”?
function StatItemEditor({ stat, onChange, onRemove }) {
  const IconComp = FaIcons[stat.icon] || FaIcons.FaQuestionCircle;
  const [count, setCount] = useState(0);

  // same counting effect
  useEffect(() => {
    let startValue = 0;
    let startTime = Date.now();
    const duration = 2000;
    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.floor(progress * (stat.value - startValue) + startValue);
      setCount(currentValue);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [stat.value]);

  // Also add inputs for “title”, “value”, “icon”
  return (
    <div className="relative bg-white p-2 rounded mb-2">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded"
      >
        Remove
      </button>

      <div className="flex items-center space-x-3">
        <IconComp className="text-[8vh] text-gray-800" />
        <div>
          <p className="text-base md:text-xl font-semibold text-yellow-600">
            {count}
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
            onChange={(e) => onChange({ ...stat, value: parseInt(e.target.value, 10) })}
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

// The main Editor, showing same layout but with forms for address/phone/...
export default function BasicMapEditor({ initialMapData, onConfigChange }) {
  // replicate the same local states: mapActive, isSmallScreen, isServiceHoursVisible
  const [mapActive, setMapActive] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );
  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);

  // local form state for the “map data”
  const [localMap, setLocalMap] = useState(() => ({
    ...initialMapData,
    // ensure we have array copies, etc
    serviceHours: initialMapData.serviceHours.map((sh) => ({ ...sh })),
    stats: initialMapData.stats.map((st) => ({ ...st })),
  }));

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

  const handleSave = () => {
    // call onConfigChange with updated data
    onConfigChange?.(localMap);
  };

  // We “render the same layout” as read-only, but with inputs for address, phone, radius, etc.
  const renderServiceHoursTable = () => (
    <table
      className={`w-full h-full rounded-xl border border-gray-300 bg-white text-center ${
        isSmallScreen ? "text-xs" : "text-sm"
      }`}
    >
      <tbody>
        {localMap.serviceHours.map((item, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? "faint-color" : ""}>
            <td className="py-2 px-2 border border-gray-300">
              <input
                type="text"
                className="bg-white w-full text-xs"
                value={item.day}
                onChange={(e) => {
                  const newSH = [...localMap.serviceHours];
                  newSH[idx] = { ...newSH[idx], day: e.target.value };
                  setLocalMap((p) => ({ ...p, serviceHours: newSH }));
                }}
              />
            </td>
            <td className="py-2 px-2 border border-gray-300">
              <input
                type="text"
                className="bg-white w-full text-xs"
                value={item.time}
                onChange={(e) => {
                  const newSH = [...localMap.serviceHours];
                  newSH[idx] = { ...newSH[idx], time: e.target.value };
                  setLocalMap((p) => ({ ...p, serviceHours: newSH }));
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // We'll also provide an “add hour” or “remove hour” button below if needed

  // helper to handle a single stat change
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
        { title: "New", value: 99, icon: "FaQuestionCircle" },
      ],
    }));
  };

  return (
    <section className="bg-gradient-to-t from-white from-50% to-black pb-2">
      <div className="pb-2">
        {/* The same heading but maybe with an editable field for “title”? For now we’ll keep it static. */}
        <div className="flex justify-between px-4">
          <h1 className="text-[3vh] md:text-[5vh] font-normal text-gray-200/50 font-serif">
            Edit: Are we in your area?
          </h1>
          <button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
          >
            Save
          </button>
        </div>

        <div className="relative flex flex-col md:flex-row gap-4 px-4 md:px-8 h-[80vh] md:h-[45vh]">
          {/* Left: Map container */}
          <div className="flex flex-col">
            {/* We add a few inputs to let them change circleRadius, address, phone, etc. */}
            <div className="my-2 flex flex-col md:flex-row gap-2 text-white">
              <label>
                Address:{" "}
                <input
                  type="text"
                  className="bg-gray-600 px-2 py-1 rounded"
                  value={localMap.address}
                  onChange={(e) =>
                    setLocalMap((p) => ({ ...p, address: e.target.value }))
                  }
                />
              </label>
              <label>
                Phone:{" "}
                <input
                  type="text"
                  className="bg-gray-600 px-2 py-1 rounded"
                  value={localMap.telephone}
                  onChange={(e) =>
                    setLocalMap((p) => ({ ...p, telephone: e.target.value }))
                  }
                />
              </label>
              <label>
                Radius:{" "}
                <input
                  type="number"
                  className="bg-gray-600 px-2 py-1 rounded w-20"
                  value={localMap.circleRadius}
                  onChange={(e) =>
                    setLocalMap((p) => ({
                      ...p,
                      circleRadius: parseInt(e.target.value, 10),
                    }))
                  }
                />
              </label>
            </div>

            <div className="relative h-[40vh] md:h-full w-full md:w-[60vw] z-10">
              <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 relative drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)]">
                <MapContainer
                  center={localMap.center}
                  zoom={localMap.zoomLevel}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  scrollWheelZoom={mapActive}
                >
                  <TileLayer
                    url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=cN6b03TNjAiJuVEdoMNh"
                    attribution="&copy; MapTiler"
                  />
                  <Circle
                    center={localMap.center}
                    radius={localMap.circleRadius}
                    pathOptions={{
                      color: "black",
                      weight: 1,
                      fillColor: "blue",
                      fillOpacity: 0.2,
                    }}
                  />
                  <DropMarker position={localMap.center} />
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

                <div className="absolute bottom-0 w-full bg-hover-color text-center text-gray-200 py-1 z-10">
                  <div className="font-semibold text-[4vw] md:text-[2.5vh] font-serif">
                    {localMap.address}
                  </div>
                  <div className="text-[3vw] text-gray-200 font-bold md:text-[2vh] font-serif">
                    <a href={`tel:${localMap.telephone.replace(/[^0-9]/g, "")}`}>
                      📞 {localMap.telephone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats + service hours toggle */}
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
              <div className="absolute inset-0 z-10">
                <div className="absolute inset-0">
                  <img
                    src="/assets/images/stats_background.jpg"
                    alt="Stats BG"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black opacity-20"></div>
                </div>

                {/* Here we show “Stats Editor” instead of simple StatsPanel */}
                <div className="relative w-full h-full flex flex-col items-center justify-start pt-4 overflow-y-auto">
                  {/* List of editable stats */}
                  {localMap.stats.map((stat, i) => (
                    <StatItemEditor
                      key={i}
                      stat={stat}
                      onChange={(newVal) => handleStatChange(i, newVal)}
                      onRemove={() => handleRemoveStat(i)}
                    />
                  ))}
                  <button
                    onClick={handleAddStat}
                    className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
                  >
                    + Add Stat
                  </button>
                </div>
              </div>

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
