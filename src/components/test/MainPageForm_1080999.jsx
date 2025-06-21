import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import TopStickyEditPanel from "./TopStickyEditPanel";
import { cloneConfigStripFiles } from '../utils/blockUtils';

// Lazy load components to avoid circular dependencies if any, and for consistency
const BasicMapBlockLazy = lazy(() => import("./MainPageBlocks/BasicMapBlock"));
const RichTextBlockLazy = lazy(() => import("./MainPageBlocks/RichTextBlock"));
const HeroBlockLazy = lazy(() => import("./MainPageBlocks/HeroBlock"));
const BeforeAfterBlockLazy = lazy(
  () => import("./MainPageBlocks/BeforeAfterBlock")
);
const EmployeesBlockLazy = lazy(
  () => import("./MainPageBlocks/EmployeesBlock")
);
const ButtonBlockLazy = lazy(() => import("./MainPageBlocks/ButtonBlock"));
const BookingBlockLazy = lazy(() => import("./MainPageBlocks/BookingBlock"));
const ServiceSliderBlockLazy = lazy(
  () => import("./MainPageBlocks/ServiceSliderBlock")
);
const TestimonialBlockLazy = lazy(
  () => import("./MainPageBlocks/TestimonialBlock")
);
const NavbarLazy = lazy(() => import("./Navbar")); // For Navbar preview
import IconSelectorModal from "./common/IconSelectorModal";
import ThemeColorPicker from './common/ThemeColorPicker';
import PanelImagesController from './common/PanelImagesController';

// Icons for edit buttons
const PencilIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
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
    className="w-4 h-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const UndoIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);


