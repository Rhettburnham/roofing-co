import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import HeroBlock from "./MainPageBlocks/HeroBlock";
import BeforeAfterBlock from "./MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./MainPageBlocks/EmployeesBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./MainPageBlocks/CombinedPageBlock";

// Sliding Edit Panel component - Will NOT be used for RichTextBlock anymore
const SlidingEditPanel = ({ children, onClose }) => (
  <div className="w-full transition-all duration-300 mt-4">
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose} // This will now also trigger save for RichTextBlock
          className="bg-gray-700 text-white rounded-full p-2 hover:bg-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="overflow-auto max-h-[70vh]">{children}</div>
    </div>
  </div>
);

SlidingEditPanel.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({ formData, setFormData, singleBlockMode = null }) => {
  const [activeEditBlock, setActiveEditBlock] = useState(null);

  useEffect(() => {
    console.log("MainPageForm received formData:", formData);
    console.log("Current singleBlockMode:", singleBlockMode);
  }, [formData, singleBlockMode]);

  const getBlockData = (blockKey) => {
    if (singleBlockMode) {
      if (formData[singleBlockMode] && blockKey === singleBlockMode) {
        return formData[singleBlockMode];
      }
      return formData[blockKey];
    }
    return formData[blockKey];
  };

  const handleHeroConfigChange = (newHeroConfig) => {
    console.log("Hero config changed:", newHeroConfig);
    setFormData((prev) => ({ ...prev, hero: newHeroConfig }));
  };

  const handleRichTextConfigChange = (newRichTextConfig) => {
    console.log("RichText config changed (auto-saved):", newRichTextConfig);
    setFormData((prev) => ({ ...prev, richText: newRichTextConfig }));
  };

  const handleButtonConfigChange = (newButtonConfig) => {
    console.log("Button config changed:", newButtonConfig);
    setFormData((prev) => ({ ...prev, button: newButtonConfig }));
  };

  const handleMapConfigChange = (newMapConfig) => {
    console.log("Map config changed:", newMapConfig);
    setFormData((prev) => ({ ...prev, map: newMapConfig }));
  };

  const handleBookingConfigChange = (newBookingConfig) => {
    console.log("Booking config changed:", newBookingConfig);
    setFormData((prev) => ({ ...prev, booking: newBookingConfig }));
  };

  const handleCombinedConfigChange = (newCombinedConfig) => {
    console.log("CombinedPage config changed:", newCombinedConfig);
    setFormData((prev) => ({ ...prev, combinedPage: newCombinedConfig }));
  };

  const handleBeforeConfigChange = (newBeforeConfig) => {
    console.log("BeforeAfter config changed:", newBeforeConfig);
    setFormData((prev) => ({ ...prev, before_after: newBeforeConfig }));
  };

  const handleEmployeesConfigChange = (newEmployeesConfig) => {
    console.log("Employees config changed:", newEmployeesConfig);
    setFormData((prev) => ({ ...prev, employees: newEmployeesConfig }));
  };

  const PencilIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"
      />
    </svg>
  );

  const CloseIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
  
  const CheckIcon = ( // Using a Check icon for "Done Editing" or "Save"
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5" 
      stroke="currentColor" 
      className="w-6 h-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );

  // Handle toggling edit mode for RichTextBlock specifically
  const toggleRichTextEdit = () => {
    if (activeEditBlock === 'richText') {
      // Closing RichText editor - changes are already auto-saved by RichTextBlock via onConfigChange
      console.log("Closing RichText editor. Data should be up-to-date in formData.");
      setActiveEditBlock(null);
    } else {
      setActiveEditBlock('richText');
    }
  };

  if (singleBlockMode) {
    console.log(`Rendering single block mode for: ${singleBlockMode}`);
    switch (singleBlockMode) {
      case "hero":
        return (
          <div className="relative">
            <HeroBlock
              readOnly={false}
              heroconfig={getBlockData("hero")}
              onConfigChange={handleHeroConfigChange}
            />
          </div>
        );
      case "richText":
        return (
          <div className="relative">
            <RichTextBlock
              readOnly={false} // Always editable in single block mode for RichText
              richTextData={getBlockData("richText")}
              onConfigChange={handleRichTextConfigChange}
            />
          </div>
        );
      case "button":
        return (
          <div className="relative">
            <ButtonBlock
              readOnly={false}
              buttonconfig={getBlockData("button")}
              onConfigChange={handleButtonConfigChange}
            />
          </div>
        );
      case "map":
        return (
          <div className="relative">
            <BasicMapBlock
              readOnly={false}
              mapData={getBlockData("map")}
              onConfigChange={handleMapConfigChange}
            />
          </div>
        );
      case "booking":
        return (
          <div className="relative">
            <BookingBlock
              readOnly={false}
              bookingData={getBlockData("booking")}
              onConfigChange={handleBookingConfigChange}
            />
          </div>
        );
      case "combinedPage":
        return (
          <div className="relative">
            <CombinedPageBlock
              readOnly={false}
              config={getBlockData("combinedPage")}
              onConfigChange={handleCombinedConfigChange}
            />
          </div>
        );
      case "beforeAfter":
        return (
          <div className="relative">
            <BeforeAfterBlock
              readOnly={false}
              beforeAfterData={getBlockData("before_after")}
              onConfigChange={handleBeforeConfigChange}
            />
          </div>
        );
      case "employees":
        return (
          <div className="relative">
            <EmployeesBlock
              readOnly={false}
              employeesData={getBlockData("employees")}
              onConfigChange={handleEmployeesConfigChange}
            />
          </div>
        );
      default:
        console.error(`Unknown block type: ${singleBlockMode}`);
        return <div>Unknown block type: {singleBlockMode}</div>;
    }
  }

  console.log("Rendering all blocks for main page editor");
  return (
    <div className="bg-gray-100">
      {/* HERO BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "hero" ? null : "hero")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "hero" ? "Close Hero Editor" : "Edit Hero Block"}
          >
            {activeEditBlock === "hero" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <HeroBlock readOnly={activeEditBlock !== "hero"} heroconfig={formData.hero} />

        {activeEditBlock === "hero" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <HeroBlock
              readOnly={false}
              heroconfig={formData.hero}
              onConfigChange={handleHeroConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* RICHTEXT BLOCK - Inline Editing Toggle, No SlidingEditPanel */}
      <div className="relative bg-white overflow-hidden py-4"> {/* Added some padding for better spacing with editor panel */} 
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={toggleRichTextEdit} // Use the dedicated toggle function
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "richText" ? "Done Editing Rich Text" : "Edit Rich Text Block"}
          >
            {activeEditBlock === "richText" ? CheckIcon : PencilIcon} 
          </button>
        </div>
        <RichTextBlock 
          readOnly={activeEditBlock !== 'richText'}
          richTextData={formData.richText} 
          onConfigChange={handleRichTextConfigChange} 
        />
        {/* The RichTextEditorPanel for images is now part of RichTextBlock itself when readOnly is false */}
      </div>

      {/* ABOUT BUTTON BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
           <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "button" ? null : "button")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "button" ? "Close Button Editor" : "Edit Button Block"}
          >
            {activeEditBlock === "button" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <ButtonBlock readOnly={activeEditBlock !== "button"} buttonconfig={formData.button} />

        {activeEditBlock === "button" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <ButtonBlock
              readOnly={false}
              buttonconfig={formData.button}
              onConfigChange={handleButtonConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* MAP & STATS BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "map" ? null : "map")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "map" ? "Close Map Editor" : "Edit Map Block"}
          >
            {activeEditBlock === "map" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <BasicMapBlock readOnly={activeEditBlock !== "map"} mapData={formData.map} />

        {activeEditBlock === "map" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <BasicMapBlock
              readOnly={false}
              mapData={formData.map}
              onConfigChange={handleMapConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* BOOKING BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "booking" ? null : "booking")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "booking" ? "Close Booking Editor" : "Edit Booking Block"}
          >
            {activeEditBlock === "booking" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <BookingBlock readOnly={activeEditBlock !== "booking"} bookingData={formData.booking} />

        {activeEditBlock === "booking" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <BookingBlock
              readOnly={false}
              bookingData={formData.booking}
              onConfigChange={handleBookingConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* COMBINED PAGE BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "combinedPage" ? null : "combinedPage")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "combinedPage" ? "Close Combined Page Editor" : "Edit Combined Page Block"}
          >
            {activeEditBlock === "combinedPage" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <CombinedPageBlock readOnly={activeEditBlock !== "combinedPage"} config={formData.combinedPage} />

        {activeEditBlock === "combinedPage" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <CombinedPageBlock
              readOnly={false}
              config={formData.combinedPage}
              onConfigChange={handleCombinedConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* BEFORE & AFTER BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "beforeAfter" ? null : "beforeAfter")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "beforeAfter" ? "Close Before/After Editor" : "Edit Before/After Block"}
          >
            {activeEditBlock === "beforeAfter" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <BeforeAfterBlock
          readOnly={activeEditBlock !== "beforeAfter"}
          beforeAfterData={formData.before_after}
        />

        {activeEditBlock === "beforeAfter" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <BeforeAfterBlock
              readOnly={false}
              beforeAfterData={formData.before_after}
              onConfigChange={handleBeforeConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* EMPLOYEES BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock(activeEditBlock === "employees" ? null : "employees")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={activeEditBlock === "employees" ? "Close Employees Editor" : "Edit Employees Block"}
          >
            {activeEditBlock === "employees" ? CloseIcon : PencilIcon}
          </button>
        </div>
        <EmployeesBlock readOnly={activeEditBlock !== "employees"} employeesData={formData.employees} />

        {activeEditBlock === "employees" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <EmployeesBlock
              readOnly={false}
              employeesData={formData.employees}
              onConfigChange={handleEmployeesConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>
    </div>
  );
};

MainPageForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  singleBlockMode: PropTypes.string,
};

export default MainPageForm;
