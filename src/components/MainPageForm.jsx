import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from "react";
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
import TopStickyEditPanel from './TopStickyEditPanel';

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
  HeroBlock: HeroBlockLazy,
  ButtonBlock,
  RichTextBlock,
  EmployeesBlock,
  BasicMapBlock,
  ServiceSliderBlock,
  TestimonialBlock,
  BeforeAfterBlock,
  BookingBlock,
  // Add other main page blocks here if any
};

// Helper for safe deep cloning
function safeDeepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  try {
    // Ensure undefined is not stringified to "undefined" which breaks JSON.parse
    const stringified = JSON.stringify(obj, (key, value) => {
        return typeof value === 'undefined' ? null : value;
    });
    return JSON.parse(stringified);
  } catch (e) {
    console.error("Error in safeDeepClone:", e, "Object was:", obj);
    return Array.isArray(obj) ? [] : {}; // Fallback to empty object/array
  }
}

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({ formData: formDataProp, setFormData: setFormDataProp, singleBlockMode = null, themeColors, sitePalette }) => {
  const [internalFormData, setInternalFormData] = useState(() => safeDeepClone(formDataProp) || {});
  const [activeEditBlock, setActiveEditBlock] = useState(null);
  const [activeBlockDataForPanel, setActiveBlockDataForPanel] = useState(null);
  const [previewNavbarAsScrolled, setPreviewNavbarAsScrolled] = useState(false);
  const navbarEditFormRef = useRef();
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconModalTargetField, setIconModalTargetField] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);
  const prevActiveEditBlockRef = useRef(null);

  const handleOpenIconModal = useCallback((fieldId, currentIcon, source = 'block', blockKeyForCardIcon = null, cardIndexForIcon = null) => { 
    setIconModalTargetField({ id: fieldId, source, blockKey: blockKeyForCardIcon, cardIndex: cardIndexForIcon }); 
    setCurrentIconForModal(currentIcon); 
    setIsIconModalOpen(true);
  }, [setIconModalTargetField, setCurrentIconForModal, setIsIconModalOpen]);

  const handleIconSelection = useCallback((pack, iconName) => {
    if (iconModalTargetField) {
      const { id, source, blockKey, cardIndex } = iconModalTargetField;
      if (source === 'navbar' && id === 'whiteLogoIcon') { 
        setInternalFormData(prev => ({
          ...prev,
          navbar: {
            ...(prev.navbar || {}),
            whiteLogoIcon: { pack, name: iconName },
            whiteLogo: { url: '', file: null, name: '' } 
          }
        }));
      } else if (source === 'block' && blockKey && cardIndex !== null && id.startsWith('card-')) {
        setInternalFormData(prev => {
          const newBlocks = (prev.mainPageBlocks || []).map(b => {
            if (b.uniqueKey === blockKey) {
              const newCards = (b.config.cards || []).map((card, idx) => {
                if (idx === cardIndex) {
                  return { ...card, icon: iconName, iconPack: pack };
                }
                return card;
              });
              return { ...b, config: { ...b.config, cards: newCards } };
            }
            return b;
          });
          if (typeof setFormDataProp === 'function') {
            if(activeEditBlock === blockKey){
                 const blockToUpdate = newBlocks.find(b => b.uniqueKey === blockKey);
                 if(blockToUpdate) {
                    const panelData = activeBlockDataForPanel;
                    if(panelData && panelData.onPanelChange && panelData.blockName === "RichTextBlock"){
                        panelData.onPanelChange(blockToUpdate.config);
                    } else {
                        setFormDataProp({ ...prev, mainPageBlocks: newBlocks });
                    }
                 }
            }
          }
          return { ...prev, mainPageBlocks: newBlocks };
        });
      } 
    }
    setIsIconModalOpen(false); 
    setIconModalTargetField(null); 
    setCurrentIconForModal(null);
  }, [iconModalTargetField, setInternalFormData, setIsIconModalOpen, setIconModalTargetField, setCurrentIconForModal, setFormDataProp, activeEditBlock, activeBlockDataForPanel]);

  // Effect 1: When an edit session ends, propagate internalFormData up to OneForm.
  useEffect(() => {
    if (prevActiveEditBlockRef.current !== null && activeEditBlock === null) {
      console.log("MainPageForm: Edit session ended. Propagating internal changes to OneForm.");
      const heroBlockData = internalFormData.mainPageBlocks?.find(b => b.blockName === 'HeroBlock');
      if (heroBlockData && heroBlockData.config) {
          console.log("MainPageForm HeroBlock config BEFORE propagation to OneForm (File check):", 
              heroBlockData.config.heroImageFile instanceof File ? `[File: ${heroBlockData.config.heroImageFile.name}]` : 'No File',
              "Original URL:", heroBlockData.config.originalUrl
          );
      }
      if (typeof setFormDataProp === 'function') {
        setFormDataProp(internalFormData);
      }
    }
    prevActiveEditBlockRef.current = activeEditBlock;
  }, [activeEditBlock, internalFormData, setFormDataProp]);

  // Effect 2: Synchronize from formDataProp down to internalFormData ONLY when not actively editing.
  useEffect(() => {
    if (activeEditBlock === null) {
      const clonedFormDataProp = safeDeepClone(formDataProp);
      if (clonedFormDataProp && typeof clonedFormDataProp === 'object') {
        if (clonedFormDataProp.mainPageBlocks && Array.isArray(clonedFormDataProp.mainPageBlocks)) {
          clonedFormDataProp.mainPageBlocks = clonedFormDataProp.mainPageBlocks.map((block, index) => ({
            ...block,
            uniqueKey: block.uniqueKey || `${block.blockName}_${Date.now()}_${index}_propSync`
          }));
        }
        
        if (JSON.stringify(internalFormData) !== JSON.stringify(clonedFormDataProp)) {
          console.log("MainPageForm: Syncing from formData prop to internalFormData (no active edit).", clonedFormDataProp);
          setInternalFormData(clonedFormDataProp);
        }
      } else if (JSON.stringify(internalFormData) !== '{}') {
          console.log("MainPageForm: formData prop is null/undefined. Resetting internalFormData if not already empty.");
          setInternalFormData({});
      }
    }
  }, [formDataProp, activeEditBlock]);

  const handleBlockConfigChange = useCallback((blockUniqueKey, newConfigFromBlock) => {
    console.log(`MainPageForm: Block ${blockUniqueKey} is committing changes to internalFormData.`, newConfigFromBlock);
    setInternalFormData((prev) => {
      const blockBeingChanged = (prev.mainPageBlocks || []).find(b => b.uniqueKey === blockUniqueKey);
      let newMainPageBlocks = (prev.mainPageBlocks || []).map(block =>
        block.uniqueKey === blockUniqueKey ? { ...block, config: newConfigFromBlock } : block
      );

      // Special handling for HeroBlock to ensure image structure consistency
      if (blockBeingChanged && blockBeingChanged.blockName === 'HeroBlock' && newConfigFromBlock) {
        console.log("[MainPageForm] HeroBlock config update - ensuring image structure consistency:", newConfigFromBlock);
        
        // Ensure the heroImage property is properly structured for compatibility
        if (newConfigFromBlock.images && newConfigFromBlock.images.length > 0) {
          const primaryImage = newConfigFromBlock.images[0];
          if (!newConfigFromBlock.heroImage || typeof newConfigFromBlock.heroImage === 'string') {
            newConfigFromBlock.heroImage = {
              url: primaryImage.url,
              file: primaryImage.file,
              name: primaryImage.name,
              originalUrl: primaryImage.originalUrl,
              id: primaryImage.id
            };
          }
        }

        const oldHeroConfig = blockBeingChanged.config;
        const serviceSliderBlockIndex = newMainPageBlocks.findIndex(b => b.blockName === 'ServiceSliderBlock');

        if (serviceSliderBlockIndex !== -1) {
          const serviceSliderConfig = { ...newMainPageBlocks[serviceSliderBlockIndex].config };
          let sliderResidentialServices = [...(serviceSliderConfig.residentialServices || [])];
          let sliderCommercialServices = [...(serviceSliderConfig.commercialServices || [])];
          let changed = false;

          (newConfigFromBlock.residential?.subServices || []).forEach(heroService => {
            const oldHeroService = oldHeroConfig.residential?.subServices?.find(s => s.id === heroService.id);
            if (oldHeroService && oldHeroService.title !== heroService.title) {
              const sliderServiceIndex = sliderResidentialServices.findIndex(
                sliderService => sliderService.title === oldHeroService.originalTitle || sliderService.title === oldHeroService.title
              );
              if (sliderServiceIndex !== -1) {
                sliderResidentialServices[sliderServiceIndex] = {
                  ...sliderResidentialServices[sliderServiceIndex],
                  title: heroService.title,
                };
                changed = true;
                console.log(`Linked Resi Service Title: '${oldHeroService.title}' to '${heroService.title}' in ServiceSlider`);
              }
            }
          });

          (newConfigFromBlock.commercial?.subServices || []).forEach(heroService => {
            const oldHeroService = oldHeroConfig.commercial?.subServices?.find(s => s.id === heroService.id);
            if (oldHeroService && oldHeroService.title !== heroService.title) {
              const sliderServiceIndex = sliderCommercialServices.findIndex(
                sliderService => sliderService.title === oldHeroService.originalTitle || sliderService.title === oldHeroService.title
              );
              if (sliderServiceIndex !== -1) {
                sliderCommercialServices[sliderServiceIndex] = {
                  ...sliderCommercialServices[sliderServiceIndex],
                  title: heroService.title,
                };
                changed = true;
                console.log(`Linked Comm Service Title: '${oldHeroService.title}' to '${heroService.title}' in ServiceSlider`);
              }
            }
          });

          if (changed) {
            newMainPageBlocks[serviceSliderBlockIndex] = {
              ...newMainPageBlocks[serviceSliderBlockIndex],
              config: {
                ...serviceSliderConfig,
                residentialServices: sliderResidentialServices,
                commercialServices: sliderCommercialServices,
              },
            };
          }
        }
      }

      const heroBlockInNewState = newMainPageBlocks.find(b => b.blockName === 'HeroBlock');
      if (heroBlockInNewState && heroBlockInNewState.config) {
          console.log("MainPageForm: HeroBlock config after update in newMainPageBlocks (File check):", 
              heroBlockInNewState.config.heroImageFile instanceof File ? `[File: ${heroBlockInNewState.config.heroImageFile.name}]` : 'No File',
              "Images array:", heroBlockInNewState.config.images?.length || 0, "images"
          );
      }
      return { ...prev, mainPageBlocks: newMainPageBlocks };
    });
  }, [setInternalFormData]);
  
  const handleNavbarConfigChange = useCallback((newNavbarConfig) => {
    console.log("MainPageForm: Navbar is committing changes to internalFormData.", newNavbarConfig);
    setInternalFormData((prev) => ({ ...prev, navbar: newNavbarConfig }));
  }, [setInternalFormData]);

  const handleRichTextConfigChange = useCallback((newRichTextConfig) => {
    console.log("MainPageForm: RichText committing changes to internalFormData.", newRichTextConfig);
    setInternalFormData((prev) => {
      const updatedMainPageBlocks = (prev.mainPageBlocks || []).map(block =>
        block.blockName === 'RichTextBlock' 
          ? { ...block, config: newRichTextConfig }
          : block
      );
      let newInternalState = { ...prev, mainPageBlocks: updatedMainPageBlocks };
      // Note: Background color synchronization with HeroBlock removed since 
      // RichTextBlock now uses its own independent backgroundColor
      return newInternalState;
    });
  }, [setInternalFormData]);

  const PencilIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg> );
  const CheckIcon = ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg> );

  const handleToggleEditState = useCallback((key) => {
    const currentlyEditing = activeEditBlock === key;
    if (currentlyEditing) {
      setActiveEditBlock(null);
    } else {
      setActiveEditBlock(key);
    }
  }, [activeEditBlock]);

  // Effect 3: Manage activeBlockDataForPanel based on activeEditBlock and internalFormData
  useEffect(() => {
    if (!activeEditBlock) {
      if (activeBlockDataForPanel !== null) {
        setActiveBlockDataForPanel(null);
      }
      return;
    }

    let newPanelData = null;

    if (activeEditBlock === 'navbar') {
      const currentNavbarConfig = internalFormData.navbar || {};
      
      // Create tabsConfig for navbar similar to other blocks
      const navbarTabsConfig = {
        general: (props) => (
          <NavbarGeneralControls
            {...props}
            currentData={currentNavbarConfig}
            onControlsChange={handleNavbarConfigChange}
          />
        ),
        images: (props) => (
          <NavbarImagesControls
            {...props}
            currentData={currentNavbarConfig}
            onControlsChange={handleNavbarConfigChange}
            themeColors={themeColors}
            onOpenIconModal={handleOpenIconModal}
          />
        ),
        colors: (props) => (
          <NavbarColorControls
            {...props}
            currentData={currentNavbarConfig}
            onControlsChange={handleNavbarConfigChange}
            themeColors={themeColors}
          />
        ),
        styling: (props) => (
          <NavbarStylingControls
            {...props}
            currentData={currentNavbarConfig}
            onControlsChange={handleNavbarConfigChange}
            previewNavbarAsScrolled={previewNavbarAsScrolled}
            setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled}
          />
        ),
      };
      
      newPanelData = {
        blockName: 'Navbar',
        config: currentNavbarConfig,
        onPanelChange: handleNavbarConfigChange,
        tabsConfig: navbarTabsConfig,
        themeColors: themeColors,
        sitePalette: sitePalette,
      };
    } else {
      const blockToEdit = internalFormData.mainPageBlocks?.find(b => b.uniqueKey === activeEditBlock);
      if (blockToEdit) {
        const BlockComponent = blockComponentMap[blockToEdit.blockName];
        const blockConfig = blockToEdit.config || {};
        
        const panelSpecificOnControlsChange = (changedFieldsOrUpdater) => {
          if (typeof changedFieldsOrUpdater === 'function') {
            const newConfig = changedFieldsOrUpdater(blockConfig);
            handleBlockConfigChange(blockToEdit.uniqueKey, newConfig);
          } else {
            handleBlockConfigChange(blockToEdit.uniqueKey, { ...blockConfig, ...changedFieldsOrUpdater });
          }
        };

        let panelTabsConfig = null;
        if (BlockComponent) {
          console.log(`[MainPageForm] Setting up panel for ${blockToEdit.blockName}. BlockComponent:`, BlockComponent);
          
          // Special handling for HeroBlock due to React.lazy and static properties
          if (blockToEdit.blockName === 'HeroBlock') {
            if (typeof HeroBlock.tabsConfig === 'function') { // Accessing the directly imported HeroBlock
              panelTabsConfig = HeroBlock.tabsConfig(blockConfig, panelSpecificOnControlsChange, themeColors, sitePalette);
              console.log(`[MainPageForm] Retrieved tabsConfig for HeroBlock directly:`, panelTabsConfig);
            } else {
              console.warn(`[MainPageForm] HeroBlock.tabsConfig is not a function on the direct import.`);
            }
          } else if (BlockComponent.type) { // For other lazy components
            console.log(`[MainPageForm] BlockComponent.type for ${blockToEdit.blockName}:`, BlockComponent.type);
            console.log(`[MainPageForm] BlockComponent.type.tabsConfig for ${blockToEdit.blockName} is function?`, typeof BlockComponent.type.tabsConfig === 'function');
            if (typeof BlockComponent.type.tabsConfig === 'function') {
              panelTabsConfig = BlockComponent.type.tabsConfig(blockConfig, panelSpecificOnControlsChange, themeColors, sitePalette);
              console.log(`[MainPageForm] Retrieved tabsConfig for ${blockToEdit.blockName} via BlockComponent.type.tabsConfig:`, panelTabsConfig);
            }
          } else if (typeof BlockComponent.tabsConfig === 'function') { // For non-lazy components
            panelTabsConfig = BlockComponent.tabsConfig(blockConfig, panelSpecificOnControlsChange, themeColors, sitePalette);
            console.log(`[MainPageForm] Retrieved tabsConfig for ${blockToEdit.blockName} via BlockComponent.tabsConfig:`, panelTabsConfig);
          }

          if (!panelTabsConfig) { // Fallback log if still not found
             console.warn(`[MainPageForm] Could not retrieve tabsConfig for ${blockToEdit.blockName} through any method.`);
          }

          // The openIconModalFnForBlock was defined earlier but might not be needed for all blocks/tabs
          // It's passed to tabsConfig functions which can choose to use it or not.
        }
        
        newPanelData = {
          blockName: blockToEdit.blockName,
          EditorPanelComponent: BlockComponent?.EditorPanel,
          config: blockConfig,
          onPanelChange: panelSpecificOnControlsChange,
          tabsConfig: panelTabsConfig,
          themeColors,
          sitePalette,
        };
      }
    }

    if (newPanelData && JSON.stringify(newPanelData.config) !== JSON.stringify(activeBlockDataForPanel?.config)) {
      console.log('[MainPageForm] Updating activeBlockDataForPanel for:', activeEditBlock, newPanelData.config);
      setActiveBlockDataForPanel(newPanelData);
    } else if (newPanelData && !activeBlockDataForPanel) {
      console.log('[MainPageForm] Initializing activeBlockDataForPanel for:', activeEditBlock, newPanelData.config);
      setActiveBlockDataForPanel(newPanelData);
    } else if (!newPanelData && activeBlockDataForPanel !== null) {
      setActiveBlockDataForPanel(null);
    }

  }, [
    activeEditBlock, 
    internalFormData, 
    themeColors, 
    sitePalette,
    handleBlockConfigChange,
    handleNavbarConfigChange,
    activeBlockDataForPanel,
    previewNavbarAsScrolled,
    handleOpenIconModal,
  ]);

  const activeBlockForPanel = activeEditBlock ? internalFormData.mainPageBlocks?.find(b => b.uniqueKey === activeEditBlock) : null;

  if (singleBlockMode) {
    const blockDataContainer = internalFormData || {};
    const blockConfig = blockDataContainer[singleBlockMode];
    const Component = blockComponentMap[singleBlockMode];
    
    if (singleBlockMode === "navbar") {
      return (
        <div className="relative p-4 bg-gray-200">
          <h2 className="text-xl font-semibold mb-3">Navbar Editor</h2>
          <NavbarEditForm 
            ref={navbarEditFormRef} 
            navbarConfig={blockDataContainer.navbar || {}} 
            onConfigChange={handleNavbarConfigChange}
            previewNavbarAsScrolled={previewNavbarAsScrolled} 
            setPreviewNavbarAsScrolled={setPreviewNavbarAsScrolled} 
            onOpenIconModal={(fieldId, currentIcon) => handleOpenIconModal(fieldId, currentIcon, 'navbar')}
            sitePalette={sitePalette}
          />
          <button onClick={() => navbarEditFormRef.current?.commitChanges()} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save Navbar Changes</button>
        </div>
      );
    }
    
    if (Component && blockConfig) {
        const propName = Object.keys(propsForBlocks[singleBlockMode] || {config: null})[0] || 'config';
        let props = {
            readOnly: false, 
            [propName]: blockConfig,
            onConfigChange: (newConfig) => {
                 console.log(`Single block mode: ${singleBlockMode} committing changes to internalFormData.`);
                 setInternalFormData(prev => {
                    const newBlockData = { ...prev, [singleBlockMode]: newConfig };
                    if ((prev.mainPageBlocks || []).some(b => b.blockName === singleBlockMode)) {
                        newBlockData.mainPageBlocks = (prev.mainPageBlocks || []).map(b => 
                            b.blockName === singleBlockMode ? {...b, config: newConfig} : b
                        );
                    }
                    return newBlockData;
                 });
            },
            themeColors: themeColors,
            sitePalette: sitePalette,
        };
        if(singleBlockMode === 'RichTextBlock') props.showControls = true;
        
      return (
        <div className="relative"><Suspense fallback={<div>Loading {singleBlockMode}...</div>}><Component {...props} /></Suspense></div>
      );
    } else {
      return <div>Unknown block type or missing config for single block: {singleBlockMode} (Data: {JSON.stringify(blockConfig || 'undefined')})</div>;
    }
  }

  const currentInternalData = internalFormData || {};
  const currentNavbarData = currentInternalData.navbar || {};
  const currentMainPageBlocks = currentInternalData.mainPageBlocks || [];

  if (Object.keys(currentInternalData).length === 0 && !singleBlockMode) {
    return <div className="p-4 text-center">Loading form data... (Main Form)</div>;
  }

  return (
    <div className="bg-gray-100 relative">
      {!singleBlockMode && (
        <TopStickyEditPanel
          isOpen={activeEditBlock !== null}
          onClose={() => handleToggleEditState(activeEditBlock)}
          activeBlockData={activeBlockDataForPanel}
        />
      )}

      {!singleBlockMode && Object.keys(currentNavbarData).length > 0 && (
        <div className="bg-white shadow-md border rounded-lg">
          <div className="flex justify-between items-center p-3 border-b">
            <h2 className="text-xl font-semibold text-gray-700">Navbar</h2>
            <button type="button" onClick={() => handleToggleEditState('navbar')} className={`${activeEditBlock === "navbar" ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}>
              {activeEditBlock === "navbar" ? CheckIcon : PencilIcon}
            </button>
          </div>
          <div className="navbar-preview-container overflow-visible">
            <Suspense fallback={<div>Loading Navbar Preview...</div>}>
              <Navbar
                config={currentNavbarData}
                forceScrolledState={previewNavbarAsScrolled}
                isPreview={true}
                isEditingPreview={activeEditBlock === 'navbar'}
                onTitleChange={(newTitle) => setInternalFormData(prev => ({ ...prev, navbar: { ...(prev.navbar || {}), title: newTitle }}))}
                onSubtitleChange={(newSubtitle) => setInternalFormData(prev => ({ ...prev, navbar: { ...(prev.navbar || {}), subtitle: newSubtitle }}))}
                naturalOffsetVh={currentNavbarData?.animation?.naturalOffsetVh}
                slideUpDistanceVh={currentNavbarData?.animation?.slideUpDistanceVh}
                logoSizeUnscrolled={currentNavbarData?.animation?.logoSizeUnscrolled}
                logoSizeScrolled={currentNavbarData?.animation?.logoSizeScrolled}
                textSizes={currentNavbarData?.textSizes}
                logoTextDistance={currentNavbarData?.logoTextDistance}
                navbarHeight={currentNavbarData?.navbarHeight}
                invertLogoColor={currentNavbarData?.invertLogoColor}
              />
            </Suspense>
          </div>
        </div>
      )}

      {currentMainPageBlocks.map((block) => {
        const blockKey = block.uniqueKey || `${block.blockName}_fallbackKey_${Math.random()}`;
        const ComponentToRender = blockComponentMap[block.blockName];
        const isEditingThisBlock = activeEditBlock === blockKey;

        if (!ComponentToRender) return <div key={blockKey} className="p-4 text-red-500">Unknown block type: {block.blockName}</div>;

        const blockSpecificPropName = {
            HeroBlock: 'heroconfig', RichTextBlock: 'richTextData', ButtonBlock: 'buttonconfig',
            BasicMapBlock: 'mapData', BookingBlock: 'bookingData', ServiceSliderBlock: 'config',
            TestimonialBlock: 'config', BeforeAfterBlock: 'beforeAfterData', EmployeesBlock: 'employeesData',
            AboutBlock: 'aboutData', CombinedPageBlock: 'config'
        }[block.blockName] || 'config';
        
        let componentProps = { 
            readOnly: !isEditingThisBlock,
            [blockSpecificPropName]: block.config || {}, 
            themeColors: themeColors,
            sitePalette: sitePalette,
        };

        if (block.blockName === 'HeroBlock') {
             componentProps.onConfigChange = (newConf) => handleBlockConfigChange(blockKey, newConf);
        } else if (block.blockName === 'RichTextBlock') {
            componentProps.showControls = isEditingThisBlock; 
            componentProps.onConfigChange = (newConf) => handleBlockConfigChange(blockKey, newConf); 
        } else {
            componentProps.onConfigChange = (newConf) => handleBlockConfigChange(blockKey, newConf);
        }
        
        return (
          <div key={blockKey} className="relative bg-white overflow-hidden border">
            <div className="absolute top-4 right-4 z-50">
              <button 
                type="button" 
                onClick={() => handleToggleEditState(blockKey)} 
                className={`${isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full p-2 shadow-lg transition-colors`}
              >
                {isEditingThisBlock ? CheckIcon : PencilIcon}
              </button>
            </div>
            <Suspense fallback={<div>Loading {block.blockName}...</div>}>
              <ComponentToRender {...componentProps} />
            </Suspense>
          </div>
        );
      })}
      {isIconModalOpen && (
        <IconSelectorModal 
          isOpen={isIconModalOpen} 
          onClose={() => setIsIconModalOpen(false)} 
          onSelectIcon={handleIconSelection}
          currentIconPack={currentIconForModal?.pack || 'lucide'} 
          currentIconName={currentIconForModal?.name}
        />
      )}
    </div>
  );
};

MainPageForm.propTypes = {
  formData: PropTypes.object, 
  setFormData: PropTypes.func.isRequired,
  singleBlockMode: PropTypes.string,
  themeColors: PropTypes.object, 
  sitePalette: PropTypes.array,
};

const propsForBlocks = {
    HeroBlock: { heroconfig: null }, RichTextBlock: { richTextData: null }, ButtonBlock: { buttonconfig: null },
    BasicMapBlock: { mapData: null }, BookingBlock: { bookingData: null }, ServiceSliderBlock: { config: null },
    TestimonialBlock: { config: null }, BeforeAfterBlock: { beforeAfterData: null }, EmployeesBlock: { employeesData: null },
    AboutBlock: { aboutData: null }, CombinedPageBlock: { config: null }
};

export default MainPageForm;

/* ==============================================
   NAVBAR TAB CONTROL COMPONENTS
   ----------------------------------------------
   Following the standard pattern from BeforeAfterBlock
=============================================== */

// Navbar General Controls - Navigation Links
const NavbarGeneralControls = ({ currentData, onControlsChange }) => {
  const handleNavLinkChange = (index, field, value) => {
    const updatedNavLinks = [...(currentData.navLinks || [])];
    updatedNavLinks[index] = { ...updatedNavLinks[index], [field]: value };
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  const addNavLink = () => {
    const navLinks = currentData.navLinks || [];
    onControlsChange({ 
      ...currentData, 
      navLinks: [...navLinks, { name: 'New Link', href: '/' }] 
    });
  };

  const removeNavLink = (index) => {
    const updatedNavLinks = (currentData.navLinks || []).filter((_, i) => i !== index);
    onControlsChange({ ...currentData, navLinks: updatedNavLinks });
  };

  // Simplified routes for the dropdown
  const predefinedRoutes = [
    { label: "Home Page", value: "/" },
    { label: "About Page", value: "/about" },
    { label: "Booking Anchor", value: "/#book" },
    { label: "Packages Anchor", value: "/#packages" },
    { label: "Services Anchor", value: "/#services" },
    { label: "Contact Anchor", value: "/#contact" },
    { label: "Legal Page", value: "/legal" },
    { label: "All Service Blocks Page", value: "/all-service-blocks" },
    { label: "Custom URL...", value: "CUSTOM" }
  ];

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
      <h3 className="text-md font-medium text-gray-900 mb-2">Navigation Links:</h3>
      {(currentData.navLinks || []).map((link, index) => (
        <div key={index} className="p-2 border border-gray-200 rounded-md mb-2 bg-white shadow-sm">
          <div className="flex items-center space-x-2">
            <div className="flex-grow">
              <label className="block text-xs font-medium text-gray-600">Display Name:</label>
              <input 
                type="text" 
                value={link.name} 
                onChange={(e) => handleNavLinkChange(index, 'name', e.target.value)} 
                className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              />
            </div>
            <div className="flex-grow">
              <label className="block text-xs font-medium text-gray-600">Target Route:</label>
              <select 
                value={predefinedRoutes.find(r => r.value === link.href) ? link.href : 'CUSTOM'} 
                onChange={(e) => {
                  const val = e.target.value;
                  handleNavLinkChange(index, 'href', val === 'CUSTOM' ? '' : val);
                }} 
                className="mt-0.5 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
              >
                {predefinedRoutes.map(route => (
                  <option key={route.value} value={route.value}>{route.label}</option>
                ))}
              </select>
              {(link.href === 'CUSTOM' || !predefinedRoutes.find(r => r.value === link.href)) && (
                <input 
                  type="text" 
                  value={link.href === 'CUSTOM' ? '' : link.href} 
                  onChange={(e) => handleNavLinkChange(index, 'href', e.target.value)} 
                  placeholder="Enter custom URL (e.g., /#contact)" 
                  className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                />
              )}
            </div>
            <button 
              type="button" 
              onClick={() => removeNavLink(index)} 
              className="text-red-500 hover:text-red-700 text-xs font-semibold self-end pb-1"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button 
        type="button" 
        onClick={addNavLink} 
        className="mt-2 px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
      >
        Add Nav Link
      </button>
    </div>
  );
};

// Navbar Images Controls - Logo and White Logo
const NavbarImagesControls = ({ currentData, onControlsChange, themeColors, onOpenIconModal }) => {
  const handleLogoFileChange = (field, file) => {
    if (!file) return;
    const currentLogoState = currentData[field] || {};
    if (currentLogoState?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentLogoState.url);
    }
    const fileURL = URL.createObjectURL(file);
    onControlsChange({ 
      ...currentData,
      [field]: { 
        file, 
        url: fileURL, 
        name: file.name, 
        originalUrl: currentLogoState?.originalUrl || (field === 'logo' ? "/assets/images/hero/clipped.png" : "")
      } 
    });
  };

  const handleLogoUrlChange = (field, urlValue) => {
    const currentLogoState = currentData[field] || {};
    if (currentLogoState?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(currentLogoState.url);
    }
    onControlsChange({ 
      ...currentData,
      [field]: { 
        file: null, 
        url: urlValue, 
        name: urlValue.split('/').pop(),
        originalUrl: urlValue
      } 
    });
  };

  const getDisplayUrl = (logoState) => {
    if (!logoState) return '';
    if (typeof logoState === 'string') return logoState;
    if (logoState.file && logoState.url && logoState.url.startsWith('blob:')) return logoState.url;
    return logoState.url || '';
  };

  return (
    <div className="p-4 space-y-6 bg-white rounded-md">
      {/* Main Logo */}
      <div className="border p-3 rounded-md bg-white shadow-sm">
        <label className="block text-sm font-medium text-gray-700">Logo:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => handleLogoFileChange('logo', e.target.files?.[0])} 
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
        />
        <input 
          type="text" 
          placeholder="Or paste image URL" 
          value={getDisplayUrl(currentData.logo) === currentData.logo?.file?.name ? '' : getDisplayUrl(currentData.logo)} 
          onChange={(e) => handleLogoUrlChange('logo', e.target.value)} 
          className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
        />
        {getDisplayUrl(currentData.logo) && (
          <img 
            src={getDisplayUrl(currentData.logo)} 
            alt="Logo Preview" 
            className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-100 rounded" 
          />
        )}
      </div>

      {/* White Logo */}
      <div className="border p-3 rounded-md bg-white shadow-sm">
        <label className="block text-sm font-medium text-gray-700">White Logo (for dark unscrolled backgrounds):</label>
        <div className="flex items-center space-x-2 mt-1">
          <button 
            type="button"
            onClick={() => onOpenIconModal('whiteLogoIcon', currentData.whiteLogoIcon, 'navbar')}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Select Icon
          </button>
          {!currentData.whiteLogoIcon && <span className="text-sm text-gray-600">OR Upload Image:</span>}
        </div>

        {currentData.whiteLogoIcon ? (
          <div className="mt-2 p-2 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-700">
              Selected Icon: <strong>{currentData.whiteLogoIcon.pack} - {currentData.whiteLogoIcon.name}</strong>
              <button 
                type="button" 
                onClick={() => onControlsChange({ ...currentData, whiteLogoIcon: null })} 
                className="text-red-500 hover:text-red-700 text-xs ml-2 font-semibold"
              >
                (Clear Icon & Use Image Instead)
              </button>
            </p>
          </div>
        ) : (
          <>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleLogoFileChange('whiteLogo', e.target.files?.[0])} 
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
            <input 
              type="text" 
              placeholder="Or paste image URL" 
              value={getDisplayUrl(currentData.whiteLogo) === currentData.whiteLogo?.file?.name ? '' : getDisplayUrl(currentData.whiteLogo)} 
              onChange={(e) => handleLogoUrlChange('whiteLogo', e.target.value)} 
              className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
            {getDisplayUrl(currentData.whiteLogo) && (
              <img 
                src={getDisplayUrl(currentData.whiteLogo)} 
                alt="White Logo Preview" 
                className="mt-2 h-12 w-auto object-contain border p-1 bg-gray-700 rounded" 
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Navbar Color Controls
const NavbarColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ ...currentData, [fieldName]: value });
  };

  return (
    <div className="p-4 space-y-4 bg-white rounded-md">
      <h3 className="text-sm font-semibold mb-3">Navbar Color Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Unscrolled Background:"
          currentColorValue={currentData.unscrolledBackgroundColor || 'bg-transparent'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange('unscrolledBackgroundColor', value)}
          fieldName="unscrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Scrolled Background:"
          currentColorValue={currentData.scrolledBackgroundColor || 'bg-banner'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange('scrolledBackgroundColor', value)}
          fieldName="scrolledBackgroundColor"
        />
        <ThemeColorPicker
          label="Dropdown Background:"
          currentColorValue={currentData.dropdownBackgroundColor || 'bg-white'}
          themeColors={themeColors}
          onColorChange={(fieldName, value) => handleColorChange('dropdownBackgroundColor', value)}
          fieldName="dropdownBackgroundColor"
        />
        <div>
          <label className="block text-sm font-medium text-gray-700">Dropdown Text Color:</label>
          <input 
            type="text" 
            value={currentData.dropdownTextColor || ''} 
            onChange={(e) => handleColorChange('dropdownTextColor', e.target.value)} 
            placeholder="e.g., text-black" 
            className="mt-1 block w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm"
          />
        </div>
        <div className="md:col-span-2 flex items-center mt-1">
          <input 
            type="checkbox" 
            checked={currentData.useWhiteHamburger || false} 
            onChange={(e) => handleColorChange('useWhiteHamburger', e.target.checked)} 
            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="text-sm font-medium text-gray-700">Use White Hamburger Icon</label>
        </div>
      </div>
    </div>
  );
};

// Navbar Styling Controls
const NavbarStylingControls = ({ currentData, onControlsChange, previewNavbarAsScrolled, setPreviewNavbarAsScrolled }) => {
  const handleAnimationChange = (field, value) => {
    const updatedAnimation = { ...currentData.animation, [field]: value };
    onControlsChange({ ...currentData, animation: updatedAnimation });
  };

  const handleSizeConfigChange = (sizeType, breakpoint, property, value) => {
    const currentSizes = currentData[sizeType] || {};
    const currentBreakpoint = currentSizes[breakpoint] || {};
    const updatedSizes = {
      ...currentSizes,
      [breakpoint]: { ...currentBreakpoint, [property]: value }
    };
    onControlsChange({ ...currentData, [sizeType]: updatedSizes });
  };

  const animation = currentData.animation || {};

  return (
    <div className="p-4 space-y-6 bg-white rounded-md">
      {/* Preview Mode Toggle */}
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

      {/* Animation Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Animation Settings:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Natural Offset (vh):</label>
            <input 
              type="number" 
              value={animation.naturalOffsetVh || 11} 
              onChange={(e) => handleAnimationChange('naturalOffsetVh', parseFloat(e.target.value))} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Slide Up Distance (vh):</label>
            <input 
              type="number" 
              value={animation.slideUpDistanceVh || 0} 
              onChange={(e) => handleAnimationChange('slideUpDistanceVh', parseFloat(e.target.value))} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Logo Size Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Logo Size Settings:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600">Unscrolled Width:</label>
            <input 
              type="text" 
              value={animation.logoSizeUnscrolled?.width || '18vh'} 
              onChange={(e) => handleAnimationChange('logoSizeUnscrolled', { ...animation.logoSizeUnscrolled, width: e.target.value })} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Unscrolled Height:</label>
            <input 
              type="text" 
              value={animation.logoSizeUnscrolled?.height || '18vh'} 
              onChange={(e) => handleAnimationChange('logoSizeUnscrolled', { ...animation.logoSizeUnscrolled, height: e.target.value })} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Scrolled Width:</label>
            <input 
              type="text" 
              value={animation.logoSizeScrolled?.width || '14vh'} 
              onChange={(e) => handleAnimationChange('logoSizeScrolled', { ...animation.logoSizeScrolled, width: e.target.value })} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">Scrolled Height:</label>
            <input 
              type="text" 
              value={animation.logoSizeScrolled?.height || '14vh'} 
              onChange={(e) => handleAnimationChange('logoSizeScrolled', { ...animation.logoSizeScrolled, height: e.target.value })} 
              className="mt-1 block w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded-md shadow-sm sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className="flex items-center mt-4">
        <input 
          type="checkbox" 
          checked={currentData.invertLogoColor || false} 
          onChange={(e) => onControlsChange({ ...currentData, invertLogoColor: e.target.checked })} 
          className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label className="text-sm font-medium text-gray-700">Invert Logo Color</label>
      </div>
    </div>
  );
};
