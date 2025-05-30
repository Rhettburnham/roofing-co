import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaUsers, FaHistory, FaAward, FaHandshake } from "react-icons/fa";
import { useConfig } from "../../context/ConfigContext";

/* ======================================================
   READ-ONLY VIEW & INLINE EDITOR: AboutContent
   ------------------------------------------------------
   This component shows the About section.
   If readOnly is false, it allows inline editing of all content.
========================================================= */
function AboutContent({ aboutData, readOnly, onConfigChange }) {
  if (!aboutData) {
    return <p>Loading About data...</p>;
  }

  // Fallback to empty structures if not present in aboutData from JSON
  const {
    title = "Craft Roofing Company, LLC: Atlanta's Trusted Roofing Experts",
    subtitle = "Building Strong Roofs, Stronger Relationships",
    history = "Founded in 2016...",
    mission = "Our mission is to deliver...",
    values = [{title: "Quality", description: "Details..."}],
    team = [{name: "Carl Craft", position: "Owner", photo: "/assets/images/team/roofer.png"}],
    stats = [{title: "Years", value: 9, icon: "FaHistory"}],
    heroImage = "/assets/images/about/about-hero.jpg",
    steps = [{title: "Book", videoSrc: "/assets/videos/our_process_videos/booking.mp4", href: "/#booking", scale: 0.8 }]
  } = aboutData;


  const handleFieldChange = (field, value) => {
    onConfigChange({ ...aboutData, [field]: value });
  };

  const handleNestedChange = (listName, index, field, value) => {
    const newList = [...(aboutData[listName] || [])];
    if (newList[index]) {
      newList[index] = { ...newList[index], [field]: value };
      onConfigChange({ ...aboutData, [listName]: newList });
    }
  };
  
  const handleNestedFileChange = (listName, index, field, file) => {
    if (!file) return;
    const currentList = aboutData[listName] || [];
    const currentItem = currentList[index];
    let originalUrl = currentItem?.originalUrl || (typeof currentItem?.[field] === 'string' ? currentItem[field] : null);

    if (currentItem && currentItem[field]?.url && currentItem[field].url.startsWith('blob:')) {
        URL.revokeObjectURL(currentItem[field].url);
    }
    
    const fileURL = URL.createObjectURL(file);
    const updatedItem = {
      ...currentItem,
      [field]: {
        file: file,
        url: fileURL,
        name: file.name,
        originalUrl: originalUrl 
      }
    };
    const newList = [...currentList];
    newList[index] = updatedItem;
    onConfigChange({ ...aboutData, [listName]: newList });
  };

  const handleNestedUrlChange = (listName, index, field, urlValue) => {
    const currentList = aboutData[listName] || [];
    const currentItem = currentList[index];

    if (currentItem && currentItem[field]?.url && currentItem[field].url.startsWith('blob:')) {
        URL.revokeObjectURL(currentItem[field].url);
    }

    const updatedItem = {
      ...currentItem,
      [field]: {
        file: null,
        url: urlValue,
        name: urlValue.split('/').pop(),
        originalUrl: urlValue
      }
    };
    const newList = [...currentList];
    newList[index] = updatedItem;
    onConfigChange({ ...aboutData, [listName]: newList });
  };


  const handleAddItem = (listName, newItemTemplate) => {
    const newList = [...(aboutData[listName] || []), newItemTemplate];
    onConfigChange({ ...aboutData, [listName]: newList });
  };

  const handleRemoveItem = (listName, index) => {
    const list = aboutData[listName] || [];
    const itemToRemove = list[index];
    // Revoke blob URLs if they exist for 'photo' or 'videoSrc' fields
    if (itemToRemove) {
        for (const key in itemToRemove) {
            if (itemToRemove[key] && typeof itemToRemove[key] === 'object' && itemToRemove[key].url && itemToRemove[key].url.startsWith('blob:')) {
                 URL.revokeObjectURL(itemToRemove[key].url);
            }
        }
    }
    const newList = list.filter((_, i) => i !== index);
    onConfigChange({ ...aboutData, [listName]: newList });
  };
  
  const handleHeroImageFileChange = (file) => {
    if (!file) return;
    const currentHeroImage = aboutData.heroImage;
    let originalUrl = typeof currentHeroImage === 'string' ? currentHeroImage : currentHeroImage?.originalUrl;

    if (currentHeroImage && typeof currentHeroImage === 'object' && currentHeroImage.url && currentHeroImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentHeroImage.url);
    }
    const fileURL = URL.createObjectURL(file);
    onConfigChange({ 
        ...aboutData, 
        heroImage: { 
            file, 
            url: fileURL, 
            name: file.name,
            originalUrl: originalUrl // Preserve or set original URL
        } 
    });
  };

  const handleHeroImageUrlChange = (urlValue) => {
    const currentHeroImage = aboutData.heroImage;
     if (currentHeroImage && typeof currentHeroImage === 'object' && currentHeroImage.url && currentHeroImage.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentHeroImage.url);
    }
    onConfigChange({ 
        ...aboutData, 
        heroImage: { 
            file: null, 
            url: urlValue, 
            name: urlValue.split('/').pop(),
            originalUrl: urlValue // New URL is the original
        } 
    });
  };

  const heroImageDisplayUrl = getDisplayUrl(heroImage, "/assets/images/about/default-hero.jpg");

  const commonInputClass = "bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded p-1 w-full";
  const commonTextareaClass = `${commonInputClass} h-24 resize-none`;

  return (
    <section className="py-12 md:py-16 bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Main Title and Subtitle */}
        <div className="text-center">
          {readOnly ? (
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          ) : (
            <input type="text" value={title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="Main Title" className={`text-4xl md:text-5xl font-bold mb-2 text-center ${commonInputClass}`} />
          )}
          {readOnly ? (
            <p className="text-lg text-gray-600">{subtitle}</p>
          ) : (
            <input type="text" value={subtitle} onChange={(e) => handleFieldChange('subtitle', e.target.value)} placeholder="Subtitle" className={`text-lg text-gray-600 text-center ${commonInputClass} mt-1`} />
          )}
        </div>

        {/* Hero Image Section */}
        <div className="mb-8">
            {readOnly ? (
                heroImageDisplayUrl && <img src={heroImageDisplayUrl} alt={title || 'About Hero'} className="rounded-lg shadow-xl w-full h-64 md:h-96 object-cover" />
            ) : (
                <div className="border p-3 rounded-md bg-white shadow">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image:</label>
                    <input type="file" accept="image/*" onChange={(e) => handleHeroImageFileChange(e.target.files?.[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-2"/>
                    <input type="text" placeholder="Or image URL" value={typeof heroImage === 'string' ? heroImage : heroImage?.url || ''} onChange={(e) => handleHeroImageUrlChange(e.target.value)} className={`${commonInputClass} border border-gray-300 mb-2`} />
                    {heroImageDisplayUrl && <img src={heroImageDisplayUrl} alt="Hero Preview" className="mt-2 h-40 w-auto object-contain rounded bg-gray-100 p-1"/>}
                </div>
            )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Our History</h2>
          {readOnly ? (
            <p className="text-gray-700 leading-relaxed">{history}</p>
          ) : (
            <textarea value={history} onChange={(e) => handleFieldChange('history', e.target.value)} placeholder="Company History" className={commonTextareaClass} />
          )}
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Our Mission</h2>
          {readOnly ? (
            <p className="text-gray-700 leading-relaxed">{mission}</p>
          ) : (
            <textarea value={mission} onChange={(e) => handleFieldChange('mission', e.target.value)} placeholder="Company Mission" className={commonTextareaClass} />
          )}
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(values || []).map((valueItem, index) => (
              <div key={index} className={`p-4 rounded-lg shadow ${readOnly ? 'bg-white' : 'bg-gray-100 border border-gray-300'}`}>
                {readOnly ? (
                  <h3 className="text-xl font-semibold text-accent mb-1">{valueItem.title}</h3>
                ) : (
                  <input type="text" value={valueItem.title} onChange={(e) => handleNestedChange('values', index, 'title', e.target.value)} placeholder="Value Title" className={`text-xl font-semibold text-accent mb-1 ${commonInputClass}`} />
                )}
                {readOnly ? (
                  <p className="text-gray-600">{valueItem.description}</p>
                ) : (
                  <textarea value={valueItem.description} onChange={(e) => handleNestedChange('values', index, 'description', e.target.value)} placeholder="Value Description" className={`${commonTextareaClass} h-20 mt-1`} />
                )}
                {!readOnly && (
                  <button onClick={() => handleRemoveItem('values', index)} className="text-red-500 hover:text-red-700 text-xs mt-2">Remove Value</button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <button onClick={() => handleAddItem('values', { title: "New Value", description: "Description" })} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Add Value</button>
          )}
        </div>
        
        {/* Team */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(team || []).map((member, index) => {
              const photoDisplayUrl = getDisplayUrl(member.photo, "/assets/images/team/default-profile.png");
              return (
                <div key={index} className={`text-center p-4 rounded-lg shadow ${readOnly ? 'bg-white' : 'bg-gray-100 border border-gray-300'}`}>
                  {readOnly ? (
                    <img src={photoDisplayUrl} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-3 object-cover" />
                  ) : (
                    <div className="mb-3">
                      <img src={photoDisplayUrl} alt={member.name || 'Profile Preview'} className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border" />
                      <input type="file" accept="image/*" onChange={(e) => handleNestedFileChange('team', index, 'photo', e.target.files?.[0])} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 mb-1"/>
                      <input type="text" placeholder="Or photo URL" value={typeof member.photo === 'string' ? member.photo : member.photo?.url || ''} onChange={(e) => handleNestedUrlChange('team', index, 'photo', e.target.value)} className={`${commonInputClass} text-xs border border-gray-300`} />
                    </div>
                  )}
                  {readOnly ? (
                    <h3 className="text-lg font-medium">{member.name}</h3>
                  ) : (
                    <input type="text" value={member.name} onChange={(e) => handleNestedChange('team', index, 'name', e.target.value)} placeholder="Team Member Name" className={`text-lg font-medium text-center ${commonInputClass}`} />
                  )}
                  {readOnly ? (
                    <p className="text-gray-500 text-sm">{member.position}</p>
                  ) : (
                    <input type="text" value={member.position} onChange={(e) => handleNestedChange('team', index, 'position', e.target.value)} placeholder="Position" className={`text-gray-500 text-sm text-center ${commonInputClass} mt-1`} />
                  )}
                  {!readOnly && (
                    <button onClick={() => handleRemoveItem('team', index)} className="text-red-500 hover:text-red-700 text-xs mt-2">Remove Member</button>
                  )}
                </div>
              );
            })}
          </div>
          {!readOnly && (
            <div className="text-center mt-6">
                <button onClick={() => handleAddItem('team', { name: "New Member", position: "Role", photo: "/assets/images/team/default-profile.png" })} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Add Team Member</button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Our Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(stats || []).map((statItem, index) => (
              <div key={index} className={`text-center p-3 rounded-lg shadow ${readOnly ? 'bg-white' : 'bg-gray-100 border border-gray-300'}`}>
                {readOnly ? (
                  <p className="text-3xl font-bold text-accent">{statItem.value}</p>
                ) : (
                  <input type="text" value={statItem.value} onChange={(e) => handleNestedChange('stats', index, 'value', e.target.value)} placeholder="Value" className={`text-3xl font-bold text-accent text-center ${commonInputClass}`} />
                )}
                {readOnly ? (
                  <p className="text-sm text-gray-600 mt-1">{statItem.title}</p>
                ) : (
                  <input type="text" value={statItem.title} onChange={(e) => handleNestedChange('stats', index, 'title', e.target.value)} placeholder="Title" className={`text-sm text-gray-600 mt-1 text-center ${commonInputClass}`} />
                )}
                 {/* Icon is not editable for now, could add IconSelectorModal if needed */}
                {!readOnly && (
                  <button onClick={() => handleRemoveItem('stats', index)} className="text-red-500 hover:text-red-700 text-xs mt-2">Remove Stat</button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
             <div className="text-center mt-6">
                <button onClick={() => handleAddItem('stats', { title: "New Stat", value: "0", icon: "FaQuestionCircle" })} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Add Stat</button>
            </div>
          )}
        </div>
        
        {/* Steps (Our Process) */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Our Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            {(steps || []).map((step, index) => {
                const videoDisplayUrl = getDisplayUrl(step.videoSrc, "");
                return (
                    <div key={index} className={`flex flex-col items-center text-center p-3 rounded-lg shadow ${readOnly ? 'bg-white' : 'bg-gray-100 border border-gray-300'}`}>
                        {!readOnly && (
                            <div className="w-full mb-2">
                                <label className="block text-xs font-medium text-gray-600 mb-0.5">Step Video:</label>
                                <input type="file" accept="video/*" onChange={(e) => handleNestedFileChange('steps', index, 'videoSrc', e.target.files?.[0])} className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 mb-1"/>
                                <input type="text" placeholder="Or video URL" value={typeof step.videoSrc === 'string' ? step.videoSrc : step.videoSrc?.url || ''} onChange={(e) => handleNestedUrlChange('steps', index, 'videoSrc', e.target.value)} className={`${commonInputClass} text-xs border border-gray-300`} />
                            </div>
                        )}
                        {videoDisplayUrl && (
                             <div className="w-full h-32 bg-black rounded-md overflow-hidden mb-3 flex items-center justify-center">
                                <video 
                                    src={videoDisplayUrl} 
                                    className="max-w-full max-h-full object-contain"
                                    autoPlay={!readOnly} // Autoplay in edit mode might be useful for preview
                                    loop 
                                    muted 
                                    playsInline 
                                    controls={readOnly} // Show controls only in readOnly mode
                                />
                            </div>
                        )}
                        {readOnly ? (
                            <h3 className="text-lg font-medium">{step.title}</h3>
                        ) : (
                             <input type="text" value={step.title} onChange={(e) => handleNestedChange('steps', index, 'title', e.target.value)} placeholder="Step Title" className={`text-lg font-medium text-center ${commonInputClass} mb-1`} />
                        )}
                        {readOnly ? (
                            step.href && <a href={step.href} className="text-blue-600 hover:text-blue-800 text-sm mt-1">Learn More</a>
                        ) : (
                            <input type="text" value={step.href || ""} onChange={(e) => handleNestedChange('steps', index, 'href', e.target.value)} placeholder="Link URL (e.g., /#contact)" className={`text-blue-600 text-sm text-center ${commonInputClass} mt-1`} />
                        )}
                        {!readOnly && (
                             <div className="w-full mt-2">
                                <label className="block text-xs font-medium text-gray-600">Scale (e.g., 1.0):</label>
                                <input type="number" step="0.01" value={step.scale || 1.0} onChange={(e) => handleNestedChange('steps', index, 'scale', parseFloat(e.target.value))} className={`text-sm text-center ${commonInputClass} w-20 mx-auto`} />
                             </div>
                        )}
                        {!readOnly && (
                            <button onClick={() => handleRemoveItem('steps', index)} className="text-red-500 hover:text-red-700 text-xs mt-3">Remove Step</button>
                        )}
                    </div>
                );
            })}
          </div>
           {!readOnly && (
             <div className="text-center mt-6">
                <button onClick={() => handleAddItem('steps', { title: "New Step", videoSrc: "", href: "", scale: 1.0 })} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Add Process Step</button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

AboutContent.propTypes = {
  aboutData: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    history: PropTypes.string,
    mission: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    })),
    team: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        photo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string, // Icon name string
      })
    ),
    heroImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    steps: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        href: PropTypes.string,
        scale: PropTypes.number,
    })),
  }),
  readOnly: PropTypes.bool,
  onConfigChange: PropTypes.func,
};

/* ======================================================
   MAIN COMPONENT: AboutBlock
   ------------------------------------------------------
   Main component that handles the state and switching between
   read-only preview and editable modes. Now directly uses AboutContent
   and passes onConfigChange for inline editing.
========================================================= */
export default function AboutBlock({
  readOnly = false,
  aboutData, // This prop comes from OneForm (aboutPageJsonData) or App.jsx (dedicatedAboutPageData)
  onConfigChange, // This prop comes from OneForm
}) {
  // localData will hold the structure from about_page.json
  // It will be initialized or updated from the aboutData prop.
  const [localData, setLocalData] = useState(() => {
    // Ensure all fields from about_page.json are initialized
    const initial = aboutData || {};
    return {
      title: initial.title || "Default Title",
      subtitle: initial.subtitle || "Default Subtitle.",
      history: initial.history || "Default history.",
      mission: initial.mission || "Default mission.",
      values: (initial.values || []).map(v => ({ ...v })),
      team: (initial.team || []).map(t => ({ ...t, photo: initializeImageState(t.photo) })),
      stats: (initial.stats || []).map(s => ({ ...s })),
      heroImage: initializeImageState(initial.heroImage),
      steps: (initial.steps || []).map(st => ({ ...st, videoSrc: initializeImageState(st.videoSrc) })),
    };
  });

  const prevReadOnlyRef = useRef(readOnly);
  const prevAboutDataRef = useRef(aboutData);


  useEffect(() => {
    // If the incoming aboutData prop changes, update localData
    // This handles initial load and external updates if OneForm re-passes data.
    if (aboutData && aboutData !== prevAboutDataRef.current) {
      setLocalData(prevLocal => {
        // Create a new state based on aboutData, ensuring image/video objects are correctly initialized
        const newHeroImage = initializeImageState(aboutData.heroImage, prevLocal.heroImage?.originalUrl);
        if(prevLocal.heroImage?.file && prevLocal.heroImage.url?.startsWith('blob:') && prevLocal.heroImage.url !== newHeroImage.url) {
            URL.revokeObjectURL(prevLocal.heroImage.url);
        }

        const newTeam = (aboutData.team || []).map((newMember, idx) => {
            const oldMember = prevLocal.team?.[idx];
            const newPhoto = initializeImageState(newMember.photo, oldMember?.photo?.originalUrl);
            if(oldMember?.photo?.file && oldMember.photo.url?.startsWith('blob:') && oldMember.photo.url !== newPhoto.url) {
                 URL.revokeObjectURL(oldMember.photo.url);
            }
            return { ...newMember, photo: newPhoto };
        });
        
        const newSteps = (aboutData.steps || []).map((newStep, idx) => {
            const oldStep = prevLocal.steps?.[idx];
            const newVideoSrc = initializeImageState(newStep.videoSrc, oldStep?.videoSrc?.originalUrl);
             if(oldStep?.videoSrc?.file && oldStep.videoSrc.url?.startsWith('blob:') && oldStep.videoSrc.url !== newVideoSrc.url) {
                 URL.revokeObjectURL(oldStep.videoSrc.url);
            }
            return { ...newStep, videoSrc: newVideoSrc };
        });

        return {
          ...aboutData, // Spread all properties from the incoming aboutData
          heroImage: newHeroImage,
          team: newTeam,
          steps: newSteps,
          // Ensure other arrays are also fresh copies if they exist in aboutData
          values: (aboutData.values || []).map(v => ({...v})),
          stats: (aboutData.stats || []).map(s => ({...s})),
        };
      });
      prevAboutDataRef.current = aboutData;
    }
  }, [aboutData]);


  useEffect(() => {
    // Cleanup blob URLs when component unmounts or localData changes significantly
    return () => {
      const cleanupItem = (item) => {
        if (item && typeof item === 'object' && item.url && item.url.startsWith('blob:')) {
          URL.revokeObjectURL(item.url);
        }
      };
      cleanupItem(localData.heroImage);
      (localData.team || []).forEach(member => cleanupItem(member.photo));
      (localData.steps || []).forEach(step => cleanupItem(step.videoSrc));
    };
  }, [localData.heroImage, localData.team, localData.steps]);


  // This effect is crucial for OneForm. When editing is "finished" (readOnly becomes true),
  // it calls onConfigChange with the final state of localData.
  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        // Pass localData directly. OneForm's handleSubmit will process it with traverseAndModifyDataForZip
        onConfigChange(localData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  // This function is passed to AboutContent, which calls it when an inline edit occurs.
  // It updates localData, and because onConfigChange depends on localData (in the useEffect above),
  // this will effectively make OneForm aware of changes "live" if readOnly is false,
  // or provide the final data when readOnly becomes true.
  const handleLocalDataUpdate = (updatedAboutData) => {
    setLocalData(updatedAboutData);
    // If not readOnly, and onConfigChange is provided (from OneForm), call it immediately.
    if (!readOnly && onConfigChange) {
      onConfigChange(updatedAboutData);
    }
  };

  if (readOnly && (!aboutData || Object.keys(aboutData).length === 0)) {
    return <div className="p-4 text-center text-gray-500">About information not available.</div>;
  }
  
  // When readOnly is false (editing in OneForm), pass localData and handleLocalDataUpdate.
  // When readOnly is true (display on /about page), pass aboutData (which comes from App.jsx).
  return (
    <AboutContent
      aboutData={readOnly ? aboutData : localData}
      readOnly={readOnly}
      onConfigChange={handleLocalDataUpdate} // Pass the single updater function
    />
  );
}

AboutBlock.propTypes = {
  readOnly: PropTypes.bool,
  aboutData: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    history: PropTypes.string,
    mission: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
    })),
    team: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        position: PropTypes.string,
        photo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    })),
    stats: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        icon: PropTypes.string, // Icon name string
      })
    ),
    heroImage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    steps: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        videoSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        href: PropTypes.string,
        scale: PropTypes.number,
    })),
  }),
  onConfigChange: PropTypes.func,
};

