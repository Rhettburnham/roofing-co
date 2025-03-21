import React, { useState } from "react";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import HeroBlock from "./MainPageBlocks/HeroBlock";
import BeforeAfterBlock from "./MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./MainPageBlocks/EmployeesBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./MainPageBlocks/CombinedPageBlock";

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({ formData, setFormData }) => {
  // Toggles for each block
  const [showHeroEdit, setShowHeroEdit] = useState(false);
  const [showRichEdit, setShowRichEdit] = useState(false);
  const [showButtonEdit, setShowButtonEdit] = useState(false);
  const [showMapEditor, setShowMapEditor] = useState(false);
  const [showBookingEdit, setShowBookingEdit] = useState(false);
  const [showCombinedEdit, setShowCombinedEdit] = useState(false);
  const [showBeforeAfterEdit, setShowBeforeAfterEdit] = useState(false);
  const [showEmployeesEdit, setShowEmployeesEdit] = useState(false);

  // Callback functions remain unchanged
  const handleHeroConfigChange = (newHeroConfig) => {
    setFormData((prev) => ({ ...prev, hero: newHeroConfig }));
  };
  const handleRichTextConfigChange = (newRichTextConfig) => {
    setFormData((prev) => ({ ...prev, richText: newRichTextConfig }));
  };
  const handleButtonConfigChange = (newButtonConfig) => {
    setFormData((prev) => ({ ...prev, about: newButtonConfig }));
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

  // Reusable SVG icons for pencil and check mark
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

  const CheckIcon = (
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
        d="M4.5 12.75l6 6 9-13.5"
      />
    </svg>
  );

  return (
    <div className="border border-gray-700 p-4 rounded space-y-6 text-white">
      {/* HERO BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showHeroEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowHeroEdit((prev) => !prev)}
          >
            {showHeroEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showHeroEdit ? (
          <HeroBlock
            readOnly={false}
            heroconfig={formData.hero}
            onConfigChange={handleHeroConfigChange}
          />
        ) : (
          <HeroBlock readOnly={true} heroconfig={formData.hero} />
        )}
      </div>

      {/* RICHTEXT BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showRichEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowRichEdit((prev) => !prev)}
          >
            {showRichEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showRichEdit ? (
          <RichTextBlock
            readOnly={false}
            richTextData={formData.richText}
            onConfigChange={handleRichTextConfigChange}
          />
        ) : (
          <RichTextBlock readOnly={true} richTextData={formData.richText} />
        )}
      </div>

      {/* ABOUT BUTTON BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showButtonEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowButtonEdit((prev) => !prev)}
          >
            {showButtonEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showButtonEdit ? (
          <ButtonBlock
            readOnly={false}
            buttonconfig={formData.about}
            onConfigChange={handleButtonConfigChange}
          />
        ) : (
          <ButtonBlock readOnly={true} buttonconfig={formData.about} />
        )}
      </div>

      {/* MAP & STATS BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showMapEditor ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowMapEditor((prev) => !prev)}
          >
            {showMapEditor ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showMapEditor ? (
          <BasicMapBlock
            readOnly={false}
            mapData={formData.map}
            onConfigChange={handleMapConfigChange}
          />
        ) : (
          <BasicMapBlock readOnly={true} mapData={formData.map} />
        )}
      </div>

      {/* BOOKING BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showBookingEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowBookingEdit((prev) => !prev)}
          >
            {showBookingEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showBookingEdit ? (
          <BookingBlock
            readOnly={false}
            bookingData={formData.booking}
            onConfigChange={handleBookingConfigChange}
          />
        ) : (
          <BookingBlock readOnly={true} bookingData={formData.booking} />
        )}
      </div>

      {/* COMBINED PAGE BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showCombinedEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowCombinedEdit((prev) => !prev)}
          >
            {showCombinedEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showCombinedEdit ? (
          <CombinedPageBlock
            readOnly={false}
            config={formData.combinedPage}
            onConfigChange={handleCombinedConfigChange}
          />
        ) : (
          <CombinedPageBlock readOnly={true} config={formData.combinedPage} />
        )}
      </div>

      {/* BEFORE & AFTER BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showBeforeAfterEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowBeforeAfterEdit((prev) => !prev)}
          >
            {showBeforeAfterEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showBeforeAfterEdit ? (
          <BeforeAfterBlock
            readOnly={false}
            config={formData.beforeAfter}
            onConfigChange={handleBeforeConfigChange}
          />
        ) : (
          <BeforeAfterBlock
            readOnly={true}
            beforeAfterData={formData.beforeAfter}
          />
        )}
      </div>

      {/* EMPLOYEES BLOCK */}
      <div className="border p-3 rounded space-y-3">
        <div className="flex justify-end">
          <button
            type="button"
            className={`flex items-center justify-center w-10 h-10 rounded ${
              showEmployeesEdit ? "bg-green-500" : "bg-red-500"
            }`}
            onClick={() => setShowEmployeesEdit((prev) => !prev)}
          >
            {showEmployeesEdit ? CheckIcon : PencilIcon}
          </button>
        </div>
        {showEmployeesEdit ? (
          <EmployeesBlock
            readOnly={false}
            employeesData={formData.employees}
            onConfigChange={handleEmployeesConfigChange}
          />
        ) : (
          <EmployeesBlock
            readOnly={true}
            employeesData={formData.employees}
          />
        )}
      </div>
    </div>
  );
};

export default MainPageForm;
