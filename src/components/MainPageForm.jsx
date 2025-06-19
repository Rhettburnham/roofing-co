import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
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
import IconSelectorModal from "./common/IconSelectorModal";
import { cloneConfigStripFiles } from '../utils/blockUtils';
import PanelFontController from "./common/PanelFontController";
import BlockEditControl from "./common/BlockEditControl";
import EditingOverlay from "./common/EditingOverlay";
import BlockListEditor from "./common/BlockListEditor";

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

// Iframe component for true mobile preview
const IframePreview = ({ children }) => {
  const iframeRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      
      // Basic HTML structure
      doc.open();
      doc.write('<!DOCTYPE html><html><head></head><body><div id="root"></div></body></html>');
      doc.close();

      // Find all style and link elements from the parent document's head
      const parentHead = document.head;
      const styles = parentHead.querySelectorAll('style, link[rel="stylesheet"]');
      
      // Append cloned styles to the iframe's head
      styles.forEach(style => {
        doc.head.appendChild(style.cloneNode(true));
      });
      
      setMountNode(doc.getElementById('root'));
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Mobile Preview"
      style={{ width: '100%', height: '100%', border: 'none' }}
    >
      {mountNode && ReactDOM.createPortal(children, mountNode)}
    </iframe>
  );
};
IframePreview.propTypes = {
  children: PropTypes.node.isRequired,
};

// Mapping block names to components for dynamic rendering
const blockComponentMap = {
  HeroBlock: { component: HeroBlockLazy, tabsConfig: HeroBlock.tabsConfig },
  ButtonBlock: { component: ButtonBlockLazy, tabsConfig: ButtonBlock.tabsConfig },
  RichTextBlock: { component: RichTextBlockLazy, tabsConfig: RichTextBlock.tabsConfig },
  EmployeesBlock: { component: EmployeesBlockLazy, tabsConfig: EmployeesBlock.tabsConfig },
  BasicMapBlock: { component: BasicMapBlockLazy, tabsConfig: BasicMapBlock.tabsConfig },
  ServiceSliderBlock: { component: ServiceSliderBlockLazy, tabsConfig: ServiceSliderBlock.tabsConfig },
  TestimonialBlock: { component: TestimonialBlockLazy, tabsConfig: TestimonialBlock.tabsConfig },
  BeforeAfterBlock: { component: BeforeAfterBlockLazy, tabsConfig: BeforeAfterBlock.tabsConfig },
  BookingBlock: { component: BookingBlockLazy, tabsConfig: BookingBlock.tabsConfig },
};

/**
 * MainPageForm is a presentational component for editing the main page.
 * It displays the UI and passes changes upward via setFormData.
 */
