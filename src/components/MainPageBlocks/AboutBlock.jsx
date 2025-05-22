import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaUsers, FaHistory, FaAward, FaHandshake } from "react-icons/fa";

/* ======================================================
   READ-ONLY VIEW: AboutPreview
   ------------------------------------------------------
   This component shows the About section as a preview.
   It displays the content from aboutData with sections for
   company history, mission, values, and team.
========================================================= */
function AboutPreview({ aboutData, readOnly, onInlineChange }) {
  if (!aboutData) {
    return <p>Loading About data...</p>;
  }

  const { 
    mainTitle = "", 
    subTitle = "", 
    description = "", 
    image = null, // Can be string path or {file, url, name}
    stats = [], 
    awards = [] 
  } = aboutData;

  const mainImageDisplayUrl = getDisplayUrl(image, "/assets/images/about/default-main.jpg");

  const StatItem = ({ value, label, index: statIndex }) => {
    const handleStatFieldChange = (field, newValue) => {
      if (onInlineChange) {
        onInlineChange('stats', statIndex, field, newValue);
      }
    };
    return (
      <div className="text-center">
        {readOnly ? (
          <p className="text-4xl font-bold text-accent">{value}</p>
        ) : (
          <input 
            type="text" 
            value={value || ""} 
            onChange={(e) => handleStatFieldChange('value', e.target.value)} 
            className="text-4xl font-bold text-accent bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded w-full"
            placeholder="Value"
          />
        )}
        {readOnly ? (
          <p className="text-sm text-gray-600">{label}</p>
        ) : (
          <input 
            type="text" 
            value={label || ""} 
            onChange={(e) => handleStatFieldChange('label', e.target.value)} 
            className="text-sm text-gray-600 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded w-full mt-1"
            placeholder="Label"
          />
        )}
      </div>
    );
  };

  const AwardItem = ({ src, alt }) => (
    <img src={getDisplayUrl(src, "/assets/images/about/default-award.png")} alt={alt} className="h-16 md:h-20 object-contain" />
  );

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          {readOnly ? (
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">{mainTitle}</h1>
          ) : (
            <input 
              type="text" 
              value={mainTitle || ""} 
              onChange={(e) => onInlineChange('mainTitle', e.target.value)} 
              className="text-4xl md:text-5xl font-bold text-gray-800 mb-2 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded w-full md:w-3/4 lg:w-1/2 mx-auto p-1"
              placeholder="Main Title"
            />
          )}
          {readOnly ? (
            <p className="text-lg text-gray-600">{subTitle}</p>
          ) : (
            <input 
              type="text" 
              value={subTitle || ""} 
              onChange={(e) => onInlineChange('subTitle', e.target.value)} 
              className="text-lg text-gray-600 bg-transparent text-center focus:outline-none focus:ring-1 focus:ring-blue-500 rounded w-full md:w-3/4 lg:w-1/2 mx-auto p-1 mt-1"
              placeholder="Subtitle"
            />
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12">
          <div className="md:w-1/2">
            {mainImageDisplayUrl && <img src={mainImageDisplayUrl} alt={mainTitle || 'About us'} className="rounded-lg shadow-xl w-full" />}
          </div>
          <div className="md:w-1/2">
            {readOnly ? (
              <div className="prose max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
            ) : (
              <textarea 
                value={description || ""} 
                onChange={(e) => onInlineChange('description', e.target.value)} 
                className="prose max-w-none text-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded w-full p-2 h-48 resize-none"
                placeholder="Description (supports HTML)"
              />
            )}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 text-center">
            {stats.map((stat, index) => <StatItem key={stat.id || index} {...stat} index={index} />)}
          </div>
        )}

        {awards && awards.length > 0 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-gray-700 mb-6">Our Accolades</h3>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {awards.map((award, index) => <AwardItem key={award.id || index} {...award} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

AboutPreview.propTypes = {
  aboutData: PropTypes.shape({
    mainTitle: PropTypes.string,
    subTitle: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      })
    ),
    awards: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        alt: PropTypes.string,
      })
    ),
  }),
  readOnly: PropTypes.bool,
  onInlineChange: PropTypes.func,
};

