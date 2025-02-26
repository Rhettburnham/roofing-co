import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import ServiceEditPage from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";

// Default data structure if combined_data.json isn’t available yet.
const defaultFormData = {
  hero: {},
  richText: {},
  map: {},
  combinedPage: {},
  employees: {},
  testimonial: {},
  beforeAfter: {},
  booking: {},
  logo: {},
  main_header: {},
  about: {},
  services: {
    commercial: [],
    residential: [],
  },
  colors: {},
};

const OneForm = () => {
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // On mount, fetch combined_data.json to populate the form.
  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        const response = await fetch("/data/combined_data.json");
        if (!response.ok) throw new Error("Failed to fetch combined_data.json.");
        const data = await response.json();
        setFormData((prev) => ({
          ...prev,
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
          services: {
            commercial: data.services?.commercial || [],
            residential: data.services?.residential || [],
          },
          colors: data.colors || {},
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

  // ZIP-generation on final submit.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const zip = new JSZip();

      // Clone the formData to remove File objects before JSONifying.
      const clonedData = JSON.parse(JSON.stringify(formData));
      if (clonedData.logo) {
        delete clonedData.logo.file;
      }
      if (clonedData.main_header) {
        delete clonedData.main_header.final_res_main_file;
        delete clonedData.main_header.final_com_main_file;
      }
      const combinedDataJson = JSON.stringify(clonedData, null, 2);
      zip.file("combined_data.json", combinedDataJson);

      // Optionally, also create a separate service data file.
      const serviceDataOnly = {
        commercial: clonedData.services.commercial,
        residential: clonedData.services.residential,
      };
      zip.file("service_edit.json", JSON.stringify(serviceDataOnly, null, 2));

      // Gather any files from formData for inclusion.
      const filesToZip = [];
      if (formData.logo && formData.logo.file) {
        filesToZip.push({
          file: formData.logo.file,
          path: `assets/images/${formData.logo.fileName || "logo.png"}`,
        });
      }
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

      // Also include images from service blocks.
      if (formData.services) {
        ["commercial", "residential"].forEach((category) => {
          formData.services[category].forEach((page) => {
            if (page.blocks) {
              page.blocks.forEach((block, blockIndex) => {
                Object.keys(block.config).forEach((key) => {
                  const value = block.config[key];
                  if (value && typeof value === "object" && value.file) {
                    const fileName = `${category}_page_${page.id}_block_${blockIndex}_${key}.png`;
                    filesToZip.push({
                      file: value.file,
                      path: `assets/images/${fileName}`,
                    });
                  }
                });
              });
            }
          });
        });
      }

      for (const item of filesToZip) {
        const arrayBuffer = await item.file.arrayBuffer();
        zip.file(item.path, arrayBuffer);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "website_data.zip");
    } catch (err) {
      console.error("Error generating ZIP:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p>Loading combined_data.json ...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">Master Editor</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <ServiceEditPage />
        <MainPageForm formData={formData} setFormData={setFormData} />
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

export default OneForm;
