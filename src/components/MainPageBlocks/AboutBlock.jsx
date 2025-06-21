import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FaUsers, FaHistory, FaAward, FaHandshake } from "react-icons/fa";
import ThemeColorPicker from "../common/ThemeColorPicker";
import PanelImagesController from "../common/PanelImagesController";
import PanelStylingController from "../common/PanelStylingController";
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
    steps = [{title: "Book", videoSrc: "/assets/videos/our_process_videos/booking.mp4", href: "/#booking", scale: 0.8 }],
    // color properties
    sectionBackgroundColor = '#F9FAFB',
    textColor = '#374151',
    subtitleColor = '#4B5563',
    accentColor = '#2B4C7E',
    cardBackgroundColor = '#FFFFFF',
    cardTextColor = '#4B5563'
  } = aboutData;

  const heroImageDisplayUrl = getDisplayUrl(heroImage, "/assets/images/about/default-hero.jpg");

  const commonInputClass = "bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1";

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: sectionBackgroundColor, color: textColor }}>
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
              style={{ color: textColor }}
            />
          )}
          {readOnly ? (
            <p className="text-lg" style={{ color: subtitleColor }}>{subtitle}</p>
          ) : (
            <input 
              type="text" 
              value={subtitle} 
              onChange={(e) => onFieldChange && onFieldChange('subtitle', e.target.value)} 
              className={`text-lg text-center w-full ${commonInputClass} mt-1`}
              placeholder="Subtitle"
              style={{ color: subtitleColor }}
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
            <p className="leading-relaxed" style={{ color: textColor }}>{history}</p>
          ) : (
            <textarea 
              value={history} 
              onChange={(e) => onFieldChange && onFieldChange('history', e.target.value)} 
              className={`${commonInputClass} w-full h-24 resize-none leading-relaxed`}
              placeholder="Company History"
              style={{ color: textColor }}
            />
          )}
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3">Our Mission</h2>
          {readOnly ? (
            <p className="leading-relaxed" style={{ color: textColor }}>{mission}</p>
          ) : (
            <textarea 
              value={mission} 
              onChange={(e) => onFieldChange && onFieldChange('mission', e.target.value)} 
              className={`${commonInputClass} w-full h-24 resize-none leading-relaxed`}
              placeholder="Company Mission"
              style={{ color: textColor }}
            />
          )}
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(values || []).map((valueItem, index) => (
              <div key={index} className="p-4 rounded-lg shadow" style={{ backgroundColor: cardBackgroundColor }}>
                {readOnly ? (
                  <h3 className="text-xl font-semibold mb-1" style={{ color: accentColor }}>{valueItem.title}</h3>
                ) : (
                  <input 
                    type="text" 
                    value={valueItem.title} 
                    onChange={(e) => onNestedChange && onNestedChange('values', index, 'title', e.target.value)} 
                    className={`text-xl font-semibold mb-1 w-full ${commonInputClass}`}
                    placeholder="Value Title"
                    style={{ color: accentColor }}
                  />
                )}
                {readOnly ? (
                  <p style={{ color: cardTextColor }}>{valueItem.description}</p>
                ) : (
                  <textarea 
                    value={valueItem.description} 
                    onChange={(e) => onNestedChange && onNestedChange('values', index, 'description', e.target.value)} 
                    className={`w-full h-20 resize-none ${commonInputClass} mt-1`}
                    placeholder="Value Description"
                    style={{ color: cardTextColor }}
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
                <div key={index} className="text-center p-4 rounded-lg shadow" style={{ backgroundColor: cardBackgroundColor }}>
                  <img 
                    src={photoDisplayUrl} 
                    alt={member.name} 
                    className="w-32 h-32 rounded-full mx-auto mb-3 object-cover" 
                  />
                  {readOnly ? (
                    <h3 className="text-lg font-medium" style={{ color: cardTextColor }}>{member.name}</h3>
                  ) : (
                    <input 
                      type="text" 
                      value={member.name} 
                      onChange={(e) => onNestedChange && onNestedChange('team', index, 'name', e.target.value)} 
                      className={`text-lg font-medium text-center w-full ${commonInputClass}`}
                      placeholder="Team Member Name"
                      style={{ color: cardTextColor }}
                    />
                  )}
                  {readOnly ? (
                    <p className="text-sm" style={{ color: cardTextColor }}>{member.position}</p>
                  ) : (
                    <input 
                      type="text" 
                      value={member.position} 
                      onChange={(e) => onNestedChange && onNestedChange('team', index, 'position', e.target.value)} 
                      className={`text-sm text-center w-full ${commonInputClass} mt-1`}
                      placeholder="Position"
                      style={{ color: cardTextColor }}
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
              <div key={index} className="text-center p-3 rounded-lg shadow" style={{ backgroundColor: cardBackgroundColor }}>
                {readOnly ? (
                  <p className="text-3xl font-bold" style={{ color: accentColor }}>{statItem.value}</p>
                ) : (
                  <input 
                    type="text" 
                    value={statItem.value} 
                    onChange={(e) => onNestedChange && onNestedChange('stats', index, 'value', e.target.value)} 
                    className={`text-3xl font-bold text-center w-full ${commonInputClass}`}
                    placeholder="Value"
                    style={{ color: accentColor }}
                  />
                )}
                {readOnly ? (
                  <p className="text-sm mt-1" style={{ color: cardTextColor }}>{statItem.title}</p>
                ) : (
                  <input 
                    type="text" 
                    value={statItem.title} 
                    onChange={(e) => onNestedChange && onNestedChange('stats', index, 'title', e.target.value)} 
                    className={`text-sm mt-1 text-center w-full ${commonInputClass}`}
                    placeholder="Title"
                    style={{ color: cardTextColor }}
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
                <div key={index} className="flex flex-col items-center text-center p-3 rounded-lg shadow" style={{ backgroundColor: cardBackgroundColor }}>
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
                            <h3 className="text-lg font-medium" style={{ color: cardTextColor }}>{step.title}</h3>
                        ) : (
                    <input 
                      type="text" 
                      value={step.title} 
                      onChange={(e) => onNestedChange && onNestedChange('steps', index, 'title', e.target.value)} 
                      className={`text-lg font-medium text-center w-full ${commonInputClass} mb-1`}
                      placeholder="Step Title"
                      style={{ color: cardTextColor }}
                    />
                        )}
                        {readOnly ? (
                            step.href && <a href={step.href} className="text-blue-600 hover:text-blue-800 text-sm mt-1" style={{ color: cardTextColor }}>Learn More</a>
                        ) : (
                    <input 
                      type="text" 
                      value={step.href || ""} 
                      onChange={(e) => onNestedChange && onNestedChange('steps', index, 'href', e.target.value)} 
                      className={`text-blue-600 text-sm text-center w-full ${commonInputClass} mt-1`}
                      placeholder="Link URL (e.g., /#contact)"
                      style={{ color: cardTextColor }}
                    />
                        )}
                        {!readOnly && (
                    <>
                             <div className="w-full mt-2">
                                <label className="block text-xs font-medium text-gray-600" style={{ color: cardTextColor }}>Scale (e.g., 1.0):</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          value={step.scale || 1.0} 
                          onChange={(e) => onNestedChange && onNestedChange('steps', index, 'scale', parseFloat(e.target.value))} 
                          className={`text-sm text-center w-20 mx-auto ${commonInputClass}`}
                          style={{ color: cardTextColor }}
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
   ABOUT IMAGES CONTROLS
   ------------------------------------------------------
   Handles image uploads using PanelImagesController
========================================================= */
const AboutImagesControls = ({ currentData, onControlsChange, themeColors }) => {
  const { team = [], steps = [] } = currentData;

  // Convert team photos to images array format for PanelImagesController
  const teamImagesArray = team.map((member, index) => ({
    id: `team_${index}`,
    url: getDisplayUrl(member.photo, "/assets/images/team/default-profile.png"),
    file: member.photo?.file || null,
    name: `${member.name || `Team Member ${index + 1}`} Photo`,
    originalUrl: member.photo?.originalUrl || "/assets/images/team/default-profile.png",
    memberIndex: index,
    type: 'team'
  }));

  // Handle hero image with PanelImagesController
  const heroImagesArray = currentData.heroImage ? [{
    id: 'hero_image',
    url: getDisplayUrl(currentData.heroImage, "/assets/images/about/default-hero.jpg"),
    file: currentData.heroImage?.file || null,
    name: 'Hero Image',
    originalUrl: currentData.heroImage?.originalUrl || "/assets/images/about/default-hero.jpg",
    type: 'hero'
  }] : [];

  const handleHeroImageChange = (newImagesArray) => {
    const heroImage = newImagesArray.length > 0 ? {
      file: newImagesArray[0].file,
      url: newImagesArray[0].url,
      name: newImagesArray[0].name,
      originalUrl: newImagesArray[0].originalUrl
    } : null;
    onControlsChange({ heroImage });
  };

  const handleTeamImagesChange = (newImagesArray) => {
    const updatedTeam = [...team];
    newImagesArray.forEach(img => {
      const memberIndex = img.memberIndex || 0;
      if (updatedTeam[memberIndex]) {
        updatedTeam[memberIndex] = {
          ...updatedTeam[memberIndex],
          photo: {
            file: img.file,
            url: img.url,
            name: img.name,
            originalUrl: img.originalUrl
          }
        };
      }
    });
    onControlsChange({ team: updatedTeam });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">About Page Images</h3>
      
      <div className="space-y-6">
        {/* Hero Image */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Hero Image</h4>
          <PanelImagesController
            currentData={{ images: heroImagesArray }}
            onControlsChange={(data) => handleHeroImageChange(data.images || [])}
            imageArrayFieldName="images"
            maxImages={1}
          />
        </div>

        {/* Team Photos */}
        {team.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Team Photos</h4>
            <PanelImagesController
              currentData={{ images: teamImagesArray }}
              onControlsChange={(data) => handleTeamImagesChange(data.images || [])}
              imageArrayFieldName="images"
              getItemName={(item, idx) => item.name || `Team Photo ${idx + 1}`}
              maxImages={team.length}
            />
          </div>
        )}
      </div>
    </div>
  );
};

/* ======================================================
   ABOUT COLOR CONTROLS
   ------------------------------------------------------
   Handles color customization using ThemeColorPicker
========================================================= */
const AboutColorControls = ({ currentData, onControlsChange, themeColors }) => {
  const handleColorChange = (fieldName, value) => {
    onControlsChange({ [fieldName]: value });
  };

  return (
    <div className="bg-white text-gray-800 p-3 rounded">
      <h3 className="text-sm font-semibold mb-3">About Page Colors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThemeColorPicker
          label="Section Background:"
          currentColorValue={currentData.sectionBackgroundColor || '#F9FAFB'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="sectionBackgroundColor"
        />
        <ThemeColorPicker
          label="Main Text Color:"
          currentColorValue={currentData.textColor || '#374151'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="textColor"
        />
        <ThemeColorPicker
          label="Subtitle Color:"
          currentColorValue={currentData.subtitleColor || '#4B5563'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="subtitleColor"
        />
        <ThemeColorPicker
          label="Accent Color:"
          currentColorValue={currentData.accentColor || '#2B4C7E'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="accentColor"
        />
        <ThemeColorPicker
          label="Card Background:"
          currentColorValue={currentData.cardBackgroundColor || '#FFFFFF'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="cardBackgroundColor"
        />
        <ThemeColorPicker
          label="Card Text Color:"
          currentColorValue={currentData.cardTextColor || '#4B5563'}
          themeColors={themeColors}
          onColorChange={handleColorChange}
          fieldName="cardTextColor"
        />
      </div>
    </div>
  );
};

/* ======================================================
   ABOUT STYLING CONTROLS
   ------------------------------------------------------
   Handles styling options using PanelStylingController
========================================================= */
const AboutStylingControls = ({ currentData, onControlsChange }) => {
  return (
    <PanelStylingController
      currentData={currentData}
      onControlsChange={onControlsChange}
      blockType="AboutBlock"
      controlType="height"
    />
  );
};

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
      // Add default styling colors
      sectionBackgroundColor: initial.sectionBackgroundColor || '#F9FAFB',
      textColor: initial.textColor || '#374151',
      accentColor: initial.accentColor || '#2B4C7E',
      cardBackgroundColor: initial.cardBackgroundColor || '#FFFFFF',
      subtitleColor: initial.subtitleColor || '#4B5563',
      cardTextColor: initial.cardTextColor || '#4B5563',
      styling: initial.styling || { desktopHeightVH: 35, mobileHeightVW: 60 }
    };
  });

  // Sync with external data changes
  useEffect(() => {
    if (aboutData) {
      setLocalData(prev => {
        const newData = {
          title: aboutData.title || prev.title,
          subtitle: aboutData.subtitle || prev.subtitle,
          history: aboutData.history || prev.history,
          mission: aboutData.mission || prev.mission,
          values: (aboutData.values || []).map(v => ({ ...v })),
          team: (aboutData.team || []).map(t => ({ ...t, photo: initializeImageState(t.photo) })),
          stats: (aboutData.stats || []).map(s => ({ ...s })),
          heroImage: initializeImageState(aboutData.heroImage),
          steps: (aboutData.steps || []).map(st => ({ ...st, videoSrc: initializeImageState(st.videoSrc) })),
          sectionBackgroundColor: aboutData.sectionBackgroundColor || prev.sectionBackgroundColor,
          textColor: aboutData.textColor || prev.textColor,
          accentColor: aboutData.accentColor || prev.accentColor,
          cardBackgroundColor: aboutData.cardBackgroundColor || prev.cardBackgroundColor,
          subtitleColor: aboutData.subtitleColor || prev.subtitleColor,
          cardTextColor: aboutData.cardTextColor || prev.cardTextColor,
          styling: aboutData.styling || prev.styling
        };
        return newData;
      });
    }
  }, [aboutData]);

  const prevReadOnlyRef = useRef(readOnly);
  const prevAboutDataRef = useRef(aboutData);

  useEffect(() => {
    if (prevReadOnlyRef.current === false && readOnly === true) {
      if (onConfigChange) {
        console.log("[AboutBlock] Saving changes:", localData);
        onConfigChange(localData);
      }
    }
    prevReadOnlyRef.current = readOnly;
  }, [readOnly, localData, onConfigChange]);

  const handleLocalDataUpdate = (updatedAboutData) => {
    console.log("[AboutBlock] Local data updated:", updatedAboutData);
    setLocalData(updatedAboutData);
    if (!readOnly && onConfigChange) {
      onConfigChange(updatedAboutData);
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    if (!readOnly && onConfigChange) {
      onConfigChange(updatedData);
    }
  };

  const handleNestedChange = (listName, index, field, value) => {
    setLocalData(prev => {
      const newList = [...(prev[listName] || [])];
      if (newList[index]) {
        newList[index] = { ...newList[index], [field]: value };
      }
      const updatedData = { ...prev, [listName]: newList };
      if (!readOnly && onConfigChange) {
        onConfigChange(updatedData);
      }
      return updatedData;
    });
  };

  const handleAddItem = (listName, newItemTemplate) => {
    setLocalData(prev => {
      const newList = [...(prev[listName] || [])];
      // Ensure proper photo format for new team members
      if (listName === 'team' && newItemTemplate.photo) {
        newItemTemplate = {
          ...newItemTemplate,
          photo: {
            file: null,
            url: `/assets/images/team/${newItemTemplate.photo.name || 'default-profile.png'}`,
            name: newItemTemplate.photo.name || 'default-profile.png',
            originalUrl: `/assets/images/team/${newItemTemplate.photo.name || 'default-profile.png'}`
          }
        };
      }
      newList.push(newItemTemplate);
      const updatedData = { ...prev, [listName]: newList };
      if (!readOnly && onConfigChange) {
        onConfigChange(updatedData);
      }
      return updatedData;
    });
  };

  const handleRemoveItem = (listName, index) => {
    setLocalData(prev => {
      const newList = [...(prev[listName] || [])];
      newList.splice(index, 1);
      const updatedData = { ...prev, [listName]: newList };
      if (!readOnly && onConfigChange) {
        onConfigChange(updatedData);
      }
      return updatedData;
    });
  };

  const handleFileChange = (fieldOrPath, file) => {
    if (!file) return;

    if (typeof fieldOrPath === 'string') {
      // Hero image
      const currentHeroImage = localData.heroImage;
      
      // Clean up old blob URL if it exists
      if (currentHeroImage && typeof currentHeroImage === 'object' && currentHeroImage.url && currentHeroImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(currentHeroImage.url);
      }

      const fileURL = URL.createObjectURL(file);
      const updatedData = {
        ...localData,
        heroImage: {
          file,
          url: `/assets/images/about/${file.name}`,
          name: file.name,
          originalUrl: `/assets/images/about/${file.name}`
        }
      };
      setLocalData(updatedData);
      onConfigChange(updatedData);
    } else if (fieldOrPath.teamIndex !== undefined) {
      // Team photo
      const teamIndex = fieldOrPath.teamIndex;
      const newTeam = [...localData.team];
      const currentPhoto = newTeam[teamIndex]?.photo;
      
      // Clean up old blob URL if it exists
      if (currentPhoto?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPhoto.url);
      }

      const fileURL = URL.createObjectURL(file);
      newTeam[teamIndex] = {
        ...newTeam[teamIndex],
        photo: {
          file,
          url: `/assets/images/team/${file.name}`,
          name: file.name,
          originalUrl: `/assets/images/team/${file.name}`
        }
      };
      const updatedData = { ...localData, team: newTeam };
      setLocalData(updatedData);
      onConfigChange(updatedData);
    } else if (fieldOrPath.stepIndex !== undefined) {
      // Step video
      const stepIndex = fieldOrPath.stepIndex;
      const newSteps = [...localData.steps];
      const currentVideo = newSteps[stepIndex]?.videoSrc;
      
      // Clean up old blob URL if it exists
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
      const updatedData = { ...localData, steps: newSteps };
      setLocalData(updatedData);
      onConfigChange(updatedData);
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

  // Add cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      // Clean up hero image blob URL
      if (localData.heroImage?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(localData.heroImage.url);
      }

      // Clean up team photo blob URLs
      localData.team?.forEach(member => {
        if (member.photo?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(member.photo.url);
        }
      });

      // Clean up step video blob URLs
      localData.steps?.forEach(step => {
        if (step.videoSrc?.url?.startsWith('blob:')) {
          URL.revokeObjectURL(step.videoSrc.url);
        }
      });
    };
  }, [localData]);

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
        <>
          <AboutImagesControls
            currentData={localData}
            onControlsChange={handleLocalDataUpdate}
            themeColors={themeColors}
          />
          <AboutColorControls
            currentData={localData}
            onControlsChange={handleLocalDataUpdate}
            themeColors={themeColors}
          />
          <AboutStylingControls
            currentData={localData}
            onControlsChange={handleLocalDataUpdate}
          />
        </>
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
    // Don't use blob URLs for display, use the proper path instead
    if (itemConfig.url && !itemConfig.url.startsWith('blob:')) {
      urlToDisplay = itemConfig.url;
    } else if (itemConfig.originalUrl) {
      urlToDisplay = itemConfig.originalUrl;
    }
    nameToStore = itemConfig.name || (urlToDisplay ? urlToDisplay.split('/').pop() : nameToStore);
    
    originalUrlToStore = itemConfig.originalUrl || 
                         (typeof itemConfig.url === 'string' && !itemConfig.url.startsWith('blob:') ? itemConfig.url : defaultPath);

    // Only create blob URL if we have a file and no valid URL
    if (fileObject && !urlToDisplay) {
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
    // First check if we have a valid file object
    if (imageValue.file instanceof File) {
      return URL.createObjectURL(imageValue.file);
    }
    
    // If it's a blob URL and we have a file, create a new blob URL
    if (imageValue.url.startsWith('blob:') && imageValue.file) {
      return URL.createObjectURL(imageValue.file);
    }
    
    // If it's a path, check for override in virtualFS
    const path = imageValue.url.startsWith('/') ? imageValue.url.substring(1) : imageValue.url;
    if (virtualFS && virtualFS[path]) {
      return virtualFS[path];
    }

    // If we have an originalUrl, try that as well
    if (imageValue.originalUrl) {
      const originalPath = imageValue.originalUrl.startsWith('/') ? imageValue.originalUrl.substring(1) : imageValue.originalUrl;
      if (virtualFS && virtualFS[originalPath]) {
        return virtualFS[originalPath];
      }
      return imageValue.originalUrl;
    }
    
    // If we have a non-blob URL, use it
    if (!imageValue.url.startsWith('blob:')) {
      return imageValue.url;
    }
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
AboutBlock.EditorPanel = AboutPreview;

// Expose tabsConfig for BottomStickyEditPanel
AboutBlock.tabsConfig = (blockData, onUpdate, themeColors) => ({
  general: (props) => (
    <div className="p-4 space-y-4">
      <AboutImagesControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
        themeColors={themeColors}
      />
      <AboutColorControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
        themeColors={themeColors}
      />
      <AboutStylingControls
        {...props}
        currentData={blockData}
        onControlsChange={onUpdate}
      />
    </div>
  ),
  images: (props) => (
    <AboutImagesControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors}
    />
  ),
  colors: (props) => (
    <AboutColorControls 
      {...props} 
      currentData={blockData}
      onControlsChange={onUpdate}
      themeColors={themeColors} 
    />
  ),
  styling: (props) => (
    <AboutStylingControls
      {...props}
      currentData={blockData}
      onControlsChange={onUpdate}
    />
  ),
});