/* ======================================================
   EDITOR VIEW: AboutEditorPanel
   ------------------------------------------------------
   This component lets the admin edit all aspects of the
   about page including title, content, images, and team members.
========================================================= */
function AboutEditorPanel({ localData, onPanelChange }) {

  const handleImageChange = (file) => {
    if (!file) return;
    const currentImageState = localData.image; // Get current state
    if (currentImageState?.url?.startsWith('blob:')) URL.revokeObjectURL(currentImageState.url);
    const fileURL = URL.createObjectURL(file);
    onPanelChange(prev => ({ 
        ...prev, 
        image: { 
            file, 
            url: fileURL, 
            name: file.name, 
            originalUrl: currentImageState?.originalUrl // Preserve originalUrl
        } 
    }));
  };

  const handleImageUrlChange = (urlValue) => {
    const currentImageState = localData.image;
    if (currentImageState?.url?.startsWith('blob:')) URL.revokeObjectURL(currentImageState.url);
    onPanelChange(prev => ({ 
        ...prev, 
        image: { 
            file: null, 
            url: urlValue, 
            name: urlValue.split('/').pop(), 
            originalUrl: urlValue // Pasted URL is the new original
        } 
    }));
  };

  const handleStatChange = (index, field, value) => {
    onPanelChange(prev => {
      const updatedStats = [...(prev.stats || [])];
      if (updatedStats[index]) {
        updatedStats[index] = { ...updatedStats[index], [field]: value };
      }
      return { ...prev, stats: updatedStats };
    });
  };

  const handleAddStat = () => {
    onPanelChange(prev => ({ ...prev, stats: [...(prev.stats || []), { value: "0", label: "New Stat" }] }));
  };

  const handleRemoveStat = (index) => {
    onPanelChange(prev => ({ ...prev, stats: (prev.stats || []).filter((_, i) => i !== index) }));
  };

  const handleAwardChange = (index, field, valueOrFile) => {
    onPanelChange(prev => {
      const updatedAwards = [...(prev.awards || [])];
      if (updatedAwards[index]) {
        const currentAwardSrcState = updatedAwards[index].src;
        if (field === 'src' && typeof valueOrFile !== 'string') { // File object for src
          if (currentAwardSrcState?.url?.startsWith('blob:')) URL.revokeObjectURL(currentAwardSrcState.url);
          const fileURL = URL.createObjectURL(valueOrFile);
          updatedAwards[index] = { 
              ...updatedAwards[index], 
              src: { 
                  file: valueOrFile, 
                  url: fileURL, 
                  name: valueOrFile.name, 
                  originalUrl: currentAwardSrcState?.originalUrl // Preserve originalUrl
              } 
          };
        } else if (field === 'src' && typeof valueOrFile === 'string') { // URL string for src
           if (currentAwardSrcState?.url?.startsWith('blob:')) URL.revokeObjectURL(currentAwardSrcState.url);
           updatedAwards[index] = { 
               ...updatedAwards[index], 
               src: { 
                   file: null, 
                   url: valueOrFile, 
                   name: valueOrFile.split('/').pop(), 
                   originalUrl: valueOrFile // Pasted URL is new original
               } 
            };
        } else {
          updatedAwards[index] = { ...updatedAwards[index], [field]: valueOrFile };
        }
      }
      return { ...prev, awards: updatedAwards };
    });
  };

  const handleAddAward = () => {
    onPanelChange(prev => ({ ...prev, awards: [...(prev.awards || []), { src: initializeImageState(null, "/assets/images/about/default-award.png"), alt: "New Award" }] }));
  };

  const handleRemoveAward = (index) => {
    const awardToRemove = localData.awards[index];
    if (awardToRemove?.src?.url?.startsWith('blob:')) URL.revokeObjectURL(awardToRemove.src.url);
    onPanelChange(prev => ({ ...prev, awards: (prev.awards || []).filter((_, i) => i !== index) }));
  };

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg mt-0 max-h-[75vh] overflow-y-auto space-y-4">
      <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">About Page Settings</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Main Image:</label>
        <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files?.[0])} className="w-full bg-gray-700 px-2 py-1 rounded text-xs file:mr-2 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
        <input type="text" placeholder="Or image URL" value={getDisplayUrl(localData.image, '')} onChange={(e) => handleImageUrlChange(e.target.value)} className="w-full bg-gray-700 px-2 py-1 rounded mt-1 text-xs"/>
        {getDisplayUrl(localData.image) && <img src={getDisplayUrl(localData.image)} alt="Main Preview" className="mt-2 h-24 w-auto object-contain rounded bg-gray-700 p-1"/>}
      </div>

      <div className="pt-3 border-t border-gray-700">
        <h3 className="text-lg font-medium mb-2">Stats Section</h3>
        {(localData.stats || []).map((stat, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded mb-2 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span>Stat {index + 1}</span>
              <button onClick={() => handleRemoveStat(index)} className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] hover:bg-red-600">Remove</button>
            </div>
            <label className="block text-xs">Value: <input type="text" value={stat.value || ""} onChange={(e) => handleStatChange(index, 'value', e.target.value)} className="bg-gray-600 p-0.5 rounded w-full focus:outline-none text-gray-200"/></label>
            <label className="block text-xs mt-1">Label: <input type="text" value={stat.label || ""} onChange={(e) => handleStatChange(index, 'label', e.target.value)} className="bg-gray-600 p-0.5 rounded w-full focus:outline-none text-gray-200"/></label>
          </div>
        ))}
        <button onClick={handleAddStat} className="bg-blue-600 text-white text-xs px-2 py-1 rounded mt-1 hover:bg-blue-700">+ Add Stat</button>
      </div>

      <div className="pt-3 border-t border-gray-700">
        <h3 className="text-lg font-medium mb-2">Accolades/Awards Section</h3>
        {(localData.awards || []).map((award, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded mb-2 text-xs">
            <div className="flex justify-between items-center mb-1">
              <span>Award {index + 1}</span>
              <button onClick={() => handleRemoveAward(index)} className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] hover:bg-red-600">Remove</button>
            </div>
            <label className="block text-xs">Image: <input type="file" accept="image/*" onChange={(e) => handleAwardChange(index, 'src', e.target.files?.[0])} className="w-full bg-gray-600 my-0.5 rounded file:text-xs file:p-0.5"/></label>
            <label className="block text-xs">Image URL: <input type="text" placeholder="Or image URL" value={getDisplayUrl(award.src, '')} onChange={(e) => handleAwardChange(index, 'src', e.target.value)} className="w-full bg-gray-600 p-0.5 rounded focus:outline-none text-gray-200"/></label>
            {getDisplayUrl(award.src) && <img src={getDisplayUrl(award.src)} alt={award.alt || 'Award'} className="mt-1 h-12 w-auto object-contain rounded bg-gray-600 p-0.5"/>}
            <label className="block text-xs mt-1">Alt Text: <input type="text" value={award.alt || ""} onChange={(e) => handleAwardChange(index, 'alt', e.target.value)} className="bg-gray-600 p-0.5 rounded w-full focus:outline-none text-gray-200"/></label>
          </div>
        ))}
        <button onClick={handleAddAward} className="bg-blue-600 text-white text-xs px-2 py-1 rounded mt-1 hover:bg-blue-700">+ Add Award</button>
      </div>
    </div>
  );
}

