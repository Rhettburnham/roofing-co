import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, Trash2 } from 'lucide-react';

const PanelImagesController = ({ currentData, onControlsChange, imageArrayFieldName = "images", getItemName, maxImages }) => {
  const images = currentData[imageArrayFieldName] || [];

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

  // Automatically add an initial slot if maxImages is 1 and no images currently exist.
  useEffect(() => {
    if (maxImages === 1 && images.length === 0) {
      handleAddImageSlot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [maxImages, images.length]); // Rerun if maxImages changes or images array length becomes 0.
  // Note: handleAddImageSlot is not added to dependency array to prevent potential loops if it changes frequently.
  // This is generally safe if handleAddImageSlot itself doesn't depend on frequently changing props/state not listed here.

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
    <div className="p-2 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-700">Manage Images</h3>
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
      {images.length === 0 && (
        <p className="text-sm text-gray-500 italic my-1">No image slots configured. Click "Add Image Slot" to add one.</p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {images.map((imgState, idx) => {
          const itemName = getItemName ? getItemName(imgState, idx) : (imgState?.name || `Image ${idx + 1}`);
          const previewUrl = imgState?.url;

          return (
            <div key={imgState?.id || idx} className="bg-gray-50 p-2 rounded-lg shadow space-y-1 relative">
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
                  {previewUrl ? 'Change' : 'Choose'} Image
                </button>
              </div>

              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`${itemName} Preview`}
                  className="h-36 w-full object-cover rounded bg-gray-100 p-1 pt-7"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="h-36 w-full flex items-center justify-center bg-gray-100 border-dashed border-gray-300 rounded text-gray-400 text-xs pt-7">
                  Image Preview
                </div>
              )}

              <input
                type="text"
                placeholder="Or Paste Image URL"
                value={(imgState?.url && !imgState.url.startsWith('blob:')) ? imgState.url : ''}
                onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                className="mt-0.5 block w-full px-2 py-1 bg-white rounded-md shadow-sm sm:text-xs focus:ring-indigo-500 focus:border-indigo-500 ring-1 ring-gray-300 focus:ring-2"
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