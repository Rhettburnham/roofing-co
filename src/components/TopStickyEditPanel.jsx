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
    EditorPanelComponent, // The original EditorPanel for the block
    config,
    onPanelChange,
    themeColors,
    tabsConfig, // Expected: { images: Func, colors: Func, styling: Func }
    // Add any other specific props a block's panel might need
    onDataChange, // Keep for potential direct use by some legacy or specific tabs
    currentBannerColor, // Keep for potential direct use
  } = activeBlockData || {};

  // Define the standard order of tabs
  const standardTabOrder = ['images', 'colors', 'styling'];

  const availableTabKeys = [
    tabsConfig?.images && typeof tabsConfig.images === 'function' ? 'images' : null,
    tabsConfig?.colors && typeof tabsConfig.colors === 'function' ? 'colors' : null,
    tabsConfig?.styling && typeof tabsConfig.styling === 'function' ? 'styling' : null,
  ].filter(Boolean);

  const sortedTabKeys = [...availableTabKeys];

  useEffect(() => {
    if (activeBlockData?.blockName !== prevBlockNameRef.current || !availableTabKeys.includes(activeTab)) {
      // If block changes, or current activeTab is no longer available, set to the first available preferred tab or first available tab.
      const firstAvailable = sortedTabKeys.find(key => availableTabKeys.includes(key));
      if (firstAvailable) {
        setActiveTab(firstAvailable);
      } else if (availableTabKeys.length > 0) {
        setActiveTab(availableTabKeys[0]); // Fallback to the first available tab if no preferred ones are present
      } else {
        setActiveTab('images'); // Default if no tabs are available (should be rare)
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
              localData={config}
              onPanelChange={onPanelChange}
              themeColors={themeColors}
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
    });

    console.log('[TopStickyEditPanel] Rendered content for tab', activeTab, ':', content ? 'Exists' : 'null/undefined');
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
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 text-white flex-shrink-0">
        <span className="font-semibold text-lg">Editing: {blockName}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-gray-700"
          aria-label="Close edit panel"
        >
          <X size={22} />
        </button>
      </div>

      <div className="bg-gray-100 border-b border-gray-300 flex-shrink-0">
        <nav className="flex px-1 sm:px-2" aria-label="Tabs">
          {availableAndSortedTabs.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`capitalize whitespace-nowrap py-2 sm:py-3 px-3 sm:px-5 text-sm font-medium focus:outline-none transition-all duration-150 ease-in-out
                ${activeTab === tabName
                  ? 'text-blue-600 border-b-2 border-blue-600 animate-pulse-text-blue'
                  : 'text-gray-600 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-300 bg-white hover:bg-gray-50'
                }
              `}
              // Add a simple CSS animation for the pulse effect on text color
              // This will be defined in a global CSS or a style tag if necessary.
              // For now, 'animate-pulse-text-blue' is a placeholder for such a class.
            >
              {tabName}
            </button>
          ))}
        </nav>
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
  }),
};

export default TopStickyEditPanel; 