/**
 * OneForm Component
 *
 * This component provides a comprehensive editing interface for website content.
 * It allows for editing both main page blocks and service pages, and generates
 * a downloadable ZIP file containing:
 *
 * 1. Updated JSON data files (combined_data.json and service_edit.json)
 * 2. Any uploaded images organized in the correct directory structure
 *
 * This is a key part of the website's content management system that allows
 * for local editing of content without direct database access. The downloaded
 * ZIP file can be sent to the developer for permanent integration into the site.
 */
import React, { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import ServiceEditPage, { getServicesData } from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";

const OneForm = ({ initialData, blockName, title }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, fetch combined_data.json to populate the form if no initialData is provided
  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        // If initialData is provided, use it directly
        if (initialData) {
          setFormData({ [blockName]: initialData });
          setLoading(false);
          return;
        }

        // Otherwise, fetch the complete combined_data.json
        const response = await fetch("/data/combined_data.json");
        const data = await response.json();
        setFormData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error loading form data:", error);
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, [initialData, blockName]);

  /**
   * handleSubmit - Generates and downloads a ZIP file with all edited content
   *
   * This function:
   * 1. Creates a new ZIP archive
   * 2. Clones and cleans the formData to remove File objects
   * 3. Adds the JSON data files to the ZIP
   * 4. Collects all uploaded image files
   * 5. Adds the image files to the ZIP with proper paths
   * 6. Generates and downloads the final ZIP file
   *
   * This allows website owners to make changes locally and send the
   * updated content to the developer for integration.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
      const zip = new JSZip();

    // Clone the formData to remove File objects before JSONifying
    // This prevents circular references when stringifying
      const clonedData = JSON.parse(JSON.stringify(formData));

    // Clean up file references from all blocks
    cleanupFileReferences(clonedData);

    // Add the complete combined_data.json to the ZIP
      const combinedDataJson = JSON.stringify(clonedData, null, 2);
      zip.file("combined_data.json", combinedDataJson);

    // Get the services data from ServiceEditPage
    const servicesData = getServicesData();
    if (servicesData) {
      // Use the services data directly from ServiceEditPage
      zip.file("services.json", JSON.stringify(servicesData, null, 2));
    } else {
      // Fallback to the services data from combined_data if available
      const serviceDataOnly = {
        commercial: clonedData.services?.commercial || [],
        residential: clonedData.services?.residential || [],
      };
      zip.file("services.json", JSON.stringify(serviceDataOnly, null, 2));
    }

    // Gather all files from formData for inclusion in the ZIP
      const filesToZip = [];

    // Collect all image files from the form data
    collectImageFiles(formData, filesToZip);

    // Add all collected files to the ZIP
    for (const item of filesToZip) {
      try {
        const arrayBuffer = await item.file.arrayBuffer();
        zip.file(item.path, arrayBuffer);
        console.log(`Added file to ZIP: ${item.path}`);
      } catch (error) {
        console.error(`Error adding file to ZIP: ${item.path}`, error);
      }
    }

    // Generate and download the ZIP file
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "website_data.zip");
  };

  /**
   * cleanupFileReferences - Removes File objects from the data before stringifying
   *
   * @param {Object} data - The data object to clean
   */
  const cleanupFileReferences = (data) => {
    // Clean up file references from the logo
    if (data.logo) {
      delete data.logo.file;
    }

    // Clean up file references from the main header
    if (data.main_header) {
      delete data.main_header.final_res_main_file;
      delete data.main_header.final_com_main_file;
    }

    // Clean up file references from hero block
    if (data.hero) {
      if (
        data.hero.residentialImage &&
        typeof data.hero.residentialImage === "object"
      ) {
        data.hero.residentialImage =
          data.hero.residentialImage.url || data.hero.residentialImage;
      }
      if (
        data.hero.commercialImage &&
        typeof data.hero.commercialImage === "object"
      ) {
        data.hero.commercialImage =
          data.hero.commercialImage.url || data.hero.commercialImage;
      }
    }

    // Clean up file references from before/after block
    if (data.beforeAfter && data.beforeAfter.items) {
      data.beforeAfter.items.forEach((item) => {
        if (item.before && typeof item.before === "object") {
          item.before = item.before.url || item.before;
        }
        if (item.after && typeof item.after === "object") {
          item.after = item.after.url || item.after;
        }
      });
    }

    // Clean up file references from employees block
    if (data.employees && data.employees.employees) {
      data.employees.employees.forEach((employee) => {
        if (employee.image && typeof employee.image === "object") {
          employee.image = employee.image.url || employee.image;
        }
      });
    }

    // Clean up file references from rich text block
    if (
      data.richText &&
      data.richText.image &&
      typeof data.richText.image === "object"
    ) {
      data.richText.image = data.richText.image.url || data.richText.image;
    }

    // Clean up file references from button block
    if (
      data.about &&
      data.about.image &&
      typeof data.about.image === "object"
    ) {
      data.about.image = data.about.image.url || data.about.image;
    }

    // Clean up file references from booking block
    if (
      data.booking &&
      data.booking.logo &&
      typeof data.booking.logo === "object"
    ) {
      data.booking.logo = data.booking.logo.url || data.booking.logo;
    }

    // Clean up file references from combined page block
    if (data.combinedPage) {
      if (
        data.combinedPage.image &&
        typeof data.combinedPage.image === "object"
      ) {
        data.combinedPage.image =
          data.combinedPage.image.url || data.combinedPage.image;
      }
      if (data.combinedPage.items) {
        data.combinedPage.items.forEach((item) => {
          if (item.image && typeof item.image === "object") {
            item.image = item.image.url || item.image;
          }
        });
      }
    }

    // Clean up file references from services
    if (data.services) {
      ["commercial", "residential"].forEach((category) => {
        data.services[category]?.forEach((page) => {
          if (page.blocks) {
            page.blocks.forEach((block) => {
              if (block.config) {
                Object.keys(block.config).forEach((key) => {
                  const value = block.config[key];

                  // Handle single image objects
                  if (value && typeof value === "object" && value.file) {
                    block.config[key] = value.url || value;
                  }

                  // Handle arrays that might contain image objects
                  if (Array.isArray(value)) {
                    block.config[key] = value.map((item) => {
                      if (item && typeof item === "object" && item.file) {
                        return item.url || item;
                      }

                      // Handle objects with image properties
                      if (item && typeof item === "object") {
                        const newItem = { ...item };
                        Object.keys(newItem).forEach((itemKey) => {
                          if (
                            newItem[itemKey] &&
                            typeof newItem[itemKey] === "object" &&
                            newItem[itemKey].file
                          ) {
                            newItem[itemKey] =
                              newItem[itemKey].url || newItem[itemKey];
                          }
                        });
                        return newItem;
                      }

                      return item;
                    });
                  }
                });
              }
            });
          }
        });
      });
    }
  };

  /**
   * collectImageFiles - Recursively collects all image files from the form data
   *
   * @param {Object} data - The data object to collect files from
   * @param {Array} filesToZip - Array to store collected files
   */
  const collectImageFiles = (data, filesToZip) => {
    // Add logo file if present
    if (data.logo && data.logo.file) {
      filesToZip.push({
        file: data.logo.file,
        path: `assets/images/${data.logo.fileName || "logo.png"}`,
      });
    }

    // Add main header images if present
    if (data.main_header?.final_res_main_file) {
      filesToZip.push({
        file: data.main_header.final_res_main_file,
        path: `assets/images/${data.main_header.final_res_main_filename}`,
      });
    }
    if (data.main_header?.final_com_main_file) {
      filesToZip.push({
        file: data.main_header.final_com_main_file,
        path: `assets/images/${data.main_header.final_com_main_filename}`,
      });
    }

    // Add hero block images
    if (data.hero) {
      if (data.hero.residentialImage && data.hero.residentialImage.file) {
        filesToZip.push({
          file: data.hero.residentialImage.file,
          path: `assets/images/hero/residential_background.${getFileExtension(data.hero.residentialImage.file.name)}`,
        });
      }
      if (data.hero.commercialImage && data.hero.commercialImage.file) {
        filesToZip.push({
          file: data.hero.commercialImage.file,
          path: `assets/images/hero/commercial_background.${getFileExtension(data.hero.commercialImage.file.name)}`,
        });
      }
    }

    // Add before/after block images
    if (data.beforeAfter && data.beforeAfter.items) {
      data.beforeAfter.items.forEach((item, index) => {
        if (item.before && item.before.file) {
          filesToZip.push({
            file: item.before.file,
            path: `assets/images/beforeAfter/before_${index + 1}.${getFileExtension(item.before.file.name)}`,
          });
        }
        if (item.after && item.after.file) {
          filesToZip.push({
            file: item.after.file,
            path: `assets/images/beforeAfter/after_${index + 1}.${getFileExtension(item.after.file.name)}`,
          });
        }
      });
    }

    // Add employees block images
    if (data.employees && data.employees.employees) {
      data.employees.employees.forEach((employee, index) => {
        if (employee.image && employee.image.file) {
          filesToZip.push({
            file: employee.image.file,
            path: `assets/images/employees/employee_${index + 1}.${getFileExtension(employee.image.file.name)}`,
          });
        }
      });
    }

    // Add rich text block image
    if (data.richText && data.richText.image && data.richText.image.file) {
      filesToZip.push({
        file: data.richText.image.file,
        path: `assets/images/richText/main_image.${getFileExtension(data.richText.image.file.name)}`,
      });
    }

    // Add button block image
    if (data.about && data.about.image && data.about.image.file) {
      filesToZip.push({
        file: data.about.image.file,
        path: `assets/images/about/main_image.${getFileExtension(data.about.image.file.name)}`,
      });
    }

    // Add booking block logo
    if (data.booking && data.booking.logo && data.booking.logo.file) {
      filesToZip.push({
        file: data.booking.logo.file,
        path: `assets/images/booking/logo.${getFileExtension(data.booking.logo.file.name)}`,
      });
    }

    // Add combined page block images
    if (data.combinedPage) {
      if (data.combinedPage.image && data.combinedPage.image.file) {
        filesToZip.push({
          file: data.combinedPage.image.file,
          path: `assets/images/combinedPage/main_image.${getFileExtension(data.combinedPage.image.file.name)}`,
        });
      }
      if (data.combinedPage.items) {
        data.combinedPage.items.forEach((item, index) => {
          if (item.image && item.image.file) {
            filesToZip.push({
              file: item.image.file,
              path: `assets/images/combinedPage/item_${index + 1}.${getFileExtension(item.image.file.name)}`,
            });
          }
        });
      }
    }

    // Include images from service blocks
    if (data.services) {
        ["commercial", "residential"].forEach((category) => {
        data.services[category]?.forEach((page) => {
            if (page.blocks) {
              page.blocks.forEach((block, blockIndex) => {
              const blockType = block.blockName || "unknown";

              // Process config object for image files
              if (block.config) {
                Object.keys(block.config).forEach((key) => {
                  const value = block.config[key];

                  // Handle single image objects
                  if (value && typeof value === "object" && value.file) {
                    const fileName = `${category}_page_${page.id}_${blockType}_${blockIndex}_${key}.${getFileExtension(value.file.name)}`;
                    filesToZip.push({
                      file: value.file,
                      path: `assets/images/services/${category}/${page.id}/${fileName}`,
                    });
                  }

                  // Handle arrays that might contain image objects
                  if (Array.isArray(value)) {
                    value.forEach((item, itemIndex) => {
                      // Direct image objects in array
                      if (item && typeof item === "object" && item.file) {
                        const fileName = `${category}_page_${page.id}_${blockType}_${blockIndex}_${key}_${itemIndex}.${getFileExtension(item.file.name)}`;
                        filesToZip.push({
                          file: item.file,
                          path: `assets/images/services/${category}/${page.id}/${fileName}`,
                        });
                      }

                      // Objects with image properties (like before/after items)
                      if (item && typeof item === "object") {
                        Object.keys(item).forEach((itemKey) => {
                          if (
                            item[itemKey] &&
                            typeof item[itemKey] === "object" &&
                            item[itemKey].file
                          ) {
                            const fileName = `${category}_page_${page.id}_${blockType}_${blockIndex}_${key}_${itemIndex}_${itemKey}.${getFileExtension(item[itemKey].file.name)}`;
                            filesToZip.push({
                              file: item[itemKey].file,
                              path: `assets/images/services/${category}/${page.id}/${fileName}`,
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
              });
            }
          });
        });
      }
  };

  /**
   * getFileExtension - Extracts the file extension from a filename
   *
   * @param {string} filename - The filename to extract extension from
   * @returns {string} - The file extension (without the dot)
   */
  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase() || "png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }

  // If editing a specific block, render a simplified interface
  if (blockName && title) {
    return (
      <div className="min-h-screen bg-white text-black p-6">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <div className="space-y-8">
          <MainPageForm
            formData={formData}
            setFormData={setFormData}
            singleBlockMode={blockName}
          />
          <div className="text-center">
            <button
              onClick={handleSubmit}
              type="button"
              className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded text-white text-lg"
            >
              Download Updated JSON
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render the full editor interface
  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-4">Master Editor</h1>
      <div className="space-y-8">
        <ServiceEditPage />
        <MainPageForm formData={formData} setFormData={setFormData} />
        <div className="text-center">
          <button
            onClick={handleSubmit}
            type="button"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded text-white text-lg"
          >
            Download ZIP (All Data + Images)
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneForm;
