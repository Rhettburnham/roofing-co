// EmployeesBlock.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelImageSectionController from "../common/PanelImageSectionController";
import PanelFontController from "../common/PanelFontController";
import PanelStylingController from "../common/PanelStylingController";

// Register GSAP's ScrollTrigger plugin
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

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeEmployeeImageState = (
  imageValue,
  defaultStaticPath = "/assets/images/team/roofer.png"
) => {
  let file = null;
  let url = defaultStaticPath;
  let name = defaultStaticPath.split("/").pop();
  let originalUrl = defaultStaticPath;

  if (typeof imageValue === "string") {
    url = imageValue;
    name = imageValue.split("/").pop();
    originalUrl = imageValue;
  } else if (imageValue && typeof imageValue === "object") {
    url = imageValue.url || defaultStaticPath;
    name = imageValue.name || url.split("/").pop();
    file = imageValue.file || null;
    if (imageValue.originalUrl) {
      originalUrl = imageValue.originalUrl;
    } else if (
      typeof imageValue.url === "string" &&
      !imageValue.url.startsWith("blob:")
    ) {
      originalUrl = imageValue.url;
    } else {
      originalUrl = defaultStaticPath;
    }
  }
  return { file, url, name, originalUrl };
};

// Helper to get display URL from string path or {url, file} object
const getEmployeeImageUrl = (
  imageState,
  defaultImgPath = "/assets/images/team/roofer.png"
) => {
  let path = defaultImgPath;
  if (imageState && typeof imageState === "object" && imageState.url) {
    path = imageState.url;
  } else if (typeof imageState === "string") {
    path = imageState;
  }
  if (
    path &&
    !path.startsWith("blob:") &&
    !path.startsWith("http:") &&
    !path.startsWith("https:") &&
    !path.startsWith("/")
  ) {
    return `/assets/images/team/${path.split("/").pop()}`;
  }
  return path;
};

/* ======================================================
   READ-ONLY VIEW: EmployeesPreview
   ------------------------------------------------------
   Renders the employees block as seen by site visitors.
   Uses GSAP for header animations and an auto-sliding
   carousel that empows the employees.
========================================================= */

