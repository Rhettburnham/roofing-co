// src/components/MainPageBlocks/ButtonBlock.jsx
import { useEffect, useRef, useState } from "react";
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
    if (!images.length || !sliderRef.current) return;
    const ctx = gsap.context(() => {
      const totalWidth = sliderRef.current.scrollWidth;
      const singleSetWidth = totalWidth / 2;
      if (animRef.current) animRef.current.kill();
      animRef.current = gsap.to(sliderRef.current, {
        x: `-=${singleSetWidth}`,
        ease: "none",
        duration: slideDuration,
        repeat: -1,
        force3D: true,
        overwrite: true,
        modifiers: { x: (x) => (parseFloat(x) % singleSetWidth) + "px" },
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
              {images.concat(images).map((src, index) => (
                <div key={`slide-${index}`} className="flex-shrink-0">
                  <div className="relative sm:w-[70vw] w-[88vw] md:h-[24vh] sm:h-[20vh] h-[15vh]">
                    <div className="flex items-center justify-center overflow-hidden w-full h-full relative">
                      <img src={src} alt={`Slide ${index}`} className="w-full h-full object-cover pointer-events-none" loading={index < 3 ? "eager" : "lazy"}/>
                      <div className="absolute top-0 left-0 w-full h-full bg-gray-800 opacity-60"></div>
                    </div>
                  </div>
                </div>
              ))}
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
function ButtonEditorPanel({ localButton, onPanelChange }) {
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState("general");

  // Validate before attempting to call a save (though actual save is now external)
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
    const currentImage = localButton.images[index];
    if (currentImage && typeof currentImage === 'object' && currentImage.url && currentImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImage.url);
    }
    const fileURL = URL.createObjectURL(file);
    const updatedImages = [...localButton.images];
    updatedImages[index] = { file, url: fileURL, name: file.name };
    onPanelChange(prev => ({ ...prev, images: updatedImages }));
  };

  const handleImageUrlChange = (index, urlValue) => {
    const currentImage = localButton.images[index];
    if (currentImage && typeof currentImage === 'object' && currentImage.url && currentImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentImage.url);
    }
    const updatedImages = [...localButton.images];
    updatedImages[index] = { file: null, url: urlValue, name: urlValue.split('/').pop() };
    onPanelChange(prev => ({ ...prev, images: updatedImages }));
  };

  const handleAddImage = () => {
    const placeholderImage = { file: null, url: "/assets/images/placeholder.png", name: "placeholder.png" };
    onPanelChange(prev => ({ ...prev, images: [...(prev.images || []), placeholderImage] }));
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = localButton.images[index];
    if (imageToRemove && typeof imageToRemove === 'object' && imageToRemove.url && imageToRemove.url.startsWith('blob:')){
        URL.revokeObjectURL(imageToRemove.url);
    }
    onPanelChange(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const getDisplayUrl = (value) => {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.url) return value.url;
    return null;
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
              <div className="mb-3">
                <label className="block text-sm mb-1 font-medium">Image Slot {index + 1}:</label>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(index, e.target.files?.[0])} className="mb-2 w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                <input type="text" className="w-full bg-gray-600 px-2 py-2 rounded mt-1 text-white text-xs" placeholder="Or enter image URL" value={getDisplayUrl(imgData, '')} onChange={(e) => handleImageUrlChange(index, e.target.value)}/>
              </div>
              {getDisplayUrl(imgData) && <img src={getDisplayUrl(imgData)} alt={`Background ${index + 1}`} className="w-full h-24 object-cover rounded border border-gray-600" onError={(e) => { e.target.src = "/assets/images/placeholder.png"; e.target.alt = "Image not found"; }}/>}
            </div>
          ))}
          <button onClick={handleAddImage} className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-2 rounded font-medium">+ Add Image</button>
        </div>
      )}
    </div>
  );
}

ButtonEditorPanel.propTypes = {
  localButton: PropTypes.shape({
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
    return {
      text: initial.text || "About Us",
      buttonLink: initial.buttonLink || "/about",
      slideDuration: initial.slideDuration || 40,
      images: (initial.images || []).map(img => 
        typeof img === 'string' ? { file: null, url: img, name: img.split('/').pop() } : img
      ),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (buttonconfig) {
      setLocalButton(prevLocal => {
        const newImages = (buttonconfig.images || []).map(img => {
            const existingImg = prevLocal.images.find(li => (typeof li === 'string' ? li : li.name) === (typeof img === 'string' ? img.split('/').pop() : img.name));
            if (existingImg && typeof existingImg === 'object' && existingImg.url?.startsWith('blob:') && (typeof img === 'string' || img.url !== existingImg.url)) {
                URL.revokeObjectURL(existingImg.url); // Revoke if new img path/obj is different
            }
            return typeof img === 'string' ? { file: null, url: img, name: img.split('/').pop() } : img;
        });
        return {
            ...prevLocal,
            ...buttonconfig,
            slideDuration: buttonconfig.slideDuration || prevLocal.slideDuration || 40,
            images: newImages,
        };
      });
    }
  }, [buttonconfig]);

  useEffect(() => {
    return () => {
      localButton.images.forEach(img => {
        if (img && typeof img === 'object' && img.url && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, [localButton.images]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("ButtonBlock: Editing finished. Calling onConfigChange.");
        // Prepare data for saving: convert image objects with files back to simple name/path for JSON
        const dataToSave = {
          ...localButton,
          images: localButton.images.map(img => {
            if (img && typeof img === 'object') {
              return img.file ? img.name : img.url; // Save filename if file exists, else URL
            }
            return img; // Should be a string path already if not an object
          })
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localButton, onConfigChange]);

  const handlePanelChange = (updater) => {
    setLocalButton(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : { ...prevState, ...updater };
      return newState;
    });
  };

  if (readOnly) {
    return <ButtonPreview buttonconfig={localButton} />; // Read-only preview uses localButton for consistency
  }

  // In edit mode, MainPageForm handles the SlidingEditPanel.
  // ButtonBlock just renders its editor panel content directly when !readOnly.
  return (
    <ButtonEditorPanel
      localButton={localButton}
      onPanelChange={handlePanelChange}
    />
  );
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
