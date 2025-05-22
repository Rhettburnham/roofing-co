// EmployeesBlock.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeEmployeeImageState = (imageValue, defaultPath = "/assets/images/team/roofer.png") => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return { ...imageValue, name: imageValue.name || imageValue.url.split('/').pop() };
  }
  if (typeof imageValue === 'string') {
    return { file: null, url: imageValue, name: imageValue.split('/').pop() };
  }
  return { file: null, url: defaultPath, name: defaultPath.split('/').pop() }; 
};

// Helper to get display URL from string path or {url, file} object
const getEmployeeImageUrl = (imageState, defaultImgPath = "/assets/images/team/roofer.png") => {
  let path = defaultImgPath;
  if (imageState && typeof imageState === 'object' && imageState.url) {
    path = imageState.url;
  } else if (typeof imageState === 'string') {
    path = imageState; 
  }
  if (path && !path.startsWith('blob:') && !path.startsWith('http:') && !path.startsWith('https:') && !path.startsWith('/')) {
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
  onEmployeeDetailChange 
}) {
  if (!employeesData) {
    return <p>No Employee data found.</p>;
  }
  
  const employeesListOriginal = employeesData?.employee || [];
  const sectionTitle = employeesData?.sectionTitle || "OUR TEAM";
  const showNailAnimation = employeesData?.showNailAnimation !== undefined ? employeesData.showNailAnimation : true;

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
      return formattedEmployees.concat(formattedEmployees.slice(0, ITEMS_TO_SHOW_ANIMATION));
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

    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger === header && (st.animation?.targets?.includes(nail) || st.animation?.targets?.includes(text))) {
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
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === header && (st.animation?.targets?.includes(nail) || st.animation?.targets?.includes(text))) {
          st.kill();
        }
      });
      gsap.killTweensOf([nail, text]);
    };
  }, [showNailAnimation]);

  const renderEmployeeCard = (employee, index, cardStyle = {}) => (
    <div key={employee.id || index} className="flex-shrink-0 flex flex-col items-center justify-start px-2" style={cardStyle}>
      <div className="relative mb-4">
        <div className="bg-white w-[12.5vh] h-[12.5vh] md:w-32 md:h-32 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
          <img src={employee.image} alt={employee.name} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.src = "/assets/images/team/roofer.png"; }}/>
        </div>
        <div className="flex flex-col items-center mt-1">
          {readOnly ? (
            <>
              <p className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] text-black font-semibold text-center">{employee.name}</p>
              <p className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] font-semibold -mt-2 text-black text-center">{employee.role}</p>
            </>
          ) : (
            <>
              <input type="text" value={employee.name || ""} onChange={(e) => onEmployeeDetailChange(index, 'name', e.target.value)} className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] text-black font-semibold text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full" placeholder="Name"/>
              <input type="text" value={employee.role || ""} onChange={(e) => onEmployeeDetailChange(index, 'role', e.target.value)} className="whitespace-nowrap text-[1.4vw] md:text-[1.5vh] font-semibold -mt-0 text-black text-center bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full" placeholder="Role"/>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div ref={headerRef} className="relative flex items-center w-full py-8 md:py-10">
        <div ref={nailRef} className="absolute right-[17vw] md:right-[17%] w-[30%] h-[6vh] md:h-[4vh]">
          <div className="w-full h-full dynamic-shadow" style={{ backgroundImage: "url('/assets/images/nail.png')", backgroundPosition: "right center", backgroundRepeat: "no-repeat", backgroundSize: "contain", transform: "scale(3) scaleX(-1)", transformOrigin: "right center" }}/>
        </div>
        <div ref={textRef} className="absolute left-1/2 z-30 w-auto">
          {readOnly ? (
            <h2 className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-rye pt-3 whitespace-nowrap">{sectionTitle}</h2>
          ) : (
            <input type="text" value={sectionTitle} onChange={(e) => onSectionTitleChange && onSectionTitleChange(e.target.value)} className="text-[6vw] md:text-[4vh] text-black font-normal font-ultra-condensed font-rye pt-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 text-center whitespace-nowrap min-w-[300px] md:min-w-[400px]" placeholder="Section Title"/>
          )}
        </div>
      </div>
      <div className="relative employee-section flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="w-full max-w-screen-lg">
          {numTotalEmployees > 0 && numTotalEmployees <= 4 ? (
            <div className="flex justify-around items-start py-4">
              {formattedEmployees.map((employee, idx) => renderEmployeeCard(employee, idx))}
            </div>
          ) : numTotalEmployees >= 5 ? (
            <div className="flex transition-transform" style={{ transform: `translateX(-${currentIndex * (100 / ITEMS_TO_SHOW_ANIMATION)}%)`, transitionDuration: `${transitionDuration}s`, transitionTimingFunction: "cubic-bezier(0.65, 0, 0.35, 1)", width: `${(extendedEmployees.length * 100) / ITEMS_TO_SHOW_ANIMATION}%` }}>
              {extendedEmployees.map((employee, idx) => renderEmployeeCard(employee, idx, { width: `${100 / ITEMS_TO_SHOW_ANIMATION}%` }))}
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
   EDITOR VIEW: EmployeesEditorPanel
   ------------------------------------------------------
   Renders an editor interface to update the section title
   and the list of employees. Changes here are stored in
   local state until the admin clicks "Save."
========================================================= */
function EmployeesEditorPanel({ localData, onPanelChange }) {
  const handleAddItem = () => {
    const newItem = {
      id: `new_emp_${Date.now()}`,
      name: "New Employee",
      role: "Role",
      image: initializeEmployeeImageState("/assets/images/team/roofer.png"),
    };
    onPanelChange(prev => ({ ...prev, employee: [...(prev.employee || []), newItem] }));
  };

  const handleRemoveItem = (index) => {
    const itemToRemove = localData.employee[index];
    if (itemToRemove?.image?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove.image.url);
    }
    onPanelChange(prev => ({ ...prev, employee: prev.employee.filter((_, i) => i !== index) }));
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    const currentItem = localData.employee[index];
    if (currentItem?.image?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentItem.image.url);
    }
    const fileURL = URL.createObjectURL(file);
    const updatedImageState = { file: file, url: fileURL, name: file.name };
    onPanelChange(prev => {
      const updatedEmployees = [...prev.employee];
      updatedEmployees[index] = { ...updatedEmployees[index], image: updatedImageState };
      return { ...prev, employee: updatedEmployees };
    });
  };

  const handleImageUrlChange = (index, urlValue) => {
    const currentItem = localData.employee[index];
    if (currentItem?.image?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentItem.image.url);
    }
    const updatedImageState = { file: null, url: urlValue, name: urlValue.split('/').pop() };
    onPanelChange(prev => {
      const updatedEmployees = [...prev.employee];
      updatedEmployees[index] = { ...updatedEmployees[index], image: updatedImageState };
      return { ...prev, employee: updatedEmployees };
    });
  };

  const handleToggleNailAnimation = () => {
    const currentShowState = localData.showNailAnimation !== undefined ? localData.showNailAnimation : true;
    onPanelChange({ showNailAnimation: !currentShowState });
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded mt-0">
      <h2 className="text-lg font-semibold mb-2 border-b pb-2">Manage Employees & Images</h2>
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {(localData.employee || []).map((emp, index) => (
        <div key={emp.id || index} className="bg-gray-100 p-3 rounded mb-3 relative border border-gray-300">
          <button onClick={() => handleRemoveItem(index)} className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-700 z-10">Remove</button>
          <p className="text-sm mb-1 text-gray-600">Editing: {emp.name || "New Employee"} ({emp.role || "Role"})</p>
          <div className="grid grid-cols-1 gap-3">
            <div>
                <label className="block text-xs mb-1 text-gray-700">Employee Image:</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0])} className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer" />
                <input type="text" value={getEmployeeImageUrl(emp.image, '')} onChange={(e) => handleImageUrlChange(index, e.target.value)} className="w-full bg-gray-200 text-gray-800 px-2 py-1 rounded mt-1 text-xs placeholder-gray-500" placeholder="Or paste direct image URL" />
                {getEmployeeImageUrl(emp.image) && <img src={getEmployeeImageUrl(emp.image)} alt={`Preview of ${emp.name}`} className="mt-2 h-20 w-20 object-cover rounded shadow bg-gray-200 p-1"/>}
            </div>
          </div>
        </div>
      ))}
      </div>
      <button type="button" onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm w-full mt-3 font-medium">+ Add Employee</button>
      <div className="mt-4 pt-3 border-t">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={localData.showNailAnimation !== undefined ? localData.showNailAnimation : true}
            onChange={handleToggleNailAnimation}
            className="form-checkbox h-5 w-5 text-blue-600 rounded"
          />
          <span className="text-sm font-medium text-gray-700">Show Nail Animation</span>
        </label>
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
  const [localData, setLocalData] = useState(() => {
    const initialConfig = employeesData || {};
    return {
      sectionTitle: initialConfig.sectionTitle || "OUR TEAM",
      showNailAnimation: initialConfig.showNailAnimation !== undefined ? initialConfig.showNailAnimation : true,
      employee: (initialConfig.employee || []).map((emp, index) => ({
        ...emp,
        id: emp.id || `emp_init_${index}_${Date.now()}`,
        image: initializeEmployeeImageState(emp.image),
      })),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (employeesData) {
      setLocalData(prevLocalData => {
        const newEmployeeList = (employeesData.employee || []).map((newEmpFromProp, index) => {
          const oldEmpFromLocal = prevLocalData.employee.find(pe => pe.id === newEmpFromProp.id) || prevLocalData.employee[index] || {};
          const newImageState = initializeEmployeeImageState(newEmpFromProp.image, oldEmpFromLocal.image?.url);
          
          if (oldEmpFromLocal.image?.file && oldEmpFromLocal.image.url?.startsWith('blob:') && oldEmpFromLocal.image.url !== newImageState.url) {
            URL.revokeObjectURL(oldEmpFromLocal.image.url);
          }

          const mergedEmp = {
            ...oldEmpFromLocal,
            ...newEmpFromProp,
            id: newEmpFromProp.id || oldEmpFromLocal.id || `emp_update_${index}_${Date.now()}`,
            image: newImageState,
          };

          if (!readOnly && oldEmpFromLocal.name !== (newEmpFromProp.name || "")) {
            mergedEmp.name = oldEmpFromLocal.name;
          } else {
            mergedEmp.name = newEmpFromProp.name || "";
          }

          if (!readOnly && oldEmpFromLocal.role !== (newEmpFromProp.role || "")) {
            mergedEmp.role = oldEmpFromLocal.role;
          } else {
            mergedEmp.role = newEmpFromProp.role || "";
          }
          return mergedEmp;
        });
        
        let resolvedSectionTitle;
        if (!readOnly && prevLocalData.sectionTitle !== (employeesData.sectionTitle || "OUR TEAM")) {
            resolvedSectionTitle = prevLocalData.sectionTitle;
        } else {
            resolvedSectionTitle = employeesData.sectionTitle || "OUR TEAM";
        }

        const resolvedShowNailAnimation = employeesData.showNailAnimation !== undefined
                                     ? employeesData.showNailAnimation
                                     : (prevLocalData.showNailAnimation !== undefined
                                          ? prevLocalData.showNailAnimation
                                          : true);

        return {
          ...prevLocalData,
          ...employeesData,
          sectionTitle: resolvedSectionTitle,
          employee: newEmployeeList,
          showNailAnimation: resolvedShowNailAnimation,
        };
      });
    }
  }, [employeesData, readOnly]);

  useEffect(() => {
    return () => {
      localData.employee?.forEach(emp => {
        if (emp.image?.file && emp.image.url?.startsWith('blob:')) {
          URL.revokeObjectURL(emp.image.url);
        }
      });
    };
  }, [localData.employee]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("EmployeesBlock: Editing finished. Calling onConfigChange.");
        const dataToSave = {
            ...localData,
            employee: localData.employee.map(emp => ({
                ...emp,
                image: emp.image?.file ? (emp.image.name || 'default_employee.png') : emp.image?.url,
            })),
            showNailAnimation: localData.showNailAnimation !== undefined ? localData.showNailAnimation : true,
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (updater) => {
    setLocalData(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      return newState;
    });
  };

  const handleSectionTitleChange = (newTitle) => {
    handleLocalDataChange(prev => ({ ...prev, sectionTitle: newTitle }));
  };

  const handleEmployeeDetailChange = (index, field, value) => {
    handleLocalDataChange(prev => {
      const updatedEmployees = [...prev.employee];
      if (updatedEmployees[index]) {
        updatedEmployees[index] = { ...updatedEmployees[index], [field]: value };
      }
      return { ...prev, employee: updatedEmployees };
    });
  };

  if (readOnly) {
    return <EmployeesPreview employeesData={localData} readOnly={true} />;
  }
  
  return (
    <>
      <EmployeesPreview 
        employeesData={localData} 
        readOnly={false}
        onSectionTitleChange={handleSectionTitleChange}
        onEmployeeDetailChange={handleEmployeeDetailChange}
      />
      <EmployeesEditorPanel
        localData={localData}
        onPanelChange={handleLocalDataChange} 
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
