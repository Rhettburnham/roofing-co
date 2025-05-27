// src/components/blocks/VideoCTA.jsx
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import IconSelectorModal from '../common/IconSelectorModal';
import * as LucideIcons from 'lucide-react';

// Helper to render dynamic icons
const renderDynamicIcon = (pack, iconName, fallback = null, props = {}) => {
    const IconsSet = pack === 'lucide' ? LucideIcons : {}; // Expand with other packs if needed
    const IconComponent = IconsSet[iconName];
    return IconComponent ? <IconComponent {...props} /> : fallback;
};

// Helper to initialize image state
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

// Helper to get effective display URL
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
    return imageState.startsWith('.') ? imageState : `/${imageState.replace(/^\/*/, "")}`;
  }
  return '';
};

// Preview Component (Handles inline editing)
function VideoCTAPreview({ localConfig, readOnly, onInlineChange, getDisplayUrl }) {
  const {
    title, text, videoUrl, videoType, posterImage, buttonText, buttonLink,
    backgroundColor, titleColor, textColor, buttonBackgroundColor, buttonTextColor, textAlignment
  } = localConfig;

  const currentPosterImageUrl = getEffectiveDisplayUrl(posterImage, getDisplayUrl);

  const renderVideo = () => {
    if (!videoUrl) return <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-lg text-gray-400"><p>(No video URL provided)</p></div>;
    switch (videoType) {
      case 'youtube':
      case 'vimeo':
        return (
          <iframe
            className="w-full aspect-video rounded-lg shadow-xl"
            src={videoUrl}
            title={title || "Video Content"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        );
      case 'direct':
        return (
          <video className="w-full aspect-video rounded-lg shadow-xl bg-black" controls poster={currentPosterImageUrl || undefined}>
            <source src={videoUrl} type={videoUrl.endsWith('.mp4') ? 'video/mp4' : (videoUrl.endsWith('.webm') ? 'video/webm' : undefined)} />
            Your browser does not support the video tag.
          </video>
        );
      default:
        return <div className="w-full h-full flex items-center justify-center bg-red-700 rounded-lg text-red-300"><p>(Unsupported video type)</p></div>;
    }
  };

  const textAlignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };
  const currentAlignmentClass = textAlignClasses[textAlignment] || textAlignClasses.center;
  const CTAButtonTag = 'a';

  return (
    <div style={{ backgroundColor }} className={`py-8 md:py-12 px-4 md:px-6 ${currentAlignmentClass} flex flex-col`}>
      <div className="max-w-4xl w-full mx-auto">
        {readOnly ? (
          <h2 style={{ color: titleColor }} className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 break-words">
            {title}
          </h2>
        ) : (
          <input
            type="text"
            value={title}
            onChange={(e) => onInlineChange('title', e.target.value)}
            className="text-3xl md:text-4xl font-bold mb-3 md:mb-4 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 w-full"
            style={{ color: titleColor }}
            placeholder="Enter Title"
          />
        )}
        {readOnly ? (
          <p style={{ color: textColor }} className="text-base md:text-lg mb-6 md:mb-8 break-words">
            {text}
          </p>
        ) : (
          <textarea
            value={text}
            onChange={(e) => onInlineChange('text', e.target.value)}
            className="text-base md:text-lg mb-6 md:mb-8 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 w-full min-h-[80px] resize-y"
            style={{ color: textColor }}
            placeholder="Enter Text"
            rows={3}
          />
        )}
        <div className="mb-6 md:mb-8 w-full max-w-2xl mx-auto relative aspect-video bg-black rounded-lg shadow-xl overflow-hidden">
          {renderVideo()}
        </div>
        {readOnly ? (
          <CTAButtonTag
            href={buttonLink}
            target={buttonLink && buttonLink.startsWith('http') ? '_blank' : '_self'}
            rel={buttonLink && buttonLink.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{ backgroundColor: buttonBackgroundColor, color: buttonTextColor }}
            className="inline-block px-6 py-3 text-lg font-semibold rounded-md shadow-md hover:opacity-90 transition-opacity duration-200"
          >
            {buttonText}
          </CTAButtonTag>
        ) : (
          <input
            type="text"
            value={buttonText}
            onChange={(e) => onInlineChange('buttonText', e.target.value)}
            className="text-lg font-semibold bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 inline-block"
            style={{ 
              color: buttonTextColor, 
              backgroundColor: buttonBackgroundColor, 
              padding: '0.75rem 1.5rem', 
              border: '1px solid transparent' 
            }}
            placeholder="Enter Button Text"
          />
        )}
      </div>
    </div>
  );
}