function EmployeesPreview({
  employeesData,
  readOnly = true,
  onSectionTitleChange,
  onEmployeeDetailChange,
}) {
  if (!employeesData) {
    return <p>No Employee data found.</p>;
  }

  const {
    sectionTitle = "OUR TEAM",
    employee: employeesListOriginal = [],
    showNailAnimation = true,
    cardBackgroundColor = "#FFFFFF",
    cardTextColor = "#000000",
    sectionTitleTextSettings,
    nameTextSettings,
    roleTextSettings,
  } = employeesData || {};

  const formattedEmployees = employeesListOriginal.map((emp) => ({
    ...emp,
    image: getEmployeeImageUrl(emp.image),
  }));

  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const slideInterval = 2500;
  const numTotalEmployees = formattedEmployees.length;
  const ITEMS_TO_SHOW_ANIMATION = 4;

  const extendedEmployees = useMemo(() => {
    if (numTotalEmployees >= 5) {
      return formattedEmployees.concat(
        formattedEmployees.slice(0, ITEMS_TO_SHOW_ANIMATION)
      );
    }
    return formattedEmployees;
  }, [formattedEmployees, numTotalEmployees, ITEMS_TO_SHOW_ANIMATION]);

  useEffect(() => {
    if (numTotalEmployees < 5) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= numTotalEmployees - 1) {
          setTransitionDuration(0);
          setTimeout(() => setTransitionDuration(0.5), 50);
          return 0;
        }
        return prevIndex + 1;
      });
    }, slideInterval);
    return () => clearInterval(interval);
  }, [numTotalEmployees, slideInterval]);

  useEffect(() => {
    const nail = nailRef.current;
    const text = textRef.current;
    const header = headerRef.current;

    ScrollTrigger.getAll().forEach((st) => {
      if (
        st.trigger === header &&
        (st.animation?.targets?.includes(nail) ||
          st.animation?.targets?.includes(text))
      ) {
        st.kill();
      }
    });
    gsap.killTweensOf([nail, text]);

    if (showNailAnimation) {
      gsap.set(nail, { x: "100vw", opacity: 1 });
      gsap.set(text, { x: "-100vw", opacity: 1 });
      const masterTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: "top 80%",
          end: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });
      masterTimeline
        .to(nail, { x: "10vw", duration: 0.8, ease: "power2.out" })
        .to(nail, { x: "1vw", duration: 0.6, ease: "power2.inOut" }, "+=0.5")
        .to(text, { x: "-50%", duration: 0.6, ease: "power2.inOut" }, "<");
    } else {
      gsap.set(nail, { opacity: 0 });
      gsap.set(text, { x: "-50%", opacity: 1 });
    }

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (
          st.trigger === header &&
          (st.animation?.targets?.includes(nail) ||
            st.animation?.targets?.includes(text))
        ) {
          st.kill();
        }
      });
      gsap.killTweensOf([nail, text]);
    };
  }, [showNailAnimation]);

  const renderEmployeeCard = (employee, index, cardStyle = {}) => (
    <div
      key={employee.id || index}
      className="flex-shrink-0 flex flex-col items-center justify-start px-2"
      style={{ ...cardStyle, backgroundColor: cardBackgroundColor }}
    >
      <div className="relative flex flex-col items-center">
        {" "}
        {/* Ensured items-center here for the circle itself */}
        <div
          className="w-[21.25vh] h-[21.25vh] md:w-[180px] md:h-[180px] rounded-full overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: "transparent" }}
        >
          {" "}
          {/* Circle itself transparent, parent has BG */}
          <img
            src={employee.image}
            alt={employee.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/assets/images/team/roofer.png";
            }}
          />
        </div>
        <div className="flex flex-col items-center mt-2">
          {" "}
          {/* This already has items-center */}
          {readOnly ? (
            <>
              <p
                className="whitespace-nowrap text-[1.5vw] md:text-[1.6vh] font-semibold text-center"
                style={{ ...getTextStyles(nameTextSettings), color: cardTextColor }}
              >
                {employee.name}
              </p>
              <p
                className="whitespace-nowrap text-[1.5vw] md:text-[1.6vh] font-semibold mt-1 md:mt-[0.5vh] text-center"
                style={{ ...getTextStyles(roleTextSettings), color: cardTextColor }}
              >
                {employee.role}
              </p>{" "}
              {/* Added margin for role */}
            </>
          ) : (
            <>
              <input
                type="text"
                value={employee.name || ""}
                onChange={(e) =>
                  onEmployeeDetailChange(index, "name", e.target.value)
                }
                className="whitespace-nowrap text-[1.5vw] md:text-[1.6vh] font-semibold text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                style={{ ...getTextStyles(nameTextSettings), color: cardTextColor }}
                placeholder="Name"
              />
              <input
                type="text"
                value={employee.role || ""}
                onChange={(e) =>
                  onEmployeeDetailChange(index, "role", e.target.value)
                }
                className="whitespace-nowrap text-[1.5vw] md:text-[1.6vh] font-semibold mt-1 md:mt-[0.5vh] text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                style={{ ...getTextStyles(roleTextSettings), color: cardTextColor }}
                placeholder="Role"
              />{" "}
              {/* Added margin for role */}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div
        ref={headerRef}
        className="relative flex items-center w-full py-4 md:py-3 overflow-visible"
      >
        {" "}
        {/* Changed to overflow-visible for nail shadows */}
        <div
          ref={nailRef}
          className="absolute right-[17vw] md:right-[17%] w-[30%] h-[6vh] md:h-[3vh] overflow-visible z-50"
        >
          <div
            className="w-full h-full dynamic-shadow"
            style={{
              backgroundImage: "url('/assets/images/nail.png')",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "scale(3.6) scaleX(-1)", // Increased scale by 20%
              transformOrigin: "right center",
              filter: "drop-shadow(5px 5px 5px rgba(0,0,0,0.7))", // Added darker and bigger shadow
            }}
          />
        </div>
        <div ref={textRef} className="absolute left-1/2 z-30 w-auto">
          {readOnly ? (
            <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-serif pt-3 whitespace-nowrap" style={getTextStyles(sectionTitleTextSettings)}>
              {sectionTitle}
            </h2>
          ) : (
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) =>
                onSectionTitleChange && onSectionTitleChange(e.target.value)
              }
              className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-serif pt-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 text-center whitespace-nowrap min-w-[300px] md:min-w-[400px]"
              placeholder="Section Title"
              style={getTextStyles(sectionTitleTextSettings)}
            />
          )}
        </div>
      </div>
      <div className="relative employee-section flex flex-col items-center justify-center px-6 overflow-hidden">
        {" "}
        {/* Added overflow-hidden */}
        <div className="w-full max-w-screen-lg">
          {numTotalEmployees > 0 && numTotalEmployees <= 4 ? (
            <div className="flex justify-around items-start py-4">
              {formattedEmployees.map((employee, idx) =>
                renderEmployeeCard(employee, idx)
              )}
            </div>
          ) : numTotalEmployees >= 5 ? (
            <div
              className="flex transition-transform"
              style={{
                transform: `translateX(-${currentIndex * (100 / ITEMS_TO_SHOW_ANIMATION)}%)`,
                transitionDuration: `${transitionDuration}s`,
                transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
                width: `${(extendedEmployees.length * 100) / ITEMS_TO_SHOW_ANIMATION}%`,
              }}
            >
              {extendedEmployees.map((employee, idx) =>
                renderEmployeeCard(employee, idx, {
                  width: `${100 / ITEMS_TO_SHOW_ANIMATION}%`,
                })
              )}
            </div>
          ) : (
            <p className="text-center py-4">No employees to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   Main Exported Component: EmployeesBlock
   ------------------------------------------------------
   This component initializes its local editor state from
   the passed-in `employeesData`. When in read-only mode it
   shows the preview; when in edit mode, it shows the editor.
========================================================= */
export default function EmployeesBlock({
  readOnly = false,
  employeesData,
  onConfigChange,
  themeColors,
}) {
  const [localData, setLocalData] = useState(() => {
    const initialConfig = employeesData || {};
    const initialShowNailAnimation = initialConfig.showNailAnimation !== undefined ? initialConfig.showNailAnimation : true;
    return {
      sectionTitle: initialConfig.sectionTitle || "OUR TEAM",
      showNailAnimation: initialShowNailAnimation,
      employee: (initialConfig.employee || []).map((emp, index) => ({
        ...emp,
        id: emp.id || `emp_${index}_${Date.now()}`,
        image: initializeEmployeeImageState(emp.image),
      })),
      cardBackgroundColor: initialConfig.cardBackgroundColor || '#FFFFFF',
      cardTextColor: initialConfig.cardTextColor || '#000000',
      sectionTitleTextSettings: initialConfig.sectionTitleTextSettings,
      nameTextSettings: initialConfig.nameTextSettings,
      roleTextSettings: initialConfig.roleTextSettings,
      styling: {
        desktopHeightVH: initialConfig.styling?.desktopHeightVH || 40,
        mobileHeightVW: initialConfig.styling?.mobileHeightVW || 60,
      },
    };
  });
  const prevEmployeesDataRef = useRef();
  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    const newConfigString = JSON.stringify(employeesData);
    const oldConfigString = JSON.stringify(prevEmployeesDataRef.current);
    if (newConfigString !== oldConfigString) {
      prevEmployeesDataRef.current = employeesData;
      setLocalData(prevLocal => {
        const updatedShowNail = employeesData.showNailAnimation !== undefined ? employeesData.showNailAnimation : prevLocal.showNailAnimation;
        const updatedItems = (employeesData.employee || []).map((propItem, index) => {
          const localItem = prevLocal.employee.find(li => li.id === propItem.id) || prevLocal.employee[index] || {};
          const newImageState = initializeEmployeeImageState(propItem.image, localItem.image?.originalUrl);
          if (localItem.image?.file && localItem.image.url?.startsWith('blob:') && newImageState.url !== localItem.image.url) {
            URL.revokeObjectURL(localItem.image.url);
          }
          return {
            ...localItem,
            ...propItem,
            id: propItem.id || localItem.id || `emp_sync_${index}_${Date.now()}`,
            image: newImageState,
          };
        });
        return {
          ...prevLocal,
          ...employeesData,
          showNailAnimation: updatedShowNail,
          employee: updatedItems,
        };
      });
    }
  }, [employeesData]);

  useEffect(() => {
    return () => {
      localData.employee.forEach((emp) => {
        if (emp.image && emp.image.url && emp.image.url.startsWith("blob:")) {
          URL.revokeObjectURL(emp.image.url);
        }
      });
    };
  }, [localData.employee]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localData,
          employee: localData.employee.map(emp => ({
            ...emp,
            image: emp.image.file
              ? { file: emp.image.file, url: emp.image.url, name: emp.image.name, originalUrl: emp.image.originalUrl }
              : { url: emp.image.originalUrl || emp.image.url, name: emp.image.name, originalUrl: emp.image.originalUrl },
          })),
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData((prevState) => {
      const newState =
        typeof updater === "function"
          ? updater(prevState)
          : { ...prevState, ...updater };
      return newState;
    });
  };

  const handleImagesChange = (newEmployeeArray) => {
    handleLocalDataChange((prev) => ({ ...prev, employee: newEmployeeArray }));
  };

  const handleSectionTitleChange = (newTitle) => {
    handleLocalDataChange({ sectionTitle: newTitle });
  };

  const handleEmployeeDetailChange = (index, field, value) => {
    handleLocalDataChange((prev) => {
      const updatedEmployees = [...prev.employee];
      if (updatedEmployees[index]) {
        updatedEmployees[index] = {
          ...updatedEmployees[index],
          [field]: value,
        };
      }
      return { ...prev, employee: updatedEmployees };
    });
  };

  const handleStylingChange = (newStyling) => {
    handleLocalDataChange({ styling: { ...localData.styling, ...newStyling } });
  };

  if (readOnly) {
    return <EmployeesPreview employeesData={localData} readOnly={true} />;
  }

  return (
    <EmployeesPreview
      employeesData={localData}
      readOnly={false}
      onSectionTitleChange={handleSectionTitleChange}
      onEmployeeDetailChange={handleEmployeeDetailChange}
    />
  );
}

