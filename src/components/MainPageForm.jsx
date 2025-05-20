import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import PropTypes from "prop-types";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import HeroBlock from "./MainPageBlocks/HeroBlock";
import BeforeAfterBlock from "./MainPageBlocks/BeforeAfterBlock";
import EmployeesBlock from "./MainPageBlocks/EmployeesBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import CombinedPageBlock from "./MainPageBlocks/CombinedPageBlock";
import ServiceSliderBlock from "./MainPageBlocks/ServiceSliderBlock";
import TestimonialBlock from "./MainPageBlocks/TestimonialBlock";
import Navbar from "./Navbar";
import IconSelectorModal from './common/IconSelectorModal';

// Lazy load components to avoid circular dependencies if any, and for consistency
const BasicMapBlockLazy = lazy(() => import("./MainPageBlocks/BasicMapBlock"));
const RichTextBlockLazy = lazy(() => import("./MainPageBlocks/RichTextBlock"));
const HeroBlockLazy = lazy(() => import("./MainPageBlocks/HeroBlock"));
const BeforeAfterBlockLazy = lazy(() => import("./MainPageBlocks/BeforeAfterBlock"));
const EmployeesBlockLazy = lazy(() => import("./MainPageBlocks/EmployeesBlock"));
const ButtonBlockLazy = lazy(() => import("./MainPageBlocks/ButtonBlock"));
const BookingBlockLazy = lazy(() => import("./MainPageBlocks/BookingBlock"));
const ServiceSliderBlockLazy = lazy(() => import("./MainPageBlocks/ServiceSliderBlock"));
const TestimonialBlockLazy = lazy(() => import("./MainPageBlocks/TestimonialBlock"));
const NavbarLazy = lazy(() => import("./Navbar")); // For Navbar preview

// Mapping block names to components for dynamic rendering
const blockComponentMap = {
  HeroBlock,
  RichTextBlock,
  ButtonBlock,
  BasicMapBlock,
  BookingBlock,
  ServiceSliderBlock,
  TestimonialBlock,
  BeforeAfterBlock,
  EmployeesBlock,
  // Add other main page blocks here if any
};

// Sliding Edit Panel component - Will NOT be used for RichTextBlock anymore
const SlidingEditPanel = ({ children, onClose }) => (
  <div className="w-full transition-all duration-300 mt-4">
    <div className="bg-white py-4 px-0 rounded-lg shadow-lg relative">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 z-10 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center focus:outline-none"
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
      <div>{children}</div>
    </div>
  </div>
);

SlidingEditPanel.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func.isRequired,
};

