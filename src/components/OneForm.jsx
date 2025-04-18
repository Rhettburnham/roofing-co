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
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import ServiceEditPage, { getServicesData } from "./ServiceEditPage";
import MainPageForm from "./MainPageForm";
import AboutBlock from "./MainPageBlocks/AboutBlock";

// Tab style button component
const TabButton = ({ id, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium transition-all duration-300 ${
      isActive
        ? "bg-blue text-white drop-shadow-[0_1.2px_1.2px_rgba(255,30,0,0.8)] border-t-2 border-blue"
        : "bg-gray-700 text-gray-200 hover:bg-gray-600"
    } rounded-t-lg`}
    data-tab-id={id}
  >
    {label}
  </button>
);

TabButton.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
};

const OneForm = ({ initialData = null, blockName = null, title = null }) => {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("mainPage");

  // On mount, fetch combined_data.json to populate the form if no initialData is provided
  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        // If initialData is provided, use it directly within the appropriate block structure
        if (initialData) {
          if (blockName) {
            // For editing a specific block, structure the data properly
            setFormData({ [blockName]: initialData });
          } else {
            // For editing the entire form, use the data directly
            setFormData(initialData);
          }
          setLoading(false);
          return;
        }

        // Otherwise, try to fetch the full combined_data.json first
        try {
          const combinedResponse = await fetch(
            "/data/raw_data/step_4/combined_data.json"
          );
          if (combinedResponse.ok) {
            const combinedData = await combinedResponse.json();
            console.log("Loaded combined data:", combinedData);
            setFormData(combinedData);
            setLoading(false);
            return;
          }
        } catch (combinedError) {
          console.error("Error loading combined data:", combinedError);
          // Continue to fallback if combined data fetch fails
        }

        // Fallback: Create a default configuration
        try {
          // Fetch colors from colors_output.json
          const colorsResponse = await fetch(
            "/data/raw_data/step_2/colors_output.json"
          );
          const colorData = await colorsResponse.json();

          // Create a basic default form data
          const defaultData = {
            hero: {
              title: "Welcome to Craft Roofing Company",
              subtitle: "Professional Roofing Services",
              buttonText: "Get a Quote",
              buttonUrl: "#contact",
              residentialImage: "/assets/images/residential-roof.jpg",
              commercialImage: "/assets/images/commercial-roof.jpg",
              accentColor: colorData.accent || "#2B4C7E",
            },
            richText: {
              title: "About Our Services",
              content:
                "We provide professional roofing services for both residential and commercial properties.",
              heroText: "Expert Roofs, Trusted Craftsmanship",
              bus_description: "Professional roofing services description",
              bus_description_second: "Additional description text",
              cards: [],
              images: [],
              steps: [
                {
                  title: "Book",
                  videoSrc: "/assets/videos/our_process_videos/booking.mp4",
                  href: "/#booking",
                  scale: 0.8,
                },
                {
                  title: "Inspection",
                  videoSrc: "/assets/videos/our_process_videos/magnify.mp4",
                  href: "/inspection",
                  scale: 1.25,
                },
              ],
            },
            button: {
              text: "Contact Us",
              url: "#contact",
            },
            map: {
              title: "Find Us",
              location: "Your Location",
              center: {
                lat: 33.67671976442508,
                lng: -84.32647876462993,
              },
              zoomLevel: 12,
              circleRadius: 6000,
              address: "123 Main Street, Atlanta, GA",
              telephone: "(404) 555-1234",
              serviceHours: [],
            },
            booking: {
              title: "Book an Appointment",
            },
            combinedPage: {
              title: "Our Services",
              residentialServices: [],
              commercialServices: [],
              googleReviews: [],
            },
            before_after: {
              title: "Before & After",
              items: [],
            },
            employees: {
              title: "Our Team",
              items: [],
            },
            aboutPage: {
              title: "About Us",
            },
          };

          setFormData(defaultData);
          console.log("Using default data:", defaultData);
        } catch (colorError) {
          console.error("Error loading color data:", colorError);

          // Fallback to very basic data if color fetch fails
          const basicData = {
            hero: {
              title: "Welcome",
              subtitle: "Professional Services",
              buttonText: "Contact Us",
              buttonUrl: "#contact",
            },
          };

          setFormData(basicData);
          console.log("Using basic fallback data:", basicData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error loading form data:", error);
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, [initialData, blockName]);

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("About config changed:", newAboutConfig);
    setFormData((prev) => ({ ...prev, aboutPage: newAboutConfig }));
  };

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
  const handleSubmit = async () => {
    try {
      console.log("Creating ZIP with data:", formData);

      // Copy process steps from aboutPage to richText if they exist and richText doesn't have them
      const dataToZip = { ...formData };

      if (
        dataToZip.aboutPage &&
        dataToZip.aboutPage.steps &&
        dataToZip.richText &&
        (!dataToZip.richText.steps || dataToZip.richText.steps.length === 0)
      ) {
        console.log("Copying process steps from aboutPage to richText");
        dataToZip.richText = {
          ...dataToZip.richText,
          steps: dataToZip.aboutPage.steps,
        };
      }

      // Create a new ZIP archive
      const zip = new JSZip();

      // Clone the form data so we don't modify the original state
      const dataClone = JSON.parse(JSON.stringify(dataToZip));

      // Clean the data by replacing File objects with URLs
      cleanFileReferences(dataClone);

      // Add the combined_data.json to the root of the ZIP
      zip.file("combined_data.json", JSON.stringify(dataClone, null, 2));

      // Fetch and add the services data if editing the main page
      if (!blockName) {
        const services = await getServicesData();
        if (services) {
          // Make sure service slugs are properly formatted
          if (services.residential) {
            services.residential.forEach((service) => {
              if (!service.slug && service.id && service.name) {
                // Generate slug if missing
                service.slug = `residential-${service.id}-${service.name.toLowerCase().replace(/\s+/g, "-")}`;
              }
            });
          }

          if (services.commercial) {
            services.commercial.forEach((service) => {
              if (!service.slug && service.id && service.name) {
                // Generate slug if missing
                service.slug = `commercial-${service.id}-${service.name.toLowerCase().replace(/\s+/g, "-")}`;
              }
            });
          }

          zip.file("services.json", JSON.stringify(services, null, 2));
        }
      }

      // Collect all uploaded image and video files
      const filesToZip = [];
      collectFiles(dataClone, filesToZip);

      // Add each file to the ZIP with the correct path
      for (const { file, path } of filesToZip) {
        if (file) {
          // Convert File objects to array buffers
          const arrayBuffer = await file.arrayBuffer();
          zip.file(path, arrayBuffer);
        }
      }

      // Generate the ZIP file
      const content = await zip.generateAsync({ type: "blob" });

      // Create a friendly file name with date
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
      const fileName = blockName
        ? `${blockName}_edit_${dateStr}_${timeStr}.zip`
        : `website_content_${dateStr}_${timeStr}.zip`;

      // Download the ZIP file
      saveAs(content, fileName);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Error creating ZIP file. See console for details.");
    }
  };

  /**
   * cleanFileReferences - Recursively removes File objects from the data
   * by replacing them with their URL properties
   *
   * @param {Object} data - The data object to clean
   */
  const cleanFileReferences = (data) => {
    if (!data) return;

    // Process videos in RichText block
    if (data.richText && data.richText.steps) {
      data.richText.steps.forEach((step) => {
        if (step.videoFile) {
          step.videoSrc = `/assets/videos/our_process_videos/${step.fileName || "video.mp4"}`;
          delete step.videoFile;
          delete step.fileName;
        }
      });
    }

    // Hero block images
    if (data.hero) {
      // Residential image
      if (
        data.hero.residentialImage &&
        typeof data.hero.residentialImage === "object"
      ) {
        data.hero.residentialImage =
          data.hero.residentialImage.url || data.hero.residentialImage;
      }

      // Commercial image
      if (
        data.hero.commercialImage &&
        typeof data.hero.commercialImage === "object"
      ) {
        data.hero.commercialImage =
          data.hero.commercialImage.url || data.hero.commercialImage;
      }
    }

    // About block images
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
   * collectFiles - Recursively collects all image and video files from the form data
   *
   * @param {Object} data - The data object to collect files from
   * @param {Array} filesToZip - Array to store collected files
   */
  const collectFiles = (data, filesToZip) => {
    // Add process videos from RichText if present
    if (data.richText && data.richText.steps) {
      data.richText.steps.forEach((step, index) => {
        if (step.videoFile) {
          const fileName = step.fileName || `process_step_${index + 1}.mp4`;
          filesToZip.push({
            file: step.videoFile,
            path: `assets/videos/our_process_videos/${fileName}`,
          });
        }
      });
    }

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
        if (item.beforeImage && item.beforeImage.file) {
          filesToZip.push({
            file: item.beforeImage.file,
            path: `assets/images/before_after/before_${index + 1}.${getFileExtension(
              item.beforeImage.file.name
            )}`,
          });
        }
        if (item.afterImage && item.afterImage.file) {
          filesToZip.push({
            file: item.afterImage.file,
            path: `assets/images/before_after/after_${index + 1}.${getFileExtension(
              item.afterImage.file.name
            )}`,
          });
        }
      });
    }

    // Add employee photos
    if (data.employees && data.employees.items) {
      data.employees.items.forEach((employee, index) => {
        if (employee.photo && employee.photo.file) {
          filesToZip.push({
            file: employee.photo.file,
            path: `assets/images/employees/employee_${index + 1}.${getFileExtension(
              employee.photo.file.name
            )}`,
          });
        }
      });
    }

    // Add services blocks images
    if (data.services) {
      ["commercial", "residential"].forEach((category) => {
        if (data.services[category]) {
          data.services[category].forEach((page) => {
            if (page.blocks) {
              page.blocks.forEach((block, blockIndex) => {
                if (block.config) {
                  Object.keys(block.config).forEach((key) => {
                    const value = block.config[key];

                    // Handle single image file
                    if (value && typeof value === "object" && value.file) {
                      filesToZip.push({
                        file: value.file,
                        path: `assets/images/services/${category}/${page.id}/block_${blockIndex + 1}_${key}.${getFileExtension(
                          value.file.name
                        )}`,
                      });
                    }

                    // Handle arrays that might contain image files
                    if (Array.isArray(value)) {
                      value.forEach((item, itemIndex) => {
                        if (item && typeof item === "object" && item.file) {
                          filesToZip.push({
                            file: item.file,
                            path: `assets/images/services/${category}/${page.id}/block_${blockIndex + 1}_${key}_${itemIndex + 1}.${getFileExtension(
                              item.file.name
                            )}`,
                          });
                        }

                        // Handle objects with image properties
                        if (item && typeof item === "object") {
                          Object.keys(item).forEach((itemKey) => {
                            if (
                              item[itemKey] &&
                              typeof item[itemKey] === "object" &&
                              item[itemKey].file
                            ) {
                              filesToZip.push({
                                file: item[itemKey].file,
                                path: `assets/images/services/${category}/${page.id}/block_${blockIndex + 1}_${key}_${itemIndex + 1}_${itemKey}.${getFileExtension(
                                  item[itemKey].file.name
                                )}`,
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
        }
      });
    }
  };

  /**
   * Helper function to get the file extension from a filename
   */
  const getFileExtension = (filename) => {
    return filename.split(".").pop().toLowerCase() || "png";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }

  // If editing a specific block, render a simplified interface
  if (blockName && title) {
    console.log(`Editing specific block: ${blockName}`, formData);
    return (
      <div className="min-h-screen bg-gray-100 text-black">
        <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
          <button
            onClick={handleSubmit}
            type="button"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            Download JSON
          </button>
        </div>
        <div>
          <MainPageForm
            formData={formData}
            setFormData={setFormData}
            singleBlockMode={blockName}
          />
        </div>
      </div>
    );
  }

  // Render the tab header
  const renderTabHeader = () => (
    <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md">
      <TabButton
        id="mainPage"
        label="Main Page"
        isActive={activeTab === "mainPage"}
        onClick={() => setActiveTab("mainPage")}
      />
      <TabButton
        id="services"
        label="Service Pages"
        isActive={activeTab === "services"}
        onClick={() => setActiveTab("services")}
      />
      <TabButton
        id="about"
        label="About Page"
        isActive={activeTab === "about"}
        onClick={() => setActiveTab("about")}
      />
    </div>
  );

  // Otherwise, render the full editor interface
  console.log("Rendering full editor with data:", formData);
  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
        <h1 className="text-xl font-medium">Content Editor</h1>
        <button
          onClick={handleSubmit}
          type="button"
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
        >
          Download ZIP
        </button>
      </div>

      {/* Tab Navigation */}
      {renderTabHeader()}

      {/* Tab Content - Only one is shown at a time */}
      <div className="tab-content">
        {activeTab === "mainPage" && (
          <MainPageForm formData={formData} setFormData={setFormData} />
        )}
        {activeTab === "services" && <ServiceEditPage />}
        {activeTab === "about" && (
          <div className="container mx-auto px-4 py-6 bg-gray-100">
            <div className="mb-4 bg-gray-800 text-white p-4 rounded">
              <h1 className="text-2xl font-bold">About Page</h1>
              <p className="text-gray-300 mt-1">Edit the about page content</p>
            </div>
            <div className="relative border border-gray-300 bg-white overflow-hidden">
              <AboutBlock
                readOnly={false}
                aboutData={formData.aboutPage}
                onConfigChange={handleAboutConfigChange}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OneForm.propTypes = {
  initialData: PropTypes.object,
  blockName: PropTypes.string,
  title: PropTypes.string,
};

export default OneForm;
