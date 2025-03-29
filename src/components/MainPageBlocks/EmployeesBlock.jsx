// EmployeesBlock.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* ======================================================
   READ-ONLY VIEW: EmployeesPreview
   ------------------------------------------------------
   Renders the employees block as seen by site visitors.
   Uses GSAP for header animations and an auto-sliding
   carousel that empows the employees.
========================================================= */



function EmployeesPreview({ employeesData }) {
  if (!employeesData) {
    return <p>No Employee data found.</p>;
  }
  // Use the employees data passed in or default to an empty array
  const employeesList = employeesData?.employee || [];
  
  // Ensure we have a section title, default to "OUR TEAM" if none provided
  const sectionTitle = employeesData?.sectionTitle || "OUR TEAM";
  
  // Format image paths to ensure they have proper format
  const formattedEmployees = employeesList.map(emp => ({
    ...emp,
    image: emp.image?.startsWith('/') ? emp.image : `/assets/images/team/${emp.image?.split('/').pop() || 'roofer.png'}`
  }));
  
  const headerRef = useRef(null);
  const nailRef = useRef(null);
  const textRef = useRef(null);

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const itemsToShow = useItemsToShow(); // custom hook for responsive count
  const slideInterval = 2500;
  
  // Get employee data from employeesData, default to empty array
  const employee = employeesData?.employee || [];

  // Extend the employees array for a seamless loop (use formattedEmployees)
  const extendedEmployees = useMemo(() => {
    return formattedEmployees.concat(formattedEmployees.slice(0, itemsToShow));
  }, [formattedEmployees, itemsToShow]);

  // Auto-slide the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex >= employeesList.length - 1) {
          // Reset the transition to jump instantly back to the beginning,
          // then restore the smooth transition
          setTransitionDuration(0);
          setTimeout(() => setTransitionDuration(0.5), 50);
          return 0;
        }
        return prevIndex + 1;
      });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [employeesList.length, slideInterval]);

  // GSAP header animations (nail and text slide in)
  useEffect(() => {
    // Starting positions: nail off-screen right, text off-screen left.
    gsap.set(nailRef.current, { x: "100vw" });
    gsap.set(textRef.current, { x: "-100vw" });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: headerRef.current,
        start: "top 75%",
        toggleActions: "play none none none",
        markers: false,
        once: true,
      },      
    });

    // 1) Nail slides in (from 100vw to -7vw)
    masterTimeline.to(nailRef.current, {
      x: "-7vw",
      duration: 0.8,
      ease: "power2.out",
    });

    // 2) After a short delay, nail moves further left and text slides in simultaneously.
    masterTimeline
      .to(
        nailRef.current,
        {
          x: "-10vw",
          duration: 0.6,
          ease: "power2.inOut",
        },
        "+=0.5"
      )
      .to(
        textRef.current,
        {
          x: "-50%",
          duration: 0.6,
          ease: "power2.inOut",
        },
        "<"
      );

    // Cleanup ScrollTrigger instances when unmounting
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div>
      {/* Header Section with animated nail and title */}
      <div
        ref={headerRef}
        className="relative flex items-center w-full overflow-hidden py-8 md:py-10"
      >
        {/* Nail element (animated from the right) */}
        <div
          ref={nailRef}
          className="absolute right-[17vw] md:right-[17%] w-[30%] h-[6vh] md:h-[5vh]"

        >
          <div
            className="w-full h-full dynamic-shadow"
            style={{
              backgroundImage: "url('/assets/images/nail.png')",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
              transform: "scale(3) scaleX(-1)",
              transformOrigin: "right center",
            }}
          />
        </div>
        {/* Section title (animated from the left) */}
        <div ref={textRef} className="absolute left-1/2 z-30">
          <h2 className="text-[6vw] md:text-[7vh] text-black font-normal font-ultra-condensed font-rye pt-3">
            {sectionTitle}
          </h2>
        </div>
      </div>

      {/* Employees Carousel */}
      <div className="relative employee-section flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-screen-lg">
          <div
            className="flex transition-transform"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
              transitionDuration: `${transitionDuration}s`,
              transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)",
              width: `${(extendedEmployees.length * 100) / itemsToShow}%`,
            }}
          >
            {extendedEmployees.map((employee, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 flex flex-col items-center justify-start px-2"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <div className="relative mb-4">
                  <div className="bg-white w-[12.5vh] h-[12.5vh] md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
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
                  <div className="flex flex-col -space-y-1 items-center mt-1">
                    <p className="whitespace-nowrap text-[1.4vw] md:text-[2vh] text-black font-semibold text-center">
                      {employee.name}
                    </p>
                    <p className=" whitespace-nowrap text-[1.4vw] md:text-[1.5vh] font-semibold text-black text-center">
                      {employee.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
    <div className="bg-black text-white p-4 rounded max-h-[75vh] overflow-auto">
      {/* Top bar with "Save" button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Employees Editor</h1>
        <button
          type="button"
          onClick={onSave}
          className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white font-semibold"
        >
          Save
        </button>
      </div>

      {/* Editable Section Title */}
      <div className="mb-6">
        <label className="block text-sm mb-1">Section Title:</label>
        <input
          type="text"
          className="w-full bg-gray-700 px-2 py-1 rounded"
          value={localEmployees.sectionTitle || ""}
          onChange={(e) =>
            setLocalEmployees((prev) => ({
              ...prev,
              sectionTitle: e.target.value,
            }))
          }
        />
      </div>

      {/* Editable Employees List */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Employees</h2>
        {localEmployees.employee.map((emp, index) => (
          <div key={index} className="bg-gray-800 p-3 rounded mb-3 relative">
            <button
              onClick={() => {
                const updated = [...localEmployees.employee];
                updated.splice(index, 1);
                setLocalEmployees((prev) => ({
                  ...prev,
                  employee: updated,
                }));
              }}
              className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2"
            >
              Remove
            </button>
            <label className="block text-sm mb-1">
              Name:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={emp.name || ""}
                onChange={(e) => {
                  const updated = [...localEmployees.employee];
                  updated[index] = { ...emp, name: e.target.value };
                  setLocalEmployees((prev) => ({ ...prev, employee: updated }));
                }}
              />
            </label>
            <label className="block text-sm mb-1">
              Role:
              <input
                type="text"
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
                value={emp.role || ""}
                onChange={(e) => {
                  const updated = [...localEmployees.employee];
                  updated[index] = { ...emp, role: e.target.value };
                  setLocalEmployees((prev) => ({ ...prev, employee: updated }));
                }}
              />
            </label>
            {/* New file upload for employee image */}
            <label className="block text-sm mb-1">
              Upload Employee Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const fileURL = URL.createObjectURL(file);
                    const updated = [...localEmployees.employee];
                    updated[index] = { ...emp, image: fileURL };
                    setLocalEmployees((prev) => ({ ...prev, employee: updated }));
                  }
                }}
                className="w-full bg-gray-700 px-2 py-1 rounded mt-1"
              />
            </label>
            {emp.image && (
              <img
                src={emp.image}
                alt={`Preview of ${emp.name}`}
                className="mt-2 h-24 rounded shadow"
              />
            )}
          </div>
        ))}
        <button
          onClick={() => {
            const updated = [
              ...localEmployees.employee,
              {
                name: "New Employee",
                role: "Role",
                image: "/assets/images/placeholder.png",
              },
            ];
            setLocalEmployees((prev) => ({ ...prev, employee: updated }));
          }}
          className="bg-blue-600 text-white text-xs px-2 py-1 rounded"
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
  const [localEmployees, setLocalEmployees] = useState(() => {
    if (!employeesData) {
      return {
        sectionTitle: "",
        employee: [],
      };
    }
    return {
      ...employeesData,
      employee: employeesData.employee?.map((emp) => ({...emp})) || [],
    };
  });

  // Callback to save the changes back to the parent
  const handleSave = () => {
    onConfigChange?.(localEmployees);
  };

  // Render read-only preview or editor panel based on the readOnly prop.
  if (readOnly) {
    return <EmployeesPreview employeesData={employeesData} />;
  }
  return (
    <EmployeesEditorPanel
      localEmployees={localEmployees}
      setLocalEmployees={setLocalEmployees}
      onSave={handleSave}
    />
  );
}

/* ======================================================
   Helper Hook: useItemsToShow
   ------------------------------------------------------
   Determines how many carousel items to display at once
   based on the window width.
========================================================= */
function useItemsToShow() {
  const [itemsToShow, setItemsToShow] = useState(4);

  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth >= 700) {
        setItemsToShow(7);
      } else {
        setItemsToShow(5);
      }
    };

    updateItemsToShow();
    window.addEventListener("resize", updateItemsToShow);
    return () => window.removeEventListener("resize", updateItemsToShow);
  }, []);

  return itemsToShow;
}
