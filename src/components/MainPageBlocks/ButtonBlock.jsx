// src/components/MainPageBlocks/ButtonBlock.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";

// Add ticker registration to keep animations running during scrolling
gsap.registerPlugin();
// Force GSAP to use requestAnimationFrame which is more reliable during scrolling
gsap.ticker.lagSmoothing(0);

/* ======================================================
   READ-ONLY VIEW: ButtonPreview
   ------------------------------------------------------
   This component shows the button as a preview.
   It uses GSAP for the sliding carousel and uses the
   passed-in button configuration values.
========================================================= */
function ButtonPreview({ buttonconfig }) {
  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const [images, setImages] = useState([]);
  const slideDuration = buttonconfig?.slideDuration || 120; 
  const animRef = useRef(null);

  useEffect(() => {
    if (!buttonconfig) return;
    const { images = [] } = buttonconfig;
    const formattedImages = images.map((img) => {
        if (typeof img === 'string') {
            return img.startsWith("/") ? img : `/${img.replace(/^\.\//, "")}`;
        } else if (img && img.url) { // Handle {file, url, name} objects
            return img.url; // Use the URL for display
        }
        return ''; // Fallback for invalid entries
    }).filter(Boolean);
    setImages(formattedImages);
  }, [buttonconfig]);

  useEffect(() => {
    // Log the images state when it changes or when slideDuration changes
    console.log("[ButtonPreview useEffect images/slideDuration] Images state for slider:", images, "Slide Duration:", slideDuration);

    if (!images.length || !sliderRef.current) return;
    const ctx = gsap.context(() => {
      const movementDistance = 300; // Fixed movement in pixels
      const durationPerMovement = slideDuration > 0 ? slideDuration / (sliderRef.current.scrollWidth / movementDistance) : 5; // Estimate duration for 300px based on total duration, or default
                                        // Or, more simply, use slideDuration directly as time for 300px move if that's desired.
                                        // For now, let's assume slideDuration is the time for ONE 300px shift.
      const actualDuration = slideDuration > 0 ? slideDuration : 5; // Use slideDuration directly, default to 5s if invalid

      if (animRef.current) animRef.current.kill();
      
      // We need to ensure the slider has enough width for a continuous loop with fixed pixel movement.
      // If the content isn't wide enough (e.g., less than screen width + 300px), a simple repeat won't look seamless.
      // The current logic with `images.concat(images)` helps, but the modifier also needs care.

      gsap.set(sliderRef.current, { x: 0 }); // Ensure starting at 0 for predictable modifiers

      animRef.current = gsap.to(sliderRef.current, {
        x: `-=${movementDistance}`, // Move left by 300px
        ease: "none",
        duration: actualDuration, // Time for one 300px shift
        repeat: -1, // Infinite repeat
        force3D: true,
        overwrite: true,
        modifiers: {
          x: (x_value) => {
            const x = parseFloat(x_value);
            if (!sliderRef.current) {
              return "0px";
            }
            const totalWidth = sliderRef.current.scrollWidth / 2; // Width of one set of images
            // Wrap the x value around the width of one set of images
            // Ensure it's always a negative or zero offset for leftward movement
            let modX = x % totalWidth;
            if (modX > 0) {
                modX -= totalWidth;
            }
            // console.log(`Raw x: ${x}, TotalWidth: ${totalWidth}, ModX: ${modX}`);
            return modX + "px";
          }
        },
        onUpdate: () => { gsap.ticker.tick(); },
      });
      animRef.current.eventCallback("onUpdate", () => { if (animRef.current.paused()) animRef.current.play(); });
    });
    return () => {
      if (animRef.current) animRef.current.kill();
      ctx.revert();
    };
  }, [images, slideDuration]);

  useEffect(() => {
    const handleResize = () => { if (animRef.current) animRef.current.restart(true); };
    window.addEventListener("resize", handleResize);
    return () => { window.removeEventListener("resize", handleResize); };
  }, []);

  const handleClick = () => {
    if (buttonconfig && buttonconfig.buttonLink) {
      navigate(buttonconfig.buttonLink);
    }
  };

  if (!buttonconfig) {
    return <p className="text-center p-4">No button configuration found.</p>;
  }
  const { text = "About Us" } = buttonconfig;

  return (
    <div className="flex flex-col relative w-full mt-0 pt-0 ">
      <div className="z-40">
        <div className="relative overflow-hidden z-30">
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto z-10">
            <button
              className="text-white hover:text-black hover:bg-white font-sans text-xl font-bold md:text-2xl px-4 py-2 md:px-5 md:py-2 rounded-lg shadow-lg dark_button bg-accent"
              onClick={handleClick}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "inset 0 0 15px 1px rgba(0,0,0,0.8)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"; }}
            >
              <div>{text}</div>
            </button>
          </div>
          <div className="relative h-[10vh] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1vh] z-20"><div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" /></div>
            <div className="flex" ref={sliderRef}>
              {images.concat(images).map((src, index) => {
                // Log the src for each image being rendered
                console.log(`[ButtonPreview render] Image src for index ${index}:`, src);
                return (
                  <div key={`slide-${index}`} className="flex-shrink-0">
                    <div className="relative sm:w-[70vw] w-[88vw] md:h-[24vh] sm:h-[20vh] h-[15vh]">
                      <div className="flex items-center justify-center overflow-hidden w-full h-full relative">
                        <img src={src} alt={`Slide ${index}`} className="w-full h-full object-cover pointer-events-none" loading={index < 3 ? "eager" : "lazy"}/>
                        <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[1vh] z-20"><div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" /></div>
          </div>
        </div>
      </div>
    </div>
  );
}

ButtonPreview.propTypes = {
  buttonconfig: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    slideDuration: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  }),
};

