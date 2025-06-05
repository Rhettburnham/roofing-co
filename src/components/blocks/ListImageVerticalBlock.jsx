// src/components/blocks/ListImageVerticalBlock.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import PropTypes from 'prop-types';
import PanelImagesController from "../common/PanelImagesController";

/**
 * ListImageVerticalBlock
 * 
 * Showcases a group of items with benefits and images in a vertical layout
 * 
 * config = {
 *   listTitle: string,
 *   items: [
 *     {
 *       id: number,
 *       title: string,
 *       description: string,
 *       benefits: string[],
 *       image: string or {url: string}
 *     }
 *   ]
 * }
 */
const ListImageVerticalBlock = ({ config = {}, getDisplayUrl: getDisplayUrlFromProp }) => {
  const { listTitle = "Our Services", items = [] } = config;
  
  // Use the passed getDisplayUrlFromProp if available, otherwise fallback to local helper
  const effectiveGetDisplayUrl = typeof getDisplayUrlFromProp === 'function' ? getDisplayUrlFromProp : getDisplayUrl;

  // Add a useEffect to log when the component re-renders with new config for debugging
  useEffect(() => {
    console.log("[ListImageVerticalBlock] Display component re-rendered with config:", config);
  }, [config]);

  return (
    <section className="py-6 px-4 md:px-8 lg:px-16">
      {listTitle && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
          {listTitle}
        </h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {(items || []).map((item, index) => {
          const imageUrl = effectiveGetDisplayUrl(item.image, "/assets/images/placeholder_rect_1.jpg");
          return (
            <div 
              key={item.id || index}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02]"
            >
              {imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={item.title || `Item ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!imageUrl && (
                <div className="aspect-video w-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
              
              <div className="p-4 sm:p-6 flex-grow flex flex-col @container">
                {item.title && (
                  <h3 className="text-xl @md:text-2xl font-semibold mb-2 text-gray-800">
                    {item.title}
                  </h3>
                )}
                
                {item.description && (
                  <p className="text-sm @md:text-base text-gray-600 mb-4 flex-grow">
                    {item.description}
                  </p>
                )}
                
                {item.benefits && item.benefits.length > 0 && (
                  <div className="mt-auto pt-3 border-t border-gray-200">
                    <h4 className="text-base @md:text-lg font-semibold mb-2 text-gray-700">
                      Benefits:
                    </h4>
                    <ul className="space-y-1">
                      {item.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start text-sm @md:text-base text-gray-700">
                          <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

ListImageVerticalBlock.propTypes = {
  config: PropTypes.shape({
    listTitle: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      description: PropTypes.string,
      benefits: PropTypes.arrayOf(PropTypes.string),
      image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    }))
  }),
  getDisplayUrl: PropTypes.func, // For ServiceEditPage context
};

ListImageVerticalBlock.tabsConfig = (currentConfig, onPanelChange, themeColors, sitePalette) => {
  const { items = [] } = currentConfig || {};

  const handlePanelFieldChange = (field, value, itemIndex = null, subField = null, benefitIndex = null) => {
    let newConfig = { ...currentConfig };
    if (itemIndex !== null) { // Change within an item
      const newItems = [...(newConfig.items || [])];
      if (newItems[itemIndex]) {
        if (subField === 'benefits' && benefitIndex !== null) {
          const newBenefits = [...(newItems[itemIndex].benefits || [])];
          newBenefits[benefitIndex] = value;
          newItems[itemIndex] = { ...newItems[itemIndex], benefits: newBenefits };
        } else if (subField) {
          newItems[itemIndex] = { ...newItems[itemIndex], [subField]: value };
        }
        newConfig.items = newItems;
      } 
    } else { // Top-level field change
      newConfig[field] = value;
    }
    onPanelChange(newConfig);
  };

  const addItem = () => {
    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
      title: "New Service Item",
      description: "Description of this new service item.",
      benefits: ["Key benefit 1", "Key benefit 2"],
      image: initializeImageState(null, "/assets/images/placeholder_rect_1.jpg") 
    };
    onPanelChange({ ...currentConfig, items: [...(currentConfig.items || []), newItem] });
  };

  const removeItem = (indexToRemove) => {
    const itemRemoved = (currentConfig.items || [])[indexToRemove];
    if (itemRemoved?.image?.file && itemRemoved.image.url?.startsWith('blob:')) {
        URL.revokeObjectURL(itemRemoved.image.url);
    }
    const newItems = (currentConfig.items || []).filter((_, i) => i !== indexToRemove);
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const addBenefitToItem = (itemIndex) => {
    const newItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        return { ...item, benefits: [...(item.benefits || []), "New Benefit"] };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  const removeBenefitFromItem = (itemIndex, benefitIndexToRemove) => {
    const newItems = (currentConfig.items || []).map((item, i) => {
      if (i === itemIndex) {
        return { ...item, benefits: (item.benefits || []).filter((_, bIdx) => bIdx !== benefitIndexToRemove) };
      }
      return item;
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };
  
  // Prepare data for PanelImagesController
  const imagesForController = items.map((item, index) => ({
    ...(item.image || initializeImageState(null, '/assets/images/placeholder_rect_1.jpg')),
    id: item.id || `vert_list_item_img_${index}`,
    name: item.title || `List Item ${index + 1}`,
    itemIndex: index,
  }));

  const onImagesControllerChange = (updatedData) => {
    const newItems = [...items];
    (updatedData.images || []).forEach(imgCtrl => {
      if (imgCtrl.itemIndex !== undefined && newItems[imgCtrl.itemIndex]) {
        const oldImageState = newItems[imgCtrl.itemIndex].image;
        if (oldImageState?.file && oldImageState.url?.startsWith('blob:')) {
          if ((imgCtrl.file && oldImageState.url !== imgCtrl.url) || (!imgCtrl.file && oldImageState.url !== imgCtrl.originalUrl)) {
            URL.revokeObjectURL(oldImageState.url);
          }
        }
        newItems[imgCtrl.itemIndex].image = {
          file: imgCtrl.file || null,
          url: imgCtrl.url || '',
          name: imgCtrl.name || (imgCtrl.url || '').split('/').pop() || 'image.jpg',
          originalUrl: imgCtrl.originalUrl || imgCtrl.url || ''
        };
      }
    });
    onPanelChange({ ...currentConfig, items: newItems });
  };

  return {
    general: () => (
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">List Title:</label>
          <input 
            type="text" 
            value={currentConfig.listTitle || ''} 
            onChange={(e) => handlePanelFieldChange('listTitle', e.target.value)} 
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter list title"
          />
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-semibold text-gray-700">List Items:</h4>
            <button onClick={addItem} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md shadow">+ Add Item</button>
          </div>
          {(items || []).map((item, idx) => (
            <div key={item.id || idx} className="p-3 bg-gray-50 rounded-md mb-3 shadow-sm border border-gray-200 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-800 font-medium">Item {idx + 1}</span>
                <button onClick={() => removeItem(idx)} className="text-xs text-red-600 hover:text-red-800 font-semibold p-1 hover:bg-red-100 rounded-full">✕ Remove</button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Title:</label>
                <input type="text" value={item.title || ""} onChange={(e) => handlePanelFieldChange('items', e.target.value, idx, "title")} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Description:</label>
                <textarea rows={3} value={item.description || ""} onChange={(e) => handlePanelFieldChange('items', e.target.value, idx, "description")} className="mt-0.5 block w-full px-2 py-1.5 bg-white border border-gray-300 rounded-md sm:text-xs resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">Benefits:</label>
                {(item.benefits || []).map((benefit, bIdx) => (
                  <div key={bIdx} className="flex items-center mt-0.5">
                    <input type="text" value={benefit} onChange={(e) => handlePanelFieldChange('items', e.target.value, idx, 'benefits', bIdx)} className="flex-grow px-2 py-1 bg-white border border-gray-300 rounded-l-md sm:text-xs" />
                    <button onClick={() => removeBenefitFromItem(idx, bIdx)} className="bg-red-500 text-white px-2 py-1 rounded-r-md text-xs hover:bg-red-600">✕</button>
                  </div>
                ))}
                <button onClick={() => addBenefitToItem(idx)} className="mt-1 text-blue-600 hover:text-blue-800 text-xs font-medium">+ Add Benefit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    images: () => (
      items.length > 0 ? (
        <PanelImagesController
          currentData={{ images: imagesForController }}
          onControlsChange={onImagesControllerChange}
          imageArrayFieldName="images"
          getItemName={(img) => img?.name || 'List Item Image'}
          allowAdd={false} // Item addition handled in general tab
          allowRemove={false} // Item removal handled in general tab
        />
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>No items available to manage images for. Add items in the 'General' tab first.</p>
        </div>
      )
    ),
  };
};

export default ListImageVerticalBlock;
