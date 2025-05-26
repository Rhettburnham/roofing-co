import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const initializeImageState = (imageValue, defaultPath = '') => {
  let fileObject = null;
  let urlToDisplay = defaultPath;
  let nameToStore = defaultPath.split('/').pop();
  let originalUrlToStore = defaultPath;

  if (imageValue && typeof imageValue === 'object') {
    urlToDisplay = imageValue.url || defaultPath;
    nameToStore = imageValue.name || urlToDisplay.split('/').pop();
    fileObject = imageValue.file || null;
    originalUrlToStore = imageValue.originalUrl || (typeof imageValue.url === 'string' && !imageValue.url.startsWith('blob:') ? imageValue.url : defaultPath);
  } else if (typeof imageValue === 'string') {
    urlToDisplay = imageValue;
    nameToStore = imageValue.split('/').pop();
    originalUrlToStore = imageValue;
  }
  
  return { 
    file: fileObject, 
    url: urlToDisplay,
    name: nameToStore,
    originalUrl: originalUrlToStore 
  };
};

const getEffectiveDisplayUrl = (imageState, getDisplayUrlProp) => {
  if (getDisplayUrlProp) {
    return getDisplayUrlProp(imageState);
  }
  if (imageState && typeof imageState === 'object' && imageState.url) {
    return imageState.url;
  }
  if (typeof imageState === 'string') {
    if (imageState.startsWith('/') || imageState.startsWith('blob:') || imageState.startsWith('data:')) {
      return imageState;
    }
    return `/${imageState.replace(/^\.\//, "")}`;
  }
  return '';
};

/**
 * SectionBannerBlock
 *
 * A full width banner with heading and subheading
 *
 * config = {
 *   title: string,
 *   subtitle: string,
 *   backgroundImage: string | object
 *   overlayOpacity: number,
 *   textColor: string,
 *   height: string
 * }
 */