/* ======================================================
   EDITOR VIEW: ButtonEditorPanel
   ------------------------------------------------------
   This component lets the admin change the button text,
   the link, and the images used in the carousel. Changes
   are kept in local state until the user clicks "Save."
========================================================= */
function ButtonEditorPanel({ localData: localButton, onPanelChange }) {
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  const validateData = () => {
    if (!localButton.text) { setValidationError("Button text is required"); return false; }
    if (!localButton.buttonLink) { setValidationError("Button link is required"); return false; }
    if (!localButton.images || localButton.images.length === 0) { setValidationError("At least one image is required"); return false; }
    setValidationError("");
    return true;
  };

  const handleFieldChange = (field, value) => {
    onPanelChange(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (index, file) => {
    if (!file) return;
    const currentImageState = localButton.images[index];
    // Revoke old blob URL if it exists
    if (currentImageState && typeof currentImageState === 'object' && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    const fileURL = URL.createObjectURL(file);
    const updatedImages = [...localButton.images];
    updatedImages[index] = { 
      file, 
      url: fileURL, 
      name: file.name, 
      originalUrl: currentImageState?.originalUrl || "" // Preserve originalUrl or set to empty if new
    };
    onPanelChange(prev => ({ ...prev, images: updatedImages }));
  };

  const handleImageUrlChange = (index, urlValue) => {
    const currentImageState = localButton.images[index];
    // Revoke old blob URL if it exists
    if (currentImageState && typeof currentImageState === 'object' && currentImageState.url && currentImageState.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageState.url);
    }
    const updatedImages = [...localButton.images];
    updatedImages[index] = { 
      file: null, 
      url: urlValue, 
      name: urlValue.split('/').pop(),
      originalUrl: urlValue // Pasted URL becomes the new originalUrl and display url
    };
    onPanelChange(prev => ({ ...prev, images: updatedImages }));
  };

  const handleAddImage = () => {
    // Add a placeholder or an empty state that prompts for upload/URL
    const newImagePlaceholder = { 
      file: null, 
      url: '', // No default visual placeholder URL initially, let the user add one
      name: 'New Image', 
      originalUrl: ''
    };
    onPanelChange(prev => ({ ...prev, images: [...(prev.images || []), newImagePlaceholder] }));
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = localButton.images[index];
    if (imageToRemove && typeof imageToRemove === 'object' && imageToRemove.url && imageToRemove.url.startsWith('blob:')){
        URL.revokeObjectURL(imageToRemove.url);
    }
    onPanelChange(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  // Get display URL for previews in the editor panel
  const getEditorDisplayUrl = (imgData) => {
    if (imgData && typeof imgData === 'object' && imgData.url) {
      return imgData.url; // This will be blob URL for new uploads, or path for existing
    }
    if (typeof imgData === 'string') return imgData; // Should ideally be an object by now
    return "/assets/images/placeholder.png"; // Fallback placeholder
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg max-h-[75vh] overflow-auto">
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-gray-800 py-2 z-10">
        <h1 className="text-lg md:text-xl font-medium">Button Settings</h1>
        {/* Save button removed - saving handled by MainPageForm */}
      </div>

      {validationError && (
        <div className="bg-red-500 text-white p-2 mb-4 rounded">{validationError}</div>
      )}

      <div className="flex border-b border-gray-700 mb-4">
        <button className={`px-4 py-2 ${activeTab === 'general' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`} onClick={() => setActiveTab('general')}>General</button>
        <button className={`px-4 py-2 ${activeTab === 'images' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'} rounded-t`} onClick={() => setActiveTab('images')}>Images</button>
      </div>

      {activeTab === 'general' && (
        <>
          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Button Text:</label>
            <input type="text" className="w-full bg-gray-700 px-2 py-2 rounded text-white" value={localButton.text || ""} onChange={(e) => handleFieldChange('text', e.target.value)}/>
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Button Link:</label>
            <input type="text" className="w-full bg-gray-700 px-2 py-2 rounded text-white" value={localButton.buttonLink || ""} onChange={(e) => handleFieldChange('buttonLink', e.target.value)}/>
            <div className="text-xs text-gray-400 mt-1">Example: /about or https://example.com</div>
          </div>
          <div className="mb-6">
            <label className="block text-sm mb-1 font-medium">Slide Duration (seconds):</label>
            <input type="number" min="1" max="200" step="1" className="w-full bg-gray-700 px-2 py-2 rounded text-white" value={localButton.slideDuration || 40} onChange={(e) => handleFieldChange('slideDuration', parseFloat(e.target.value))}/>
            <div className="text-xs text-gray-400 mt-1">Lower = faster, Higher = slower. Recommended: 40-120.</div>
          </div>
        </>
      )}

      {activeTab === 'images' && (
        <div>
          <h2 className="text-lg font-medium mb-2">Background Images</h2>
          <p className="text-sm text-gray-400 mb-3">Images for the carousel behind the button.</p>
          {(localButton.images || []).map((imgData, index) => (
            <div key={index} className="bg-gray-700 p-3 rounded mb-3 relative">
              <button onClick={() => handleRemoveImage(index)} className="bg-red-600 text-white text-xs px-2 py-1 rounded absolute top-2 right-2 hover:bg-red-500">Remove</button>
              <div className="mb-1">
                <label className="block text-sm mb-1 font-medium">Image Slot {index + 1}: ({imgData?.name || 'No image selected'})</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0])} className="mb-2 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                <input type="text" className="w-full bg-gray-600 px-2 py-2 rounded mt-1 text-white text-xs" placeholder="Or paste image URL" value={(imgData?.url && !imgData.url.startsWith('blob:')) ? imgData.url : ''} onChange={(e) => handleImageUrlChange(index, e.target.value)}/>
              </div>
              {getEditorDisplayUrl(imgData) && getEditorDisplayUrl(imgData) !== '' && 
                <img src={getEditorDisplayUrl(imgData)} alt={`Background ${index + 1}`} className="w-full h-24 object-cover rounded border border-gray-600" onError={(e) => { e.target.src = "/assets/images/placeholder.png"; e.target.alt = "Image not found or invalid"; }}/>
              }
            </div>
          ))}
          <button onClick={handleAddImage} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded font-medium">+ Add Image</button>
        </div>
      )}
    </div>
  );
}

ButtonEditorPanel.propTypes = {
  localData: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    slideDuration: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  }).isRequired,
  onPanelChange: PropTypes.func.isRequired,
};

