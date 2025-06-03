import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaUsers, FaHistory, FaAward, FaHandshake } from "react-icons/fa";
import ThemeColorPicker from "../common/ThemeColorPicker";
import { useConfig } from "../../context/ConfigContext";

/* ======================================================
   ABOUT PREVIEW COMPONENT (Read-Only & Inline Edit)
   ------------------------------------------------------
   This component shows the About section with inline editing
   that looks identical to read-only mode.
========================================================= */
function AboutPreview({ 
  aboutData, 
  readOnly = true, 
  onFieldChange,
  onNestedChange,
  onAddItem,
  onRemoveItem
}) {
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

  const heroImageDisplayUrl = getDisplayUrl(heroImage, "/assets/images/about/default-hero.jpg");

  const commonInputClass = "bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1";

  return (
    <section className="py-12 md:py-16 bg-gray-50 text-gray-800">
      <div className="container mx-auto px-4 space-y-12">
        
        {/* Main Title and Subtitle */}
        <div className="text-center">
          {readOnly ? (
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{title}</h1>
          ) : (
            <input 
              type="text" 
              value={title} 
              onChange={(e) => onFieldChange && onFieldChange('title', e.target.value)} 
              className={`text-4xl md:text-5xl font-bold mb-2 text-center w-full ${commonInputClass}`}
              placeholder="Main Title"
            />
          )}
          {readOnly ? (
            <p className="text-lg text-gray-600">{subtitle}</p>
          ) : (
            <input 
              type="text" 
              value={subtitle} 
              onChange={(e) => onFieldChange && onFieldChange('subtitle', e.target.value)} 
              className={`text-lg text-gray-600 text-center w-full ${commonInputClass} mt-1`}
              placeholder="Subtitle"
            />
          )}
        </div>

        {/* Hero Image Section */}
        <div className="mb-8">
          {heroImageDisplayUrl && (
            <img 
              src={heroImageDisplayUrl} 
              alt={title || 'About Hero'} 
              className="rounded-lg shadow-xl w-full h-64 md:h-96 object-cover" 
            />
          )}
        </div>

        {/* History */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Our History</h2>
          {readOnly ? (
            <p className="text-gray-700 leading-relaxed">{history}</p>
          ) : (
            <textarea 
              value={history} 
              onChange={(e) => onFieldChange && onFieldChange('history', e.target.value)} 
              className={`${commonInputClass} w-full h-24 resize-none text-gray-700 leading-relaxed`}
              placeholder="Company History"
            />
          )}
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Our Mission</h2>
          {readOnly ? (
            <p className="text-gray-700 leading-relaxed">{mission}</p>
          ) : (
            <textarea 
              value={mission} 
              onChange={(e) => onFieldChange && onFieldChange('mission', e.target.value)} 
              className={`${commonInputClass} w-full h-24 resize-none text-gray-700 leading-relaxed`}
              placeholder="Company Mission"
            />
          )}
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(values || []).map((valueItem, index) => (
              <div key={index} className="p-4 rounded-lg shadow bg-white">
                {readOnly ? (
                  <h3 className="text-xl font-semibold text-accent mb-1">{valueItem.title}</h3>
                ) : (
                  <input 
                    type="text" 
                    value={valueItem.title} 
                    onChange={(e) => onNestedChange && onNestedChange('values', index, 'title', e.target.value)} 
                    className={`text-xl font-semibold text-accent mb-1 w-full ${commonInputClass}`}
                    placeholder="Value Title"
                  />
                )}
                {readOnly ? (
                  <p className="text-gray-600">{valueItem.description}</p>
                ) : (
                  <textarea 
                    value={valueItem.description} 
                    onChange={(e) => onNestedChange && onNestedChange('values', index, 'description', e.target.value)} 
                    className={`text-gray-600 w-full h-20 resize-none ${commonInputClass} mt-1`}
                    placeholder="Value Description"
                  />
                )}
                {!readOnly && (
                  <button 
                    onClick={() => onRemoveItem && onRemoveItem('values', index)} 
                    className="text-red-500 hover:text-red-700 text-xs mt-2"
                  >
                    Remove Value
                  </button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <button 
              onClick={() => onAddItem && onAddItem('values', { title: "New Value", description: "Description" })} 
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
            >
              Add Value
            </button>
          )}
        </div>
        
        {/* Team */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(team || []).map((member, index) => {
              const photoDisplayUrl = getDisplayUrl(member.photo, "/assets/images/team/default-profile.png");
              return (
                <div key={index} className="text-center p-4 rounded-lg shadow bg-white">
                  <img 
                    src={photoDisplayUrl} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-3 object-cover" 
                  />
                  {readOnly ? (
                    <h3 className="text-lg font-medium">{member.name}</h3>
                  ) : (
                    <input 
                      type="text" 
                      value={member.name} 
                      onChange={(e) => onNestedChange && onNestedChange('team', index, 'name', e.target.value)} 
                      className={`text-lg font-medium text-center w-full ${commonInputClass}`}
                      placeholder="Team Member Name"
                    />
                  )}
                  {readOnly ? (
                    <p className="text-gray-500 text-sm">{member.position}</p>
                  ) : (
                    <input 
                      type="text" 
                      value={member.position} 
                      onChange={(e) => onNestedChange && onNestedChange('team', index, 'position', e.target.value)} 
                      className={`text-gray-500 text-sm text-center w-full ${commonInputClass} mt-1`}
                      placeholder="Position"
                    />
                  )}
                  {!readOnly && (
                    <button 
                      onClick={() => onRemoveItem && onRemoveItem('team', index)} 
                      className="text-red-500 hover:text-red-700 text-xs mt-2"
                    >
                      Remove Member
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {!readOnly && (
            <div className="text-center mt-6">
              <button 
                onClick={() => onAddItem && onAddItem('team', { name: "New Member", position: "Role", photo: "/assets/images/team/default-profile.png" })} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
              >
                Add Team Member
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Our Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(stats || []).map((statItem, index) => (
              <div key={index} className="text-center p-3 rounded-lg shadow bg-white">
                {readOnly ? (
                  <p className="text-3xl font-bold text-accent">{statItem.value}</p>
                ) : (
                  <input 
                    type="text" 
                    value={statItem.value} 
                    onChange={(e) => onNestedChange && onNestedChange('stats', index, 'value', e.target.value)} 
                    className={`text-3xl font-bold text-accent text-center w-full ${commonInputClass}`}
                    placeholder="Value"
                  />
                )}
                {readOnly ? (
                  <p className="text-sm text-gray-600 mt-1">{statItem.title}</p>
                ) : (
                  <input 
                    type="text" 
                    value={statItem.title} 
                    onChange={(e) => onNestedChange && onNestedChange('stats', index, 'title', e.target.value)} 
                    className={`text-sm text-gray-600 mt-1 text-center w-full ${commonInputClass}`}
                    placeholder="Title"
                  />
                )}
                {!readOnly && (
                  <button 
                    onClick={() => onRemoveItem && onRemoveItem('stats', index)} 
                    className="text-red-500 hover:text-red-700 text-xs mt-2"
                  >
                    Remove Stat
                  </button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <div className="text-center mt-6">
              <button 
                onClick={() => onAddItem && onAddItem('stats', { title: "New Stat", value: "0", icon: "FaQuestionCircle" })} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
              >
                Add Stat
              </button>
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
                <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg shadow bg-white">
                  {videoDisplayUrl && (
                    <div className="w-full h-32 bg-black rounded-md overflow-hidden mb-3 flex items-center justify-center">
                      <video 
                        src={videoDisplayUrl} 
                        className="max-w-full max-h-full object-contain"
                        autoPlay={!readOnly}
                        loop 
                        muted 
                        playsInline 
                        controls={readOnly}
                      />
                    </div>
                  )}
                  {readOnly ? (
                    <h3 className="text-lg font-medium">{step.title}</h3>
                  ) : (
                    <input 
                      type="text" 
                      value={step.title} 
                      onChange={(e) => onNestedChange && onNestedChange('steps', index, 'title', e.target.value)} 
                      className={`text-lg font-medium text-center w-full ${commonInputClass} mb-1`}
                      placeholder="Step Title"
                    />
                  )}
                  {readOnly ? (
                    step.href && <a href={step.href} className="text-blue-600 hover:text-blue-800 text-sm mt-1">Learn More</a>
                  ) : (
                    <input 
                      type="text" 
                      value={step.href || ""} 
                      onChange={(e) => onNestedChange && onNestedChange('steps', index, 'href', e.target.value)} 
                      className={`text-blue-600 text-sm text-center w-full ${commonInputClass} mt-1`}
                      placeholder="Link URL (e.g., /#contact)"
                    />
                  )}
                  {!readOnly && (
                    <>
                      <div className="w-full mt-2">
                        <label className="block text-xs font-medium text-gray-600">Scale (e.g., 1.0):</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={step.scale || 1.0} 
                          onChange={(e) => onNestedChange && onNestedChange('steps', index, 'scale', parseFloat(e.target.value))} 
                          className={`text-sm text-center w-20 mx-auto ${commonInputClass}`}
                        />
                      </div>
                      <button 
                        onClick={() => onRemoveItem && onRemoveItem('steps', index)} 
                        className="text-red-500 hover:text-red-700 text-xs mt-3"
                      >
                        Remove Step
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {!readOnly && (
            <div className="text-center mt-6">
              <button 
                onClick={() => onAddItem && onAddItem('steps', { title: "New Step", videoSrc: "", href: "", scale: 1.0 })} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm"
              >
                Add Process Step
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

/* ======================================================
   ABOUT EDITOR PANEL (Image uploads and controls)
   ------------------------------------------------------
   Similar to BeforeAfterEditorPanel, handles complex controls
========================================================= */
function AboutEditorPanel({ localData, onPanelChange, onFileChange, themeColors }) {
  const { team = [], steps = [] } = localData;

  const handleHeroImageChange = (file) => {
    if (onFileChange) {
      onFileChange('heroImage', file);
    }
  };

  const handleTeamPhotoChange = (index, file) => {
    if (onFileChange) {
      onFileChange({ field: 'photo', teamIndex: index }, file);
    }
  };

  const handleStepVideoChange = (index, file) => {
    if (onFileChange) {
      onFileChange({ field: 'videoSrc', stepIndex: index }, file);
    }
  };

  return (
    <div className="bg-white text-gray-800 p-4 rounded border-t border-gray-200">
      <h2 className="text-lg font-semibold mb-4">About Page Settings</h2>
      
      <div className="space-y-6">
        {/* Hero Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => handleHeroImageChange(e.target.files?.[0])} 
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {getDisplayUrl(localData.heroImage) && (
            <img 
              src={getDisplayUrl(localData.heroImage)} 
              alt="Hero Preview" 
              className="mt-2 h-20 w-auto object-contain rounded bg-gray-100 p-1"
            />
          )}
        </div>

        {/* Team Photos */}
        {team.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Team Photos:</h3>
            <div className="space-y-2">
              {team.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium min-w-0 flex-1">{member.name || `Member ${index + 1}`}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => handleTeamPhotoChange(index, e.target.files?.[0])} 
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  {getDisplayUrl(member.photo) && (
                    <img 
                      src={getDisplayUrl(member.photo)} 
                      alt={member.name} 
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Process Step Videos */}
        {steps.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Process Step Videos:</h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium min-w-0 flex-1">{step.title || `Step ${index + 1}`}</span>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => handleStepVideoChange(index, e.target.files?.[0])} 
                    className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                  {getDisplayUrl(step.videoSrc) && (
                    <div className="h-8 w-12 bg-black rounded overflow-hidden">
                      <video 
                        src={getDisplayUrl(step.videoSrc)} 
                        className="w-full h-full object-cover"
                        muted
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Theme Colors */}
        {themeColors && (
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-2">Theme Colors:</h3>
            <div className="grid grid-cols-2 gap-3">
              <ThemeColorPicker
                label="Accent Color"
                currentColorValue={themeColors.accent || '#2B4C7E'}
                themeColors={themeColors}
                onColorChange={(fieldName, value) => {
                  // This would need to be handled by parent component
                  console.log('Color change:', fieldName, value);
                }}
                fieldName="accent"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   MAIN COMPONENT: AboutBlock
   ------------------------------------------------------
   Main component that handles the state and switching between
   read-only preview and editable modes with separate edit panel.
========================================================= */
export default function AboutBlock({
  readOnly = false,
  aboutData,
  onConfigChange,
  themeColors,
}) {
  const [localData, setLocalData] = useState(() => {
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
    if (aboutData && aboutData !== prevAboutDataRef.current) {
      setLocalData(prevLocal => {
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
          ...aboutData,
          heroImage: newHeroImage,
          team: newTeam,
          steps: newSteps,
          values: (aboutData.values || []).map(v => ({...v})),
          stats: (aboutData.stats || []).map(s => ({...s})),
        };
      });
      prevAboutDataRef.current = aboutData;
    }
  }, [aboutData]);

  useEffect(() => {
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

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        onConfigChange(localData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataUpdate = (updatedAboutData) => {
    setLocalData(updatedAboutData);
    if (!readOnly && onConfigChange) {
      onConfigChange(updatedAboutData);
    }
  };

  const handleFieldChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (listName, index, field, value) => {
    setLocalData(prev => {
      const newList = [...(prev[listName] || [])];
      if (newList[index]) {
        newList[index] = { ...newList[index], [field]: value };
      }
      return { ...prev, [listName]: newList };
    });
  };

  const handleAddItem = (listName, newItemTemplate) => {
    setLocalData(prev => {
      const newList = [...(prev[listName] || []), newItemTemplate];
      return { ...prev, [listName]: newList };
    });
  };

  const handleRemoveItem = (listName, index) => {
    setLocalData(prev => {
      const list = prev[listName] || [];
      const itemToRemove = list[index];
      if (itemToRemove) {
        for (const key in itemToRemove) {
          if (itemToRemove[key] && typeof itemToRemove[key] === 'object' && itemToRemove[key].url && itemToRemove[key].url.startsWith('blob:')) {
            URL.revokeObjectURL(itemToRemove[key].url);
          }
        }
      }
      const newList = list.filter((_, i) => i !== index);
      return { ...prev, [listName]: newList };
    });
  };

  const handleFileChange = (fieldOrPath, file) => {
    if (!file) return;

    if (typeof fieldOrPath === 'string') {
      // Hero image
      const currentHeroImage = localData.heroImage;
      let originalUrl = typeof currentHeroImage === 'string' ? currentHeroImage : currentHeroImage?.originalUrl;

      if (currentHeroImage && typeof currentHeroImage === 'object' && currentHeroImage.url && currentHeroImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentHeroImage.url);
      }
      const fileURL = URL.createObjectURL(file);
      setLocalData(prev => ({
        ...prev,
        heroImage: {
          file,
          url: fileURL,
          name: file.name,
          originalUrl: originalUrl
        }
      }));
    } else if (fieldOrPath.teamIndex !== undefined) {
      // Team photo
      const teamIndex = fieldOrPath.teamIndex;
      setLocalData(prev => {
        const newTeam = [...prev.team];
        const currentPhoto = newTeam[teamIndex]?.photo;
        if (currentPhoto?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(currentPhoto.url);
        }
        const fileURL = URL.createObjectURL(file);
        newTeam[teamIndex] = {
          ...newTeam[teamIndex],
          photo: {
            file,
            url: fileURL,
            name: file.name,
            originalUrl: currentPhoto?.originalUrl
          }
        };
        return { ...prev, team: newTeam };
      });
    } else if (fieldOrPath.stepIndex !== undefined) {
      // Step video
      const stepIndex = fieldOrPath.stepIndex;
      setLocalData(prev => {
        const newSteps = [...prev.steps];
        const currentVideo = newSteps[stepIndex]?.videoSrc;
        if (currentVideo?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(currentVideo.url);
        }
        const fileURL = URL.createObjectURL(file);
        newSteps[stepIndex] = {
          ...newSteps[stepIndex],
          videoSrc: {
            file,
            url: fileURL,
            name: file.name,
            originalUrl: currentVideo?.originalUrl
          }
        };
        return { ...prev, steps: newSteps };
      });
    }
  };

  const handleUrlChange = (urlValue, currentValue) => {
    // Revoke old blob URL if it exists
    if (currentValue && typeof currentValue === 'object' && currentValue.url && currentValue.url.startsWith('blob:')) {
      URL.revokeObjectURL(currentValue.url);
    }

    return {
      file: null,
      url: urlValue,
      name: urlValue.split('/').pop(),
      originalUrl: urlValue
    };
  };

  if (readOnly && (!aboutData || Object.keys(aboutData).length === 0)) {
    return <div className="p-4 text-center text-gray-500">About information not available.</div>;
  }

  // Always show the preview, with optional editor panel at bottom
  return (
    <>
      <AboutPreview
        aboutData={readOnly ? aboutData : localData}
        readOnly={readOnly}
        onFieldChange={!readOnly ? handleFieldChange : undefined}
        onNestedChange={!readOnly ? handleNestedChange : undefined}
        onAddItem={!readOnly ? handleAddItem : undefined}
        onRemoveItem={!readOnly ? handleRemoveItem : undefined}
      />
      {!readOnly && (
        <AboutEditorPanel
          localData={localData}
          onPanelChange={handleLocalDataUpdate}
          onFileChange={handleFileChange}
          themeColors={themeColors}
        />
      )}
    </>
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
        icon: PropTypes.string,
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
  themeColors: PropTypes.object,
};

AboutBlock.defaultProps = {
  readOnly: false,
  aboutData: null,
  onConfigChange: () => {},
};

// Helper to initialize image/video state: handles string path or {file, url, name, originalUrl} object
const initializeImageState = (itemConfig, defaultPath = null) => {
  let originalUrlToStore = defaultPath;
  let nameToStore = defaultPath ? defaultPath.split('/').pop() : 'default_asset';
  let urlToDisplay = defaultPath;
  let fileObject = null;

  if (itemConfig && typeof itemConfig === 'object') {
    fileObject = itemConfig.file || null;
    urlToDisplay = itemConfig.url || defaultPath;
    nameToStore = itemConfig.name || (urlToDisplay ? urlToDisplay.split('/').pop() : nameToStore);
    
    originalUrlToStore = itemConfig.originalUrl || 
                         (typeof itemConfig.url === 'string' && !itemConfig.url.startsWith('blob:') ? itemConfig.url : defaultPath);

    // If we have a file but no blob URL, create one for preview
    if (fileObject && !urlToDisplay.startsWith('blob:')) {
      urlToDisplay = URL.createObjectURL(fileObject);
    }
  } else if (typeof itemConfig === 'string') {
    urlToDisplay = itemConfig;
    nameToStore = itemConfig.split('/').pop();
    originalUrlToStore = itemConfig;
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

// Helper function to handle file changes for individual items
const handleFileChangeHelper = (file, currentValue) => {
  if (!file) return currentValue;

  // Revoke old blob URL if it exists
  if (currentValue && typeof currentValue === 'object' && currentValue.url && currentValue.url.startsWith('blob:')) {
    URL.revokeObjectURL(currentValue.url);
  }

  // Create new blob URL for preview
  const fileURL = URL.createObjectURL(file);
  
  return {
    file: file,
    url: fileURL,
    name: file.name,
    originalUrl: currentValue?.originalUrl || null
  };
};

// Helper function to handle URL changes for individual items
const handleUrlChangeHelper = (urlValue, currentValue) => {
  // Revoke old blob URL if it exists
  if (currentValue && typeof currentValue === 'object' && currentValue.url && currentValue.url.startsWith('blob:')) {
    URL.revokeObjectURL(currentValue.url);
  }

  return {
    file: null,
    url: urlValue,
    name: urlValue.split('/').pop(),
    originalUrl: urlValue
  };
};

// Export EditorPanel for potential external usage (matching BeforeAfterBlock pattern)
AboutBlock.EditorPanel = AboutEditorPanel;
