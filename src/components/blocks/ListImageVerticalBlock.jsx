// src/components/blocks/ListImageVerticalBlock.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";

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
const ListImageVerticalBlock = ({ config = {}, readOnly = false, onConfigChange, onFileChange }) => {
  const { listTitle = "Our Services", items = [] } = config;
  const [selectedItem, setSelectedItem] = useState(0);

  // Helper function to get display URL
  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object" && value.url) return value.url;
    return null;
  };

  if (readOnly) {
    return (
      <section className="py-6 px-4 md:px-8 lg:px-16">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">
          {listTitle}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-300 hover:scale-[1.02]"
            >
              {/* Image at top */}
              {getDisplayUrl(item.image) && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={getDisplayUrl(item.image)} 
                    alt={item.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4 sm:p-6 flex-grow @container">
                <h3 className="text-xl @md:text-2xl font-semibold mb-2 text-gray-800">
                  {item.title}
                </h3>
                
                <p className="text-sm @md:text-base text-gray-600 mb-4">
                  {item.description}
                </p>
                
                {item.benefits && item.benefits.length > 0 && (
                  <div className="mt-auto">
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
          ))}
        </div>
      </section>
    );
  }

  // EDIT MODE - structured editor
  const handleFieldChange = (field, value) => {
    onConfigChange?.({
      ...config,
      [field]: value,
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    handleFieldChange("items", newItems);
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        id: Date.now(),
        title: "New Service",
        description: "Service description",
        benefits: ["Benefit 1"],
        image: { url: "", file: null, name: "new_service_image", originalUrl: "" }
      }
    ];
    handleFieldChange("items", newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    handleFieldChange("items", newItems);
  };

  const addBenefit = (itemIndex) => {
    const newItems = [...items];
    newItems[itemIndex].benefits = [
      ...(newItems[itemIndex].benefits || []),
      "New benefit"
    ];
    handleFieldChange("items", newItems);
  };

  const updateBenefit = (itemIndex, benefitIndex, value) => {
    const newItems = [...items];
    newItems[itemIndex].benefits[benefitIndex] = value;
    handleFieldChange("items", newItems);
  };

  const removeBenefit = (itemIndex, benefitIndex) => {
    const newItems = [...items];
    newItems[itemIndex].benefits.splice(benefitIndex, 1);
    handleFieldChange("items", newItems);
  };

  const handleImageUpload = (itemIndex, file) => {
    if (!file) return;
    if (onFileChange) {
      const pathData = { field: 'image', blockItemIndex: itemIndex }; 
      onFileChange(pathData, file);
    } else {
      console.warn("ListImageVerticalBlock: onFileChange prop not provided. Cannot handle file upload.");
      const fileURL = URL.createObjectURL(file);
      updateItem(itemIndex, "image", { url: fileURL, file: file, name: file.name, originalUrl: "" });
    }
  };
  
  // Render the edit mode
  return (
    <div className="p-4 bg-gray-700 rounded text-white">
      <h3 className="font-bold text-lg mb-4">List Image Vertical Block Editor</h3>
      
      {/* List Title */}
      <label className="block text-sm mb-2">
        List Title:
        <input
          type="text"
          value={listTitle}
          onChange={(e) => handleFieldChange("listTitle", e.target.value)}
          className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
        />
      </label>
      
      {/* Items */}
      <div className="mt-4 space-y-4">
        {items.map((item, itemIndex) => (
          <div key={item.id || itemIndex} className="border border-gray-500 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-base">Item {itemIndex + 1}</h4>
              <button
                onClick={() => removeItem(itemIndex)}
                className="bg-red-600 text-white px-2 py-1 rounded text-sm"
              >
                Remove
              </button>
            </div>
            
            {/* Item Title */}
            <label className="block text-sm mb-2">
              Title:
              <input
                type="text"
                value={item.title || ''}
                onChange={(e) => updateItem(itemIndex, "title", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            
            {/* Description */}
            <label className="block text-sm mb-2">
              Description:
              <textarea
                rows={2}
                value={item.description || ''}
                onChange={(e) => updateItem(itemIndex, "description", e.target.value)}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            
            {/* Image Upload */}
            <label className="block text-sm mb-2">
              Image:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleImageUpload(itemIndex, e.target.files[0]);
                  }
                }}
                className="mt-1 w-full px-2 py-1 bg-gray-600 text-white rounded border border-gray-500"
              />
            </label>
            
            {getDisplayUrl(item.image) && (
              <div className="my-2">
                <img
                  src={getDisplayUrl(item.image)}
                  alt={item.title || `Item ${itemIndex}`}
                  className="h-20 object-cover rounded"
                />
              </div>
            )}
            
            {/* Benefits */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium">Benefits:</label>
                <button
                  onClick={() => addBenefit(itemIndex)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Add Benefit
                </button>
              </div>
              
              <div className="space-y-2">
                {(item.benefits || []).map((benefit, benefitIndex) => (
                  <div key={benefitIndex} className="flex items-center">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => updateBenefit(itemIndex, benefitIndex, e.target.value)}
                      className="flex-grow px-2 py-1 bg-gray-600 text-white rounded-l border border-gray-500"
                    />
                    <button
                      onClick={() => removeBenefit(itemIndex, benefitIndex)}
                      className="bg-red-600 text-white px-2 py-1 rounded-r border border-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={addItem}
        className="mt-4 bg-blue-600 text-white px-3 py-2 rounded"
      >
        Add New Item
      </button>
    </div>
  );
};

export default ListImageVerticalBlock;