/* ==============================================
   EMPLOYEES FONTS CONTROLS
   ----------------------------------------------
   Handles font selection for Employees text elements
=============================================== */
const EmployeesFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const fontFields = [
    { prefix: 'sectionTitleTextSettings', label: 'Section Title' },
    { prefix: 'nameTextSettings', label: 'Employee Name' },
    { prefix: 'roleTextSettings', label: 'Employee Role' },
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

// Expose tabsConfig for BottomStickyEditPanel
EmployeesBlock.tabsConfig = (blockData, onUpdate, themeColors) => ({
  general: (props) => (
    <div className="p-4 space-y-4">
      <EmployeesFontsControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
        themeColors={themeColors}
      />
      <EmployeesImagesControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
        themeColors={themeColors}
      />
      <EmployeesColorControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
        themeColors={themeColors}
      />
      <EmployeesStylingControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
      />
    </div>
  ),
  images: (props) => (
    <EmployeesImagesControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  team: (props) => (
    <PanelImageSectionController
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      controlType="gallery"
      blockType="EmployeesBlock"
      imageConfig={{
        label: 'Team Photos',
        itemLabel: 'Employee',
        arrayFieldName: 'employee',
        generateName: (index, blockType) => `employee_${index + 1}`,
        acceptedTypes: 'image/*',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        defaultPath: '/assets/images/team/'
      }}
    />
  ),
  colors: (props) => (
    <EmployeesColorControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  styling: (props) => (
    <EmployeesStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
    />
  ),
});

/* ==============================================
   EMPLOYEES IMAGES CONTROLS
   ----------------------------------------------
   Handles employee management and image uploads
=============================================== */
const EmployeesImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const { employee = [] } = currentData;

  // Convert employees to images array format for PanelImagesController
  const imagesArray = employee.map((emp, index) => ({
    id: `employee_${emp.id || index}`,
    url: getEmployeeImageUrl(emp.image, "/assets/images/team/roofer.png"),
    file: emp.image?.file || null,
    name: emp.name || `Employee ${index + 1}`,
    originalUrl: emp.image?.originalUrl || "/assets/images/team/roofer.png",
    employeeIndex: index,
    employeeName: emp.name || "",
    employeeRole: emp.role || "",
  }));

  const handleImagesChange = (newImagesArray) => {
    // Create new employees array from images
    const newEmployees = newImagesArray.map((img, index) => {
      const existingEmp = employee[img.employeeIndex] || employee[index] || {};

      return {
        id: existingEmp.id || `emp_${index}_${Date.now()}`,
        name: img.employeeName || existingEmp.name || "",
        role: img.employeeRole || existingEmp.role || "",
        image: {
          file: img.file,
          url: img.url,
          name: img.name,
          originalUrl: img.originalUrl,
        },
      };
    });

    onControlsChange({ employee: newEmployees });
  };

  const handleAddEmployee = () => {
    const newEmployee = {
      id: `new_emp_${Date.now()}`,
      name: "New Employee",
      role: "Role",
      image: initializeEmployeeImageState("/assets/images/team/roofer.png"),
    };
    onControlsChange({ employee: [...employee, newEmployee] });
  };

  const handleRemoveEmployee = (index) => {
    const empToRemove = employee[index];
    if (empToRemove?.image?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(empToRemove.image.url);
    }
    onControlsChange({ employee: employee.filter((_, i) => i !== index) });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-2">Employee Images</h3>
        <PanelImagesController
          currentData={{ images: imagesArray }}
          onControlsChange={(data) => handleImagesChange(data.images || [])}
          imageArrayFieldName="images"
          maxImages={20}
          allowMultiple={true}
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-medium text-gray-700">
            Team Members ({employee.length})
          </h4>
          <button
            onClick={handleAddEmployee}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
          >
            + Add Employee
          </button>
        </div>

        {employee.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No employees yet. Add a team member to get started.
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          <p>
            • Click on employee names and roles in the preview to edit them
            directly
          </p>
          <p>• Use the image controls above to manage employee photos</p>
        </div>
      </div>
    </div>
  );
};

/* ==============================================
   EMPLOYEES COLOR CONTROLS
   ----------------------------------------------
   Handles card background and text color customization
=============================================== */
const EmployeesColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">Employee Card Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Card Background Color:"
          currentColorValue={currentData.cardBackgroundColor || "#FFFFFF"}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="cardBackgroundColor"
        />
        <ThemeColorPicker
          label="Card Text Color:"
          currentColorValue={currentData.cardTextColor || "#000000"}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="cardTextColor"
        />
      </div>
    </div>
  );
};

/* ==============================================
   EMPLOYEES STYLING CONTROLS
   ----------------------------------------------
   Handles styling options like nail animation
=============================================== */
const EmployeesStylingControls = ({ currentData, onControlsChange }) => {
  return (
    <PanelStylingController
      currentData={currentData}
      onControlsChange={onControlsChange}
      blockType="EmployeesBlock"
      controlType="animations"
    />
  );
};
