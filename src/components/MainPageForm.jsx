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

// Sliding Edit Panel component - replaces overlay to slide underneath instead
const SlidingEditPanel = ({ children, onClose }) => (
  <div className="w-full transition-all duration-300 mt-4">
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={onClose}
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
  // Toggles for each block
  const [activeEditBlock, setActiveEditBlock] = useState(null);

  // Keep track of the data structure for debugging
  useEffect(() => {
    console.log("MainPageForm received formData:", formData);
    console.log("Current singleBlockMode:", singleBlockMode);
  }, [formData, singleBlockMode]);

  // Helper function to get the correct data for a block
  const getBlockData = (blockKey) => {
    // If we're in single block mode, the data might be directly in formData[blockKey]
    // or nested if it came from OneForm with a specific blockName
    if (singleBlockMode) {
      // If formData[singleBlockMode] exists and we're requesting that block, use it directly
      if (formData[singleBlockMode] && blockKey === singleBlockMode) {
        return formData[singleBlockMode];
      }
      // Otherwise, we're likely trying to access a different block property
      return formData[blockKey];
    }

    // In full form mode, just return the block data directly
    return formData[blockKey];
  };

  // Callback functions
  const handleHeroConfigChange = (newHeroConfig) => {
    console.log("Hero config changed:", newHeroConfig);

    if (singleBlockMode === "hero") {
      // In single block mode for this specific block
      setFormData((prev) => ({
        ...prev,
        hero: newHeroConfig,
      }));
    } else {
      // Normal mode
      setFormData((prev) => ({ ...prev, hero: newHeroConfig }));
    }
  };

  const handleRichTextConfigChange = (newRichTextConfig) => {
    console.log("RichText config changed:", newRichTextConfig);
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

  // SVG icons
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

  // Handle rendering for single block mode
  if (singleBlockMode) {
    console.log(`Rendering single block mode for: ${singleBlockMode}`);
    // Only render the specified block
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
              readOnly={false}
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

  // Render all blocks with edit buttons for the main page editor
  console.log("Rendering all blocks for main page editor");
  return (
    <div className="bg-gray-100">
      {/* HERO BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock("hero")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <HeroBlock readOnly={true} heroconfig={formData.hero} />

        {/* Sliding editor panel */}
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

      {/* RICHTEXT BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock("richText")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <RichTextBlock readOnly={true} richTextData={formData.richText} />

        {/* Sliding editor panel */}
        {activeEditBlock === "richText" && (
          <SlidingEditPanel onClose={() => setActiveEditBlock(null)}>
            <RichTextBlock
              readOnly={false}
              richTextData={formData.richText}
              onConfigChange={handleRichTextConfigChange}
            />
          </SlidingEditPanel>
        )}
      </div>

      {/* ABOUT BUTTON BLOCK */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock("button")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <ButtonBlock readOnly={true} buttonconfig={formData.button} />

        {/* Sliding editor panel */}
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
            onClick={() => setActiveEditBlock("map")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <BasicMapBlock readOnly={true} mapData={formData.map} />

        {/* Sliding editor panel */}
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
            onClick={() => setActiveEditBlock("booking")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <BookingBlock readOnly={true} bookingData={formData.booking} />

        {/* Sliding editor panel */}
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
            onClick={() => setActiveEditBlock("combinedPage")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <CombinedPageBlock readOnly={true} config={formData.combinedPage} />

        {/* Sliding editor panel */}
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
            onClick={() => setActiveEditBlock("beforeAfter")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <BeforeAfterBlock
          readOnly={true}
          beforeAfterData={formData.before_after}
        />

        {/* Sliding editor panel */}
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
            onClick={() => setActiveEditBlock("employees")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <EmployeesBlock readOnly={true} employeesData={formData.employees} />

        {/* Sliding editor panel */}
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