const MainPageForm = ({
  formData,
  navbarData: navbarDataProp,
  onNavbarChange,
  singleBlockMode = null,
  themeColors,
  sitePalette,
  initialFormData = null,
  editingTarget,
  onStartEditing,
  onBlockConfigChange,
  onUndoBlock,
  onSaveBlock,
}) => {
  const [navbarConfig, setNavbarConfig] = useState(null);
  const [initialNavbarConfig, setInitialNavbarConfig] = useState(null);
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [iconModalTargetField, setIconModalTargetField] = useState(null);
  const [currentIconForModal, setCurrentIconForModal] = useState(null);
  const blockRefs = useRef({});

  // Get the preview state for the navbar from the parent
  const previewNavbarAsScrolled = formData.forcedPreviewStates?.Navbar === 'scrolled';

  const handleOpenIconModal = useCallback(
    (
      fieldId,
      currentIcon,
      source = "block",
      blockKeyForCardIcon = null,
      cardIndexForIcon = null
    ) => {
      setIconModalTargetField({
        id: fieldId,
        source,
        blockKey: blockKeyForCardIcon,
        cardIndex: cardIndexForIcon,
      });
      setCurrentIconForModal(currentIcon);
      setIsIconModalOpen(true);
    },
    [setIconModalTargetField, setCurrentIconForModal, setIsIconModalOpen]
  );

  const handleIconSelection = useCallback(
    (pack, iconName) => {
      if (iconModalTargetField) {
        const { id, source, blockKey, cardIndex } = iconModalTargetField;

        const currentBlock = formData.mainPageBlocks.find(b => b.uniqueKey === blockKey);
        if (!currentBlock) return;

        let newConfig = { ...currentBlock.config };

        if (
          source === "block" &&
          blockKey &&
          cardIndex !== null &&
          id.startsWith("card-")
        ) {
          const newCards = (newConfig.cards || []).map((card, idx) => {
            if (idx === cardIndex) {
              return { ...card, icon: iconName, iconPack: pack };
            }
            return card;
          });
          newConfig.cards = newCards;
        }
        
        onBlockConfigChange(blockKey, newConfig);
      }
      setIsIconModalOpen(false);
      setIconModalTargetField(null);
      setCurrentIconForModal(null);
    },
    [
      iconModalTargetField,
      formData,
      onBlockConfigChange,
    ]
  );

  const handleStartEditingBlock = (blockKey) => {
    const blockToEdit = formData.mainPageBlocks?.find(
      (b) => b.uniqueKey === blockKey
    );

    if (blockToEdit) {
      const BlockComponent = blockComponentMap[blockToEdit.blockName];
      const blockConfig = blockToEdit.config || {};
      
      const onConfigChange = (newConf) => onBlockConfigChange(blockKey, newConf);

      let panelTabsConfig = null;
      if (BlockComponent && typeof BlockComponent.tabsConfig === 'function') {
        panelTabsConfig = BlockComponent.tabsConfig(blockConfig, onConfigChange, themeColors, sitePalette);
      } else if (blockToEdit.blockName === 'HeroBlock' && typeof HeroBlock.tabsConfig === 'function') {
        // Special case for HeroBlock which isn't lazy loaded in the map the same way
        panelTabsConfig = HeroBlock.tabsConfig(blockConfig, onConfigChange, themeColors, sitePalette);
      }
      
      onStartEditing({
        type: 'main',
        key: blockKey,
        blockName: blockToEdit.blockName,
        config: blockConfig,
        onPanelChange: onConfigChange,
        onUndo: () => onUndoBlock(blockKey),
        onSave: () => onSaveBlock(blockKey, blockConfig),
        tabsConfig: panelTabsConfig,
        themeColors,
        sitePalette,
      });

      // Scroll to block
      setTimeout(() => {
        const blockElement = blockRefs.current[blockKey]?.current;
        if (blockElement) {
          const blockTop = blockElement.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: blockTop - 100, // Adjust for sticky header/panel
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  };

  const handleStartEditingNavbar = () => {
    onStartEditing({
      type: 'navbar',
      key: 'navbar',
      blockName: "Navbar",
      config: navbarConfig,
      onPanelChange: handleNavbarConfigChange,
      onUndo: () => {
        const initial = cloneConfigStripFiles(initialNavbarConfig);
        setNavbarConfig(initial);
        if (onNavbarChange) onNavbarChange(initial);
      },
      onSave: () => { /* No-op, changes are live */ },
      tabsConfig: Navbar.tabsConfig(navbarConfig, handleNavbarConfigChange, themeColors, sitePalette),
      themeColors,
      sitePalette,
    });
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
      }
    };
    loadNavbarConfig();
  }, [navbarDataProp, initialNavbarConfig]);

  const handleNavbarConfigChange = useCallback(
    (changedFields) => {
      setNavbarConfig((prevConfig) => {
        const newConfig = { ...prevConfig, ...changedFields };
        if (onNavbarChange && typeof onNavbarChange === 'function') {
          onNavbarChange(newConfig);
        }
        return newConfig;
      });
    },
    [onNavbarChange]
  );
  
  const getLastSavedConfig = (blockKey) => {
    const block = (initialFormData?.mainPageBlocks || []).find(b => b.uniqueKey === blockKey);
    return block ? block.config : null;
  };

  if (singleBlockMode) {
    const singleBlock = formData.mainPageBlocks.find(
      (b) => b.blockName === singleBlockMode
    );
    if (!singleBlock) {
      return <div>Block '{singleBlockMode}' not found.</div>;
    }

    const singleBlockKey = singleBlock.uniqueKey || `${singleBlock.blockName}_fallbackKey_single`;

    return (
      <div className="p-4">
         <BlockListEditor
            blocks={[singleBlock]}
            pageType="main"
            blockComponentMap={blockComponentMap}
            editingTarget={editingTarget}
            onStartEditing={onStartEditing}
            onBlockConfigChange={onBlockConfigChange}
            onUndoBlock={onUndoBlock}
            onSaveBlock={onSaveBlock}
            themeColors={themeColors}
            sitePalette={sitePalette}
            forcedPreviewStates={formData.forcedPreviewStates}
          />
      </div>
    );
  }

  const currentMainPageBlocks = formData.mainPageBlocks || [];
  const previewViewport = formData.previewViewport || 'desktop';
  const containerWidthClass = previewViewport === 'mobile' ? 'max-w-[420px] mx-auto transition-all duration-500 ease-in-out' : 'w-full transition-all duration-500 ease-in-out';

  if (currentMainPageBlocks.length === 0 && !singleBlockMode) {
    return (
      <div className="p-4 text-center">Loading form data... (Main Form)</div>
    );
  }

  return (
    <div>
      <div
        ref={(el) => (blockRefs.current['navbar'] = { current: el })}
        className={`relative border ${editingTarget?.key === 'navbar' ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
        style={{ zIndex: (currentMainPageBlocks.length + 1) * 10 }}
      >
        {editingTarget?.key !== 'navbar' && (
          <BlockEditControl onToggleEdit={() => handleStartEditingNavbar()} isEditing={false} />
        )}
        <div id="block-content-navbar" className="transition-all duration-300">
          <Suspense fallback={<div>Loading Navbar...</div>}>
            <NavbarLazy
              config={navbarConfig}
              isPreview={true}
              isEditingPreview={editingTarget?.key === 'navbar'}
              onTitleChange={(title) => handleNavbarConfigChange({ title })}
              onSubtitleChange={(subtitle) => handleNavbarConfigChange({ subtitle })}
              forceScrolledState={previewNavbarAsScrolled}
              onIconSelect={handleIconSelection}
            />
          </Suspense>
        </div>
      </div>
      <BlockListEditor
        blocks={currentMainPageBlocks}
        pageType="main"
        blockComponentMap={blockComponentMap}
        editingTarget={editingTarget}
        onStartEditing={onStartEditing}
        onBlockConfigChange={onBlockConfigChange}
        onUndoBlock={onUndoBlock}
        onSaveBlock={onSaveBlock}
        themeColors={themeColors}
        sitePalette={sitePalette}
        forcedPreviewStates={formData.forcedPreviewStates}
      />
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
  navbarData: PropTypes.object,
  onNavbarChange: PropTypes.func,
  singleBlockMode: PropTypes.string,
  themeColors: PropTypes.object,
  sitePalette: PropTypes.array,
  initialFormData: PropTypes.object,
  editingTarget: PropTypes.object,
  onStartEditing: PropTypes.func,
  onBlockConfigChange: PropTypes.func,
  onUndoBlock: PropTypes.func,
  onSaveBlock: PropTypes.func,
};

/* ==============================================
   NAVBAR TAB CONTROL COMPONENTS
   ----------------------------------------------
   Following the standard pattern from BeforeAfterBlock
=============================================== */

// Navbar General Controls - Navigation Links and Basic Text
const NavbarGeneralControls = ({
  currentData,
  onControlsChange,
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

// Navbar Fonts Controls
const NavbarFontsControls = ({ currentData, onControlsChange, themeColors }) => {
  const [viewportMode, setViewportMode] = useState('desktop');

  const handleSettingsChange = (settingsType, newSettings) => {
    onControlsChange({
      [settingsType]: {
        ...currentData[settingsType],
        ...newSettings,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-800">Font Settings</h3>
        <p className="mt-1 text-sm text-gray-500">
          Toggle between desktop and mobile viewport settings.
        </p>
        <div className="mt-4 flex justify-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewportMode === 'desktop'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-300'
            } transition-all duration-200`}
          >
            Desktop
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewportMode === 'mobile'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-300'
            } transition-all duration-200`}
          >
            Mobile
          </button>
        </div>
      </div>

      <div className="space-y-8 p-4 bg-white rounded-lg">
        <PanelFontController
          label="Main Title"
          currentData={currentData.mainTitleTextSettings}
          onControlsChange={(newSettings) => handleSettingsChange('mainTitleTextSettings', newSettings)}
          fieldPrefix={viewportMode}
          themeColors={themeColors}
        />
        <PanelFontController
          label="Subtitle"
          currentData={currentData.subTitleTextSettings}
          onControlsChange={(newSettings) => handleSettingsChange('subTitleTextSettings', newSettings)}
          fieldPrefix={viewportMode}
          themeColors={themeColors}
        />
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

  const parseSize = (sizeStr) => {
    if (typeof sizeStr !== 'string') return 10;
    const match = sizeStr.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 10;
  };

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
              Unscrolled Size (vh): {parseSize(animation.logoSizeUnscrolled?.width || '18vh')}
            </label>
            <input
              type="range"
              min="5"
              max="25"
              value={parseSize(animation.logoSizeUnscrolled?.width || '18vh')}
              onChange={(e) => {
                const size = `${e.target.value}vh`;
                handleAnimationChange("logoSizeUnscrolled", { width: size, height: size });
              }}
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Scrolled Size (vh): {parseSize(animation.logoSizeScrolled?.width || '14vh')}
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={parseSize(animation.logoSizeScrolled?.width || '14vh')}
              onChange={(e) => {
                const size = `${e.target.value}vh`;
                handleAnimationChange("logoSizeScrolled", { width: size, height: size });
              }}
              className="mt-1 block w-full"
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

export { MainPageForm };
