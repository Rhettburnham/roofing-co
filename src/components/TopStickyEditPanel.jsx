import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

const TopStickyEditPanel = ({ isOpen, onClose, activeBlockData }) => {
  // Log received props
  useEffect(() => {
    if (isOpen) {
      console.log('[TopStickyEditPanel] Received activeBlockData:', JSON.stringify(activeBlockData, (k,v) => {
        if (typeof v === 'function') return `Function: ${v.name || 'anonymous'}`;
        if (k === 'EditorPanelComponent' && v) return `Component: ${v.displayName || v.name || 'UnknownComponent'}`;
        return v;
      }, 2));
    }
  }, [isOpen, activeBlockData]);

  const [activeTab, setActiveTab] = useState('images'); // Default tab
  const prevBlockNameRef = useRef(null); // To track changes in blockName

  const {
    blockName = 'Block',
    EditorPanelComponent, // The original EditorPanel for the block -- these shoudl be elimianted for the new standard verison
    config,
    onPanelChange,
    themeColors,
    tabsConfig, // Expected: { images: Func, colors: Func, styling: Func }
    // Add any other specific props a block's panel might need
    onDataChange, // Keep for potential direct use by some legacy or specific tabs
    currentBannerColor, // Keep for potential direct use
    // New props for PanelStylingController variants
    animationDurationOptions, // For ButtonBlock animation duration ranges
    buttonSizeOptions, // For ButtonBlock button size options
  } = activeBlockData || {};

  // Define the standard order of tabs
  const standardTabOrder = ['general', 'images', 'colors', 'styling'];

  const availableTabKeys = [
    tabsConfig?.general && typeof tabsConfig.general === 'function' ? 'general' : null,
    tabsConfig?.images && typeof tabsConfig.images === 'function' ? 'images' : null,
    tabsConfig?.colors && typeof tabsConfig.colors === 'function' ? 'colors' : null,
    tabsConfig?.styling && typeof tabsConfig.styling === 'function' ? 'styling' : null,
  ].filter(Boolean);

  const sortedTabKeys = [...availableTabKeys];

  // DEBUG: Log available tabs and config
  useEffect(() => {
    if (isOpen && activeBlockData) {
      console.log("[TopStickyEditPanel] DEBUG: Available tabs analysis:", {
        blockName: activeBlockData.blockName,
        hasTabsConfig: !!tabsConfig,
        tabsConfigKeys: tabsConfig ? Object.keys(tabsConfig) : [],
        availableTabKeys,
        activeTab,
        configStyling: activeBlockData.config?.styling
      });
    }
  }, [isOpen, activeBlockData, tabsConfig, availableTabKeys, activeTab]);

  useEffect(() => {
    if (activeBlockData?.blockName !== prevBlockNameRef.current || !availableTabKeys.includes(activeTab)) {
      // If block changes, or current activeTab is no longer available, set to the first available preferred tab or first available tab.
      const firstAvailable = sortedTabKeys.find(key => availableTabKeys.includes(key));
      if (firstAvailable) {
        setActiveTab(firstAvailable);
      } else if (availableTabKeys.length > 0) {
        setActiveTab(availableTabKeys[0]); // Fallback to the first available tab if no preferred ones are present
      } else {
        setActiveTab('general'); // Default if no tabs are available (should be rare)
      }
    }
    prevBlockNameRef.current = activeBlockData?.blockName;
  }, [activeBlockData?.blockName, activeBlockData?.tabsConfig, activeTab, sortedTabKeys, availableTabKeys]); // Added availableTabKeys and sortedTabKeys

  if (!isOpen) {
    return (
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 1040, // High z-index
          height: '0px',
          transform: 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out, height 0.3s ease-in-out 0.3s',
          overflow: 'hidden',
          backgroundColor: '#F9FAFB', // bg-gray-50
        }}
      />
    );
  }

  // Generic GeneralPanel for general settings - now more flexible
  const GeneralPanel = ({ config, onPanelChange, blockName }) => {
    // Handle different block types with their specific general settings
    if (blockName === 'BookingBlock') {
      const socialIconLocation = config?.socialIconLocation || 'above';
      return (
        <div className="p-4 space-y-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">General Settings</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Social Media Icon Location:</label>
            <select
              value={socialIconLocation}
              onChange={e => onPanelChange({ ...config, socialIconLocation: e.target.value })}
              className="w-full bg-gray-100 px-3 py-2 rounded text-sm border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="above">Above Form</option>
              <option value="below">Below Form</option>
              <option value="hidden">Hidden</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">Controls where the social media icons appear in the BookingBlock.</p>
          </div>
        </div>
      );
    }
    
    // Default general panel for blocks without specific general settings
    return (
      <div className="p-4 space-y-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">General Settings</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">⚙️</div>
          <p className="mb-2">No general settings available</p>
          <p className="text-sm">This block uses the dedicated general tab for content management.</p>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    console.log('[TopStickyEditPanel] renderTabContent called. Active Tab:', activeTab, 'TabsConfig:', tabsConfig);
    if (!tabsConfig || typeof tabsConfig[activeTab] !== 'function') {
      console.log('[TopStickyEditPanel] No specific tab content for', activeTab, '. Trying EditorPanelComponent.');
      // If no specific tab content, try to render the original EditorPanelComponent
      // This is a fallback if a block hasn't been updated with the new tab structure.
      if (EditorPanelComponent) {
        console.log('[TopStickyEditPanel] Rendering EditorPanelComponent:', EditorPanelComponent.displayName || EditorPanelComponent.name);
        return (
          <div className="p-4 bg-white">
            <EditorPanelComponent
              currentConfig={config}
              onPanelConfigChange={onPanelChange}
              onPanelFileChange={activeBlockData?.onFileChange}
              themeColors={themeColors}
              getDisplayUrl={activeBlockData?.getDisplayUrl}
              // RichTextBlock specific props - pass them if available
              onDataChange={onDataChange}
              currentBannerColor={currentBannerColor}
            />
          </div>
        );
      }
      console.log('[TopStickyEditPanel] No EditorPanelComponent available either.');
      return <div className="p-6 text-center text-gray-500">No content configured for this tab.</div>;
    }

    const TabContentRenderer = tabsConfig[activeTab];
    console.log('[TopStickyEditPanel] Attempting to render tab content using:', TabContentRenderer.name || 'anonymous function');
    const content = TabContentRenderer({ // Pass necessary props to the tab content function
      config,
      onPanelChange, // Or a more specific part of it if tabs manage sub-sections of config
      themeColors,
      // RichTextBlock specific props, ensure they are available if needed by the tab
      onDataChange: blockName === 'RichTextBlock' ? onDataChange : undefined,
      currentBannerColor: blockName === 'RichTextBlock' ? currentBannerColor : undefined,
      // New props for PanelStylingController variants
      animationDurationOptions: blockName === 'ButtonBlock' ? animationDurationOptions : undefined,
      buttonSizeOptions: blockName === 'ButtonBlock' ? buttonSizeOptions : undefined,
    });

    console.log('[TopStickyEditPanel] Rendered content for tab', activeTab, ':', content ? 'Exists' : 'null/undefined');
    
    // Special handling for general tab when using legacy GeneralPanel
    if (activeTab === 'general' && blockName === 'BookingBlock' && !content) {
      return <GeneralPanel config={config} onPanelChange={onPanelChange} blockName={blockName} />;
    }
    
    return content ? <div className="p-4 bg-white">{content}</div> : <div className="p-6 text-center text-gray-500">No content available for this section.</div>;
  };

  // Filter and sort tabs: Only show standard tabs if they are defined in tabsConfig
  const availableAndSortedTabs = standardTabOrder.filter(key => tabsConfig && typeof tabsConfig[key] === 'function');

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 1040, // Ensure it's above other content, including Navbar preview
        backgroundColor: '#F9FAFB', // bg-gray-50
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s ease-in-out, height 0.3s ease-in-out',
        transform: 'translateY(0)',
        borderBottom: '1px solid #E5E7EB', // border-gray-200
        maxHeight: '70vh', // Max height for the panel
        display: 'flex',
        flexDirection: 'column',
      }}
      className="top-sticky-edit-panel"
    >

      <div className=" flex flex-row items-center justify-between bg-black border-gray-300 flex-shrink-0">
        <button
            type="button"
            onClick={onClose}
            className="text-white text-[3vh] md:text-[6vw] text-bold hover:text-white p-1 rounded-full hover:bg-gray-700"
            aria-label="Close edit panel"
          >
            <X size={22} />
        </button>
        <div className="border-b border-black">
          <nav className="-mb-px flex -space-x-3 px-4" aria-label="Tabs">
            {availableAndSortedTabs.map((tabName) => (
              <button
                key={tabName}
                onClick={() => setActiveTab(tabName)}
                className={`
                  whitespace-nowrap py-2 px-6 border-b-2 font-medium text-sm capitalize
                  ${activeTab === tabName
                    ? 'border-blue-500 ml-2 text-left text-white font-bold bg-banner rounded-t-lg shadow-xl '
                    : 'border-transparent text-black fotn-semibold hover:text-gray-700 bg-blue-50 rounded-t-lg shadow-xl hover:border-gray-300'
                  }
                `}
              >
                {tabName}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div className="panel-content overflow-y-auto flex-grow bg-white">
        {renderTabContent()}
      </div>
    </div>
  );
};

TopStickyEditPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeBlockData: PropTypes.shape({
    blockName: PropTypes.string,
    EditorPanelComponent: PropTypes.elementType,
    config: PropTypes.object,
    onPanelChange: PropTypes.func,
    themeColors: PropTypes.object,
    tabsConfig: PropTypes.object, // Changed to PropTypes.object for more dynamic keys
    // Props for RichTextBlock's EditorPanel (RichTextControlsPanel)
    onDataChange: PropTypes.func, // Specifically for RichTextBlock's onDataChange (or other blocks if needed)
    currentBannerColor: PropTypes.string, // Specifically for RichTextBlock (or other blocks if needed)
    // New props for PanelStylingController variants
    animationDurationOptions: PropTypes.object, // For ButtonBlock animation duration ranges
    buttonSizeOptions: PropTypes.object, // For ButtonBlock button size options
  }),
};

export default TopStickyEditPanel; 