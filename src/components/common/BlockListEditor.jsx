import React, { Suspense, useRef } from 'react';
import PropTypes from 'prop-types';
import BlockEditControl from './BlockEditControl';
import EditingOverlay from './EditingOverlay';

/**
 * BlockListEditor renders a list of blocks and handles the editing UI for them.
 * It's a reusable component to be used by MainPageForm, ServiceEditPage, etc.
 */
const BlockListEditor = ({
  blocks,
  pageType, // e.g., 'main', 'service'
  blockComponentMap,
  editingTarget,
  onStartEditing,
  onBlockConfigChange,
  onUndoBlock,
  onSaveBlock,
  themeColors,
  sitePalette,
  serviceContext, // Only for service pages
  forcedPreviewStates, // Pass down for specific blocks like HeroBlock
}) => {
  const blockRefs = useRef({});

  const handleStartEditingBlock = (blockKey, block) => {
    const blockToEdit = block;
    if (blockToEdit) {
      const blockInfo = blockComponentMap[blockToEdit.blockName];
      const blockConfig = blockToEdit.config || {};
      
      const onConfigChange = (newConf) => onBlockConfigChange(blockKey, newConf, pageType, serviceContext);

      let panelTabsConfig = null;
      if (blockInfo && typeof blockInfo.tabsConfig === 'function') {
        panelTabsConfig = blockInfo.tabsConfig(blockConfig, onConfigChange, themeColors, sitePalette);
      }
      
      onStartEditing({
        type: pageType,
        key: blockKey,
        blockName: blockToEdit.blockName,
        config: blockConfig,
        onPanelChange: onConfigChange,
        onUndo: () => onUndoBlock(blockKey, pageType, serviceContext),
        onSave: () => onSaveBlock(blockKey, blockConfig, pageType),
        tabsConfig: panelTabsConfig,
        themeColors,
        sitePalette,
      });

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

  const getLastSavedConfig = (blockKey) => {
    // This logic might need to be passed in if the source of initial data varies.
    // For now, it's simplified. A more robust implementation might involve a prop.
    return null; // Simplified for now. onUndoBlock in OneForm handles getting initial data.
  };

  return (
    <div>
      {(blocks || []).map((block, index) => {
        const blockKey = block.uniqueKey || `${block.blockName}_${index}`;
        const blockInfo = blockComponentMap[block.blockName];
        const ComponentToRender = blockInfo?.component;
        const isEditingThisBlock = editingTarget?.type === pageType && editingTarget?.key === blockKey;

        if (!ComponentToRender) {
          return (
            <div key={blockKey} className="p-4 text-red-500">
              Unknown block type: {block.blockName}
            </div>
          );
        }

        const blockSpecificPropName =
          {
            HeroBlock: 'heroconfig',
            RichTextBlock: 'richTextData',
            ButtonBlock: 'buttonconfig',
            BasicMapBlock: 'mapData',
            BookingBlock: 'bookingData',
            ServiceSliderBlock: 'config',
            TestimonialBlock: 'config',
            BeforeAfterBlock: 'beforeAfterData',
            EmployeesBlock: 'employeesData',
            AboutBlock: 'aboutData',
            CombinedPageBlock: 'config',
            // Service block props
            GeneralList: 'config',
            VideoCTA: 'config',
            GeneralListVariant2: 'config',
            OverviewAndAdvantagesBlock: 'config',
            ActionButtonBlock: 'config',
            HeaderBannerBlock: 'config',
            PricingGrid: 'config',
            ListDropdown: 'config',
            GridImageTextBlock: 'config',
            ThreeGridWithRichTextBlock: 'config',
            ImageWrapBlock: 'config',
            ShingleSelectorBlock: 'config',
            ListImageVerticalBlock: 'config',
          }[block.blockName] || 'config';

        const componentProps = {
          readOnly: !isEditingThisBlock,
          [blockSpecificPropName]: block.config || {},
          onConfigChange: (newConf) => onBlockConfigChange(blockKey, newConf, pageType, serviceContext),
          themeColors,
          sitePalette,
          lastSavedConfig: getLastSavedConfig(blockKey),
          onUndoBlock: () => onUndoBlock(blockKey, pageType, serviceContext),
          onSaveBlock: (newConfig) => onSaveBlock(blockKey, newConfig, pageType),
        };

        if (block.blockName === 'HeroBlock' && pageType === 'main') {
          componentProps.forcedActiveSection = forcedPreviewStates?.HeroBlock;
        }

        if (block.blockName === 'RichTextBlock') {
          componentProps.showControls = isEditingThisBlock;
        }

        const isHeroBlock = block.blockName === 'HeroBlock';
        const heroStyle = isHeroBlock ? { 
            marginTop: 0,
            zIndex: (blocks.length - index) * 10
        } : {
            zIndex: (blocks.length - index) * 10
        };

        return (
          <div
            key={blockKey}
            ref={(el) => (blockRefs.current[blockKey] = { current: el })}
            className={`relative editable-block-container ${isEditingThisBlock ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
            style={heroStyle}
          >
            {isEditingThisBlock && <EditingOverlay />}
            {!isEditingThisBlock && (
              <BlockEditControl onToggleEdit={() => handleStartEditingBlock(blockKey, block)} isEditing={false} zIndex="z-40" />
            )}
            <div id={`block-content-${blockKey}`} className="transition-all duration-300">
              <Suspense fallback={<div>Loading {block.blockName}...</div>}>
                <ComponentToRender {...componentProps} />
              </Suspense>
            </div>
          </div>
        );
      })}
    </div>
  );
};

BlockListEditor.propTypes = {
  blocks: PropTypes.array.isRequired,
  pageType: PropTypes.string.isRequired,
  blockComponentMap: PropTypes.object.isRequired,
  editingTarget: PropTypes.object,
  onStartEditing: PropTypes.func.isRequired,
  onBlockConfigChange: PropTypes.func.isRequired,
  onUndoBlock: PropTypes.func.isRequired,
  onSaveBlock: PropTypes.func.isRequired,
  themeColors: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  sitePalette: PropTypes.array,
  serviceContext: PropTypes.object,
  forcedPreviewStates: PropTypes.object,
};

export default BlockListEditor; 