VideoCTAPreview.propTypes = {
  localConfig: PropTypes.object.isRequired,
  readOnly: PropTypes.bool.isRequired,
  onInlineChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
};

// Panel Component
function VideoCTAPanel({ localConfigData, onPanelDataChange, getDisplayUrl }) {
  const [videoUrlInput, setVideoUrlInput] = useState(localConfigData.videoUrl || '');
  const [videoTypeInput, setVideoTypeInput] = useState(localConfigData.videoType || 'youtube');
  const [posterImageDisplay, setPosterImageDisplay] = useState(
    localConfigData.posterImage ? getEffectiveDisplayUrl(localConfigData.posterImage, getDisplayUrl) : ''
  );
  const [buttonLinkInput, setButtonLinkInput] = useState(localConfigData.buttonLink || '');

  useEffect(() => {
    setVideoUrlInput(localConfigData.videoUrl || '');
    setVideoTypeInput(localConfigData.videoType || 'youtube');
    setPosterImageDisplay(localConfigData.posterImage ? getEffectiveDisplayUrl(localConfigData.posterImage, getDisplayUrl) : '');
    setButtonLinkInput(localConfigData.buttonLink || '');
  }, [localConfigData, getDisplayUrl]);

  const handlePanelFieldChange = (field, value) => {
    onPanelDataChange({ ...localConfigData, [field]: value });
  };

  const handlePosterImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Pass the file object up; main component handles blob URL creation/revocation
      onPanelDataChange({ 
        ...localConfigData, 
        posterImage: { file: file, url: '', name: file.name, originalUrl: localConfigData.posterImage?.originalUrl || '' } 
      });
    }
  };

  const handlePosterImageUrlChange = (newUrl) => {
    // Pass a new image state object for URL change
    onPanelDataChange({ 
        ...localConfigData, 
        posterImage: { file: null, url: newUrl, name: newUrl.split('/').pop(), originalUrl: newUrl }
    });
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg space-y-4">
      <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Video & CTA Settings</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Video URL:</label>
        <input 
          type="text" 
          value={videoUrlInput}
          onChange={(e) => { setVideoUrlInput(e.target.value); handlePanelFieldChange('videoUrl', e.target.value); }}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="e.g., https://www.youtube.com/embed/VIDEO_ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Video Type:</label>
        <select 
          value={videoTypeInput}
          onChange={(e) => { setVideoTypeInput(e.target.value); handlePanelFieldChange('videoType', e.target.value); }}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="direct">Direct Link (MP4, WebM)</option>
        </select>
      </div>

      {videoTypeInput === 'direct' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">Poster Image (for Direct Video):</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handlePosterImageUpload} 
            className="w-full text-sm text-gray-300 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Or enter direct image URL for poster"
            value={posterImageDisplay && !posterImageDisplay.startsWith('blob:') ? posterImageDisplay : ''}
            onBlur={(e) => handlePosterImageUrlChange(e.target.value)} // Use onBlur to commit, or onChange if preferred
            onChange={(e) => setPosterImageDisplay(e.target.value)} // Allow typing
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm mt-1"
          />
          {posterImageDisplay && <img src={posterImageDisplay} alt="Poster preview" className="mt-2 max-h-32 rounded object-contain border border-gray-600" onError={(e) => e.target.style.display='none'} />}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Button Link URL:</label>
        <input 
          type="text" 
          value={buttonLinkInput}
          onChange={(e) => { setButtonLinkInput(e.target.value); handlePanelFieldChange('buttonLink', e.target.value); }}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="/contact-us or https://example.com"
        />
      </div>

      <h4 className="text-md font-semibold border-t border-gray-700 pt-3 mt-3">Styling</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Background Color:</label>
          <input type="color" value={localConfigData.backgroundColor || '#1A202C'} onChange={(e) => handlePanelFieldChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Title Color:</label>
          <input type="color" value={localConfigData.titleColor || '#FFFFFF'} onChange={(e) => handlePanelFieldChange('titleColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Text Color:</label>
          <input type="color" value={localConfigData.textColor || '#E2E8F0'} onChange={(e) => handlePanelFieldChange('textColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Button Background:</label>
          <input type="color" value={localConfigData.buttonBackgroundColor || '#3182CE'} onChange={(e) => handlePanelFieldChange('buttonBackgroundColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Button Text Color:</label>
          <input type="color" value={localConfigData.buttonTextColor || '#FFFFFF'} onChange={(e) => handlePanelFieldChange('buttonTextColor', e.target.value)} className="w-full h-10 p-1 bg-gray-700 border border-gray-600 rounded-md cursor-pointer" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Text Alignment:</label>
          <select 
            value={localConfigData.textAlignment || 'center'}
            onChange={(e) => handlePanelFieldChange('textAlignment', e.target.value)}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>
    </div>
  );
}

VideoCTAPanel.propTypes = {
  localConfigData: PropTypes.object.isRequired,
  onPanelDataChange: PropTypes.func.isRequired,
  getDisplayUrl: PropTypes.func,
};

// Main export: VideoCTABlock
export default function VideoCTABlock({ 
  config, 
  readOnly = true, 
  onConfigChange, 
  getDisplayUrl 
}) {
  const [localConfig, setLocalConfig] = useState(() => {
    const defaultConfig = {
      title: 'Watch Our Process',
      text: 'See how we deliver top-quality roofing solutions from start to finish. Our transparent process ensures you know what to expect every step of the way.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Default placeholder
      videoType: 'youtube',
      posterImage: initializeImageState(null, '/assets/images/placeholder_video_poster.jpg'),
      buttonText: 'Request a Free Quote',
      buttonLink: '/contact',
      backgroundColor: '#1A202C',
      titleColor: '#FFFFFF',
      textColor: '#E2E8F0',
      buttonBackgroundColor: '#3182CE',
      buttonTextColor: '#FFFFFF',
      textAlignment: 'center',
    };
    const initialData = { ...defaultConfig, ...config };
    return {
      ...initialData,
      posterImage: initializeImageState(initialData.posterImage, defaultConfig.posterImage.originalUrl),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  // Effect to synchronize localConfig with config prop
  useEffect(() => {
    if (config) {
      setLocalConfig(prevLocal => {
        const newBaseFromProps = { ...prevLocal, ...config };
        const newPosterImage = initializeImageState(
          config.posterImage, 
          prevLocal.posterImage?.originalUrl || '/assets/images/placeholder_video_poster.jpg'
        );

        // Revoke old blob URL if it was a file and is now being replaced by a new file or different URL
        if (prevLocal.posterImage?.file && prevLocal.posterImage.url?.startsWith('blob:')) {
            if (!newPosterImage.file || newPosterImage.url !== prevLocal.posterImage.url) {
                 URL.revokeObjectURL(prevLocal.posterImage.url);
            }
        }
        
        return {
          ...newBaseFromProps,
          posterImage: newPosterImage,
          // Preserve inline edits if not readOnly
          title: !readOnly && prevLocal.title !== (config.title || '') ? prevLocal.title : (config.title || prevLocal.title || 'Watch Our Process'),
          text: !readOnly && prevLocal.text !== (config.text || '') ? prevLocal.text : (config.text || prevLocal.text || 'Default text...'),
          buttonText: !readOnly && prevLocal.buttonText !== (config.buttonText || '') ? prevLocal.buttonText : (config.buttonText || prevLocal.buttonText || 'Request Quote'),
          // Panel controlled fields take precedence from config if available
          buttonLink: config.buttonLink ?? prevLocal.buttonLink,
          backgroundColor: config.backgroundColor ?? prevLocal.backgroundColor,
          titleColor: config.titleColor ?? prevLocal.titleColor,
          textColor: config.textColor ?? prevLocal.textColor,
          buttonBackgroundColor: config.buttonBackgroundColor ?? prevLocal.buttonBackgroundColor,
          buttonTextColor: config.buttonTextColor ?? prevLocal.buttonTextColor,
          textAlignment: config.textAlignment ?? prevLocal.textAlignment,
          videoUrl: config.videoUrl ?? prevLocal.videoUrl,
          videoType: config.videoType ?? prevLocal.videoType,
        };
      });
    }
  }, [config, readOnly]);

  // Effect to call onConfigChange when exiting edit mode (readOnly becomes true)
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        // Prepare posterImage for saving: use originalUrl if it's a file, otherwise the current URL
        const posterToSave = localConfig.posterImage?.file 
          ? { ...localConfig.posterImage, url: localConfig.posterImage.originalUrl, file: null } // Save original URL, nullify file
          : { ...localConfig.posterImage }; // Save as is (likely already a URL)
        
        if (posterToSave.file) delete posterToSave.file; // Ensure file object isn't in saved config

        onConfigChange({ ...localConfig, posterImage: posterToSave });
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localConfig, onConfigChange]);

  // Cleanup blob URL on unmount or when posterImage (that is a file) changes
  useEffect(() => {
    const currentPoster = localConfig.posterImage;
    return () => {
      if (currentPoster?.file && currentPoster.url?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPoster.url);
      }
    };
  }, [localConfig.posterImage]);

  // For VideoCTAPreview (inline text edits): updates localConfig only.
  const handleInlineChange = (field, value) => {
    if (!readOnly) {
      setLocalConfig(prev => ({ ...prev, [field]: value }));
    }
  };

  // For VideoCTAPanel: updates localConfig.
  const handlePanelDataChange = (newDataFromPanel) => {
    if (!readOnly) {
      setLocalConfig(prevLocalConfig => {
        let newPosterState = prevLocalConfig.posterImage;

        if (newDataFromPanel.posterImage) {
          const panelPoster = newDataFromPanel.posterImage;

          // If there was an old blob URL from a file, revoke it before updating
          if (prevLocalConfig.posterImage?.file && prevLocalConfig.posterImage.url?.startsWith('blob:')) {
            if (!panelPoster.file || prevLocalConfig.posterImage.url !== panelPoster.url) { // Revoke if new is not a file or is a different blob
                URL.revokeObjectURL(prevLocalConfig.posterImage.url);
            }
          }

          if (panelPoster.file instanceof File) { // New file uploaded from panel
            const blobUrl = URL.createObjectURL(panelPoster.file);
            newPosterState = { 
              file: panelPoster.file, 
              url: blobUrl, 
              name: panelPoster.file.name, 
              originalUrl: prevLocalConfig.posterImage?.originalUrl // Preserve old original URL if any
            };
          } else if (typeof panelPoster.url === 'string') { // URL string provided from panel
            newPosterState = { 
              file: null, 
              url: panelPoster.url, 
              name: panelPoster.name || panelPoster.url.split('/').pop(),
              originalUrl: panelPoster.url // This string URL is the new original
            };
          }
        }
        
        return {
          ...prevLocalConfig,
          ...newDataFromPanel, // Apply other changes from panel
          posterImage: newPosterState, // Apply the updated poster image state
        };
      });
    }
  };

  return (
    <>
      <VideoCTAPreview 
        localConfig={localConfig} 
        readOnly={readOnly} 
        onInlineChange={handleInlineChange} 
        getDisplayUrl={getDisplayUrl} 
      />
      {!readOnly && (
        <div className="bg-gray-900 p-4 rounded-b-lg shadow-xl mt-0">
          <VideoCTAPanel 
            localConfigData={localConfig} 
            onPanelDataChange={handlePanelDataChange} 
            getDisplayUrl={getDisplayUrl} 
          />
        </div>
      )}
    </>
  );
}

VideoCTABlock.propTypes = {
  config: PropTypes.object,
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
  getDisplayUrl: PropTypes.func, 
};