AboutEditorPanel.propTypes = {
  localData: PropTypes.shape({
    mainTitle: PropTypes.string,
    subTitle: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      })
    ),
    awards: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        alt: PropTypes.string,
      })
    ),
  }),
  onPanelChange: PropTypes.func,
};

/* ======================================================
   MAIN COMPONENT: AboutBlock
   ------------------------------------------------------
   Main component that handles the state and switching between
   read-only preview and editable modes.
========================================================= */
export default function AboutBlock({
  readOnly = false,
  aboutData,
  onConfigChange,
}) {
  const [localData, setLocalData] = useState(() => {
    const initial = aboutData || {};
    return {
      mainTitle: initial.mainTitle || "About Our Company",
      subTitle: initial.subTitle || "Dedicated to Quality and Service",
      description: initial.description || "<p>Enter your company description here. You can use <strong>HTML</strong> for formatting.</p>",
      image: initializeImageState(initial.image, "/assets/images/about/default-main.jpg"),
      stats: (initial.stats || []).map((s, i) => ({ ...s, id: s.id || `stat_${i}_${Date.now()}`, value: s.value || '0', label: s.label || 'Stat' })),
      awards: (initial.awards || []).map((a, i) => ({ ...a, id: a.id || `award_${i}_${Date.now()}`, src: initializeImageState(a.src, "/assets/images/about/default-award.png"), alt: a.alt || 'Award Logo' })),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);

  useEffect(() => {
    if (aboutData) {
      setLocalData(prev => {
        const newImage = initializeImageState(aboutData.image, prev.image?.url);
        if(prev.image?.file && prev.image.url?.startsWith('blob:') && prev.image.url !== newImage.url) URL.revokeObjectURL(prev.image.url);
        
        const newAwards = (aboutData.awards || []).map((newAward, idx) => {
            const oldAward = prev.awards?.find(pa => pa.id === newAward.id) || prev.awards?.[idx];
            const newAwardSrc = initializeImageState(newAward.src, oldAward?.src?.url);
            if(oldAward?.src?.file && oldAward.src.url?.startsWith('blob:') && oldAward.src.url !== newAwardSrc.url) URL.revokeObjectURL(oldAward.src.url);
            return {...newAward, id: newAward.id || oldAward?.id || `award_upd_${idx}_${Date.now()}`, src: newAwardSrc};
        });

        const newStats = (aboutData.stats || []).map((newStat, idx) => {
            const oldStat = prev.stats?.find(ps => ps.id === newStat.id) || prev.stats?.[idx];
            return {...newStat, id: newStat.id || oldStat?.id || `stat_upd_${idx}_${Date.now()}`, value: newStat.value || '0', label: newStat.label || 'Stat' };
        });

        return {
          ...prev,
          ...aboutData,
          image: newImage,
          stats: newStats,
          awards: newAwards,
        };
      });
    }
  }, [aboutData]);

  useEffect(() => {
    return () => {
      if (localData.image?.file && localData.image.url?.startsWith('blob:')) URL.revokeObjectURL(localData.image.url);
      (localData.awards || []).forEach(award => {
        if (award.src?.file && award.src.url?.startsWith('blob:')) URL.revokeObjectURL(award.src.url);
      });
    };
  }, [localData.image, localData.awards]);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("AboutBlock: Editing finished. Calling onConfigChange.");
        const dataToSave = {
            ...localData,
            image: localData.image?.file 
                ? { ...localData.image } // Pass full state if file exists
                : { url: localData.image?.originalUrl || localData.image?.url }, // Else, pass originalUrl (or fallback)
            awards: localData.awards.map(award => ({
                ...award,
                src: award.src?.file 
                    ? { ...award.src } // Pass full state if file exists
                    : { url: award.src?.originalUrl || award.src?.url }, // Else, pass originalUrl (or fallback)
            }))
        };
        onConfigChange(dataToSave);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataChange = (fieldOrListKey, valueOrIndex, itemProperty, itemValue) => {
    if (typeof valueOrIndex === 'number' && itemProperty !== undefined) {
      const listKey = fieldOrListKey;
      const itemIndex = valueOrIndex;
      setLocalData(prev => {
        const updatedList = [...(prev[listKey] || [])];
        if (updatedList[itemIndex]) {
          updatedList[itemIndex] = { ...updatedList[itemIndex], [itemProperty]: itemValue };
        }
        return { ...prev, [listKey]: updatedList };
      });
    } else {
      const field = fieldOrListKey;
      const value = valueOrIndex;
      setLocalData(prev => ({ ...prev, [field]: value }));
    }
  };

  if (readOnly && !aboutData?.mainTitle) {
    return <div className="p-4 text-center text-gray-500">About information not available.</div>;
  }

  return (
    <>
      <AboutPreview 
        aboutData={localData} 
        readOnly={readOnly} 
        onInlineChange={handleLocalDataChange} 
      />
      {!readOnly && (
        <AboutEditorPanel 
          localData={localData} 
          onPanelChange={handleLocalDataChange}
        />
      )}
    </>
  );
}

AboutBlock.propTypes = {
  readOnly: PropTypes.bool,
  aboutData: PropTypes.shape({
    mainTitle: PropTypes.string,
    subTitle: PropTypes.string,
    description: PropTypes.string,
    image: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
      })
    ),
    awards: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        alt: PropTypes.string,
      })
    ),
  }),
  onConfigChange: PropTypes.func,
};

