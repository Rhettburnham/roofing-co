import React, { useState } from "react";
import PropTypes from "prop-types";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import HeroBlock from "./MainPageBlocks/HeroBlock";
import BeforeAfterBlock from "./MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./MainPageBlocks/EmployeesBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./MainPageBlocks/CombinedPageBlock";
import ProcessBlock from "./MainPageBlocks/ProcessBlock";

// Edit overlay component
const EditOverlay = ({ children, onClose }) => (
  <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex flex-col overflow-auto">
    <div className="flex justify-end p-2">
      <button
        type="button"
        onClick={onClose}
        className="bg-gray-800 rounded-full p-2 text-white hover:bg-gray-700"
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
    <div className="flex-1 overflow-auto p-4">{children}</div>
  </div>
);

EditOverlay.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({ formData, setFormData, singleBlockMode }) => {
  // Toggles for each block
  const [activeEditBlock, setActiveEditBlock] = useState(null);

  // Callback functions
  const handleHeroConfigChange = (newHeroConfig) => {
    setFormData((prev) => ({ ...prev, hero: newHeroConfig }));
  };
  const handleRichTextConfigChange = (newRichTextConfig) => {
    setFormData((prev) => ({ ...prev, richText: newRichTextConfig }));
  };
  const handleButtonConfigChange = (newButtonConfig) => {
    setFormData((prev) => ({ ...prev, button: newButtonConfig }));
  };
  const handleMapConfigChange = (newMapConfig) => {
    setFormData((prev) => ({ ...prev, map: newMapConfig }));
  };
  const handleBookingConfigChange = (newBookingConfig) => {
    setFormData((prev) => ({ ...prev, booking: newBookingConfig }));
  };
  const handleCombinedConfigChange = (newCombinedConfig) => {
    setFormData((prev) => ({ ...prev, combinedPage: newCombinedConfig }));
  };
  const handleBeforeConfigChange = (newBeforeConfig) => {
    setFormData((prev) => ({ ...prev, beforeAfter: newBeforeConfig }));
  };
  const handleEmployeesConfigChange = (newEmployeesConfig) => {
    setFormData((prev) => ({ ...prev, employees: newEmployeesConfig }));
  };
  const handleProcessConfigChange = (newProcessConfig) => {
    setFormData((prev) => ({ ...prev, process: newProcessConfig }));
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
    // Only render the specified block
    switch (singleBlockMode) {
      case "hero":
        return (
          <div className="relative">
            <HeroBlock
              readOnly={false}
              heroconfig={formData.hero}
              onConfigChange={handleHeroConfigChange}
            />
          </div>
        );
      case "richText":
        return (
          <div className="relative">
            <RichTextBlock
              readOnly={false}
              richTextData={formData.richText}
              onConfigChange={handleRichTextConfigChange}
            />
          </div>
        );
      case "button":
        return (
          <div className="relative">
            <ButtonBlock
              readOnly={false}
              buttonconfig={formData.button}
              onConfigChange={handleButtonConfigChange}
            />
          </div>
        );
      case "map":
        return (
          <div className="relative">
            <BasicMapBlock
              readOnly={false}
              mapData={formData.map}
              onConfigChange={handleMapConfigChange}
            />
          </div>
        );
      case "booking":
        return (
          <div className="relative">
            <BookingBlock
              readOnly={false}
              bookingData={formData.booking}
              onConfigChange={handleBookingConfigChange}
            />
          </div>
        );
      case "combinedPage":
        return (
          <div className="relative">
            <CombinedPageBlock
              readOnly={false}
              config={formData.combinedPage}
              onConfigChange={handleCombinedConfigChange}
            />
          </div>
        );
      case "beforeAfter":
        return (
          <div className="relative">
            <BeforeAfterBlock
              readOnly={false}
              beforeAfterData={formData.beforeAfter}
              onConfigChange={handleBeforeConfigChange}
            />
          </div>
        );
      case "employees":
        return (
          <div className="relative">
            <EmployeesBlock
              readOnly={false}
              employeesData={formData.employees}
              onConfigChange={handleEmployeesConfigChange}
            />
          </div>
        );
      case "process":
        return (
          <div className="relative">
            <ProcessBlock
              readOnly={false}
              processData={formData.process}
              onConfigChange={handleProcessConfigChange}
            />
          </div>
        );
      default:
        return null;
    }
  }

  // Render all blocks with edit buttons
  return (
    <div className="bg-gray-100">
      {/* HERO BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "hero" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <HeroBlock
              readOnly={false}
              heroconfig={formData.hero}
              onConfigChange={handleHeroConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* PROCESS BLOCK */}
      <div className="relative">
        <div className="absolute top-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setActiveEditBlock("process")}
            className="bg-gray-800 text-white rounded-full p-2 shadow-lg"
          >
            {PencilIcon}
          </button>
        </div>
        <ProcessBlock readOnly={true} processData={formData.process} />
        {activeEditBlock === "process" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <ProcessBlock
              readOnly={false}
              processData={formData.process}
              onConfigChange={handleProcessConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* RICHTEXT BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "richText" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <RichTextBlock
              readOnly={false}
              richTextData={formData.richText}
              onConfigChange={handleRichTextConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* ABOUT BUTTON BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "button" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <ButtonBlock
              readOnly={false}
              buttonconfig={formData.button}
              onConfigChange={handleButtonConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* MAP & STATS BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "map" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <BasicMapBlock
              readOnly={false}
              mapData={formData.map}
              onConfigChange={handleMapConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* BOOKING BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "booking" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <BookingBlock
              readOnly={false}
              bookingData={formData.booking}
              onConfigChange={handleBookingConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* COMBINED PAGE BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "combinedPage" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <CombinedPageBlock
              readOnly={false}
              config={formData.combinedPage}
              onConfigChange={handleCombinedConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* BEFORE & AFTER BLOCK */}
      <div className="relative">
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
          beforeAfterData={formData.beforeAfter}
        />
        {activeEditBlock === "beforeAfter" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <BeforeAfterBlock
              readOnly={false}
              beforeAfterData={formData.beforeAfter}
              onConfigChange={handleBeforeConfigChange}
            />
          </EditOverlay>
        )}
      </div>

      {/* EMPLOYEES BLOCK */}
      <div className="relative">
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
        {activeEditBlock === "employees" && (
          <EditOverlay onClose={() => setActiveEditBlock(null)}>
            <EmployeesBlock
              readOnly={false}
              employeesData={formData.employees}
              onConfigChange={handleEmployeesConfigChange}
            />
          </EditOverlay>
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

MainPageForm.defaultProps = {
  singleBlockMode: null,
};

export default MainPageForm;
