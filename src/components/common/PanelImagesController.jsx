import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, Trash2 } from 'lucide-react';

// Helper to get display URL from string path or {url, file} object - similar to BeforeAfterBlock
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (imageValue && typeof imageValue === 'object' && imageValue.url) {
    return imageValue.url;
  }
  if (typeof imageValue === 'string') {
    if (imageValue.startsWith('/') || imageValue.startsWith('blob:') || imageValue.startsWith('data:')) {
      return imageValue;
    }
    return `/${imageValue.replace(/^\.\//, "")}`;
  }
  return defaultPath;
};

const PanelImagesController = ({ currentData, onControlsChange, imageArrayFieldName = "images", getItemName, maxImages }) => {
  const images = currentData[imageArrayFieldName] || [];
  const hasInitializedRef = useRef(false);

  const handleAddImageSlot = () => {
    const newImage = {
      file: null,
      url: '',
      name: `Image ${images.length + 1}`,
      originalUrl: '',
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    const updatedImages = [...images, newImage];
    onControlsChange({ ...currentData, [imageArrayFieldName]: updatedImages });
  };

  // Automatically add an initial slot if maxImages is 1 and no images currently exist,
  // but only if no image data has been provided from parent component
  useEffect(() => {
    // Prevent running this effect multiple times
    if (hasInitializedRef.current) return;
    
    if (maxImages === 1 && images.length === 0) {
      // Check if there's any indication that an image should exist from parent data
      const hasExistingImageData = currentData.heroImage || 
                                   currentData.backgroundImage || 
                                   currentData.imageUrl ||
                                   currentData.image;
      
      // If there's existing image data, create a proper image object from it instead of an empty slot
      if (hasExistingImageData) {
        let existingImageUrl = null;
        let existingImageName = 'Existing Image';
        let existingOriginalUrl = null;
        
        // Handle different possible image data formats
        if (currentData.heroImage) {
          if (typeof currentData.heroImage === 'object' && currentData.heroImage.url) {
            existingImageUrl = currentData.heroImage.url;
            existingImageName = currentData.heroImage.name || 'Hero Image';
            existingOriginalUrl = currentData.heroImage.originalUrl;
          } else if (typeof currentData.heroImage === 'string') {
            existingImageUrl = currentData.heroImage;
            existingImageName = currentData.heroImage.split('/').pop() || 'Hero Image';
            existingOriginalUrl = currentData.heroImage;
          }
        } else if (currentData.backgroundImage) {
          if (typeof currentData.backgroundImage === 'string') {
            existingImageUrl = currentData.backgroundImage;
            existingImageName = currentData.backgroundImage.split('/').pop() || 'Background Image';
            existingOriginalUrl = currentData.backgroundImage;
          }
        } else if (currentData.imageUrl) {
          existingImageUrl = currentData.imageUrl;
          existingImageName = currentData.imageUrl.split('/').pop() || 'Image';
          existingOriginalUrl = currentData.imageUrl;
        } else if (currentData.image) {
          existingImageUrl = currentData.image;
          existingImageName = currentData.image.split('/').pop() || 'Image';
          existingOriginalUrl = currentData.image;
        }
        
        // Create image object from existing data
        if (existingImageUrl) {
          const existingImageObject = {
            file: null,
            url: existingImageUrl,
            name: existingImageName,
            originalUrl: existingOriginalUrl,
            id: `img_existing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          const updatedImages = [existingImageObject];
          onControlsChange({ ...currentData, [imageArrayFieldName]: updatedImages });
          hasInitializedRef.current = true;
        }
      } else {
        // Only add empty slot if truly no image data exists
        handleAddImageSlot();
        hasInitializedRef.current = true;
      }
    } else if (images.length > 0) {
      // Mark as initialized if images already exist
      hasInitializedRef.current = true;
    }
  }, [maxImages, images.length]); // Rerun if maxImages changes or images array length becomes 0, or if existing image data changes.

  const handleRemoveImage = (index) => {
    const imageToRemove = images[index];
    if (imageToRemove && imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    const updatedImages = images.filter((_, i) => i !== index);
    onControlsChange({ ...currentData, [imageArrayFieldName]: updatedImages });
  };

  const handleImageFileChange = (index, file) => {
    if (file) {
      const updatedImages = [...images];
      const oldImageState = updatedImages[index];
      if (oldImageState && oldImageState.url && oldImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(oldImageState.url);
      }
      const fileURL = URL.createObjectURL(file);
      updatedImages[index] = {
        ...oldImageState,
        file: file,
        url: fileURL,
        name: file.name,
        // Preserve originalUrl if it existed, otherwise, it might be null or set by parent
      };
      onControlsChange({ ...currentData, [imageArrayFieldName]: updatedImages });
    }
  };

  const handleImageUrlChange = (index, urlValue) => {
    const updatedImages = [...images];
    const oldImageState = updatedImages[index];
    if (oldImageState && oldImageState.url && oldImageState.url.startsWith('blob:')) {
      URL.revokeObjectURL(oldImageState.url);
    }
    updatedImages[index] = {
      ...oldImageState,
      file: null,
      url: urlValue,
      name: urlValue.split('/').pop() || `Pasted Image ${index + 1}`,
      originalUrl: urlValue, // Pasted URL becomes the original for this slot
    };
    onControlsChange({ ...currentData, [imageArrayFieldName]: updatedImages });
  };

  return (
    <div className="bg-black relative ">
      <div className="flex items-center justify-between ">
        {(maxImages !== 1) && (
          <button
            type="button"
            onClick={handleAddImageSlot}
            className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle size={14} className="mr-1.5" /> Add Image Slot
          </button>
        )}
      </div>
      {images.length === 0 && maxImages !== 1 && (
        <p className="text-sm text-gray-500 italic my-1">No image slots configured. Click "Add Image Slot" to add one.</p>
      )}
      {images.length === 0 && maxImages === 1 && (
        <div className=" p-2 rounded-lg shadow space-y-1 relative">
          <div className="relative z-10">
            <input
              type="file"
              accept="image/*"
              id="panel-image-file-input-new"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // For maxImages=1, replace the empty state with new image
                  const newImage = {
                    file: file,
                    url: URL.createObjectURL(file),
                    name: file.name,
                    originalUrl: currentData.heroImage?.originalUrl || null,
                    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                  };
                  onControlsChange({ ...currentData, [imageArrayFieldName]: [newImage] });
                }
                e.target.value = null;
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => document.getElementById('panel-image-file-input-new')?.click()}
              className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow"
            >
              Choose Image
            </button>
          </div>
          <div className="h-36 w-full flex items-center justify-center  border-dashed border-gray-300 rounded text-gray-400 text-xs pt-7">
            Image Preview
          </div>
          <input
            type="text"
            placeholder="Or Paste Image URL"
            onChange={(e) => {
              if (e.target.value.trim()) {
                const newImage = {
                  file: null,
                  url: e.target.value,
                  name: e.target.value.split('/').pop() || 'Pasted Image',
                  originalUrl: e.target.value,
                  id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                };
                onControlsChange({ ...currentData, [imageArrayFieldName]: [newImage] });
              }
            }}
            className="mt-0.5 block w-full px-2 py-1 bg-white rounded-md shadow-sm sm:text-xs focus:ring-indigo-500 focus:border-indigo-500 ring-1 ring-gray-300 focus:ring-2"
          />
        </div>
      )}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {images.map((imgState, idx) => {
          const itemName = getItemName ? getItemName(imgState, idx) : (imgState?.name || `Image ${idx + 1}`);
          const previewUrl = getDisplayUrl(imgState);

          return (
            <div key={imgState?.id || idx} className="p-2 rounded-lg shadow space-y-2 relative">
              <div className="text-right font-semibold text-white pr-8">{itemName}</div>
              {(maxImages !== 1) && (
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 text-red-500 hover:text-red-700 z-20 p-0.5 bg-white/50 hover:bg-white/70 rounded-full"
                  title="Remove Image Slot"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <div className="relative z-10">
                <input
                  type="file"
                  accept="image/*"
                  id={`panel-image-file-input-${imgState?.id || idx}`}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageFileChange(idx, file);
                    e.target.value = null;
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(`panel-image-file-input-${imgState?.id || idx}`)?.click()}
                  className="absolute top-0 left-0 bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 shadow"
                >
                  Change Image
                </button>
              </div>

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${itemName} Preview`}
                  className="h-auto w-full object-cover rounded "
                  onError={(e) => { 
                    console.warn(`Failed to load image: ${previewUrl}`);
                    e.target.style.display = 'none'; 
                  }}
                />
              ) : (
                <div className="h-auto w-full flex items-center justify-center  border-dashed border-gray-300 rounded text-gray-400 text-xs pt-7">
                  Image Preview
                </div>
              )}

              <input
                type="text"
                placeholder="Or Paste Image URL"
                defaultValue=""
                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                className=" block w-full px-2 py-1 bg-white rounded-md shadow-sm sm:text-md "
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

PanelImagesController.propTypes = {
  currentData: PropTypes.object.isRequired,
  onControlsChange: PropTypes.func.isRequired,
  imageArrayFieldName: PropTypes.string,
  getItemName: PropTypes.func, // Optional: (item, index) => string
  maxImages: PropTypes.number,
};

export default PanelImagesController; 