AboutBlock.defaultProps = {
  readOnly: false,
  aboutData: null,
  onConfigChange: null,
};

// Helper to initialize image state: handles string path or {file, url, name} object
const initializeImageState = (imageConfig, defaultPath) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath.split('/').pop();
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (imageConfig && typeof imageConfig === 'object') {
    urlToDisplay = imageConfig.url || defaultPath;
    nameToStore = imageConfig.name || urlToDisplay.split('/').pop();
    fileObject = imageConfig.file || null;
    originalUrlToStore = imageConfig.originalUrl || (typeof imageConfig.url === 'string' && !imageConfig.url.startsWith('blob:') ? imageConfig.url : defaultPath);
  } else if (typeof imageConfig === 'string') {
    urlToDisplay = imageConfig;
    nameToStore = imageConfig.split('/').pop();
    originalUrlToStore = imageConfig;
  }
  
  return { 
    file: fileObject, 
    url: urlToDisplay, 
    name: nameToStore,
    originalUrl: originalUrlToStore
  }; 
};

// Helper to get display URL from string path or {url, file} object
const getDisplayUrl = (imageValue, defaultPath = null) => {
  if (!imageValue) return defaultPath;
  if (typeof imageValue === 'string') return imageValue;
  if (typeof imageValue === 'object' && imageValue.url) return imageValue.url;
  return defaultPath;
};
