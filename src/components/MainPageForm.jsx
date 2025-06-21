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
import BottomStickyEditPanel from "./BottomStickyEditPanel";
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

// Import actual components for tabsConfig access
import HeroBlock from "./MainPageBlocks/HeroBlock";
import RichTextBlock from "./MainPageBlocks/RichTextBlock";
import ButtonBlock from "./MainPageBlocks/ButtonBlock";
import BasicMapBlock from "./MainPageBlocks/BasicMapBlock";
import BookingBlock from "./MainPageBlocks/BookingBlock";
import ServiceSliderBlock, { 
  ServiceSliderImagesControls,
  ServiceSliderColorControls,
  ServiceSliderStylingControls,
  ServiceSliderFontsControls
} from "./MainPageBlocks/ServiceSliderBlock";

// Import BeforeAfter control components
import { 
  BeforeAfterImagesControls,
  BeforeAfterColorControls,
  BeforeAfterStylingControls,
  BeforeAfterFontsControls 
} from "./MainPageBlocks/BeforeAfterBlock";

import IconSelectorModal from "./common/IconSelectorModal";
import ThemeColorPicker from './common/ThemeColorPicker';
import PanelImagesController from './common/PanelImagesController';
import BlockEditControl from './common/BlockEditControl';

// Import Navbar for tabsConfig access
import Navbar from "./Navbar";

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
  forcedPreviewStates = {},
  onPreviewStateChange,
  deviceViewport = 'desktop',
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
    // Extract the index from the simplified blockKey format: "block_0", "block_1", etc.
    const blockIndex = parseInt(blockKey.split('_').pop());
    
    setInternalFormData((prevData) => {
      const newBlocks = [...(prevData.mainPageBlocks || [])];
      if (newBlocks[blockIndex]) {
        // If the block is a HeroBlock, we need to pass the icon change handler
        if (newBlocks[blockIndex].blockName === "HeroBlock") {
          newConfig.onOpenIconModal = (fieldType) => handleOpenIconModal(fieldType, { pack: newConfig[fieldType]?.iconPack, name: newConfig[fieldType]?.icon }, 'hero');
        }
        newBlocks[blockIndex] = { ...newBlocks[blockIndex], config: newConfig };
      }

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
    // Extract the index from the simplified blockKey format: "block_0", "block_1", etc.
    const blockIndex = parseInt(blockKey.split('_').pop());
    const originalBlock = initialFormData?.mainPageBlocks?.[blockIndex];
    
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
    console.log('[MainPageForm] handleToggleEditState called with:', blockIdentifier);
    console.log('[MainPageForm] Current activeEditBlock:', activeEditBlock);
    
    setActiveEditBlock((prev) => {
      console.log('[MainPageForm] setActiveEditBlock - prev:', prev, 'new:', blockIdentifier);
      
      if (prev === blockIdentifier) {
        // If clicking the same block's button, close the panel
        // Scroll DOWN when closing the panel
        setTimeout(() => {
          const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 400; // fallback height
          const currentScrollY = window.scrollY;
          // Scroll down by adding the panel height to current position
          window.scrollTo({
            top: currentScrollY + panelHeight,
            behavior: 'smooth',
          });
        }, 100);
        
        console.log('[MainPageForm] Closing panel for same block - scrolling DOWN');
        return null;
      }

      // If switching to a new block, open panel for that block
      // and scroll to position it at 20% from top (usually scrolls UP)
      setTimeout(() => {
        const blockElement = blockRefs.current[blockIdentifier]?.current;
        if (blockElement) {
          const elementTop = blockElement.getBoundingClientRect().top + window.scrollY;
          const viewportHeight = window.innerHeight;
          const targetPosition = elementTop - (viewportHeight * 0.2); // 20% gap from top
          
          window.scrollTo({
            top: Math.max(0, targetPosition), // Ensure we don't scroll above the top
            behavior: 'smooth',
          });
        }
      }, 100);
      
      console.log('[MainPageForm] Opening panel for block:', blockIdentifier, '- scrolling to 20% from top');
      return blockIdentifier;
    });
  };

  // Memoized function to get the configuration for the active block panel
  const getActiveBlockDataForPanel = useMemo(() => {
    console.log('[MainPageForm] getActiveBlockDataForPanel called with activeEditBlock:', activeEditBlock);
    
    if (!activeEditBlock) return null;

    if (activeEditBlock === 'navbar') {
      // Return data needed for the Navbar's edit panel - use Navbar.tabsConfig like HeroBlock
      return {
        blockName: "Navbar",
        config: navbarConfig,
        onPanelChange: handleNavbarConfigChange,
        tabsConfig: Navbar.tabsConfig ? 
          Navbar.tabsConfig(navbarConfig, handleNavbarConfigChange, themeColors) :
          {
            general: (props) => <div>Navbar tabs not configured</div>,
          }
      };
    }

    // SIMPLIFIED: Use array index as the stable key instead of complex fallback system
    // This is simpler and more predictable than unique keys
    const blockIndex = parseInt(activeEditBlock.split('_').pop());
    const block = internalFormData.mainPageBlocks?.[blockIndex];

    console.log('[MainPageForm] Found block for activeEditBlock:', block);

    if (!block) return null;

    // Add onOpenIconModal to the HeroBlock config here
    let finalConfig = { ...block.config };
    if (block.blockName === "HeroBlock") {
        finalConfig.onOpenIconModal = (fieldType) => handleOpenIconModal(fieldType, { pack: finalConfig[fieldType]?.iconPack, name: finalConfig[fieldType]?.icon }, 'hero');
    } else if (block.blockName === "RichTextBlock") {
        finalConfig.onOpenIconModalForCard = (cardIndex) => {
            const card = finalConfig.cards[cardIndex];
            handleOpenIconModal(`card-${cardIndex}`, { pack: card.iconPack, name: card.icon }, 'block', activeEditBlock, cardIndex);
        };
    }

    // Use a mapping to get the correct tabs config for the block
    const blockTabsMap = {
      HeroBlock: HeroBlock.tabsConfig ? 
        HeroBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          general: (props) => <HeroGeneralControls {...props} />,
          colors: (props) => <HeroColorControls {...props} />,
          fonts: (props) => <HeroFontsControls {...props} />,
        },
      RichTextBlock: RichTextBlock.tabsConfig ? 
        RichTextBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          general: (props) => <RichTextGeneralControls {...props} />,
          colors: (props) => <RichTextColorControls {...props} />,
          fonts: (props) => <RichTextFontsControls {...props} />,
        },
      BasicMapBlock: BasicMapBlock.tabsConfig ? 
        BasicMapBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          general: (props) => <div>BasicMapBlock tabs not configured</div>,
        },
      BeforeAfterBlock: {
        images: (props) => <BeforeAfterImagesControls {...props} />,
        colors: (props) => <BeforeAfterColorControls {...props} />,
        styling: (props) => <BeforeAfterStylingControls {...props} />,
        fonts: (props) => <BeforeAfterFontsControls {...props} />,
      },
      ButtonBlock: ButtonBlock.tabsConfig ? 
        ButtonBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          images: (props) => <ButtonImagesControls {...props} />,
          styling: (props) => <ButtonStylingControls {...props} />,
          fonts: (props) => <ButtonFontsControls {...props} />,
        },
      BookingBlock: BookingBlock.tabsConfig ? 
        BookingBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          general: (props) => <div>BookingBlock tabs not configured</div>,
        },
       ServiceSliderBlock: ServiceSliderBlock.tabsConfig ? 
        ServiceSliderBlock.tabsConfig(finalConfig, (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig), themeColors) :
        {
          images: (props) => <ServiceSliderImagesControls {...props} />,
          colors: (props) => <ServiceSliderColorControls {...props} />,
          styling: (props) => <ServiceSliderStylingControls {...props} />,
          fonts: (props) => <ServiceSliderFontsControls {...props} />,
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
    
    return {
      blockName: block.blockName,
      config: finalConfig,
      onPanelChange: (newConfig) => handleBlockConfigChange(activeEditBlock, newConfig),
      tabsConfig: blockTabsMap[block.blockName] || { general: (props) => <div>No controls defined.</div> },
    };
  }, [activeEditBlock, internalFormData, navbarConfig, handleNavbarConfigChange, handleBlockConfigChange, themeColors, previewNavbarAsScrolled]);

  const getLastSavedConfig = (blockKey) => {
    if (!initialFormData || !initialFormData.mainPageBlocks) return null;
    // Extract the index from the simplified blockKey format: "block_0", "block_1", etc.
    const blockIndex = parseInt(blockKey.split('_').pop());
    const block = initialFormData.mainPageBlocks[blockIndex];
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
        <BottomStickyEditPanel
          isOpen={!!activeEditBlock}
          onClose={() => handleToggleEditState(singleBlock.uniqueKey)}
          activeBlockData={getActiveBlockDataForPanel}
          onUndo={() => handleUndoBlock(singleBlock.uniqueKey)}
          onConfirm={() => handleSaveBlock(singleBlock.uniqueKey, singleBlock.config)}
          forcedPreviewStates={forcedPreviewStates}
          onPreviewStateChange={onPreviewStateChange}
        />
        <div 
          ref={(el) => (blockRefs.current[singleBlock.uniqueKey] = { current: el })} 
          className={`relative transition-all duration-300 overflow-hidden ${
            activeEditBlock === singleBlock.uniqueKey 
              ? 'ring-4 ring-blue-500/50 shadow-2xl shadow-blue-500/25 animate-pulse-glow' 
              : ''
          }`}
        >
          <BlockEditControl
            isEditing={activeEditBlock === singleBlock.uniqueKey}
            onToggleEdit={() => handleToggleEditState(singleBlock.uniqueKey)}
            onUndo={() => handleUndoBlock(singleBlock.uniqueKey)}
            showUndo={activeEditBlock === singleBlock.uniqueKey}
            zIndex="z-50"
          />
          <ComponentToRender
            {...{
              [blockSpecificPropName]: singleBlock.config,
              readOnly: activeEditBlock !== singleBlock.uniqueKey,
              onConfigChange: (newConfig) => handleBlockConfigChange(singleBlock.uniqueKey, newConfig),
              themeColors,
              sitePalette,
              forcedPreviewState: forcedPreviewStates[singleBlock.blockName],
              forcedDeviceViewport: deviceViewport,
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
        <BottomStickyEditPanel
          ref={panelRef}
          isOpen={!!activeEditBlock}
          onClose={() => handleToggleEditState(activeEditBlock)}
          activeBlockData={getActiveBlockDataForPanel}
          forcedPreviewStates={forcedPreviewStates}
          onPreviewStateChange={onPreviewStateChange}
        />
      )}
      <div
        ref={(el) => (blockRefs.current['navbar'] = { current: el })}
        className={`relative bg-white border transition-all duration-300 overflow-hidden ${
          activeEditBlock === 'navbar' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditBlock === 'navbar'}
          onToggleEdit={() => handleToggleEditState('navbar')}
          onUndo={() => {
            const initial = cloneConfigStripFiles(initialNavbarConfig);
            setNavbarConfig(initial);
            if (onNavbarChange) onNavbarChange(initial);
          }}
          showUndo={activeEditBlock === 'navbar'}
          zIndex="z-[60]"
        />
        <div id="block-content-navbar" className="transition-all duration-300">
          <Suspense fallback={<div>Loading Navbar...</div>}>
            <NavbarLazy
              config={navbarConfig}
              isPreview={true}
              isEditingPreview={activeEditBlock === 'navbar'}
              onTitleChange={(title) => handleNavbarConfigChange({ title })}
              onSubtitleChange={(subtitle) => handleNavbarConfigChange({ subtitle })}
              forceScrolledState={forcedPreviewStates.Navbar === 'scrolled'}
              forcedDeviceViewport={deviceViewport}
            />
          </Suspense>
        </div>
      </div>
      {currentMainPageBlocks.map((block, index) => {
        // SIMPLIFIED: Use simple index-based keys instead of complex fallback system
        // This makes the system more predictable and easier to debug
        const blockKey = `block_${index}`;
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
            className={`relative bg-white border transition-all duration-300 overflow-hidden ${
              isEditingThisBlock 
                ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
                : ''
            }`}
          >
            <BlockEditControl
              isEditing={isEditingThisBlock}
              onToggleEdit={() => handleToggleEditState(blockKey)}
              onUndo={() => handleUndoBlock(blockKey)}
              showUndo={isEditingThisBlock}
              zIndex="z-[60]"
            />
            <div id={`block-content-${blockKey}`} className="transition-all duration-300">
              <Suspense fallback={<div>Loading {block.blockName}...</div>}>
                <ComponentToRender 
                  {...componentProps} 
                  forcedPreviewState={forcedPreviewStates[block.blockName]}
                  forcedDeviceViewport={deviceViewport}
                />
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
  forcedPreviewStates: PropTypes.object,
  onPreviewStateChange: PropTypes.func,
  deviceViewport: PropTypes.string,
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