const SectionBannerBlock = ({ config, readOnly = true, onConfigChange, getDisplayUrl }) => {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Default Banner Title',
      subtext: 'Default banner subtext here.',
      overlayOpacity: 0.5,
      textColor: '#FFFFFF',
      height: '40vh',
      backgroundImage: initializeImageState(null, '/assets/images/placeholder_banner.jpg'),
    };
    const initialData = config || {};
    return {
      ...defaultConfig,
      ...initialData,
      backgroundImage: initializeImageState(initialData.backgroundImage, defaultConfig.backgroundImage.originalUrl),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newBgImage = initializeImageState(config.backgroundImage, prevLocal.backgroundImage.originalUrl);
        if (prevLocal.backgroundImage?.file && prevLocal.backgroundImage.url?.startsWith('blob:') && prevLocal.backgroundImage.url !== newBgImage.url) {
          URL.revokeObjectURL(prevLocal.backgroundImage.url);
        }
        return {
          ...prevLocal,
          ...config,
          backgroundImage: newBgImage,
          title: readOnly ? (config.title || prevLocal.title) : prevLocal.title,
          subtext: readOnly ? (config.subtext || prevLocal.subtext) : prevLocal.subtext,
        };
      });
    }
  }, [config]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        const dataToSave = {
          ...localConfig,
          backgroundImage: localConfig.backgroundImage?.file
            ? { ...localConfig.backgroundImage } 
            : { url: localConfig.backgroundImage?.originalUrl || localConfig.backgroundImage?.url }, 
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  useEffect(() => {
    return () => {
      if (localConfig.backgroundImage?.file && localConfig.backgroundImage.url?.startsWith('blob:')) {
        URL.revokeObjectURL(localConfig.backgroundImage.url);
      }
    };
  }, [localConfig.backgroundImage]);


  const handleLocalChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePanelDataChange = (newData) => {
    if (!readOnly) {
      if (newData.backgroundImage && typeof newData.backgroundImage === 'object' && newData.backgroundImage.file instanceof File) {
        if (localConfig.backgroundImage?.file && localConfig.backgroundImage.url?.startsWith('blob:')) {
          URL.revokeObjectURL(localConfig.backgroundImage.url);
        }
        const newFile = newData.backgroundImage.file;
        const blobUrl = URL.createObjectURL(newFile);
        setLocalConfig(prev => ({ 
          ...prev, 
          ...newData, 
          backgroundImage: {
            file: newFile,
            url: blobUrl,
            name: newFile.name,
            originalUrl: prev.backgroundImage.originalUrl 
          }
        }));
      } else if (newData.backgroundImage && typeof newData.backgroundImage === 'string') { 
        if (localConfig.backgroundImage?.file && localConfig.backgroundImage.url?.startsWith('blob:')) {
          URL.revokeObjectURL(localConfig.backgroundImage.url);
        }
        setLocalConfig(prev => ({
          ...prev,
          ...newData,
          backgroundImage: initializeImageState(newData.backgroundImage)
        }));
      }
      else {
        setLocalConfig(prev => ({ ...prev, ...newData }));
      }
    }
  };
  
  const currentDisplayImageUrl = getEffectiveDisplayUrl(localConfig.backgroundImage, getDisplayUrl);

  const bannerStyle = {
    backgroundImage: currentDisplayImageUrl ? `url("${currentDisplayImageUrl}")` : 'none',
    backgroundColor: !currentDisplayImageUrl ? '#cccccc' : '', 
    height: localConfig.height || '40vh',
    color: localConfig.textColor || '#FFFFFF',
    position: 'relative',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `rgba(0, 0, 0, ${localConfig.overlayOpacity >= 0 && localConfig.overlayOpacity <= 1 ? localConfig.overlayOpacity : 0.5})`,
    zIndex: 1,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 2,
    padding: '20px',
  };

  if (readOnly) {
    return (
      <div style={bannerStyle} className="section-banner-block">
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
          <h1>{localConfig.title}</h1>
          <p className="mt-2 text-lg md:text-xl">{localConfig.subtext}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={bannerStyle} className="section-banner-block">
        <div style={overlayStyle}></div>
        <div style={contentStyle}>
            <input 
              type="text" 
              value={localConfig.title}
              onChange={(e) => handleLocalChange('title', e.target.value)}
              className="text-3xl md:text-5xl font-bold bg-transparent border-b-2 border-dashed border-gray-400 focus:border-white outline-none w-full text-center mb-2"
              style={{ color: localConfig.textColor || '#FFFFFF' }}
              placeholder="Banner Title"
            />
            <textarea 
              value={localConfig.subtext}
              onChange={(e) => handleLocalChange('subtext', e.target.value)}
              className="mt-2 text-lg md:text-xl bg-transparent border-b-2 border-dashed border-gray-400 focus:border-white outline-none w-full text-center resize-none h-auto"
              style={{ color: localConfig.textColor || '#FFFFFF' }}
              rows={3}
              placeholder="Banner Subtext"
            />
        </div>
      </div>
      <SectionBannerBlock.EditorPanel
        currentConfig={localConfig}
        onPanelConfigChange={handlePanelDataChange}
        getDisplayUrl={(imgState) => getEffectiveDisplayUrl(imgState, getDisplayUrl)}
      />
    </>
  );
};

SectionBannerBlock.propTypes = {
  config: PropTypes.shape({
    backgroundImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    title: PropTypes.string,
    subtext: PropTypes.string,
    overlayOpacity: PropTypes.number,
    textColor: PropTypes.string,
    height: PropTypes.string,
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func,
};

SectionBannerBlock.EditorPanel = ({ currentConfig, onPanelConfigChange, getDisplayUrl: getDisplayUrlForPanel }) => {
  const handlePanelInputChange = (field, value) => {
    onPanelConfigChange({ [field]: value });
  };
  
  const handlePanelFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onPanelConfigChange({ backgroundImage: { file: e.target.files[0] } });
    }
  };

  const handleImageUrlPaste = (urlValue) => {
    onPanelConfigChange({ backgroundImage: urlValue });
  };

  const currentImageUrlDisplay = getDisplayUrlForPanel(currentConfig.backgroundImage);

  return (
    <div className="space-y-4 p-4 bg-gray-800 text-white rounded-b-md">
      <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Banner Settings</h3>
      <div>
        <label className="block text-sm font-medium text-gray-300">Background Image:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handlePanelFileChange}
          className="mt-1 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600 cursor-pointer"
        />
        {currentImageUrlDisplay && (
          <div className="mt-2">
            <img src={currentImageUrlDisplay} alt="Banner background preview" className="max-h-32 rounded object-contain bg-gray-700 p-1" />
          </div>
        )}
        <label className="block text-sm font-medium text-gray-300 mt-2">Or Image URL:</label>
        <input 
          type="text" 
          value={typeof currentConfig.backgroundImage === 'string' ? currentConfig.backgroundImage : (currentConfig.backgroundImage?.originalUrl || currentConfig.backgroundImage?.url || '')} 
          onChange={(e) => handleImageUrlPaste(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400"
          placeholder="e.g., /assets/images/banner.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Overlay Opacity (0 to 1):</label>
        <input 
          type="number" 
          step="0.1" 
          min="0" 
          max="1" 
          value={currentConfig.overlayOpacity || 0.5} 
          onChange={(e) => handlePanelInputChange('overlayOpacity', parseFloat(e.target.value))} 
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Text Color:</label>
        <input 
          type="color" 
          value={currentConfig.textColor || '#FFFFFF'} 
          onChange={(e) => handlePanelInputChange('textColor', e.target.value)} 
          className="mt-1 h-10 w-full border-gray-600 rounded-md bg-gray-700 cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">Banner Height (e.g., 300px, 50vh):</label>
        <input 
          type="text" 
          value={currentConfig.height || '40vh'} 
          onChange={(e) => handlePanelInputChange('height', e.target.value)} 
          className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
      </div>
    </div>
  );
};

SectionBannerBlock.EditorPanel.propTypes = {
  currentConfig: PropTypes.object.isRequired,
  onPanelConfigChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func.isRequired,
};

export default SectionBannerBlock; 