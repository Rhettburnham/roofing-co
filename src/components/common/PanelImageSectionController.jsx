import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaTrash, FaImage, FaGripVertical } from 'react-icons/fa';

/**
 * PanelImageSectionController - Standardized component for managing image arrays
 * Similar to PanelTextSectionController but specifically for image collections
 */
const PanelImageSectionController = ({ 
  currentData, 
  onControlsChange, 
  controlType = 'images', // 'images', 'overlayImages', 'slideshow', 'gallery'
  blockType = 'RichTextBlock',
  imageConfig = null // Configuration for the specific image array type
}) => {
  
  // Get default configuration for different image array types
  const getDefaultImageConfig = (controlType, blockType) => {
    const configs = {
      images: {
        label: 'Slideshow Images',
        itemLabel: 'Image',
        arrayFieldName: 'images',
        itemTemplate: () => ({
          id: Date.now(),
          file: null,
          url: '',
          name: '',
          originalUrl: ''
        }),
        generateName: (index, blockType) => {
          const prefix = blockType.toLowerCase().replace('block', '');
          return `${prefix}_slideshow_${index + 1}`;
        },
        acceptedTypes: 'image/*',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        defaultPath: '/assets/images/slideshow/'
      },
      overlayImages: {
        label: 'Overlay Images',
        itemLabel: 'Overlay',
        arrayFieldName: 'overlayImages',
        itemTemplate: () => ({
          id: Date.now(),
          file: null,
          url: '',
          name: '',
          originalUrl: ''
        }),
        generateName: (index, blockType) => {
          const prefix = blockType.toLowerCase().replace('block', '');
          return `${prefix}_overlay_${index + 1}`;
        },
        acceptedTypes: 'image/*',
        maxFileSize: 3 * 1024 * 1024, // 3MB  
        defaultPath: '/assets/images/overlays/'
      },
      gallery: {
        label: 'Gallery Images',
        itemLabel: 'Photo',
        arrayFieldName: 'gallery',
        itemTemplate: () => ({
          id: Date.now(),
          file: null,
          url: '',
          name: '',
          originalUrl: '',
          caption: '',
          alt: ''
        }),
        generateName: (index, blockType) => {
          const prefix = blockType.toLowerCase().replace('block', '');
          return `${prefix}_gallery_${index + 1}`;
        },
        acceptedTypes: 'image/*',
        maxFileSize: 8 * 1024 * 1024, // 8MB
        defaultPath: '/assets/images/gallery/'
      },
      carousel: {
        label: 'Carousel Images',
        itemLabel: 'Slide',
        arrayFieldName: 'images',
        itemTemplate: () => ({
          id: Date.now(),
          file: null,
          url: '',
          name: '',
          originalUrl: ''
        }),
        generateName: (index, blockType) => {
          const prefix = blockType.toLowerCase().replace('block', '');
          return `${prefix}_carousel_${index + 1}`;
        },
        acceptedTypes: 'image/*',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        defaultPath: '/assets/images/carousel/'
      }
    };
    
    return imageConfig || configs[controlType] || configs.images;
  };

  const config = getDefaultImageConfig(controlType, blockType);
  const currentArray = currentData[config.arrayFieldName] || [];

  // Helper to initialize image state for new items
  const initializeImageState = useCallback((file = null, url = '', customName = null) => {
    const newIndex = currentArray.length;
    const generatedName = customName || config.generateName(newIndex, blockType);
    
    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file: file,
      url: url || (file ? URL.createObjectURL(file) : ''),
      name: generatedName,
      originalUrl: url && !url.startsWith('blob:') ? url : '',
      ...((controlType === 'gallery') && { caption: '', alt: generatedName })
    };
  }, [currentArray.length, config, blockType, controlType]);

  // Handle adding a new image item
  const handleAddImage = useCallback(() => {
    const newImage = initializeImageState();
    const newArray = [...currentArray, newImage];
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  }, [currentArray, initializeImageState, onControlsChange, currentData, config.arrayFieldName]);

  // Handle file upload for new image
  const handleFileUpload = useCallback((files) => {
    if (!files || files.length === 0) return;
    
    const newImages = [];
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`File ${file.name} is not an image and will be skipped`);
        return;
      }
      
      // Validate file size
      if (file.size > config.maxFileSize) {
        console.warn(`File ${file.name} exceeds maximum size of ${config.maxFileSize / (1024 * 1024)}MB`);
        return;
      }
      
      const newImage = initializeImageState(file, URL.createObjectURL(file), file.name);
      newImages.push(newImage);
    });
    
    if (newImages.length > 0) {
      const newArray = [...currentArray, ...newImages];
      onControlsChange({ 
        ...currentData, 
        [config.arrayFieldName]: newArray 
      });
    }
  }, [currentArray, initializeImageState, onControlsChange, currentData, config, blockType]);

  // Handle removing an image
  const handleRemoveImage = useCallback((indexToRemove) => {
    const imageToRemove = currentArray[indexToRemove];
    
    // Clean up blob URL if it exists
    if (imageToRemove?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    const newArray = currentArray.filter((_, index) => index !== indexToRemove);
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  }, [currentArray, onControlsChange, currentData, config.arrayFieldName]);

  // Handle reordering images
  const handleMoveImage = useCallback((fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= currentArray.length) return;
    
    const newArray = [...currentArray];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  }, [currentArray, onControlsChange, currentData, config.arrayFieldName]);

  // Handle updating image properties
  const handleUpdateImage = useCallback((index, field, value) => {
    const newArray = currentArray.map((item, idx) => {
      if (idx === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    
    onControlsChange({ 
      ...currentData, 
      [config.arrayFieldName]: newArray 
    });
  }, [currentArray, onControlsChange, currentData, config.arrayFieldName]);

  // Get display text for an image item
  const getImageDisplayInfo = useCallback((item, index) => {
    const name = item.name || item.file?.name || `${config.itemLabel} ${index + 1}`;
    const url = item.url || item.originalUrl;
    const fileSize = item.file ? `${(item.file.size / 1024).toFixed(1)}KB` : null;
    
    return { name, url, fileSize };
  }, [config.itemLabel]);

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
            onClick={handleAddImage}
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
        Upload and manage {config.label.toLowerCase()} for this {blockType.replace('Block', '')} section. 
        Drag and drop files or click "Add {config.itemLabel}" to upload.
      </p>

      {/* Upload Zone */}
      <div className="mb-4">
        <label className="block w-full">
          <input
            type="file"
            multiple
            accept={config.acceptedTypes}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-6 text-center cursor-pointer transition-colors">
            <FaImage className="mx-auto text-gray-400 mb-2" size={24} />
            <p className="text-sm text-gray-600">
              Drop images here or click to browse
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Max {config.maxFileSize / (1024 * 1024)}MB per image
            </p>
          </div>
        </label>
      </div>
      
      {/* Images List */}
      {currentArray.length > 0 ? (
        <div className="space-y-2 mb-4">
          {currentArray.map((item, index) => {
            const { name, url, fileSize } = getImageDisplayInfo(item, index);
            
            return (
              <div 
                key={item.id || index} 
                className="flex items-center justify-between p-3 bg-gray-50 rounded border hover:bg-gray-100 transition-colors group"
              >
                {/* Image Preview & Info */}
                <div className="flex items-center space-x-3 flex-grow min-w-0">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-move opacity-60 group-hover:opacity-100 transition-opacity">
                    <FaGripVertical size={12} />
                  </div>
                  
                  {/* Image Preview */}
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                    {url ? (
                      <img 
                        src={url} 
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FaImage className="text-gray-400" size={16} />
                      </div>
                    )}
                  </div>
                  
                  {/* Image Info */}
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 bg-gray-200 px-2 py-0.5 rounded text-center min-w-[24px]">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-grow">
                        <div className="font-medium text-gray-800 truncate">
                          {name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {fileSize && `${fileSize} • `}
                          {item.file ? 'New Upload' : 'Existing'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Controls */}
                <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMoveImage(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Up"
                  >
                    ↑
                  </button>
                  
                  {/* Move Down */}
                  <button
                    onClick={() => handleMoveImage(index, index + 1)}
                    disabled={index === currentArray.length - 1}
                    className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move Down"
                  >
                    ↓
                  </button>
                  
                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title={`Remove ${config.itemLabel}`}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border-2 border-dashed border-gray-300">
          <div className="text-3xl mb-2">🖼️</div>
          <p className="mb-3">No {config.label.toLowerCase()} yet</p>
          <button
            onClick={handleAddImage}
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
                    // Clean up any blob URLs
                    currentArray.forEach(item => {
                      if (item.url?.startsWith('blob:')) {
                        URL.revokeObjectURL(item.url);
                      }
                    });
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
            💡 Tip: Optimize images before upload for better website performance
          </div>
        </div>
      )}
    </div>
  );
};

PanelImageSectionController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  controlType: PropTypes.oneOf(['images', 'overlayImages', 'slideshow', 'gallery', 'carousel']),
  blockType: PropTypes.string,
  imageConfig: PropTypes.shape({
    label: PropTypes.string,
    itemLabel: PropTypes.string,
    arrayFieldName: PropTypes.string,
    itemTemplate: PropTypes.func,
    generateName: PropTypes.func,
    acceptedTypes: PropTypes.string,
    maxFileSize: PropTypes.number,
    defaultPath: PropTypes.string
  })
};

export default PanelImageSectionController; 