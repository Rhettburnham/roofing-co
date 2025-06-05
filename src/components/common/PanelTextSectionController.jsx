import React from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaTrash, FaEdit, FaList, FaListUl } from 'react-icons/fa';

/**
 * PanelTextSectionController - Standardized component for managing text sections
 * Similar to PanelStylingController but for adding/removing/editing text content
 */
const PanelTextSectionController = ({ 
  currentData, 
  onControlsChange, 
  controlType = 'bullets', // 'bullets', 'items', 'advantages', 'sections'
  blockType = 'OverviewAndAdvantagesBlock',
  sectionConfig = null // Configuration for the specific section type
}) => {
  
  // Get default configuration for different section types
  const getDefaultSectionConfig = (controlType, blockType) => {
    const configs = {
      bullets: {
        label: 'Advantages',
        itemLabel: 'Advantage',
        arrayFieldName: 'bullets',
        itemTemplate: {
          id: Date.now(),
          title: "New Advantage",
          desc: "Describe this advantage.",
          icon: { pack: 'lucide', name: 'CheckCircle' }
        },
        showIcons: true,
        showDescriptions: true
      },
      items: {
        label: 'List Items',
        itemLabel: 'Item',
        arrayFieldName: 'items',
        itemTemplate: {
          id: Date.now(),
          name: "New Item",
          description: "Item description",
          advantages: ["Advantage 1"],
          colorPossibilities: "Various",
          installationTime: "1-2 days",
          pictures: []
        },
        showIcons: false,
        showDescriptions: true,
        isStructured: true
      },
      simpleItems: {
        label: 'List Items',
        itemLabel: 'Item',
        arrayFieldName: 'items',
        itemTemplate: "New List Item",
        showIcons: false,
        showDescriptions: false,
        isSimple: true
      },
      sections: {
        label: 'Content Sections',
        itemLabel: 'Section',
        arrayFieldName: 'sections',
        itemTemplate: {
          id: Date.now(),
          title: "New Section",
          content: "Section content here."
        },
        showIcons: false,
        showDescriptions: true
      }
    };
    
    return sectionConfig || configs[controlType] || configs.bullets;
  };

  const config = getDefaultSectionConfig(controlType, blockType);
  const currentArray = currentData[config.arrayFieldName] || [];

  // Handle adding a new item
  const handleAddItem = () => {
    const newItem = typeof config.itemTemplate === 'function' 
      ? config.itemTemplate() 
      : { ...config.itemTemplate, id: Date.now() };
    
    const newArray = [...currentArray, newItem];
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  };

  // Handle removing an item
  const handleRemoveItem = (indexToRemove) => {
    const newArray = currentArray.filter((_, index) => index !== indexToRemove);
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  };

  // Handle reordering items
  const handleMoveItem = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= currentArray.length) return;
    
    const newArray = [...currentArray];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  };

  // Handle editing item properties
  const handleEditItem = (index, field, value) => {
    const newArray = currentArray.map((item, idx) => {
      if (idx === index) {
        if (config.isSimple) {
          return value; // For simple string items
        } else {
          return { ...item, [field]: value };
        }
      }
      return item;
    });
    
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  };

  // Get display text for an item
  const getItemDisplayText = (item, index) => {
    if (config.isSimple) {
      return typeof item === 'string' ? item : `Item ${index + 1}`;
    }
    
    // For structured items, try to get a meaningful title
    return item.title || item.name || item.heading || `${config.itemLabel} ${index + 1}`;
  };

  // Get item description
  const getItemDescription = (item) => {
    if (config.isSimple || !config.showDescriptions) return null;
    return item.desc || item.description || item.content || null;
  };

  return (
    <div className="p-4 bg-white text-gray-800 rounded">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Manage {config.label}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {currentArray.length} {currentArray.length === 1 ? config.itemLabel.toLowerCase() : config.label.toLowerCase()}
          </span>
          <button
            onClick={handleAddItem}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm transition-colors flex items-center space-x-1"
            title={`Add ${config.itemLabel}`}
          >
            <FaPlus size={12} />
            <span>Add {config.itemLabel}</span>
          </button>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        Add, remove, and reorder {config.label.toLowerCase()} for this {blockType.replace('Block', '')} section. 
        Changes are applied immediately to the preview.
      </p>
      
      {/* Items List */}
      {currentArray.length > 0 ? (
        <div className="space-y-2 mb-4">
          {currentArray.map((item, index) => (
            <div 
              key={item.id || index} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors group"
            >
              {/* Item Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded text-center min-w-[24px]">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-grow">
                    <div className="font-medium text-gray-800 truncate">
                      {getItemDisplayText(item, index)}
                    </div>
                    {getItemDescription(item) && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {getItemDescription(item)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {/* Move Up */}
                <button
                  onClick={() => handleMoveItem(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move Up"
                >
                  ↑
                </button>
                
                {/* Move Down */}
                <button
                  onClick={() => handleMoveItem(index, index + 1)}
                  disabled={index === currentArray.length - 1}
                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move Down"
                >
                  ↓
                </button>
                
                {/* Remove */}
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title={`Remove ${config.itemLabel}`}
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-3xl mb-2">📝</div>
          <p className="mb-3">No {config.label.toLowerCase()} yet</p>
          <button
            onClick={handleAddItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors inline-flex items-center space-x-2"
          >
            <FaPlus size={14} />
            <span>Add First {config.itemLabel}</span>
          </button>
        </div>
      )}
      
      {/* Quick Actions */}
      {currentArray.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span className="font-medium">{currentArray.length}</span>
              {' '}
              {currentArray.length === 1 ? config.itemLabel.toLowerCase() : config.label.toLowerCase()} configured
            </div>
            
            {/* Bulk Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm(`Remove all ${config.label.toLowerCase()}? This cannot be undone.`)) {
                    onControlsChange({ 
                      ...currentData, 
                      [config.arrayFieldName]: [] 
                    });
                  }
                }}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          
          {/* Performance note */}
          <div className="text-xs text-gray-500 mt-2">
            💡 Tip: Keep the number of items reasonable for better performance
          </div>
        </div>
      )}
    </div>
  );
};

PanelTextSectionController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  controlType: PropTypes.oneOf(['bullets', 'items', 'simpleItems', 'sections']),
  blockType: PropTypes.string,
  sectionConfig: PropTypes.shape({
    label: PropTypes.string,
    itemLabel: PropTypes.string,
    arrayFieldName: PropTypes.string,
    itemTemplate: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.func]),
    showIcons: PropTypes.bool,
    showDescriptions: PropTypes.bool,
    isStructured: PropTypes.bool,
    isSimple: PropTypes.bool
  })
};

export default PanelTextSectionController; 