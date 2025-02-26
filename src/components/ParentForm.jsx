// src/components/ParentForm.jsx
import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import GeneralServicesForm from "./GeneralServicesForm";
import MainPageForm from "./MainPageForm";

// A default structure if combined_data.json is not available yet
const defaultFormData = {
  // Main page stuff
  hero: {},
  richText: {},
  map: {},
  combinedPage: {},
  employees: {},
  testimonial: {},
  beforeAfter: {},
  booking: {},
  // Example: if you store color or logo info:
  logo: {},
  main_header: {},
  about: {},
  // Services data => commercial + residential
  services: {
    commercial: [],
    residential: [],
  },
};

const ParentForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, fetch combined_data.json (or the relevant main data).
  // We assume it includes the “services” structure with commercial & residential arrays.
  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const response = await fetch("/data/combined_data.json");
        if (!response.ok) throw new Error("Failed to fetch combined_data.json.");
        const data = await response.json();

        // Merge the data you got from the file into formData
        setFormData((prev) => ({
          ...prev,
          // Merge top-level blocks if present:
          hero: { ...prev.hero, ...(data.hero || {}) },
          richText: { ...prev.richText, ...(data.richText || {}) },
          map: { ...prev.map, ...(data.map || {}) },
          combinedPage: { ...prev.combinedPage, ...(data.combinedPage || {}) },
          employees: { ...prev.employees, ...(data.employees || {}) },
          testimonial: { ...prev.testimonial, ...(data.testimonial || {}) },
          beforeAfter: { ...prev.beforeAfter, ...(data.beforeAfter || {}) },
          booking: { ...prev.booking, ...(data.booking || {}) },
          logo: { ...prev.logo, ...(data.logo || {}) },
          main_header: { ...prev.main_header, ...(data.main_header || {}) },
          about: { ...prev.about, ...(data.about || {}) },

          // Import services if they exist
          services: {
            commercial: data.services?.commercial || [],
            residential: data.services?.residential || [],
          },
        }));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCombinedData();
  }, []);

  /**
   * Handle final submission:
   *  - We bundle everything into a ZIP
   *  - This includes the updated JSON data,
   *  - And any uploaded images from formData.
   *  - You can also produce a separate file called “service_edit.json” if you wish.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const zip = new JSZip();

      // 1) Make a clone of formData for JSON saving
      const clonedData = JSON.parse(JSON.stringify(formData));
      // Remove any actual File objects from the clone to avoid circular references
      if (clonedData.logo) {
        delete clonedData.logo.file;
      }
      if (clonedData.main_header) {
        delete clonedData.main_header.final_res_main_file;
        delete clonedData.main_header.final_com_main_file;
      }
      // If you have other file references in “richText” or “booking,” remove them similarly.

      // 2) Put combined_data.json in the ZIP (this is your “master” data)
      const combinedDataJson = JSON.stringify(clonedData, null, 2);
      zip.file("combined_data.json", combinedDataJson);

      // 3) If you also want a separate “service_edit.json,” do so here:
      const serviceDataOnly = {
        commercial: clonedData.services.commercial,
        residential: clonedData.services.residential,
      };
      const serviceEditJson = JSON.stringify(serviceDataOnly, null, 2);
      zip.file("service_edit.json", serviceEditJson);

      // 4) Gather all file uploads that exist in your formData
      const filesToZip = [];

      // Example: logo files
      if (formData.logo && formData.logo.file) {
        filesToZip.push({
          file: formData.logo.file,
          path: `assets/images/${formData.logo.fileName || "logo.png"}`,
        });
      }
      // Example: main_header images
      if (formData.main_header?.final_res_main_file) {
        filesToZip.push({
          file: formData.main_header.final_res_main_file,
          path: `assets/images/${formData.main_header.final_res_main_filename}`,
        });
      }
      if (formData.main_header?.final_com_main_file) {
        filesToZip.push({
          file: formData.main_header.final_com_main_file,
          path: `assets/images/${formData.main_header.final_com_main_filename}`,
        });
      }

      // If your blocks or services have images stored in formData, you’d gather them here as well.

      // 5) Append each file’s contents to the ZIP
      for (const item of filesToZip) {
        const arrayBuffer = await item.file.arrayBuffer();
        zip.file(item.path, arrayBuffer);
      }

      // 6) Generate the ZIP and prompt download
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website_data.zip");
    } catch (err) {
      console.error("Error generating ZIP:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Loading combined_data.json ...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Master Editor</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/**
         * 1) Edit the “services” portion (commercial + residential)
         */}
        <GeneralServicesForm formData={formData} setFormData={setFormData} />

        {/**
         * 2) Edit main page / hero / booking / employees, etc.
         */}
        <MainPageForm formData={formData} setFormData={setFormData} />

        {/**
         * 3) Final submission => Download ZIP (images + JSON).
         */}
        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded text-white text-lg"
          >
            Download ZIP (All Data + Images)
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentForm;
