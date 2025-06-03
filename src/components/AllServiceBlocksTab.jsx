import React from 'react';
import PropTypes from 'prop-types';
// We will need serviceBlockMap, so let's anticipate importing it or receiving it as a prop.
// For now, let's assume it will be passed as a prop to keep this component flexible.

const AllServiceBlocksTab = ({
  allServiceBlocksData,
  loadingAllServiceBlocks,
  activeEditShowcaseBlockIndex,
  setActiveEditShowcaseBlockIndex,
  serviceBlockMap,
  handleShowcaseBlockConfigUpdate,
  getShowcaseDisplayUrl,
  handleShowcaseFileChangeForBlock,
  themeColors,
}) => {
  if (loadingAllServiceBlocks) {
    return <p className="p-4">Loading showcase blocks...</p>;
  }

  if (!allServiceBlocksData || !allServiceBlocksData.blocks || allServiceBlocksData.blocks.length === 0) {
    return <p className="p-4">Could not load showcase data or no blocks are defined. Check console.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">All Service Blocks Showcase</h2>
      <div className="space-y-0">
        {allServiceBlocksData.blocks.map((block, index) => {
          const BlockComponent = serviceBlockMap[block.blockName];
          const isEditingThisBlock = activeEditShowcaseBlockIndex === index;

          if (!BlockComponent) {
            return (
              <div key={index} className="p-2 my-1 bg-red-100 text-red-700 rounded">
                Unknown block: {block.blockName}
              </div>
            );
          }

          return (
            <div key={block.uniqueKey || `showcase-${index}`} className="relative border-t border-b border-gray-300 mb-0 bg-white overflow-hidden">
              <div className="bg-gray-200 p-2 border-b border-gray-300">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{block.blockName}</h3>
              </div>
              <div className="absolute top-2 right-2 z-40 pt-10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveEditShowcaseBlockIndex(isEditingThisBlock ? null : index);
                  }}
                  className={`${
                    isEditingThisBlock ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                  } text-white rounded-full p-1.5 shadow-lg transition-colors`}
                  title={isEditingThisBlock ? "Done Editing" : "Edit Block"}
                >
                  {isEditingThisBlock ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.032 2.032 0 112.872 2.872L7.5 21.613H4v-3.5L16.862 4.487z"/></svg>
                  )}
                </button>
              </div>
              <BlockComponent
                config={block.config || {}}
                readOnly={!isEditingThisBlock}
                onConfigChange={(newFullConfig) => handleShowcaseBlockConfigUpdate(index, newFullConfig)}
                getDisplayUrl={getShowcaseDisplayUrl}
                onFileChange={(fieldKeyOrPathData, file) => handleShowcaseFileChangeForBlock(index, fieldKeyOrPathData, file)}
                blockContext="allServiceBlocks"
                themeColors={themeColors}
              />
              {isEditingThisBlock && BlockComponent.EditorPanel && (
                <div className="border-t border-gray-200 bg-gray-100 p-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">{block.blockName} - Edit Panel</h3>
                  <BlockComponent.EditorPanel
                    currentConfig={block.config || {}}
                    onPanelConfigChange={(updatedFields) => {
                      const currentBlockConfig = allServiceBlocksData.blocks[index].config || {};
                      const newConfig = { ...currentBlockConfig, ...updatedFields };
                      handleShowcaseBlockConfigUpdate(index, newConfig);
                    }}
                    onPanelFileChange={(fieldKeyOrPathData, file) => {
                      handleShowcaseFileChangeForBlock(index, fieldKeyOrPathData, file);
                    }}
                    getDisplayUrl={getShowcaseDisplayUrl}
                    blockContext="allServiceBlocks"
                    themeColors={themeColors}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

AllServiceBlocksTab.propTypes = {
  allServiceBlocksData: PropTypes.object,
  loadingAllServiceBlocks: PropTypes.bool.isRequired,
  activeEditShowcaseBlockIndex: PropTypes.number,
  setActiveEditShowcaseBlockIndex: PropTypes.func.isRequired,
  serviceBlockMap: PropTypes.object.isRequired, // Expect serviceBlockMap as a prop
  handleShowcaseBlockConfigUpdate: PropTypes.func.isRequired,
  getShowcaseDisplayUrl: PropTypes.func.isRequired,
  handleShowcaseFileChangeForBlock: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
};

export default AllServiceBlocksTab; 