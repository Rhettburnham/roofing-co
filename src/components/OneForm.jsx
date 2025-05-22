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
import Navbar from "./Navbar"; // Import Navbar for preview

// Helper function to check if a URL is a local asset to be processed
function isProcessableAssetUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }
  
  // Exclude absolute URLs, data URLs, blob URLs
  if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('data:') || url.startsWith('blob:')) {
    return false;
  }
  
  // Exclude anchor links and document files
  if (url.startsWith('#') || url === 'about' || url === 'inspection' || url === 'shingleinstallation') {
    return false;
  }
  
  // Check if the URL points to a known media folder or a file with an extension
  const validPathCheck = (path) => {
    // Known media folders we want to include
    const validFolders = ['assets/', 'Commercial/', 'data/'];
    
    // Valid media file extensions
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.mp4', '.webm', '.pdf'];
    
    // Check if path starts with a valid folder
    const isInValidFolder = validFolders.some(folder => 
      path.includes(folder) || path.includes(folder.toLowerCase())
    );
    
    // Check if path has a valid file extension
    const hasValidExtension = validExtensions.some(ext => 
      path.toLowerCase().endsWith(ext)
    );
    
    return isInValidFolder || hasValidExtension;
  };
  
  // Clean up the URL (remove leading slash) for validating
  const cleanPath = url.startsWith('/') ? url.substring(1) : url;
  
  // Only process valid paths
  return validPathCheck(cleanPath);
}