// Mapping block names to components for dynamic rendering
const blockComponentMap = {
  HeroBlock: HeroBlockLazy,
  ButtonBlock: ButtonBlockLazy,
  RichTextBlock: RichTextBlockLazy,
  EmployeesBlock: EmployeesBlockLazy,
  BasicMapBlock: BasicMapBlockLazy,
  ServiceSliderBlock: ServiceSliderBlockLazy,
  TestimonialBlock: TestimonialBlockLazy,
  BeforeAfterBlock: BeforeAfterBlockLazy,
  BookingBlock: BookingBlockLazy,
};

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({
  formData,
  setFormData,
  navbarData: navbarDataProp,
  onNavbarChange,
  singleBlockMode = null,
  themeColors,
  sitePalette,
  initialFormData = null,
}) => {
  const [internalFormData, setInternalFormData] = useState(formData);
  const [navbarConfig, setNavbarConfig] = useState(null);
  const [initialNavbarConfig, setInitialNavbarConfig] = useState(null);

  const [activeEditBlock, setActiveEditBlock] = useState(null); // 'navbar' or block key
  const [previewNavbarAsScrolled, setPreviewNavbarAsScrolled] = useState(false);
  const panelRef = useRef(null);
  const blockRefs = useRef({});
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconModalTargetField, setIconModalTargetField] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);
  
  const handleOpenIconModal = useCallback((fieldId, currentIcon, source = 'block', blockKeyForCardIcon = null, cardIndexForIcon = null) => {
    setIconModalTargetField({ id: fieldId, source, blockKey: blockKeyForCardIcon, cardIndex: cardIndexForIcon });
    setCurrentIconForModal(currentIcon);
    setIsIconModalOpen(true);
  }, [setIconModalTargetField, setCurrentIconForModal, setIsIconModalOpen]);

  // When a block's config changes, update our internal state, then bubble up to OneForm
  const handleBlockConfigChange = (blockKey, newConfig) => {
    setInternalFormData((prevData) => {
      const newBlocks = (prevData.mainPageBlocks || []).map((b) => {
        if (b.uniqueKey === blockKey) {
          // If the block is a HeroBlock, we need to pass the icon change handler
          if (b.blockName === "HeroBlock") {
            newConfig.onOpenIconModal = (fieldType) => handleOpenIconModal(fieldType, { pack: newConfig[fieldType]?.iconPack, name: newConfig[fieldType]?.icon }, 'hero');
          }
          return { ...b, config: newConfig };
        }
        return b;
      });

      const updatedData = { ...prevData, mainPageBlocks: newBlocks };
      setFormData(updatedData); // Bubble up
      return updatedData;
    });
  };

  const handleIconSelection = useCallback((pack, iconName) => {
    if (iconModalTargetField) {
      const { id, source, blockKey, cardIndex } = iconModalTargetField;
  
      if (source === 'hero') {
        const heroBlock = internalFormData.mainPageBlocks.find(b => b.blockName === 'HeroBlock');
        if (heroBlock) {
          const newConfig = { ...heroBlock.config };
          const serviceType = id; // 'residential' or 'commercial'
          newConfig[serviceType] = { ...newConfig[serviceType], icon: iconName, iconPack: pack };
          handleBlockConfigChange(heroBlock.uniqueKey, newConfig);
        }
      } else if (source === 'block' && blockKey && cardIndex !== null && id.startsWith('card-')) {
        // Find the block in the form data
        const currentBlock = internalFormData.mainPageBlocks.find(b => b.uniqueKey === blockKey);
        if (!currentBlock) return;
  
        // Create a new config object to avoid direct mutation
        let newConfig = { ...currentBlock.config };
        
        // Update the icon for the specific card
        const newCards = (newConfig.cards || []).map((card, idx) => {
          if (idx === cardIndex) {
            return { ...card, icon: iconName, iconPack: pack };
          }
          return card;
        });
        newConfig.cards = newCards;
  
        // Propagate the change up
        handleBlockConfigChange(blockKey, newConfig);
      }
    }
    setIsIconModalOpen(false);
    setIconModalTargetField(null);
    setCurrentIconForModal(null);
  }, [iconModalTargetField, internalFormData, handleBlockConfigChange]);
  
  // Undo changes for a specific block
  const handleUndoBlock = (blockKey) => {
    const originalBlock = initialFormData.mainPageBlocks.find(b => b.uniqueKey === blockKey);
    if (originalBlock) {
      handleBlockConfigChange(blockKey, originalBlock.config);
      // Close the edit panel on undo
      setActiveEditBlock(null);
    }
  };
  
  // Save changes (in this flow, "saving" means accepting the current state before closing the editor)
  const handleSaveBlock = (blockKey, newConfig) => {
    // The config is already up-to-date via handleBlockConfigChange.
    // This function can be used for any final actions before closing the editor.
    // For now, it just logs and closes the panel.
    console.log(`Block ${blockKey} saved with new config.`, newConfig);
    setActiveEditBlock(null);
  };
  
  // Load navbar configuration from nav.json or props
  useEffect(() => {
    const loadNavbarConfig = async () => {
      if (navbarDataProp) {
        setNavbarConfig(navbarDataProp);
        if (!initialNavbarConfig) {
          setInitialNavbarConfig(navbarDataProp);
        }
      } else {
        // Fallback to fetch if prop not provided (maintains standalone usability)
        try {
          const response = await fetch("/personal/old/jsons/nav.json");
          if (response.ok) {
            const data = await response.json();
            setNavbarConfig(data);
            if (!initialNavbarConfig) {
              setInitialNavbarConfig(data);
            }
          }
        } catch (error) {
          console.error("Failed to fetch navbar config:", error);
        }
      }
    };
    loadNavbarConfig();
  }, [navbarDataProp, initialNavbarConfig]);

  // Update navbar state and propagate changes up
  const handleNavbarConfigChange = useCallback((changedFields) => {
    setNavbarConfig(prevConfig => {
      const newConfig = { ...prevConfig, ...changedFields };
      if (onNavbarChange && typeof onNavbarChange === 'function') {
        onNavbarChange(newConfig);
      }
      return newConfig;
    });
  }, [onNavbarChange]);

  // When parent formData changes, update internal state
  useEffect(() => {
    setInternalFormData(formData);
  }, [formData]);

  // Function to toggle edit state for a block
  const handleToggleEditState = (blockIdentifier) => {
    setActiveEditBlock((prev) => {
      if (prev === blockIdentifier) {
        // If clicking the same block's button, close the panel
        return null;
      }

      // If switching to a new block, open panel for that block
      // and scroll to it
      setTimeout(() => {
        const blockElement = blockRefs.current[blockIdentifier]?.current;
        if (blockElement) {
          const elementTop = blockElement.getBoundingClientRect().top + window.scrollY;
          const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 0;
          const offset = 20; // Some spacing
          window.scrollTo({
            top: elementTop - panelHeight - offset,
            behavior: 'smooth',
          });
        }
      }, 100);
      
      return blockIdentifier;
    });
  };

  // Memoized function to get the configuration for the active block panel
  const getActiveBlockDataForPanel = useMemo(() => {
    if (!activeEditBlock) return null;

    if (activeEditBlock === 'navbar') {
      // Return data needed for the Navbar's edit panel
      return {
        blockName: "Navbar",
        config: navbarConfig,
        onPanelChange: handleNavbarConfigChange,
        tabsConfig: { // Define tabs for Navbar
          general: (props) => <NavbarGeneralControls {...props} onPreviewStateChange={setPreviewNavbarAsScrolled} previewNavbarAsScrolled={previewNavbarAsScrolled} />,
          images: (props) => <NavbarImagesControls {...props} />,
          colors: (props) => <NavbarColorControls {...props} themeColors={themeColors} />,
          styling: (props) => <NavbarStylingControls {...props} setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled} previewNavbarAsScrolled={previewNavbarAsScrolled}/>
        }
      };
    }

    // Find the block in the form data
    const block = internalFormData.mainPageBlocks?.find(
      (b) => b.uniqueKey === activeEditBlock
    );

    if (!block) return null;

    // Use a mapping to get the correct tabs config for the block
    const blockTabsMap = {
      HeroBlock: {
        general: (props) => <HeroGeneralControls {...props} />,
        colors: (props) => <HeroColorControls {...props} />,
        fonts: (props) => <HeroFontsControls {...props} />,
      },
      RichTextBlock: {
        general: (props) => <RichTextGeneralControls {...props} />,
        colors: (props) => <RichTextColorControls {...props} />,
        fonts: (props) => <RichTextFontsControls {...props} />,
      },
      BeforeAfterBlock: {
        images: (props) => <BeforeAfterImagesControls {...props} />,
        colors: (props) => <BeforeAfterColorControls {...props} />,
        styling: (props) => <BeforeAfterStylingControls {...props} />,
        fonts: (props) => <BeforeAfterFontsControls {...props} />,
      },
      ButtonBlock: {
        images: (props) => <ButtonImagesControls {...props} />,
        styling: (props) => <ButtonStylingControls {...props} />,
        fonts: (props) => <ButtonFontsControls {...props} />,
      },
      BookingBlock: {
        general: (props) => <BookingGeneralControls {...props} />,
        colors: (props) => <BookingColorControls {...props} />,
        fonts: (props) => <BookingFontsControls {...props} />,
      },
       ServiceSliderBlock: {
        general: (props) => <ServiceSliderGeneralControls {...props} />,
        colors: (props) => <ServiceSliderColorControls {...props} />,
      },
      EmployeesBlock: {
        general: (props) => <EmployeesGeneralControls {...props} />,
        images: (props) => <EmployeesImagesControls {...props} />,
        colors: (props) => <EmployeesColorControls {...props} />,
      },
      TestimonialBlock: {
        general: (props) => <TestimonialGeneralControls {...props} />,
        colors: (props) => <TestimonialColorControls {...props} />,
        styling: (props) => <TestimonialStylingControls {...props} />,
      },
      // ... other blocks
    };
    
    // Add onOpenIconModal to the HeroBlock config here
    let finalConfig = { ...block.config };
    if (block.blockName === "HeroBlock") {
        finalConfig.onOpenIconModal = (fieldType) => handleOpenIconModal(fieldType, { pack: finalConfig[fieldType]?.iconPack, name: finalConfig[fieldType]?.icon }, 'hero');
    } else if (block.blockName === "RichTextBlock") {
        finalConfig.onOpenIconModalForCard = (cardIndex) => {
            const card = finalConfig.cards[cardIndex];
            handleOpenIconModal(`card-${cardIndex}`, { pack: card.iconPack, name: card.icon }, 'block', block.uniqueKey, cardIndex);
        };
    }

    return {
      blockName: block.blockName,
      config: finalConfig,
      onPanelChange: (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig),
      tabsConfig: blockTabsMap[block.blockName] || { general: (props) => <div>No controls defined.</div> },
    };
  }, [activeEditBlock, internalFormData, navbarConfig, handleNavbarConfigChange, handleBlockConfigChange, themeColors, previewNavbarAsScrolled]);

  const getLastSavedConfig = (blockKey) => {
    if (!initialFormData || !initialFormData.mainPageBlocks) return null;
    const block = initialFormData.mainPageBlocks.find(b => b.uniqueKey === blockKey);
    return block ? block.config : null;
  };
  
  if (singleBlockMode) {
    const singleBlock = (internalFormData.mainPageBlocks || []).find(
      (b) => b.blockName === singleBlockMode
    );
    if (!singleBlock) {
      return <div>Block '{singleBlockMode}' not found.</div>;
    }

    const ComponentToRender = blockComponentMap[singleBlock.blockName];

    // Get the correct prop name for the block's config
    const blockSpecificPropName =
      {
        HeroBlock: "heroconfig",
        RichTextBlock: "richTextData",
        ButtonBlock: "buttonconfig",
        BasicMapBlock: "mapData",
        BookingBlock: "bookingData",
        ServiceSliderBlock: "config",
        TestimonialBlock: "config",
        BeforeAfterBlock: "beforeAfterData",
        EmployeesBlock: "employeesData",
        AboutBlock: "aboutData",
        CombinedPageBlock: "config",
      }[singleBlock.blockName] || "config";

    return (
      <div className="p-4">
        <TopStickyEditPanel
          isOpen={!!activeEditBlock}
          onClose={() => handleToggleEditState(singleBlock.uniqueKey)}
          activeBlockData={getActiveBlockDataForPanel}
          onUndo={() => handleUndoBlock(singleBlock.uniqueKey)}
          onConfirm={() => handleSaveBlock(singleBlock.uniqueKey, singleBlock.config)}
        />
        <div ref={(el) => (blockRefs.current[singleBlock.uniqueKey] = { current: el })} className="relative">
           <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button
              type="button"
              onClick={() => handleToggleEditState(singleBlock.uniqueKey)}
              className={`${activeEditBlock === singleBlock.uniqueKey ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white rounded-full p-2 shadow-lg transition-colors`}
            >
              {activeEditBlock === singleBlock.uniqueKey ? CheckIcon : PencilIcon}
            </button>
          </div>
          <ComponentToRender
            {...{
              [blockSpecificPropName]: singleBlock.config,
              readOnly: activeEditBlock !== singleBlock.uniqueKey,
              onConfigChange: (newConfig) => handleBlockConfigChange(singleBlock.uniqueKey, newConfig),
              themeColors,
              sitePalette,
            }}
            onUndoBlock={() => handleUndoBlock(singleBlock.uniqueKey)}
            onSaveBlock={(newConfig) => handleSaveBlock(singleBlock.uniqueKey, newConfig)}
          />
        </div>
      </div>
    );
  }

  const currentInternalData = internalFormData || {};
  const currentNavbarData = currentInternalData.navbar || {};
  const currentMainPageBlocks = currentInternalData.mainPageBlocks || [];

  if (Object.keys(currentInternalData).length === 0 && !singleBlockMode) {
    return (
      <div className="p-4 text-center">Loading form data... (Main Form)</div>
    );
  }

  return (
    <div className={``}>
      {activeEditBlock && getActiveBlockDataForPanel && (
        <TopStickyEditPanel
          ref={panelRef}
          isOpen={!!activeEditBlock}
          onClose={() => handleToggleEditState(activeEditBlock)}
          activeBlockData={getActiveBlockDataForPanel}
        />
      )}
      <div
        ref={(el) => (blockRefs.current['navbar'] = { current: el })}
        className="relative bg-white border"
      >
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          {activeEditBlock === 'navbar' && (
            <button
              type="button"
              onClick={() => {
                const initial = cloneConfigStripFiles(initialNavbarConfig);
                setNavbarConfig(initial);
                if (onNavbarChange) onNavbarChange(initial);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition-colors"
              title="Undo changes"
            >
              {UndoIcon}
            </button>
          )}
          <button
            type="button"
            onClick={() => handleToggleEditState('navbar')}
            className={`${activeEditBlock === 'navbar' ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white rounded-full p-2 shadow-lg transition-colors`}
          >
            {activeEditBlock === 'navbar' ? CheckIcon : PencilIcon}
          </button>
        </div>
        <div id="block-content-navbar" className="transition-all duration-300">
          <Suspense fallback={<div>Loading Navbar...</div>}>
            <NavbarLazy
              config={navbarConfig}
              isPreview={true}
              isEditingPreview={activeEditBlock === 'navbar'}
              onTitleChange={(title) => handleNavbarConfigChange({ title })}
              onSubtitleChange={(subtitle) => handleNavbarConfigChange({ subtitle })}
              forceScrolledState={previewNavbarAsScrolled}
            />
          </Suspense>
        </div>
      </div>
      {currentMainPageBlocks.map((block, index) => {
        const blockKey =
          block.uniqueKey || `${block.blockName}_fallbackKey_${Math.random()}`;
        const ComponentToRender = blockComponentMap[block.blockName];
        const isEditingThisBlock = activeEditBlock === blockKey;

        if (!ComponentToRender)
          return (
            <div key={blockKey} className="p-4 text-red-500">
              Unknown block type: {block.blockName}
            </div>
          );

        const blockSpecificPropName =
          {
            HeroBlock: "heroconfig",
            RichTextBlock: "richTextData",
            ButtonBlock: "buttonconfig",
            BasicMapBlock: "mapData",
            BookingBlock: "bookingData",
            ServiceSliderBlock: "config",
            TestimonialBlock: "config",
            BeforeAfterBlock: "beforeAfterData",
            EmployeesBlock: "employeesData",
            AboutBlock: "aboutData",
            CombinedPageBlock: "config",
          }[block.blockName] || "config";

        let componentProps = {
          readOnly: !isEditingThisBlock,
          [blockSpecificPropName]: block.config || {},
          themeColors: themeColors,
          sitePalette: sitePalette,
          lastSavedConfig: getLastSavedConfig(blockKey),
          onUndoBlock: () => handleUndoBlock(blockKey),
          onSaveBlock: (newConfig) => handleSaveBlock(blockKey, newConfig),
        };

        if (block.blockName === 'HeroBlock') {
          console.log(`[MainPageForm] Rendering HeroBlock (${blockKey}). READONLY: ${!isEditingThisBlock}. CONFIG:`, block.config);
        }
        
        if (block.blockName === "HeroBlock") {
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        } else if (block.blockName === "RichTextBlock") {
          componentProps.showControls = isEditingThisBlock;
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        } else {
          componentProps.onConfigChange = (newConf) =>
            handleBlockConfigChange(blockKey, newConf);
        }

        return (
          <div
            key={blockKey}
            ref={(el) => (blockRefs.current[blockKey] = { current: el })}
            className="relative bg-white border"
          >
            <div className="absolute top-4 right-4 z-[60] flex gap-2">
              {isEditingThisBlock && (
                <button
                  type="button"
                  onClick={() => handleUndoBlock(blockKey)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  title="Undo changes"
                >
                  {UndoIcon}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleToggleEditState(blockKey)}
                className={`${isEditingThisBlock ? "bg-green-500 hover:bg-green-600" : "bg-gray-700 hover:bg-gray-600"} text-white rounded-full p-2 shadow-lg transition-colors`}
              >
                {isEditingThisBlock ? CheckIcon : PencilIcon}
              </button>
            </div>
            <div id={`block-content-${blockKey}`} className="transition-all duration-300">
              <Suspense fallback={<div>Loading {block.blockName}...</div>}>
                <ComponentToRender {...componentProps} />
              </Suspense>
            </div>
          </div>
        );
      })}
      {isIconModalOpen && (
        <IconSelectorModal
          isOpen={isIconModalOpen}
          onClose={() => setIsIconModalOpen(false)}
          onIconSelect={handleIconSelection}
          currentIconPack={currentIconForModal?.pack || "lucide"}
          currentIconName={currentIconForModal?.name}
        />
      )}
    </div>
  );
};

MainPageForm.propTypes = {
  formData: PropTypes.object,
  setFormData: PropTypes.func.isRequired,
  navbarData: PropTypes.object,
  onNavbarChange: PropTypes.func,
  singleBlockMode: PropTypes.string,
  themeColors: PropTypes.object,
  sitePalette: PropTypes.array,
  initialFormData: PropTypes.object,
};

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
  CombinedPageBlock: { config: null },
};

export default MainPageForm;

/* ==============================================
   NAVBAR TAB CONTROL COMPONENTS
   ----------------------------------------------
   Following the standard pattern from BeforeAfterBlock
=============================================== */

// Navbar General Controls - Navigation Links and Basic Text
const NavbarGeneralControls = ({
  currentData,
  onControlsChange,
  onPreviewStateChange,
  previewNavbarAsScrolled,
}) => {
  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = [...(currentData.navLinks || [])];
    updatedNavLinks[index] = { ...updatedNavLinks[index], [field]: value };
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  const addNavLink = () => {
    const navLinks = currentData.navLinks || [];
    onControlsChange({
      ...currentData,
      navLinks: [...navLinks, { name: "New Link", href: "/" }],
    });
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (currentData.navLinks || []).filter(
      (_, i) => i !== index
    );
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  const handleTextChange = (field, value) => {
    onControlsChange({ ...currentData, [field]: value });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        {/* Preview Controls */}
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <span className="text-xs text-gray-600">Preview:</span>
          <button
            onClick={() => onPreviewStateChange(false)}
            className={`px-2 py-1 text-xs rounded ${
              !previewNavbarAsScrolled
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unscrolled
          </button>
          <button
            onClick={() => onPreviewStateChange(true)}
            className={`px-2 py-1 text-xs rounded ${
              previewNavbarAsScrolled
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Scrolled
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title:
          </label>
          <input
            type="text"
            value={currentData.title || ""}
            onChange={(e) => handleTextChange("title", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subtitle:
          </label>
          <input
            type="text"
            value={currentData.subtitle || ""}
            onChange={(e) => handleTextChange("subtitle", e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter subtitle"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Navigation Links:
            </label>
            <button
              onClick={addNavLink}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Link
            </button>
          </div>
          <div className="space-y-2">
            {(currentData.navLinks || []).map((link, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={link.name || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "name", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link name"
                />
                <input
                  type="text"
                  value={link.href || ""}
                  onChange={(e) =>
                    handleNavLinkChange(index, "href", e.target.value)
                  }
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Link URL"
                />
                <button
                  onClick={() => removeNavLink(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Navbar Images Controls - Logo and White Logo
const NavbarImagesControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleControlsChange = (changedFields) => {
    onControlsChange(changedFields);
  };

  return (
    <div className="p-3 grid grid-cols-1 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Main Logo:
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={handleControlsChange}
          imageArrayFieldName="images"
          maxImages={1}
          imageLabels={["Main Logo"]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          White Logo (for dark backgrounds):
        </label>
        <PanelImagesController
          currentData={currentData}
          onControlsChange={handleControlsChange}
          imageArrayFieldName="whiteImages"
          maxImages={1}
          imageLabels={["White Logo"]}
        />
      </div>
    </div>
  );
};

NavbarImagesControls.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  themeColors: PropTypes.array.isRequired,
};

// Navbar Color Controls
const NavbarColorControls = ({
  currentData,
  onControlsChange,
  themeColors,
}) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ ...currentData, [fieldName]: value });
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
      <h3 className="text-sm font-semibold mb-3">Navbar Color Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Unscrolled Background:"
          currentColorValue={
            currentData.unscrolledBackgroundColor || "bg-transparent"
          }
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("unscrolledBackgroundColor", value)
          }
          fieldName="unscrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Scrolled Background:"
          currentColorValue={currentData.scrolledBackgroundColor || "bg-banner"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("scrolledBackgroundColor", value)
          }
          fieldName="scrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Dropdown Background:"
          currentColorValue={currentData.dropdownBackgroundColor || "bg-white"}
          themeColors={themeColors}
          onColorChange={(fieldName, value) =>
            handleColorChange("dropdownBackgroundColor", value)
          }
          fieldName="dropdownBackgroundColor"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Dropdown Text Color:
          </label>
          <input
            type="text"
            value={currentData.dropdownTextColor || ""}
            onChange={(e) =>
              handleColorChange("dropdownTextColor", e.target.value)
            }
            placeholder="e.g., text-black"
            className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center mt-1">
          <input
            type="checkbox"
            checked={currentData.useWhiteHamburger || false}
            onChange={(e) =>
              handleColorChange("useWhiteHamburger", e.target.checked)
            }
            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="text-sm font-medium text-gray-700">
            Use White Hamburger Icon
          </label>
        </div>
      </div>
    </div>
  );
};

// Navbar Styling Controls
const NavbarStylingControls = ({
  currentData,
  onControlsChange,
  previewNavbarAsScrolled,
  setPreviewNavbarAsScrolled,
}) => {
  const handleAnimationChange = (field, value) => {
    const updatedAnimation = { ...currentData.animation, [field]: value };
    onControlsChange({ ...currentData, animation: updatedAnimation });
  };

  const handleTextSizeChange = (sizeType, breakpoint, property, value) => {
    const currentSizes = currentData.textSizes || {};
    const currentBreakpoint = currentSizes[breakpoint] || {};
    const updatedSizes = {
      ...currentSizes,
      [breakpoint]: { ...currentBreakpoint, [property]: value },
    };
    onControlsChange({ ...currentData, textSizes: updatedSizes });
  };

  const handleNavbarHeightChange = (
    heightType,
    breakpoint,
    property,
    value
  ) => {
    const currentHeights = currentData.navbarHeight || {};
    const currentBreakpoint = currentHeights[breakpoint] || {};
    const updatedHeights = {
      ...currentHeights,
      [breakpoint]: { ...currentBreakpoint, [property]: value },
    };
    onControlsChange({ ...currentData, navbarHeight: updatedHeights });
  };

  const animation = currentData.animation || {};

  // Text size options for different screen sizes
  const textSizeOptions = {
    unscrolled: {
      base: [
        { value: "text-[4vw]", label: "Extra Small (4vw)" },
        { value: "text-[5vw]", label: "Small (5vw)" },
        { value: "text-[6vw]", label: "Medium (6vw)" },
        { value: "text-[7vw]", label: "Large (7vw)" },
        { value: "text-[8vw]", label: "Extra Large (8vw)" },
        { value: "text-[9vw]", label: "Huge (9vw)" },
      ],
      md: [
        { value: "text-[4vh]", label: "Extra Small (4vh)" },
        { value: "text-[5vh]", label: "Small (5vh)" },
        { value: "text-[6vh]", label: "Medium (6vh)" },
        { value: "text-[7vh]", label: "Large (7vh)" },
        { value: "text-[8vh]", label: "Extra Large (8vh)" },
        { value: "text-[9vh]", label: "Huge (9vh)" },
      ],
      lg: [
        { value: "text-[3vh]", label: "Extra Small (3vh)" },
        { value: "text-[4vh]", label: "Small (4vh)" },
        { value: "text-[5vh]", label: "Medium (5vh)" },
        { value: "text-[6vh]", label: "Large (6vh)" },
        { value: "text-[7vh]", label: "Extra Large (7vh)" },
      ],
    },
    scrolled: {
      base: [
        { value: "text-[2vw]", label: "Extra Small (2vw)" },
        { value: "text-[2.5vw]", label: "Small (2.5vw)" },
        { value: "text-[3vw]", label: "Medium (3vw)" },
        { value: "text-[3.5vw]", label: "Large (3.5vw)" },
        { value: "text-[4vw]", label: "Extra Large (4vw)" },
      ],
      md: [
        { value: "text-[3vh]", label: "Extra Small (3vh)" },
        { value: "text-[4vh]", label: "Small (4vh)" },
        { value: "text-[5vh]", label: "Medium (5vh)" },
        { value: "text-[6vh]", label: "Large (6vh)" },
        { value: "text-[7vh]", label: "Extra Large (7vh)" },
      ],
    },
  };

  // Navbar height options
  const navbarHeightOptions = {
    unscrolled: {
      base: [
        { value: "h-[12vh]", label: "Small (12vh)" },
        { value: "h-[14vh]", label: "Medium (14vh)" },
        { value: "h-[16vh]", label: "Large (16vh)" },
        { value: "h-[18vh]", label: "Extra Large (18vh)" },
        { value: "h-[20vh]", label: "Huge (20vh)" },
      ],
      md: [
        { value: "h-[14vh]", label: "Small (14vh)" },
        { value: "h-[16vh]", label: "Medium (16vh)" },
        { value: "h-[18vh]", label: "Large (18vh)" },
        { value: "h-[20vh]", label: "Extra Large (20vh)" },
        { value: "h-[22vh]", label: "Huge (22vh)" },
      ],
    },
    scrolled: {
      base: [
        { value: "h-[8vh]", label: "Small (8vh)" },
        { value: "h-[10vh]", label: "Medium (10vh)" },
        { value: "h-[12vh]", label: "Large (12vh)" },
      ],
      md: [
        { value: "h-[8vh]", label: "Small (8vh)" },
        { value: "h-[10vh]", label: "Medium (10vh)" },
        { value: "h-[12vh]", label: "Large (12vh)" },
      ],
    },
  };

  return (
    <div className="p-4 space-y-6 bg-white rounded-md">
      {/* Preview Mode Toggle */}
      <div className="flex space-x-2 mb-3 border-b pb-3">
        <p className="text-sm font-medium text-gray-700 self-center mr-2">
          Preview Mode:
        </p>
        <button
          type="button"
          onClick={() => setPreviewNavbarAsScrolled(false)}
          className={`px-3 py-1.5 text-xs rounded-md ${!previewNavbarAsScrolled ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Unscrolled
        </button>
        <button
          type="button"
          onClick={() => setPreviewNavbarAsScrolled(true)}
          className={`px-3 py-1.5 text-xs rounded-md ${previewNavbarAsScrolled ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
        >
          Scrolled
        </button>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Animation Settings:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Natural Offset (vh):
            </label>
            <input
              type="number"
              value={animation.naturalOffsetVh || 11}
              onChange={(e) =>
                handleAnimationChange(
                  "naturalOffsetVh",
                  parseFloat(e.target.value)
                )
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Slide Up Distance (vh):
            </label>
            <input
              type="number"
              value={animation.slideUpDistanceVh || 0}
              onChange={(e) =>
                handleAnimationChange(
                  "slideUpDistanceVh",
                  parseFloat(e.target.value)
                )
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logo Size Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Logo Size Settings:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Unscrolled Width:
            </label>
            <input
              type="text"
              value={animation.logoSizeUnscrolled?.width || "18vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeUnscrolled", {
                  ...animation.logoSizeUnscrolled,
                  width: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Unscrolled Height:
            </label>
            <input
              type="text"
              value={animation.logoSizeUnscrolled?.height || "18vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeUnscrolled", {
                  ...animation.logoSizeUnscrolled,
                  height: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Scrolled Width:
            </label>
            <input
              type="text"
              value={animation.logoSizeScrolled?.width || "14vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeScrolled", {
                  ...animation.logoSizeScrolled,
                  width: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Scrolled Height:
            </label>
            <input
              type="text"
              value={animation.logoSizeScrolled?.height || "14vh"}
              onChange={(e) =>
                handleAnimationChange("logoSizeScrolled", {
                  ...animation.logoSizeScrolled,
                  height: e.target.value,
                })
              }
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Text Size Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Text Size Settings:
        </h4>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Unscrolled Text Sizes:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.base || "text-[7vw]"}
                onChange={(e) =>
                  handleTextSizeChange(
                    "unscrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Tablet (md):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.md || "text-[8vh]"}
                onChange={(e) =>
                  handleTextSizeChange("unscrolled", "md", "md", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (lg):
              </label>
              <select
                value={currentData.textSizes?.unscrolled?.lg || "text-[5vh]"}
                onChange={(e) =>
                  handleTextSizeChange("unscrolled", "lg", "lg", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.unscrolled.lg.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Scrolled Text Sizes:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.textSizes?.scrolled?.base || "text-[3vw]"}
                onChange={(e) =>
                  handleTextSizeChange(
                    "scrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.scrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.textSizes?.scrolled?.md || "text-[5vh]"}
                onChange={(e) =>
                  handleTextSizeChange("scrolled", "md", "md", e.target.value)
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {textSizeOptions.scrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Navbar Height Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">
          Navbar Height Settings:
        </h4>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Unscrolled Heights:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.navbarHeight?.unscrolled?.base || "h-[16vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "unscrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.unscrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.navbarHeight?.unscrolled?.md || "h-[16vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "unscrolled",
                    "md",
                    "md",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.unscrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="border p-3 rounded-md bg-gray-50">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">
            Scrolled Heights:
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Mobile (base):
              </label>
              <select
                value={currentData.navbarHeight?.scrolled?.base || "h-[10vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "scrolled",
                    "base",
                    "base",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.scrolled.base.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Desktop (md):
              </label>
              <select
                value={currentData.navbarHeight?.scrolled?.md || "h-[10vh]"}
                onChange={(e) =>
                  handleNavbarHeightChange(
                    "scrolled",
                    "md",
                    "md",
                    e.target.value
                  )
                }
                className="mt-1 block w-full px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                {navbarHeightOptions.scrolled.md.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          checked={currentData.invertLogoColor || false}
          onChange={(e) =>
            onControlsChange({
              ...currentData,
              invertLogoColor: e.target.checked,
            })
          }
          className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label className="text-sm font-medium text-gray-700">
          Invert Logo Color
        </label>
      </div>
    </div>
  );
}; 