/* ======================================================
   MAIN COMPONENT: ButtonBlock
   ------------------------------------------------------
   Initializes its local state from the provided button
   configuration. When in read-only mode it shows the preview;
   when in edit mode it shows both a live preview (using local state)
   and the editor panel so changes are immediately visible.
========================================================= */
export default function ButtonBlock({
  readOnly = false,
  buttonconfig = null, // Prop from MainPageForm
  onConfigChange = () => {},
}) {
  const [localButton, setLocalButton] = useState(() => {
    const initial = buttonconfig || {};
    const defaultImagePlaceholder = { file: null, url: '', name: 'placeholder.png', originalUrl: '' };

    return {
      text: initial.text || "About Us",
      buttonLink: initial.buttonLink || "/about",
      slideDuration: initial.slideDuration || 40,
      images: (initial.images || []).map(imgInput => {
        if (typeof imgInput === 'string') {
          return { file: null, url: imgInput, name: imgInput.split('/').pop(), originalUrl: imgInput };
        }
        if (imgInput && typeof imgInput === 'object') {
            // Ensure originalUrl is prioritized or derived correctly
            let originalUrl = imgInput.originalUrl;
            if (!originalUrl && typeof imgInput.url === 'string' && !imgInput.url.startsWith('blob:')) {
                originalUrl = imgInput.url;
            }
            // If still no originalUrl and it's not a new file, it might be problematic, consider a default or log

            return { 
                file: imgInput.file || null, 
                url: imgInput.url || '', 
                name: imgInput.name || (typeof imgInput.url === 'string' ? imgInput.url.split('/').pop() : 'default.png'), 
                originalUrl: originalUrl || '' // Ensure originalUrl is always present
            }; 
        }
        return {...defaultImagePlaceholder, name: `placeholder_${Date.now()}.png`}; // Fallback for malformed entries
      }),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  // Sync from prop to local state
  useEffect(() => {
    if (buttonconfig) {
      console.log("[ButtonBlock useEffect] Received buttonconfig:", JSON.parse(JSON.stringify(buttonconfig, (k,v) => v instanceof File ? ({name:v.name, size:v.size, type:v.type}) : v)) );
      setLocalButton(prevLocal => {
        const newImages = (buttonconfig.images || []).map(imgConfig => {
            const prevImgMatch = prevLocal.images.find(li => 
                (li.name === imgConfig.name && li.originalUrl === imgConfig.originalUrl && !li.url?.startsWith('blob:')) || 
                (li.url === imgConfig.url && li.url?.startsWith('blob:'))
            );

            if (prevImgMatch && prevImgMatch.file && prevImgMatch.url?.startsWith('blob:')) {
                return { ...imgConfig, ...prevImgMatch }; 
            }
            
            if (typeof imgConfig === 'string') {
                return { file: null, url: imgConfig, name: imgConfig.split('/').pop(), originalUrl: imgConfig };
            }
            if (imgConfig && typeof imgConfig === 'object') {
                return { 
                    file: imgConfig.file || null, 
                    url: imgConfig.url || '', 
                    name: imgConfig.name || (typeof imgConfig.url === 'string' ? imgConfig.url.split('/').pop() : 'default.png'), 
                    originalUrl: imgConfig.originalUrl || imgConfig.url || '' 
                };
            }
            return { file: null, url: '', name: 'error.png', originalUrl: '' };
        });

        // Log the newImages array right before it's used to set localButton state
        console.log("[ButtonBlock useEffect] Computed newImages for localButton state:", JSON.parse(JSON.stringify(newImages, (k,v) => v instanceof File ? ({name:v.name, size:v.size, type:v.type, hasFileObject: true}) : v)));

        prevLocal.images.forEach(prevImg => {
            if (prevImg && prevImg.url?.startsWith('blob:') && !newImages.some(newImg => newImg.url === prevImg.url)) {
                URL.revokeObjectURL(prevImg.url);
            }
        });

        return {
            ...prevLocal, // Keep local changes to text, buttonLink, slideDuration if prop doesn't override
            text: buttonconfig.text !== undefined ? buttonconfig.text : prevLocal.text,
            buttonLink: buttonconfig.buttonLink !== undefined ? buttonconfig.buttonLink : prevLocal.buttonLink,
            slideDuration: buttonconfig.slideDuration !== undefined ? buttonconfig.slideDuration : prevLocal.slideDuration,
            images: newImages, // Images are primarily driven by prop, with local blob preservation
        };
      });
    }
  }, [buttonconfig]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      localButton.images.forEach(img => {
        if (img && typeof img === 'object' && img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [localButton.images]);

  // Call onConfigChange when exiting edit mode
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("ButtonBlock: Editing finished. Calling onConfigChange with localButton:", JSON.parse(JSON.stringify(localButton, (k,v) => v instanceof File ? ({name:v.name, size:v.size, type:v.type}) : v)));
        const dataToSave = {
          ...localButton,
          images: localButton.images.map(imgData => {
            if (imgData && typeof imgData === 'object') {
              if (imgData.file instanceof File) { 
                // New file upload: pass file, name, and originalUrl (which should be its intended final path)
                return { 
                    file: imgData.file, 
                    url: imgData.url, // blob url for preview, not directly for JSON
                    name: imgData.name, 
                    originalUrl: imgData.originalUrl // Crucial: this is the path for JSON/ZIP
                }; 
              } else if (imgData.originalUrl) {
                // Existing image, use originalUrl for persistence
                return { url: imgData.originalUrl, name: imgData.name, originalUrl: imgData.originalUrl };
              } else if (imgData.url && !imgData.url.startsWith('blob:')) {
                // Fallback: if URL is a path and no originalUrl was explicitly set, use URL as originalUrl
                return { url: imgData.url, name: imgData.name, originalUrl: imgData.url };
              }
            }
            // Fallback for malformed or empty image data - or skip if desired
            // console.warn("ButtonBlock: Unexpected image data format or empty during save:", imgData);
            // return { url: '', name: 'error.png', originalUrl: '' }; 
            return null; // Or filter out nulls later
          }).filter(img => img !== null) // Remove any null entries from malformed data
        };
        console.log("ButtonBlock: Prepared dataToSave for onConfigChange:", JSON.parse(JSON.stringify(dataToSave, (k,v) => v instanceof File ? ({name: v.name, type: v.type, size: v.size}) : v)));
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localButton, onConfigChange]);

  // Handler for panel changes to update localButton state
  const handlePanelUpdates = useCallback((updater) => {
    setLocalButton(prevLocalButton => {
      const newLocalButton = typeof updater === 'function' ? updater(prevLocalButton) : { ...prevLocalButton, ...updater };
      console.log("[ButtonBlock handlePanelUpdates] newLocalButton:", JSON.parse(JSON.stringify(newLocalButton, (k,v) => v instanceof File ? ({name:v.name, size:v.size, type:v.type}) : v)));
      return newLocalButton;
    });
  }, []);

  // ButtonBlock now always renders the preview.
  // The ButtonEditorPanel will be rendered by MainPageForm in a SlidingEditPanel when not readOnly.
  // We need to ensure ButtonBlock.EditorPanel receives `onPanelChange={handlePanelUpdates}`.
  // This is done by how MainPageForm renders EditorPanel: it passes props through.
  // So, ButtonBlock.EditorPanel (which is ButtonEditorPanel) needs to *expect* `onPanelChange`.
  // The `onPanelChange` prop in `ButtonEditorPanel` signature is already correct.

  // When MainPageForm renders ButtonBlock.EditorPanel, it does NOT pass its own onPanelChange.
  // So, ButtonBlock itself needs to provide this to its EditorPanel if we were rendering it directly.
  // However, since MainPageForm renders it, we adjust MainPageForm.
  // The current structure where ButtonBlock.EditorPanel is static and expects `onPanelChange`
  // means that if MainPageForm doesn't provide it (as per previous step), then handlePanelUpdates defined here is not used.

  // The prop for ButtonBlock.EditorPanel from MainPageForm is `localData`.
  // ButtonBlock.EditorPanel receives `onPanelChange` from MainPageForm only if `block.blockName !== 'ButtonBlock'`.
  // This means for ButtonBlock, its EditorPanel will NOT receive `MainPageForm`'s `onPanelChange`.
  // The `ButtonBlock.EditorPanel = ButtonEditorPanel;` just assigns the component.
  // The instance of ButtonEditorPanel rendered by MainPageForm needs `onPanelChange`.

  // Let's refine: ButtonBlock itself doesn't render its EditorPanel directly in this flow.
  // MainPageForm renders it. 
  // The crucial part is that ButtonEditorPanel's *own* `onPanelChange` prop (which it uses internally)
  // should be correctly wired up if needed, or it should call a prop that ButtonBlock provides.
  
  // The existing setup in ButtonEditorPanel is: `function ButtonEditorPanel({ localData: localButton, onPanelChange })`
  // `onPanelChange` there is the function it calls internally when its fields change.
  // This `onPanelChange` prop must be provided by its parent when it's rendered.
  // MainPageForm will render `<ButtonBlock.EditorPanel localData={block.config} onPanelChange={...} />`
  //  -- but we made onPanelChange undefined for ButtonBlock.
  // This means the `ButtonEditorPanel` as rendered by `MainPageForm` will have `onPanelChange` as undefined.
  // This is not what we want. The editor panel *must* have a way to communicate its changes.

  // The fix should be in MainPageForm to pass a version of onPanelChange that updates ButtonBlock's config correctly.
  // The previous step was to make onPanelChange undefined. That was incorrect for allowing the panel to send updates.
  // Instead, the onPanelChange passed from MainPageForm to ButtonEditorPanel needs to correctly trigger updates
  // that will eventually reflect in ButtonBlock's `buttonconfig` prop.

  // The most robust way, sticking to the current structure where MainPageForm renders the panel:
  // 1. ButtonEditorPanel calls its `onPanelChange` prop with the new field values.
  // 2. MainPageForm provides this `onPanelChange` prop. This prop should call `setInternalFormData` for the specific block's config.
  // This is what it was doing before we made onPanelChange conditional.
  // The problem: localButton in ButtonBlock wasn't updating for the preview.

  // The `useEffect` in `ButtonBlock` listening to `buttonconfig` is the key to sync `MainPageForm`'s `block.config` changes to `localButton`.
  // This useEffect *should* be working. The console log will confirm if `buttonconfig` prop is changing.

  // If panel previews are not updating, it means the `localData` prop of `ButtonEditorPanel` (which is `block.config`) is not updating correctly after its own `onPanelChange` fires and MainPageForm updates `internalFormData`.
  // This sounds like a React re-rendering issue or stale closure if the `block.config` object reference doesn't change sufficiently.

  // The current structure of `MainPageForm.jsx`'s `onPanelChange` looks okay for updating `internalFormData`:
  // onPanelChange={(updatedConfigFields) => { 
  //   setInternalFormData(prev => {
  //       const newBlocks = (prev.mainPageBlocks || []).map(b => 
  //           b.uniqueKey === blockKey ? { ...b, config: { ...(b.config || {}), ...updatedConfigFields } } : b
  //       );
  //       return { ...prev, mainPageBlocks: newBlocks };
  //   });
  // }}
  // This creates new block and config objects, so it should trigger re-renders.

  // The issue might be that `ButtonEditorPanel` is not re-rendering with the new `localData` prop from `MainPageForm` after an image is uploaded.
  // Or, if it is, its internal `getEditorDisplayUrl(imgData)` might not get the very latest `imgData.url` if the mapping itself is stale.

  // For now, the logic within ButtonBlock for preparing `dataToSave` is good.
  // The key is that `localButton` state must be correctly updated when the panel edits occur.
  // The `useEffect([buttonconfig])` is the mechanism for this. The log we added there is critical.

  return <ButtonPreview buttonconfig={localButton} />;
}

ButtonBlock.propTypes = {
  readOnly: PropTypes.bool,
  buttonconfig: PropTypes.shape({
    text: PropTypes.string,
    buttonLink: PropTypes.string,
    slideDuration: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
  }),
  onConfigChange: PropTypes.func,
};

ButtonBlock.EditorPanel = ButtonEditorPanel;

