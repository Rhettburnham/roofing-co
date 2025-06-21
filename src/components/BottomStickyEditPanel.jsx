import React, { useState, useEffect, useRef, forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import PreviewStateController from './common/PreviewStateController';

const CheckIcon = () => (
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
      d="M4.5 12.75l6 6 9-13.5"
    />
  </svg>
);

const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
);

// This function is now outside the component to avoid being part of the render cycle's hook logic
const getTabContent = (key, activeBlockData) => {
  if (!activeBlockData || !activeBlockData.tabsConfig || !activeBlockData.tabsConfig[key]) {
    return null;
  }
  const tabConfig = activeBlockData.tabsConfig[key];
  return tabConfig({
    currentData: activeBlockData.config,
    onControlsChange: activeBlockData.onPanelChange,
    themeColors: activeBlockData.themeColors,
    sitePalette: activeBlockData.sitePalette,
  });
};

const BottomStickyEditPanel = forwardRef(({ 
  isOpen, 
  onClose, 
  activeBlockData, 
  onConfirm, 
  forcedPreviewStates = {},
  onPreviewStateChange,
}, ref) => {
  // Start with the first available tab instead of defaulting to 'general'
  const getInitialTab = () => {
    if (activeBlockData?.tabsConfig) {
      const availableTabs = Object.keys(activeBlockData.tabsConfig);
      return availableTabs.length > 0 ? availableTabs[0] : 'general';
    }
    return 'general';
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const panelRef = useRef(null);
  
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [activeBlockData?.key]);

  const blockName = activeBlockData?.blockName || 'Block';
  const onUndo = activeBlockData?.onUndo;
  
  const getPreviewOptions = () => {
    if (!activeBlockData || !activeBlockData.blockName) return null;
    
    switch (activeBlockData.blockName) {
      case 'Navbar':
        return {
          label: 'Preview State',
          options: [
            { label: 'Unscrolled', value: 'unscrolled' },
            { label: 'Scrolled', value: 'scrolled' },
          ],
          value: forcedPreviewStates.Navbar || 'unscrolled',
          onChange: (value) => onPreviewStateChange && onPreviewStateChange('Navbar', value),
        };
      case 'HeroBlock':
        return {
          label: 'Preview State',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Shrunk', value: 'shrunk' },
          ],
          value: forcedPreviewStates.HeroBlock || 'normal',
          onChange: (value) => onPreviewStateChange && onPreviewStateChange('HeroBlock', value),
        };
      case 'MainPageHeroBlock':
        return {
          label: 'Preview State',
          options: [
            { label: 'Neutral', value: 'neutral' },
            { label: 'Residential', value: 'residential' },
            { label: 'Commercial', value: 'commercial' },
          ],
          value: forcedPreviewStates.MainPageHeroBlock || 'neutral',
          onChange: (value) => onPreviewStateChange && onPreviewStateChange('MainPageHeroBlock', value),
        };
      case 'SimpleHeroBlock':
        return {
          label: 'Preview State',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Shrunk', value: 'shrunk' },
            { label: 'With Animations', value: 'animated' },
          ],
          value: forcedPreviewStates.SimpleHeroBlock || 'normal',
          onChange: (value) => onPreviewStateChange && onPreviewStateChange('SimpleHeroBlock', value),
        };
      default:
        return null;
    }
  };

  const memoizedGetTabContent = useCallback((key) => getTabContent(key, activeBlockData), [activeBlockData]);

  if (!isOpen) {
    return null;
  }

  // Generic GeneralPanel for blocks without specific general settings
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
    if (!activeBlockData?.tabsConfig || !activeBlockData.tabsConfig[activeTab]) {
      // Fallback for blocks that may not have a 'general' tab or any tabs
      if (activeBlockData?.tabsConfig && Object.keys(activeBlockData.tabsConfig).length > 0) {
        const firstTab = Object.keys(activeBlockData.tabsConfig)[0];
        if(activeTab !== firstTab) setActiveTab(firstTab);
        return memoizedGetTabContent(firstTab);
      }
      return <GeneralPanel config={activeBlockData?.config} onPanelChange={activeBlockData?.onPanelChange} blockName={blockName} />;
    }
    return memoizedGetTabContent(activeTab);
  };
  
  const previewOptions = getPreviewOptions();

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        zIndex: 1040, // Ensure it's above other content
        backgroundColor: '#F9FAFB', // bg-gray-50
        boxShadow: '0 -4px 12px rgba(0,0,0,0.15)', // Shadow on top
        transition: 'transform 0.3s ease-in-out',
        transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        borderTop: '1px solid #E5E7EB', // border-top
        maxHeight: '70vh', // Max height for the panel
        display: 'flex',
        flexDirection: 'column',
      }}
      className="bottom-sticky-edit-panel"
    >
      <div className="flex flex-row items-center justify-between bg-black border-gray-300 flex-shrink-0 px-4">
        
        <div className="flex items-center gap-4">
            {previewOptions && (
              <PreviewStateController
                label={previewOptions.label}
                options={previewOptions.options}
                value={previewOptions.value}
                onChange={previewOptions.onChange}
              />
            )}
        </div>
        
        <div className="flex items-center">
          <div className="border-b border-black flex-grow">
            <nav className="-mb-px flex -space-x-3" aria-label="Tabs">
              {Object.keys(activeBlockData?.tabsConfig || {}).map((tabName) => (
                <button
                  key={tabName}
                  onClick={() => setActiveTab(tabName)}
                  className={`
                    whitespace-nowrap py-2 px-6 border-b-2 font-medium text-sm capitalize
                    ${activeTab === tabName
                      ? 'border-blue-500 text-left text-white font-bold bg-banner rounded-t-lg shadow-xl '
                      : 'border-transparent text-black fotn-semibold hover:text-gray-700 bg-blue-50 rounded-t-lg shadow-xl hover:border-gray-300'
                    }
                  `}
                >
                  {tabName}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-2 shadow-lg transition-colors"
                title="Undo Changes"
              >
                <UndoIcon />
              </button>
            )}
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow-lg transition-colors"
                title="Finish Editing"
              >
                <CheckIcon />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-white text-[3vh] md:text-[6vw] text-bold hover:text-white p-1 rounded-full hover:bg-gray-700"
              aria-label="Close edit panel"
            >
              <X size={22} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="panel-content overflow-y-auto flex-grow bg-white">
        {renderTabContent()}
      </div>
    </div>
  );
});

BottomStickyEditPanel.displayName = 'BottomStickyEditPanel';

BottomStickyEditPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  activeBlockData: PropTypes.object,
  onConfirm: PropTypes.func,
  forcedPreviewStates: PropTypes.object,
  onPreviewStateChange: PropTypes.func,
};

export default BottomStickyEditPanel; 