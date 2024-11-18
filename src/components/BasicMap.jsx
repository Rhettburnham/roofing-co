import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { gsap } from "gsap";

// Custom icon for a blue pin using an image URL
const CustomMarkerIcon = L.icon({
  iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue.png", // URL for a simple blue pin
  iconSize: [32, 32], // Adjust size as needed
  iconAnchor: [16, 32], // Anchor point of the marker
  popupAnchor: [0, -32], // Popup will appear above the marker
});

// GSAP drop animation for the marker
const DropMarker = ({ position, icon }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current) {
      gsap.from(markerRef.current.getElement(), {
        y: -100, // Drop from above
        opacity: 0,
        duration: 0.6,
        ease: "bounce.out",
      });
    }
  }, []);

  return <Marker position={position} icon={icon} ref={markerRef}></Marker>;
};

const BasicMap = () => {
  const mapRef = useRef();
  const [center] = useState({ lat: 33.800762207, lng: -84.308343 });
  const [showLocations, setShowLocations] = useState(false); // Toggle between Service Hours and Service Locations

  const ZOOM_LEVEL = 16;

  // List of service hours
  const serviceHours = [
    { day: "Mon", time: "08:00 AM - 6:00 PM" },
    { day: "Tue", time: "08:00 AM - 6:00 PM" },
    { day: "Wed", time: "08:00 AM - 6:00 PM" },
    { day: "Thu", time: "08:00 AM - 6:00 PM" },
    { day: "Fri", time: "08:00 AM - 6:00 PM" },
    { day: "Sat", time: "08:00 AM - 6:00 PM" },
    { day: "Sun", time: "CLOSED" },
  ];

  // List of cities in Georgia
  const serviceLocations = [
    "Marietta",
    "Smyrna",
    "Kennesaw",
    "Acworth",
    "Woodstock",
    "Canton",
    "Alpharetta",
    "Roswell",
    "Norcross",
    "Duluth",
    "Cumming",
    "Buford",
    "Lawrenceville",
    "Sandy Springs",
    "Johns Creek",
    // Add more locations if needed
  ];

  // State and refs for scroll arrow
  const [showScrollArrow, setShowScrollArrow] = useState(true);
  const scrollContainerRef = useRef(null);
  const arrowRef = useRef(null);

  const handleScroll = () => {
    if (showScrollArrow) {
      setShowScrollArrow(false);
    }
  };

  useEffect(() => {
    if (arrowRef.current && showScrollArrow) {
      gsap.fromTo(
        arrowRef.current,
        { y: 0 },
        { y: 10, duration: 1, repeat: -1, yoyo: true, ease: "power1.inOut" }
      );
    }
  }, [showScrollArrow]);

  useEffect(() => {
    if (showLocations) {
      setShowScrollArrow(true);
    }
  }, [showLocations]);

  // Function to render the Service Hours table
  const renderServiceHoursTable = () => {
    return (
      <table className="w-full rounded-2xl border-2 border-white bg-white text-center">
        <tbody>
          {serviceHours.map((item, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? "faint-color" : ""}`}
            >
              <td className="py-3 border border-white">{item.day}</td>
              <td className="py-3 border border-white">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Function to render the Service Locations table with two columns
  const renderServiceLocationsTable = () => {
    // Split the locations into two columns
    const half = Math.ceil(serviceLocations.length / 2);
    const firstColumn = serviceLocations.slice(0, half);
    const secondColumn = serviceLocations.slice(half);

    return (
      <div className="w-full border-2 border-white bg-white text-center rounded-xl">
        <div className="grid grid-cols-2">
          <div className="border-r-2 border-white">
            {firstColumn.map((location, index) => (
              <div
                key={index}
                className={`py-3 border-b border-white ${index % 2 === 0 ? "faint-color" : ""}`}
              >
                {location}
              </div>
            ))}
          </div>
          <div>
            {secondColumn.map((location, index) => (
              <div
                key={index}
                className={`py-3 border-b border-white ${index % 2 === 0 ? "faint-color" : ""}`}
              >
                {location}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // New state to control content visibility based on screen size
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const smallScreen = window.innerWidth <= 768;
      setIsSmallScreen(smallScreen);
      if (!smallScreen) {
        setIsContentVisible(true);
      }
    };

    // Set initial content visibility based on initial screen size
    if (!isSmallScreen) {
      setIsContentVisible(true);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSmallScreen]);

  return (
    <div className="">
      {/* Call to Action Component at the top */}
      {/* Text */}
      <div className="flex justify-center md:justify-start md:ml-16 items-center">
        <h1 className="text-[3vh] md:text-[2vw] font-bold text-black text-center">
          Are we in your area?
        </h1>
      </div>
      {/* The thinner colored bar */}
      <div className="w-150% hover-color  opacity-50 mb-1 h-[1vh]"></div>

      <div className="relative flex flex-col md:flex-row md:gap-4 md:p-5 h-auto md:h-[55vh] bg-white z-30 px-8 md:px-16">
        {/* Map Container */}
        <div className="relative w-full md:w-3/5 mb-4 md:mb-0 z-10 h-[35vh] md:h-[50vh] md:h-full">
          <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-300 z-10 relative">
            <div className="relative w-full h-full">
              <MapContainer
                center={center}
                zoom={ZOOM_LEVEL}
                ref={mapRef}
                style={{ height: "100%", width: "100%" }}
                className="rounded-xl z-0"
                scrollWheelZoom={true}
                dragging={true}
                doubleClickZoom={true}
                touchZoom={true}
                zoomControl={true}
              >
                <TileLayer
                  url="https://api.maptiler.com/maps/basic-v2/{z}/{x}/{y}.png?key=cN6b03TNjAiJuVEdoMNh"
                  attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler'
                />
                <DropMarker position={center} icon={CustomMarkerIcon} />
              </MapContainer>
            </div>
            {/* Bottom Bar with Address and Phone Number */}
            <div className="absolute bottom-0 w-full dark-below-header text-white text-center py-2">
              <div className="font-bold text-[3.5vw] md:text-[3vh]">
                1575 Clairmont Rd, Decatur, GA 30033
              </div>
              <div className="font-bold text-[3.5vw] md:text-[3vh]">
                <a href="tel:4422363783">📞 (442)236-3783</a>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="w-full md:w-2/5 flex flex-col md:h-full  md:mb-0">
          {/* Tabs for Service Hours and Service Locations */}
          <div className="flex w-full justify-between mb-[1vh] border-2 border-white">
            <button
              onClick={() => {
                setShowLocations(false);
                setIsContentVisible(true);
              }}
              className={`w-1/2 py-[1.5vh] text-center ${
                isContentVisible && !showLocations
                  ? "highlight-box text-white font-bold"
                  : "dark_button text-white hover:bg-gray-600"
              } rounded-l-xl`}
            >
              Service Hours
            </button>
            <button
              onClick={() => {
                setShowLocations(true);
                setIsContentVisible(true);
              }}
              className={`w-1/2 py-[1.5vh] text-center ${
                isContentVisible && showLocations
                  ? "highlight-box text-white font-bold"
                  : "dark_button text-white hover:bg-gray-600"
              } rounded-r-xl`}
            >
              Service Locations
            </button>
          </div>

          {/* Conditionally render the content based on isContentVisible */}
          {isContentVisible && (
            <div className="flex-1 flex flex-col">
              <div className="h-auto md:h-[43vh] overflow-hidden rounded-xl">
                {showLocations ? (
                  // For Service Locations, enable scrolling within the fixed height
                  <div
                    className="relative h-full overflow-y-auto"
                    onScroll={handleScroll}
                    ref={scrollContainerRef}
                  >
                    {renderServiceLocationsTable()}
                    {showScrollArrow && (
                      <div className="absolute bottom-2 left-0 w-full flex justify-center pointer-events-none">
                        <div ref={arrowRef}>
                          {/* Arrow SVG */}
                          <svg
                            className="w-10 h-10 text-gray-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.292 7.292a1 1 0 011.415 0L10 10.585l3.293-3.293a1 1 0 011.415 1.415l-4 4a1 1 0 01-1.415 0l-4-4a1 1 0 010-1.415z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // For Service Hours, adjust height to ensure all days are visible
                  <div className="h-full overflow-hidden">
                    {renderServiceHoursTable()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BasicMap;