AboutBlock.defaultProps = {
  readOnly: false,
  aboutData: null, // Default to null, OneForm will provide data for editing
  onConfigChange: () => {}, // Default to a no-op function
};

// Helper to initialize image/video state: handles string path or {file, url, name, originalUrl} object
// Ensures originalUrl is preserved or set.
const initializeImageState = (itemConfig, defaultPath = null) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath ? defaultPath.split('/').pop() : 'default_asset';
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (itemConfig && typeof itemConfig === 'object') {
    // If itemConfig has a file, it's from an upload, url should be a blob.
    // If it doesn't have a file, url should be a string path.
    fileObject = itemConfig.file || null;
    urlToDisplay = itemConfig.url || defaultPath; // Use existing URL or default
    nameToStore = itemConfig.name || (urlToDisplay ? urlToDisplay.split('/').pop() : nameToStore);
    
    // originalUrl logic:
    // 1. If itemConfig.originalUrl exists, use it.
    // 2. Else, if itemConfig.url is a string and not a blob, it's the original.
    // 3. Else, use the defaultPath as original.
    originalUrlToStore = itemConfig.originalUrl || 
                         (typeof itemConfig.url === 'string' && !itemConfig.url.startsWith('blob:') ? itemConfig.url : defaultPath);

  } else if (typeof itemConfig === 'string') { // It's a path string
    urlToDisplay = itemConfig;
    nameToStore = itemConfig.split('/').pop();
    originalUrlToStore = itemConfig; // The path itself is the original URL
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
  const { virtualFS } = useConfig();
  
  if (!imageValue) return defaultPath;
  
  // If it's a string path, check for override
  if (typeof imageValue === 'string') {
    const path = imageValue.startsWith('/') ? imageValue.substring(1) : imageValue;
    if (virtualFS && virtualFS[path]) {
      return virtualFS[path];
    }
    return imageValue;
  }
  
  // If it's an object with a url property
  if (typeof imageValue === 'object' && imageValue.url) {
    // If it's a blob URL, return it directly
    if (imageValue.url.startsWith('blob:')) {
      return imageValue.url;
    }
    
    // If it's a path, check for override
    const path = imageValue.url.startsWith('/') ? imageValue.url.substring(1) : imageValue.url;
    if (virtualFS && virtualFS[path]) {
      return virtualFS[path];
    }
    return imageValue.url;
  }
  
  return defaultPath;
};
