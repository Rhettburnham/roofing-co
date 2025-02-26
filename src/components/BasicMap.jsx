/* --------------------------------------------------
   READ-ONLY SUBCOMPONENTS
-----------------------------------------------------*/
function StatItem({ iconName, title, value }) {
  const IconComp = FaIcons[iconName] || FaIcons.FaQuestionCircle;
  const [count, setCount] = useState(0);

  return (
    <div className="flex items-center space-x-3">
      <div className="text-[5.5vh] md:text-[8.5vh] flex-shrink-0 text-gray-200/90">
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
  return (
      {stats.map((item, idx) => (
        <StatItem key={idx} iconName={item.icon} title={item.title} value={item.value} />
      ))}
  );
}

// Removed `max-h-[75vh] overflow-auto` to allow full height on smaller screens and avoid vertical scrolling.
function BasicMapPreview({ mapData }) {
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
    <section className="bg-gradient-to-t from-white from-50% to-black pb-2 overflow-hidden">
      <div className="pb-2">
        <div className={`flex ${isSmallScreen ? "justify-center" : "justify-start pl-11"}`}>
          <h1 className="text-[3vh] md:text-[5vh] font-normal text-gray-200/50 text-center font-serif">
            Are we in your area?
          </h1>
        </div>
        <div className="relative flex flex-col md:flex-row gap-4 px-4 md:px-8 h-[80vh] md:h-[45vh]">
          {/* Left: Map */}
          <div className="flex flex-col w-full md:w-[60%]">
            <div className="relative h-[50vh] md:h-[50vh] w-full z-10">
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
                {/* Bottom overlay: address + phone */}
                <div className="absolute bottom-0 w-full bg-hover-color text-center text-gray-200 py-1 z-10">
                  <div className="font-semibold text-[4vw] md:text-[2.5vh] font-serif">
                    {address}
                  </div>
                  <div className="text-[3vw] text-gray-200 font-bold md:text-[2vh] font-serif">
                    <a href={`tel:${telephone?.replace(/[^0-9]/g, "")}`}>
                      📞 {telephone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Stats + Service Hours */}
          <div className="flex flex-col w-full md:w-[40%]">
            <button
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="dark_button rounded-t-xl md:py-2 items-center justify-center text-white text-[2vh] transition-all duration-300 drop-shadow-[0_3.2px_3.2px_rgba(0,0,0,0.8)] font-serif"
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>
            <div className="relative h-[50vh] rounded-b-xl overflow-hidden">
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
                  <StatsPanel isSmallScreen={isSmallScreen} stats={stats} />
                </div>
              </div>
              <div
                className={`
                  absolute inset-0 z-20
                  bg-white border-t border-gray-300
                  transition-transform duration-300 ease-in-out
                  ${isServiceHoursVisible ? "translate-y-0" : "translate-y-full"}
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
          <p className="text-base md:text-xl font-semibold text-yellow-600">{stat.value}</p>
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

function BasicMapEditorPanel({ localMap, setLocalMap, onSave }) {
  const [mapActive, setMapActive] = useState(false);
  const [isServiceHoursVisible, setIsServiceHoursVisible] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );


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
      stats: [...p.stats, { title: "New Stat", value: 99, icon: "FaQuestionCircle" }],
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
                onChange={(e) => setLocalMap((p) => ({ ...p, address: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="block text-sm mb-1">Phone:</span>
              <input
                type="text"
                className="bg-gray-700 px-2 py-1 rounded w-full"
                value={localMap.telephone || ""}
                onChange={(e) => setLocalMap((p) => ({ ...p, telephone: e.target.value }))}
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
                      color: "black",
                      weight: 1,
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
                  <FaIcons.FaMapMarkerAlt className="text-white opacity-75" size={30} />
                  <p className="mt-2 text-white text-sm font-serif">
                    Click to interact with the map
                  </p>
                </div>
              )}

              <div className="absolute bottom-0 w-full bg-hover-color text-center text-gray-200 py-1 z-10">
                <div className="font-semibold text-base font-serif">{localMap.address}</div>
                <div className="text-sm text-gray-200 font-bold font-serif">
                  <a href={`tel:${localMap.telephone?.replace(/[^0-9]/g, "")}`}>
                    📞 {localMap.telephone}
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
            <div className="max-h-[35vh] overflow-auto">
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
          <div className="bg-gray-800 p-3 rounded">
            <button
              onClick={() => setIsServiceHoursVisible(!isServiceHoursVisible)}
              className="bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-xs"
            >
              {isServiceHoursVisible ? "Hide Hours" : "Show Hours"}
            </button>
            {isServiceHoursVisible && (
              <div className="mt-2 max-h-[30vh] overflow-auto">
                {renderServiceHoursTable()}
              </div>
            )}
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