// Navbar Edit Form Component
const NavbarEditForm = React.forwardRef(({ 
  navbarConfig, 
  onConfigChange, 
  previewNavbarAsScrolled, 
  setPreviewNavbarAsScrolled,
  onOpenIconModal
}, ref) => {
  const [localNavConfig, setLocalNavConfig] = useState(() => {
    const initial = navbarConfig || {};
    return {
      navLinks: initial.navLinks || [{ name: "Home", href: "/" }],
      logo: initial.logo || { url: '/assets/images/hero/clipped.png', file: null, name: 'clipped.png' },
      whiteLogo: initial.whiteLogo || { url: '', file: null, name: '' },
      whiteLogoIcon: initial.whiteLogoIcon || null,
      unscrolledBackgroundColor: initial.unscrolledBackgroundColor || 'bg-transparent',
      scrolledBackgroundColor: initial.scrolledBackgroundColor || 'bg-banner',
      dropdownBackgroundColor: initial.dropdownBackgroundColor || 'bg-white',
      dropdownTextColor: initial.dropdownTextColor || 'text-black',
      useWhiteHamburger: initial.useWhiteHamburger || false,
    };
  });

  useEffect(() => {
    setLocalNavConfig(prevConfig => {
      const newBase = navbarConfig || {};
      return {
        ...prevConfig,
        navLinks: newBase.navLinks || prevConfig.navLinks || [],
        logo: newBase.logo || prevConfig.logo || { url: '/assets/images/hero/clipped.png', file: null, name: 'clipped.png' },
        whiteLogo: newBase.whiteLogo || prevConfig.whiteLogo || { url: '', file: null, name: '' },
        whiteLogoIcon: newBase.whiteLogoIcon || prevConfig.whiteLogoIcon || null,
        unscrolledBackgroundColor: newBase.unscrolledBackgroundColor || prevConfig.unscrolledBackgroundColor || 'bg-transparent',
        scrolledBackgroundColor: newBase.scrolledBackgroundColor || prevConfig.scrolledBackgroundColor || 'bg-banner',
        dropdownBackgroundColor: newBase.dropdownBackgroundColor || prevConfig.dropdownBackgroundColor || 'bg-white',
        dropdownTextColor: newBase.dropdownTextColor || prevConfig.dropdownTextColor || 'text-black',
        useWhiteHamburger: newBase.useWhiteHamburger !== undefined ? newBase.useWhiteHamburger : prevConfig.useWhiteHamburger || false,
      };
    });
  }, [navbarConfig]);

  React.useImperativeHandle(ref, () => ({
    commitChanges: () => {
      onConfigChange(localNavConfig);
      console.log("NavbarEditForm: Committed changes via ref", localNavConfig);
    }
  }));

  const handleInputChange = (field, value) => {
    setLocalNavConfig(prevConf => ({ ...prevConf, [field]: value }));
  };

  const handleImageInputChange = (field, type, value) => {
    setLocalNavConfig(prevConf => {
      const currentImageState = prevConf[field] || { url: '', file: null, name: '' };
      let newImageState = { ...currentImageState };

      if (type === 'file' && value instanceof File) {
        if (currentImageState.url && currentImageState.url.startsWith('blob:')) {
          URL.revokeObjectURL(currentImageState.url);
        }
        newImageState = { file: value, url: URL.createObjectURL(value), name: value.name };
      } else if (type === 'url') {
        if (currentImageState.url && currentImageState.url.startsWith('blob:')) {
          URL.revokeObjectURL(currentImageState.url);
        }
        newImageState = { file: null, url: value, name: value.split('/').pop() };
      }
      // If an image is set for whiteLogo, clear any selected whiteLogoIcon
      const updates = { [field]: newImageState };
      if (field === 'whiteLogo' && (newImageState.file || newImageState.url)) {
        updates.whiteLogoIcon = null;
      }
      return { ...prevConf, ...updates };
    });
  };
  
  const getDisplayUrl = (imageState) => {
    if (!imageState) return '';
    if (imageState.file && imageState.url && imageState.url.startsWith('blob:')) return imageState.url; // Prioritize blob URL for local file
    return imageState.url || ''; // Fallback to path
  };

  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = localNavConfig.navLinks.map((link, i) =>
      i === index ? { ...link, [field]: value } : link
    );
    handleInputChange('navLinks', updatedNavLinks);
  };

  const addNavLink = () => {
    handleInputChange('navLinks', [...(localNavConfig.navLinks || []), { name: 'New Link', href: '/' }]);
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (localNavConfig.navLinks || []).filter((_, i) => i !== index);
    handleInputChange('navLinks', updatedNavLinks);
  };

  // Simplified routes for the dropdown
  const predefinedRoutes = [
    { label: "Home Page", value: "/" },
    { label: "About Page", value: "/about" },
    { label: "Booking Anchor", value: "/#book" },
    { label: "Packages Anchor", value: "/#packages" },
    { label: "Services Anchor", value: "/#services" }, // Added from combined_data
    { label: "Contact Anchor", value: "/#contact" },   // Added from combined_data
    { label: "Legal Page", value: "/legal" },
    { label: "All Service Blocks Page", value: "/all-service-blocks" },
    { label: "Custom URL...", value: "CUSTOM" }
  ];
  
  if (!localNavConfig) return <p>Loading navbar configuration...</p>;

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded-md">
      <div className="flex space-x-2 mb-3 border-b pb-3">
        <p className="text-sm font-medium text-gray-700 self-center mr-2">Preview Mode:</p>
        <button 
          type="button" 
          onClick={() => setPreviewNavbarAsScrolled(false)}
          className={`px-3 py-1.5 text-xs rounded-md ${!previewNavbarAsScrolled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Unscrolled
        </button>
        <button 
          type="button" 
          onClick={() => setPreviewNavbarAsScrolled(true)}
          className={`px-3 py-1.5 text-xs rounded-md ${previewNavbarAsScrolled ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Scrolled
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="border p-3 rounded-md bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700">Logo:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageInputChange('logo', 'file', e.target.files?.[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
            <input type="text" placeholder="Or paste image URL" value={getDisplayUrl(localNavConfig.logo) === localNavConfig.logo?.file?.name ? '' : getDisplayUrl(localNavConfig.logo)} onChange={(e) => handleImageInputChange('logo', 'url', e.target.value)} className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
            {getDisplayUrl(localNavConfig.logo) && <img src={getDisplayUrl(localNavConfig.logo)} alt="Logo Preview" className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-100 rounded" />}
        </div>
        <div className="border p-3 rounded-md bg-white shadow-sm">
            <label className="block text-sm font-medium text-gray-700">White Logo (for dark unscrolled backgrounds):</label>
            <div className="flex items-center space-x-2 mt-1">
                <button 
                    type="button"
                    onClick={() => onOpenIconModal('whiteLogoIcon', localNavConfig.whiteLogoIcon)}
                    className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                    Select Icon
                </button>
                {!localNavConfig.whiteLogoIcon && <span className="text-sm text-gray-600">OR Upload Image:</span>}
            </div>

            {localNavConfig.whiteLogoIcon ? (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-700">
                        Selected Icon: <strong>{localNavConfig.whiteLogoIcon.pack} - {localNavConfig.whiteLogoIcon.name}</strong>
                        <button 
                            type="button" 
                            onClick={() => handleInputChange('whiteLogoIcon', null)} 
                            className="text-red-500 hover:text-red-700 text-xs ml-2 font-semibold"
                        >
                            (Clear Icon & Use Image Instead)
                        </button>
                    </p>
                     {/* Optional: Preview icon in form. Ensure renderDynamicIcon is available or adapt. */}
                    {/* <div className="w-10 h-10 mt-1 bg-gray-700 p-1 rounded flex items-center justify-center"> */}
                    {/*   {renderDynamicIcon(localNavConfig.whiteLogoIcon.pack, localNavConfig.whiteLogoIcon.name, null, { className: "w-full h-full text-white" })} */}
                    {/* </div> */}
                </div>
            ) : (
                <>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageInputChange('whiteLogo', 'file', e.target.files?.[0])} 
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"/>
                    <input 
                        type="text" 
                        placeholder="Or paste image URL" 
                        value={getDisplayUrl(localNavConfig.whiteLogo) === localNavConfig.whiteLogo?.file?.name ? '' : getDisplayUrl(localNavConfig.whiteLogo)} 
                        onChange={(e) => handleImageInputChange('whiteLogo', 'url', e.target.value)} 
                        className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                    {getDisplayUrl(localNavConfig.whiteLogo) && <img src={getDisplayUrl(localNavConfig.whiteLogo)} alt="White Logo Preview" className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-700 rounded" />}
                </>
            )}
        </div>
      </div>

      <div>
        <h3 className="text-md font-medium text-gray-900 mb-2">Navigation Links:</h3>
        {(localNavConfig.navLinks || []).map((link, index) => (
          <div key={index} className="p-2 border border-gray-200 rounded-md mb-2 bg-white shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="flex-grow">
                <label className="block text-xs font-medium text-gray-600">Display Name:</label>
                <input type="text" value={link.name} onChange={(e) => handleNavLinkChange(index, 'name', e.target.value)} className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
              </div>
              <div className="flex-grow">
                <label className="block text-xs font-medium text-gray-600">Target Route:</label>
                <select value={predefinedRoutes.find(r => r.value === link.href) ? link.href : 'CUSTOM'} onChange={(e) => {
                    const val = e.target.value;
                    handleNavLinkChange(index, 'href', val === 'CUSTOM' ? '' : val);
                }} className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm">
                    {predefinedRoutes.map(route => <option key={route.value} value={route.value}>{route.label}</option>)}
                </select>
                {link.href === 'CUSTOM' || !predefinedRoutes.find(r => r.value === link.href) && (
                     <input type="text" value={link.href === 'CUSTOM' ? '' : link.href} onChange={(e) => handleNavLinkChange(index, 'href', e.target.value)} placeholder="Enter custom URL (e.g., /#contact)" className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"/>
                )}
              </div>
              <button type="button" onClick={() => removeNavLink(index)} className="text-red-500 hover:text-red-700 text-xs font-semibold self-end pb-1">Remove</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={addNavLink} className="mt-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">Add Nav Link</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 pt-4 mt-3 border-t border-gray-200">
        {[
          { label: 'Unscrolled Background:', field: 'unscrolledBackgroundColor' },
          { label: 'Scrolled Background:', field: 'scrolledBackgroundColor' },
          { label: 'Dropdown Background:', field: 'dropdownBackgroundColor' }
        ].map(({label, field}) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color" 
                value={localNavConfig[field]?.startsWith('#') ? localNavConfig[field] : (localNavConfig[field]?.includes('transparent') ? '#ffffff' : '#000000')}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="h-9 w-10 p-0.5 border border-gray-300 rounded-md cursor-pointer"
              />
              <input 
                type="text" 
                value={localNavConfig[field] || ''} 
                onChange={(e) => handleInputChange(field, e.target.value)} 
                placeholder="Hex or Tailwind class" 
                className="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">Dropdown Text Color:</label>
          <input 
            type="text" 
            value={localNavConfig.dropdownTextColor || ''} 
            onChange={(e) => handleInputChange('dropdownTextColor', e.target.value)} 
            placeholder="e.g., text-black" 
            className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center mt-1">
            <input 
                type="checkbox" 
                checked={localNavConfig.useWhiteHamburger || false} 
                onChange={(e) => handleInputChange('useWhiteHamburger', e.target.checked)} 
                className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-gray-700">Use White Hamburger Icon</label>
        </div>
      </div>
    </div>
  );
});
NavbarEditForm.displayName = 'NavbarEditForm';

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({ formData, setFormData, singleBlockMode = null }) => {
  const [activeEditBlock, setActiveEditBlock] = useState(null);
  const [previewNavbarAsScrolled, setPreviewNavbarAsScrolled] = useState(false);
  const navbarEditFormRef = useRef();
  const [internalFormData, setInternalFormData] = useState(formData);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconModalTargetField, setIconModalTargetField] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);

  useEffect(() => {
    let needsUpdate = false;
    const updatedBlocks = (formData?.mainPageBlocks || []).map((block, index) => {
      if (!block.uniqueKey) {
        needsUpdate = true;
        return { ...block, uniqueKey: `${block.blockName}_${Date.now()}_${index}` };
      }
      return block;
    });
    setInternalFormData(prevInternal => {
        const newInternal = { ...prevInternal, ...formData };
        if (needsUpdate || (formData?.mainPageBlocks && JSON.stringify(newInternal.mainPageBlocks) !== JSON.stringify(updatedBlocks))) {
            newInternal.mainPageBlocks = updatedBlocks;
        }
        return newInternal;
    });
  }, [formData]);

  const handleBlockConfigChange = (blockUniqueKey, newConfigFromBlock) => {
    console.log(`MainPageForm: Block ${blockUniqueKey} is committing changes.`, newConfigFromBlock);
    setInternalFormData((prev) => {
      const newMainPageBlocks = (prev.mainPageBlocks || []).map(block =>
        block.uniqueKey === blockUniqueKey ? { ...block, config: newConfigFromBlock } : block
      );
      return { ...prev, mainPageBlocks: newMainPageBlocks }; 
    });
  };
  
  const handleNavbarConfigChange = (newNavbarConfig) => {
    console.log("MainPageForm: Navbar is committing changes.", newNavbarConfig);
    setInternalFormData((prev) => ({ ...prev, navbar: newNavbarConfig }));
  };

  const handleRichTextConfigChange = (newRichTextConfig) => {
    console.log("MainPageForm: RichText committing changes.", newRichTextConfig);
    setInternalFormData((prev) => {
      const updatedMainPageBlocks = (prev.mainPageBlocks || []).map(block =>
        block.blockName === 'RichTextBlock' 
          ? { ...block, config: newRichTextConfig }
          : block
      );
      let newInternalFormData = { ...prev, mainPageBlocks: updatedMainPageBlocks };
      const heroBlockIndex = (prev.mainPageBlocks || []).findIndex(b => b.blockName === 'HeroBlock');
      if (newRichTextConfig.hasOwnProperty('sharedBannerColor') && heroBlockIndex !== -1) {
        const heroConfig = prev.mainPageBlocks[heroBlockIndex].config;
        if (newRichTextConfig.sharedBannerColor !== heroConfig?.bannerColor) {
          updatedMainPageBlocks[heroBlockIndex] = {
            ...prev.mainPageBlocks[heroBlockIndex],
            config: { ...(heroConfig || {}), bannerColor: newRichTextConfig.sharedBannerColor }
          };
          newInternalFormData = { ...prev, mainPageBlocks: updatedMainPageBlocks };
        }
      }
      return newInternalFormData;
    });
  };

  const prevActiveEditBlockRef = useRef(activeEditBlock);
  useEffect(() => {
    if (prevActiveEditBlockRef.current !== null && activeEditBlock === null) {
      console.log("MainPageForm: Edit session ended. Propagating internal changes to OneForm.", internalFormData);
      setFormData(internalFormData); 
    }
    prevActiveEditBlockRef.current = activeEditBlock;
  }, [activeEditBlock, internalFormData, setFormData]);

  const PencilIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg> );
  const CheckIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> );

  const handleToggleEditState = (key) => {
    if (activeEditBlock === key) { // Is currently editing, about to close/save
      if (key === 'navbar' && navbarEditFormRef.current?.commitChanges) {
        navbarEditFormRef.current.commitChanges(); // Ensure NavbarEditForm calls its onConfigChange
      }
      // For blocks, their onConfigChange is triggered by readOnly prop change.
      // Setting activeEditBlock to null will trigger the save propagation effect.
      setActiveEditBlock(null); 
    } else { // Is not editing this key, about to open it (or switch from another)
      if (activeEditBlock && activeEditBlock !== 'navbar' && activeEditBlock !== key) {
        // If another block was open, its save would have been triggered by its readOnly prop changing.
        // The main useEffect watching activeEditBlock will handle propagation.
      } else if (activeEditBlock === 'navbar' && key !== 'navbar' && navbarEditFormRef.current?.commitChanges) {
        // Switching from navbar to a block, commit navbar changes.
        navbarEditFormRef.current.commitChanges();
      }
      setActiveEditBlock(key);
    }
  };

  const handleOpenIconModal = (fieldId, currentIcon) => {
    setIconModalTargetField(fieldId);
    setCurrentIconForModal(currentIcon);
    setIsIconModalOpen(true);
  };

  const handleIconSelection = (pack, iconName) => {
    if (iconModalTargetField === 'whiteLogoIcon') {
      setInternalFormData(prev => ({
        ...prev,
        navbar: {
          ...(prev.navbar || {}),
          whiteLogoIcon: { pack, name: iconName },
          whiteLogo: { url: '', file: null, name: '' }
        }
      }));
    }
    setIsIconModalOpen(false);
    setIconModalTargetField(null);
    setCurrentIconForModal(null);
  };

  if (singleBlockMode) {
    const blockConfig = internalFormData[singleBlockMode]; // Use internalFormData
    const Component = blockComponentMap[singleBlockMode];
    
    if (singleBlockMode === "navbar") {
      return (
        <div className="relative p-4 bg-gray-200">
          <h2 className="text-xl font-semibold mb-3">Navbar Editor</h2>
          <NavbarEditForm 
            ref={navbarEditFormRef} 
            navbarConfig={internalFormData.navbar} 
            onConfigChange={handleNavbarConfigChange} 
            previewNavbarAsScrolled={previewNavbarAsScrolled}
            setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled}
            onOpenIconModal={handleOpenIconModal}
          />
           {/* Add a save button for single navbar edit mode */}
           <button 
             onClick={() => navbarEditFormRef.current?.commitChanges()} 
             className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
           >Save Navbar Changes</button>
        </div>
      );
    }
    
    if (Component && blockConfig) {
        let props = {
            readOnly: false, 
            onConfigChange: (newConfig) => {
                 console.log(`Single block mode: ${singleBlockMode} committing changes.`);
                 setInternalFormData(prev => ({
                    ...prev, 
                    [singleBlockMode]: newConfig,
                    // If it's a block within mainPageBlocks structure, update there too for consistency
                    mainPageBlocks: (prev.mainPageBlocks || []).map(b => b.blockName === singleBlockMode ? {...b, config: newConfig} : b)
                 }));
                 setFormData(prev => ({...prev, [singleBlockMode]: newConfig, mainPageBlocks: (prev.mainPageBlocks || []).map(b => b.blockName === singleBlockMode ? {...b, config: newConfig} : b)})); // Also update OneForm directly for single block
            }
        };

        // Assign correct prop name for config data
        if (blockComponentMap[singleBlockMode]) {
            const propName = Object.keys(propsForBlocks[singleBlockMode] || {config: null})[0] || 'config';
            props[propName] = blockConfig;
            if(singleBlockMode === 'RichTextBlock') props.showControls = true;
        } else {
            props.config = blockConfig; // Default
        }
        
      return (
        <div className="relative">
          <Suspense fallback={<div>Loading {singleBlockMode}...</div>}>
            <Component {...props} />
          </Suspense>
        </div>
      );
    } else {
      return <div>Unknown block type or missing config for single block: {singleBlockMode}</div>;
    }
  }

  if (!internalFormData || (!internalFormData.mainPageBlocks && !internalFormData.navbar) ) {
    return <div className="p-4 text-center">Loading form data...</div>;
  }

  return (
    <div className="bg-gray-100">
      {internalFormData.navbar && !singleBlockMode && (
        <div className="bg-white shadow-md border rounded-lg">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="text-xl font-semibold text-gray-700">Navbar </h2>
            <button 
              type="button" 
              onClick={() => handleToggleEditState('navbar')} 
              className={`${activeEditBlock === "navbar" ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}
            >
              {activeEditBlock === "navbar" ? CheckIcon : PencilIcon}
            </button>
          </div>
          <div className={`navbar-preview-container`}>
            <Suspense fallback={<div>Loading Navbar Preview...</div>}>
              <Navbar 
                config={internalFormData.navbar} 
                forceScrolledState={previewNavbarAsScrolled}
                isPreview={true} 
                isEditingPreview={activeEditBlock === 'navbar'}
                onTitleChange={(newTitle) => {
                  setInternalFormData(prev => ({ 
                    ...prev, 
                    navbar: { ...(prev.navbar || {}), title: newTitle }
                  }));
                }}
                onSubtitleChange={(newSubtitle) => {
                  setInternalFormData(prev => ({ 
                    ...prev, 
                    navbar: { ...(prev.navbar || {}), subtitle: newSubtitle }
                  }));
                }}
              />
            </Suspense>
          </div>
          {activeEditBlock === "navbar" && (
            <div className="w-full border-t">
              <div className="bg-white py-4 px-0">
                <NavbarEditForm
                  ref={navbarEditFormRef}
                  navbarConfig={internalFormData.navbar}
                  onConfigChange={handleNavbarConfigChange}
                  previewNavbarAsScrolled={previewNavbarAsScrolled}
                  setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled}
                  onOpenIconModal={handleOpenIconModal}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {(internalFormData.mainPageBlocks || []).map((block, index) => {
        const blockKey = block.uniqueKey || `${block.blockName}_${Date.now()}_${index}`;
        const ComponentToRender = blockComponentMap[block.blockName];
        const isEditingThisBlock = activeEditBlock === blockKey;

        if (!ComponentToRender) return <div key={blockKey} className="p-4 text-red-500">Unknown block type: {block.blockName}</div>;

        let componentProps = { 
            readOnly: !isEditingThisBlock,
        };

        const blockSpecificPropName = {
            HeroBlock: 'heroconfig',
            RichTextBlock: 'richTextData',
            ButtonBlock: 'buttonconfig',
            BasicMapBlock: 'mapData',
            BookingBlock: 'bookingData',
            ServiceSliderBlock: 'config', // or specific like serviceSliderData
            TestimonialBlock: 'config', // or specific like testimonialData
            BeforeAfterBlock: 'beforeAfterData',
            EmployeesBlock: 'employeesData',
            AboutBlock: 'aboutData',
            CombinedPageBlock: 'config' // or specific like combinedPageData
        }[block.blockName] || 'config';
        componentProps[blockSpecificPropName] = block.config;

        if (block.blockName === 'RichTextBlock') {
            componentProps.showControls = isEditingThisBlock; 
            componentProps.bannerColor = internalFormData.mainPageBlocks?.find(b => b.blockName === 'HeroBlock')?.config?.bannerColor || internalFormData.navbar?.bannerColor;
            componentProps.onConfigChange = handleRichTextConfigChange; // RichText still uses its specific handler due to complexity
        } else {
            componentProps.onConfigChange = (newConf) => handleBlockConfigChange(blockKey, newConf);
        }
        
        let currentIcon = isEditingThisBlock ? CheckIcon : PencilIcon;

        return (
          <div key={blockKey} className="relative bg-white overflow-hidden border">
            <div className="absolute top-4 right-4 z-40">
              <button type="button" onClick={() => handleToggleEditState(blockKey)} className={`${isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}>
                {currentIcon}
              </button>
            </div>
            
            <Suspense fallback={<div>Loading {block.blockName}...</div>}>
              <ComponentToRender key={blockKey} {...componentProps} />
            </Suspense>
            
            {isEditingThisBlock && block.blockName !== 'RichTextBlock' && ComponentToRender.EditorPanel && (
              <SlidingEditPanel onClose={() => handleToggleEditState(blockKey)}> 
                <ComponentToRender.EditorPanel 
                    localData={block.config}
                    onPanelChange={(updatedFields) => {
                        setInternalFormData(prev => ({
                            ...prev,
                            mainPageBlocks: (prev.mainPageBlocks || []).map(b => 
                                b.uniqueKey === blockKey ? { ...b, config: { ...b.config, ...updatedFields } } : b
                            )
                        }));
                    }} 
                />
              </SlidingEditPanel>
            )}
          </div>
        );
      })}
      {/* Render IconSelectorModal if open */}
      {isIconModalOpen && (
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onIconSelect={handleIconSelection}
          currentIconPack={currentIconForModal?.pack || 'lucide'}
          currentIconName={currentIconForModal?.name}
        />
      )}
    </div>
  );
};

MainPageForm.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  singleBlockMode: PropTypes.string,
};

// Make sure propsForBlocks is defined if used in singleBlockMode for prop name mapping
const propsForBlocks = {
    HeroBlock: { heroconfig: null },
    RichTextBlock: { richTextData: null },
    ButtonBlock: { buttonconfig: null },
    BasicMapBlock: { mapData: null },
    BookingBlock: { bookingData: null },
    ServiceSliderBlock: { config: null },
    TestimonialBlock: { config: null },
    BeforeAfterBlock: { beforeAfterData: null },
    EmployeesBlock: { employeesData: null },
    AboutBlock: { aboutData: null },
    CombinedPageBlock: { config: null }
};

export default MainPageForm;
