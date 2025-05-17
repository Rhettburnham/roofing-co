// EmployeesBlock.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeEmployeeImageState = (imageValue, defaultPath = "/assets/images/team/roofer.png") => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return imageValue; // Already in {file, url, name?} format
  }
  if (typeof imageValue === 'string') {
    // If it's a path, it might need prefixing for display, but the raw path is stored.
    return { file: null, url: imageValue, name: imageValue.split('/').pop() };
  }
  return { file: null, url: defaultPath, name: defaultPath.split('/').pop() }; // Default
};

// Helper to get display URL from string path or {url, file} object
const getEmployeeImageUrl = (imageState, defaultImgPath = "/assets/images/team/roofer.png") => {
  let path = defaultImgPath;
  if (imageState && typeof imageState === 'object' && imageState.url) {
    path = imageState.url;
  } else if (typeof imageState === 'string') {
    path = imageState; // Should ideally be an object, but handle if it's a string path
  }

  // If it's a relative asset path (not blob, not http, not absolute /), then prefix it
  // This ensures that simple filenames like "employee1.jpg" are correctly pointed to assets.
  if (path && !path.startsWith('blob:') && !path.startsWith('http:') && !path.startsWith('https:') && !path.startsWith('/')) {
    return `/assets/images/team/${path.split("/").pop()}`;
  }
  return path; // It's a blob, http, absolute, or already correctly prefixed from initialization
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
  onEmployeeDetailChange 
}) {
  if (!employeesData) {
    return <p>No Employee data found.</p>;
  }
  
  const employeesListOriginal = employeesData?.employee || [];
  const sectionTitle = employeesData?.sectionTitle || "OUR TEAM";

  // Format employees for display, primarily getting the correct image URL
  const formattedEmployees = employeesListOriginal.map((emp) => ({
    ...emp,
    image: getEmployeeImageUrl(emp.image), // Use helper to get displayable URL
  }));

  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const slideInterval = 2500;

  const numTotalEmployees = formattedEmployees.length;
  const ITEMS_TO_SHOW_ANIMATION = 4; // Number of items visible during animation

  // Extend the employees array for a seamless loop (only if animating)
  const extendedEmployees = useMemo(() => {
    if (numTotalEmployees >= 5) {
      // Animate if 5 or more
      return formattedEmployees.concat(
        formattedEmployees.slice(0, ITEMS_TO_SHOW_ANIMATION)
      );
    }
    return formattedEmployees; // For static display, actual list is used directly
  }, [formattedEmployees, numTotalEmployees, ITEMS_TO_SHOW_ANIMATION]);

  // Auto-slide the carousel (only if animating)
  useEffect(() => {
    if (numTotalEmployees < 5) return; // Don't animate if less than 5 employees

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= numTotalEmployees - 1) {
          setTransitionDuration(0); // Instant jump
          setTimeout(() => setTransitionDuration(0.5), 50); // Restore smooth transition for next slide
          return 0; // Reset to the beginning
        }
        return prevIndex + 1;
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [numTotalEmployees, slideInterval]);

  // GSAP header animations (nail and text slide in)
  useEffect(() => {
    // Starting positions: nail off-screen right, text off-screen left.
    gsap.set(nailRef.current, { x: "100vw" });
    gsap.set(textRef.current, { x: "-100vw" });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 90%", // Changed from 80% to 20% to trigger when div appears at 20% of viewport
        end: "top 90%", // Adjusted to match new trigger approach
        toggleActions: "play none none none", // Play once when entering trigger area
        markers: false,
        once: true, // Added to ensure it only plays once
      },
    });

    // 1) Nail slides in (from 100vw to -7vw)
    masterTimeline.to(nailRef.current, {
      x: "10vw",
      duration: 0.8,
      ease: "power2.out",
    });

    // 2) After a short delay, nail moves further left and text slides in simultaneously.
    masterTimeline
      .to(
        nailRef.current,
        {
          x: "1vw", // Adjusted from -7vw to be less extreme and relative to its new position
          duration: 0.6,
          ease: "power2.inOut",
        },
        "+=0.5" // Delay after the first nail animation
      )
      .to(
        textRef.current, // This ref is on the container of the title/input
        {
          x: "-50%", // Center the text container
          duration: 0.6,
          ease: "power2.inOut",
        },
        "<" // Start at the same time as the second nail animation
      );

    // Cleanup ScrollTrigger instances when unmounting
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // Helper function to render a single employee card
  const renderEmployeeCard = (employee, index, cardStyle = {}) => (
    <div
      key={employee.id || index} // Use a unique id if available, otherwise fallback to index
      className="flex-shrink-0 flex flex-col items-center justify-start px-2"
      style={cardStyle}
    >
      <div className="relative mb-4">
        <div className="bg-white w-[12.5vh] h-[12.5vh] md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
          <img
            src={employee.image} // This is now the URL from getEmployeeImageUrl
            alt={employee.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.src = "/assets/images/team/roofer.png";
            }}
          />
        </div>
        <div className="flex flex-col items-center mt-1">
          {readOnly ? (
            <>
              <p className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] text-black font-semibold text-center">
                {employee.name}
              </p>
              <p className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] font-semibold -mt-2 text-black text-center">
                {employee.role}
              </p>
            </>
          ) : (
            <>
              <input
                type="text"
                value={employee.name || ""}
                onChange={(e) => onEmployeeDetailChange(index, 'name', e.target.value)}
                className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] text-black font-semibold text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                placeholder="Name"
              />
              <input
                type="text"
                value={employee.role || ""}
                onChange={(e) => onEmployeeDetailChange(index, 'role', e.target.value)}
                className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] font-semibold -mt-0 text-black text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full"
                placeholder="Role"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header Section with animated nail and title */}
      <div
        ref={headerRef}
        className="relative flex items-center w-full py-8 md:py-10"
      >
        {/* Nail element (animated from the right) */}
        <div
          ref={nailRef}
          className="absolute right-[17vw] md:right-[17%] w-[30%] h-[6vh] md:h-[4vh]"
        >
          <div
            className="w-full h-full dynamic-shadow"
            style={{
              backgroundImage: "url('/assets/images/nail.png')",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "scale(3) scaleX(-1)", // Nail points left
              transformOrigin: "right center",
            }}
          />
        </div>
        {/* Section title (animated from the left) */}
        <div ref={textRef} className="absolute left-1/2 z-30 w-auto">
          {readOnly ? (
            <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-rye pt-3 whitespace-nowrap">
              {sectionTitle}
            </h2>
          ) : (
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => onSectionTitleChange && onSectionTitleChange(e.target.value)}
              className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-rye pt-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 text-center whitespace-nowrap min-w-[300px] md:min-w-[400px]"
              placeholder="Section Title"
            />
          )}
        </div>
      </div>

      {/* Employees Display Area */}
      <div className="relative employee-section flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-screen-lg">
          {numTotalEmployees > 0 && numTotalEmployees <= 4 ? (
            // Static display for 1 to 4 employees
            <div className="flex justify-around items-start py-4">
              {formattedEmployees.map((employee, idx) =>
                renderEmployeeCard(employee, idx)
              )}
            </div>
          ) : numTotalEmployees >= 5 ? (
            // Animated Carousel for 5 or more employees
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
            // Case for 0 employees
            <p className="text-center py-4">No employees to display.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   EDITOR VIEW: EmployeesEditorPanel
   ------------------------------------------------------
   Renders an editor interface to update the section title
   and the list of employees. Changes here are stored in
   local state until the admin clicks "Save."
========================================================= */
function EmployeesEditorPanel({ localEmployees, setLocalEmployees, onSave }) {
  return (
    <div className="bg-white text-gray-800 p-4 rounded mt-4">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Edit Employee Details</h1>
      </div>

      {/* Editable Employees List */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Manage Employees & Images</h2>
        {localEmployees.employee.map((emp, index) => (
          <div key={emp.id || index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
            <button
              onClick={() => {
                // Revoke blob URL if the image being removed is a blob
                const employeeToRemove = localEmployees.employee[index];
                if (employeeToRemove.image && typeof employeeToRemove.image === 'object' && employeeToRemove.image.url && employeeToRemove.image.url.startsWith('blob:')) {
                  URL.revokeObjectURL(employeeToRemove.image.url);
                }
                const updated = [...localEmployees.employee];
                updated.splice(index, 1);
                setLocalEmployees((prev) => ({
                  ...prev,
                  employee: updated,
                }));
              }}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-700"
            >
              Remove Employee
            </button>
            {/* Name and Role are now edited in EmployeesPreview */}
            <p className="text-sm mb-1 text-gray-600">Editing: {emp.name || "New Employee"} ({emp.role || "Role"})</p>
            
            {/* File upload for employee image */}
            <label className="block text-sm mb-1 mt-2 text-gray-700">
              Employee Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Revoke old blob URL if image was an object with a blob URL
                    const oldImageState = localEmployees.employee[index]?.image;
                    if (oldImageState && typeof oldImageState === 'object' && oldImageState.url && oldImageState.url.startsWith('blob:')) {
                      URL.revokeObjectURL(oldImageState.url);
                    }

                    const fileURL = URL.createObjectURL(file);
                    const updatedEmployees = [...localEmployees.employee];
                    updatedEmployees[index] = {
                      ...updatedEmployees[index],
                      image: { file: file, url: fileURL, name: file.name },
                    };
                    setLocalEmployees((prev) => ({
                      ...prev,
                      employee: updatedEmployees,
                    }));
                  }
                }}
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-sm file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
              />
            </label>
            {emp.image && (
              <img
                src={getEmployeeImageUrl(emp.image)} // Use helper to display current image (blob or path)
                alt={`Preview of ${emp.name}`}
                className="mt-2 h-24 w-24 object-cover rounded shadow bg-gray-200 p-1"
              />
            )}
            {/* Optionally, allow pasting a URL or path directly */}
            <label className="block text-sm mb-1 mt-2 text-gray-700">
              Or Image Path/URL:
              <input
                type="text"
                className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500"
                placeholder="e.g., /assets/images/team/existing.png or http://..."
                value={(emp.image && (typeof emp.image === 'string' ? emp.image : emp.image.url)) || ''}
                onChange={(e) => {
                  const newImageValue = e.target.value;
                  // Revoke old blob URL if current image is a blob and is being replaced by a path
                  const oldImageState = localEmployees.employee[index]?.image;
                  if (oldImageState && typeof oldImageState === 'object' && oldImageState.url && oldImageState.url.startsWith('blob:')) {
                     if (newImageValue !== oldImageState.url) { // only revoke if URL changes
                        URL.revokeObjectURL(oldImageState.url);
                     }
                  }
                  
                  const updatedEmployees = [...localEmployees.employee];
                  updatedEmployees[index] = {
                    ...updatedEmployees[index],
                    image: { file: null, url: newImageValue, name: newImageValue.split('/').pop() }, // Store as object, no file if path is pasted
                  };
                  setLocalEmployees(prev => ({ ...prev, employee: updatedEmployees }));
                }}
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            const updated = [
              ...localEmployees.employee,
              {
                id: `new_${Date.now()}`,
                name: "New Employee",
                role: "Role",
                image: initializeEmployeeImageState("/assets/images/placeholder.png"), // Initialize with helper
              },
            ];
            setLocalEmployees((prev) => ({ ...prev, employee: updated }));
          }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm w-full mt-2"
        >
          + Add Employee
        </button>
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
}) {
  // Initialize local state for the editor from the provided data.
  const [localEmployees, setLocalEmployeesState] = useState(() => {
    const initialData = employeesData || { sectionTitle: "OUR TEAM", employee: [] };
    return {
      ...initialData,
      sectionTitle: initialData.sectionTitle || "OUR TEAM",
      employee: initialData.employee?.map((emp) => ({
        ...emp,
        image: initializeEmployeeImageState(emp.image), // Use helper for image
      })) || [],
    };
  });

  // Effect to update local state if the initial employeesData prop changes from parent
  useEffect(() => {
    if (employeesData) {
      setLocalEmployeesState(prevLocal => {
        // Revoke old blob URLs if any employee image was a blob and is changing
        // This needs to compare the new employeesData with prevLocal
        const newEmployeeData = employeesData.employee || [];
        prevLocal.employee?.forEach(oldEmp => {
          if (oldEmp.image && oldEmp.image.url && oldEmp.image.url.startsWith('blob:')) {
            const correspondingNewEmp = newEmployeeData.find(
              // Find by a unique key if possible, e.g. id. Assuming name for now.
              // This comparison logic might need to be more robust if names are not unique or change.
              newEmp => (newEmp.id && oldEmp.id && newEmp.id === oldEmp.id) || newEmp.name === oldEmp.name
            );
            let newImageIsDifferent = true;
            if (correspondingNewEmp) {
              const newImageState = initializeEmployeeImageState(correspondingNewEmp.image);
              if (newImageState.url === oldEmp.image.url) {
                newImageIsDifferent = false;
              }
            }
            if (newImageIsDifferent) {
              URL.revokeObjectURL(oldEmp.image.url);
            }
          }
        });

        return {
          ...employeesData,
          sectionTitle: employeesData.sectionTitle || prevLocal.sectionTitle || "OUR TEAM",
          employee: newEmployeeData.map((emp) => ({
            ...emp,
            image: initializeEmployeeImageState(emp.image),
          })),
        };
      });
    }
  }, [employeesData]);

  // Function to update local state and call onConfigChange
  const updateAndPropagateChanges = (updater) => {
    setLocalEmployeesState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      onConfigChange?.(newState); // Propagate the entire new state
      return newState;
    });
  };

  // Cleanup blob URLs on unmount for images in localEmployees state
  useEffect(() => {
    return () => {
      localEmployees.employee?.forEach(emp => {
        if (emp.image && emp.image.url && emp.image.url.startsWith('blob:')) {
          URL.revokeObjectURL(emp.image.url);
        }
      });
    };
  }, [localEmployees.employee]);

  if (readOnly) {
    // Pass the original employeesData for read-only preview, which now correctly uses getEmployeeImageUrl
    return <EmployeesPreview employeesData={employeesData} readOnly={true} />;
  }

  // When not readOnly, EmployeesPreview shows editable title, EmployeesEditorPanel edits employee list
  return (
    <>
      <EmployeesPreview
        employeesData={localEmployees} // Preview uses local state for dynamic updates
        readOnly={false}
        onSectionTitleChange={(newTitle) => {
          updateAndPropagateChanges(prev => ({ ...prev, sectionTitle: newTitle }));
        }}
        onEmployeeDetailChange={(index, field, value) => {
          updateAndPropagateChanges(prev => {
            const updatedEmployees = [...prev.employee];
            updatedEmployees[index] = { ...updatedEmployees[index], [field]: value };
            return { ...prev, employee: updatedEmployees };
          });
        }}
      />
      <EmployeesEditorPanel
        localEmployees={localEmployees}
        setLocalEmployees={updateAndPropagateChanges} 
        onSave={() => onConfigChange?.(localEmployees)} 
      />
    </>
  );
}

/* ======================================================
   Helper Hook: useItemsToShow - NO LONGER USED
========================================================= */
// This hook is no longer used by EmployeesPreview and can be removed.
// function useItemsToShow() {
//   const [itemsToShow, setItemsToShow] = useState(4);

//   useEffect(() => {
//     const updateItemsToShow = () => {
//       if (window.innerWidth >= 700) {
//         setItemsToShow(7);
//       } else {
//         setItemsToShow(5);
//       }
//     };

//     updateItemsToShow();
//     window.addEventListener("resize", updateItemsToShow);
//     return () => window.removeEventListener("resize", updateItemsToShow);
//   }, []);

//   return itemsToShow;
// }