// Recursive function to traverse data, collect assets, and return cleaned data for ZIP
function traverseAndModifyDataForZip(originalDataNode, assetsToCollect, pathContext, uploadBaseDir) {
  if (originalDataNode === null || originalDataNode === undefined) {
    return originalDataNode;
  }

  // Handle arrays by creating a new array with processed items
  if (Array.isArray(originalDataNode)) {
    return originalDataNode.map((item, index) =>
      traverseAndModifyDataForZip(item, assetsToCollect, `${pathContext}[${index}]`, uploadBaseDir)
    );
  }

  // Handle objects (including potential file upload objects)
  if (typeof originalDataNode === 'object' && !(originalDataNode instanceof File)) {
    // Check if it's our structure for a file upload (e.g., contains a File object)
    if (originalDataNode.file && originalDataNode.file instanceof File && typeof originalDataNode.name === 'string') {
      const file = originalDataNode.file;
      const fileName = originalDataNode.name || file.name || 'untitled_asset';
      const sanitizedPathContext = pathContext.replace(/[\[\].]/g, '_').replace(/[^a-zA-Z0-9_/-]/g, '').slice(0, 100);
      const pathInZip = `media/${uploadBaseDir}/${sanitizedPathContext}_${fileName}`;

      assetsToCollect.push({
        pathInZip,
        dataSource: file,
        type: 'file',
      });
      
      // Return a new, cleaned object for the JSON structure
      const cleanedFileObject = { ...originalDataNode };
      delete cleanedFileObject.file;
      cleanedFileObject.url = pathInZip;
      return cleanedFileObject;
    }
    
    // Handle objects with url property (from pasted URLs)
    else if (originalDataNode.url && typeof originalDataNode.url === 'string' && isProcessableAssetUrl(originalDataNode.url)) {
      let url = originalDataNode.url;
      let pathInZip = url;
      if (pathInZip.startsWith('/')) {
        pathInZip = pathInZip.substring(1);
      }
      
      // Add 'media/' prefix
      pathInZip = `media/${pathInZip}`;
      
      // Avoid duplicating asset collection
      if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({
          pathInZip,
          dataSource: url,
          type: 'url',
        });
      }
      
      // Return a cloned object with updated url
      return { ...originalDataNode, url: pathInZip };
    }

    // Otherwise, it's a generic object; traverse its properties and build a new object
    const newObj = {};
    for (const key in originalDataNode) {
      if (Object.prototype.hasOwnProperty.call(originalDataNode, key)) {
        newObj[key] = traverseAndModifyDataForZip(
          originalDataNode[key],
          assetsToCollect,
          `${pathContext}.${key}`,
          uploadBaseDir
        );
      }
    }
    return newObj;
  }

  // Handle string URLs that might be existing assets
  if (typeof originalDataNode === 'string' && isProcessableAssetUrl(originalDataNode)) {
    let pathInZip = originalDataNode;
    if (pathInZip.startsWith('/')) {
      pathInZip = pathInZip.substring(1);
    }
    
    // Add 'media/' prefix
    pathInZip = `media/${pathInZip}`;

    // Avoid duplicating asset collection
    if (!assetsToCollect.some(asset => asset.pathInZip === pathInZip && asset.type === 'url')) {
        assetsToCollect.push({
          pathInZip,
          dataSource: originalDataNode,
          type: 'url',
        });
    }
    return pathInZip;
  }

  // Return primitives and other types as is
  return originalDataNode;
}

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
        // If initialData is provided, use it directly (for single block editing like /edit/hero)
        if (initialData && blockName) {
          // Make sure initialData for single block also includes navbar if needed for preview/context
          const baseData = { ...initialData };
          if (!baseData.navbar && initialData.navbar) baseData.navbar = initialData.navbar;
          else if (!baseData.navbar) baseData.navbar = { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} };

          setFormData({ [blockName]: baseData[blockName] || baseData, navbar: baseData.navbar });
          setLoading(false);
          return;
        }
        if (initialData && !blockName) { // Case where OneForm is loaded with full data but not for a single block.
             setFormData(initialData);
             setLoading(false);
             return;
        }

        // Default: fetch the full combined_data.json for the main OneForm editor
        try {
          const combinedResponse = await fetch(
            "/data/raw_data/step_4/combined_data.json"
          );
          if (combinedResponse.ok) {
            const combinedData = await combinedResponse.json();
            console.log("Loaded combined data:", combinedData);
            setFormData(combinedData); // This will include navbar and mainPageBlocks
            setLoading(false);
            return;
          } else {
            console.error("Failed to load combined_data.json, status:", combinedResponse.status);
          }
        } catch (combinedError) {
          console.error("Error loading combined data:", combinedError);
          // Continue to fallback if combined data fetch fails
        }

        // Fallback: Create a default configuration (simplified, ensure navbar exists)
        console.warn("Falling back to default data structure for OneForm.");
        const defaultData = {
          navbar: { navLinks: [{name: "Home", href: "/"}], logo: { url: '/assets/images/logo.png', name: 'logo.png' }, whiteLogo: { url: '/assets/images/logo-white.png', name: 'logo-white.png'} },
          mainPageBlocks: [], // Default to empty blocks
          hero: { title: "Welcome" }, // Keep some defaults for single block editors if they rely on this path
          // ... (other default block structures if needed by single block editors)
        };
        setFormData(defaultData);
        console.log("Using default data:", defaultData);
        setLoading(false);

      } catch (error) {
        console.error("Error loading form data:", error);
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, [initialData, blockName]);

  const handleMainPageFormChange = (newMainPageFormData) => {
    setFormData(prev => ({
        ...prev, 
        ...newMainPageFormData 
    }));
};

  const handleAboutConfigChange = (newAboutConfig) => {
    console.log("About config changed:", newAboutConfig);
    setFormData((prev) => ({ ...prev, aboutPage: newAboutConfig }));
  };

  /**
   * handleSubmit - Generates and downloads a ZIP file with all edited content
   */
  const handleSubmit = async () => {
    try {
      if (!formData) {
        console.error("No form data to submit.");
        alert("No data available to download.");
        return;
      }
      console.log("Creating ZIP with initial data (a copy will be processed):", formData);

      const zip = new JSZip();
      const collectedAssets = [];

      // Process formData (for combined_data.json)
      const cleanedCombinedData = traverseAndModifyDataForZip(
        formData,
        collectedAssets,
        'formDataRoot',
        'user_uploads/combined_data'
      );
      zip.file("json/combined_data.json", JSON.stringify(cleanedCombinedData, null, 2));
      console.log("Cleaned combined_data for ZIP:", cleanedCombinedData);
      
      // Log what assets are being collected
      console.log("Assets collected from combined_data:", collectedAssets.map(a => a.pathInZip));

      // Fetch and process services.json
      if (!blockName) {
        try {
          // Direct fetch for services.json
          const servicesResponse = await fetch("/data/ignore/services.json");
          if (!servicesResponse.ok) {
            throw new Error(`Failed to fetch services.json: ${servicesResponse.status}`);
          }
          
          const servicesData = await servicesResponse.json();
          if (servicesData) {
            console.log("Raw services_data fetched");
            const cleanedServicesData = traverseAndModifyDataForZip(
              servicesData,
              collectedAssets,
              'servicesDataRoot',
              'user_uploads/services_data'
            );
            zip.file("json/services.json", JSON.stringify(cleanedServicesData, null, 2));
            console.log("Assets collected after services_data processing:", 
              collectedAssets.map(a => a.pathInZip).filter(p => 
                !p.includes('formDataRoot') // Only show newly added assets
              )
            );
          }
        } catch (serviceError) {
          console.error("Error processing services.json for ZIP:", serviceError);
          alert(`Error processing services.json: ${serviceError.message}. ZIP may be incomplete.`);
        }
      }
      
      // Filter out any assets that might have slipped through but should be excluded
      const filteredAssets = collectedAssets.filter(asset => {
        // Skip any asset that isn't in a folder structure
        if (asset.pathInZip.split('/').length <= 2) {
          console.log(`Excluding non-folder asset: ${asset.pathInZip}`);
          return false;
        }
        
        // Skip document files that might have passed the initial check
        const baseFileName = asset.pathInZip.split('/').pop();
        if (baseFileName === 'about' || baseFileName === 'inspection' || 
            baseFileName === 'shingleinstallation' || baseFileName.startsWith('#')) {
          console.log(`Excluding document file: ${asset.pathInZip}`);
          return false;
        }
        
        return true;
      });
      
      console.log(`Filtered out ${collectedAssets.length - filteredAssets.length} assets`);
      console.log("Final assets for ZIP:", filteredAssets.map(a => a.pathInZip));

      // Add all collected assets to the ZIP
      const assetProcessingPromises = filteredAssets.map(async (asset) => {
        try {
          if (asset.type === 'file' && asset.dataSource instanceof File) {
            zip.file(asset.pathInZip, asset.dataSource);
            console.log(`Added file ${asset.pathInZip} to ZIP`);
          } else if (asset.type === 'url' && typeof asset.dataSource === 'string') {
            if (asset.dataSource.startsWith('/') || !asset.dataSource.includes(':')) {
              try {
                const response = await fetch(asset.dataSource);
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                const blob = await response.blob();
                zip.file(asset.pathInZip, blob);
                console.log(`Fetched and added ${asset.pathInZip} to ZIP`);
              } catch (fetchError) {
                console.error(`Error fetching ${asset.dataSource}:`, fetchError);
                // Skip adding error files to keep the ZIP clean
              }
            } else {
              console.warn(`Skipping external URL: ${asset.dataSource}`);
            }
          }
        } catch (assetError) {
          console.error(`Error processing asset ${asset.pathInZip}:`, assetError);
        }
      });

      await Promise.all(assetProcessingPromises);

      const content = await zip.generateAsync({ type: "blob" });
      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}-${String(date.getMinutes()).padStart(2, "0")}`;
      const zipFileName = blockName
        ? `${blockName}_edit_${dateStr}_${timeStr}.zip`
        : `website_content_${dateStr}_${timeStr}.zip`;
      saveAs(content, zipFileName);
      console.log("ZIP file generation complete:", zipFileName);

    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("Error creating ZIP file. See console for details.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }
  
  if (!formData) { // Check if formData is null after loading attempt
    return (
      <div className="min-h-screen bg-gray-100 text-black flex items-center justify-center">
        <p>Failed to load form data. Please check console for errors or try refreshing.</p>
      </div>
    );
  }

  // If editing a specific block (e.g., /edit/hero), render MainPageForm in singleBlockMode
  if (blockName && title) {
    console.log(`OneForm: Editing specific block: ${blockName}`, formData);
    // Pass only the relevant part of formData for the specific block and the navbar config
    const singleBlockData = formData[blockName] || {};
    const navbarDataForSingleBlock = formData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

    return (
      <div className="min-h-screen bg-gray-100 text-black">
        <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-50 flex justify-between items-center">
          <h1 className="text-xl font-medium">{title}</h1>
          <button onClick={handleSubmit} type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
            Download JSON for {blockName}
          </button>
        </div>
        {/* For single block editing, we might not show the OneForm Navbar editor, just the block's form */}
        {/* Or, if `initialData` was meant to be the *entire* site structure, this changes */}
        {/* The current logic in useEffect for initialData aims to make `formData` hold the full structure or the specific block. */}
        <div className="p-4">
          <MainPageForm
            formData={{ [blockName]: singleBlockData, navbar: navbarDataForSingleBlock }} // Pass necessary data for the single block
            setFormData={setFormData} // This would update OneForm's main formData state
            singleBlockMode={blockName}
          />
        </div>
      </div>
    );
  }

  // Render the full OneForm editor interface
  console.log("Rendering OneForm full editor with data:", formData);
  const oneFormNavbarConfig = formData.navbar || { navLinks: [], logo: '', whiteLogo: '' };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col">
      {/* Top OneForm Navigation Bar - Always Sticky */}
      <div className="bg-gray-900 text-white p-3 shadow-md sticky top-0 z-[60] flex justify-between items-center">
        <h1 className="text-[5vh] font-serif">WebEdit</h1>
        <button onClick={handleSubmit} type="button" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm">
          Download ZIP
        </button>
      </div>
      
      {/* Tab Navigation and Content - below the sticky navbar editor */}
      <div className="flex-grow">
        <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md sticky top-[calc(3.5rem+env(safe-area-inset-top,0px)+Xpx)] z-[50]">
          {/* Xpx needs to be the height of the rendered Navbar preview section */}
          {/* This sticky positioning for tabs might be complex to get right with dynamic navbar height */}
          {/* For simplicity, let's make tabs not sticky for now, or assume fixed height for navbar */}
          <div className="bg-gray-800 px-4 flex border-b border-gray-700 shadow-md">
            <TabButton id="mainPage" label="Main Page Blocks" isActive={activeTab === "mainPage"} onClick={() => setActiveTab("mainPage")} />
            <TabButton id="services" label="Service Pages" isActive={activeTab === "services"} onClick={() => setActiveTab("services")} />
            <TabButton id="about" label="About Page Block" isActive={activeTab === "about"} onClick={() => setActiveTab("about")} />
          </div>
        </div>

        <div className="tab-content">
          {activeTab === "mainPage" && (
            // Pass formData.mainPageBlocks if that's how MainPageForm expects it,
            // or the whole formData if MainPageForm is meant to extract what it needs.
            // Assuming MainPageForm expects the full formData that includes .navbar, .mainPageBlocks etc.
            <MainPageForm 
                formData={formData} 
                setFormData={handleMainPageFormChange} // Use the new handler
            />
          )}
          {activeTab === "services" && <ServiceEditPage />} 
          {activeTab === "about" && (
            <div className="container mx-auto px-4 py-6 bg-gray-100">
              <div className="mb-4 bg-gray-800 text-white p-4 rounded">
                <h1 className="text-2xl font-bold">About Page Content</h1>
                <p className="text-gray-300 mt-1">Edit the about page block content</p>
              </div>
              <div className="relative border border-gray-300 bg-white overflow-hidden">
                <AboutBlock
                  readOnly={false}
                  aboutData={formData.aboutPage || formData.mainPageBlocks?.find(b => b.blockName === 'AboutBlock')?.config || {}}
                  onConfigChange={handleAboutConfigChange} // Use the new handler
                />
              </div>
            </div>
          )}
        </div>
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
