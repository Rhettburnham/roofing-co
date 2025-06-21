import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import BottomStickyEditPanel from './BottomStickyEditPanel';
import PanelImagesController from './common/PanelImagesController';
import BlockEditControl from './common/BlockEditControl';
import { cloneConfigStripFiles } from '../utils/blockUtils';

const AboutPageForm = ({
  aboutData,
  onAboutDataChange,
  themeColors,
  sitePalette,
  initialAboutData = null,
  forcedPreviewStates = {},
  onPreviewStateChange,
  deviceViewport = 'desktop',
}) => {
  const [internalAboutData, setInternalAboutData] = useState(aboutData);
  const [activeEditSection, setActiveEditSection] = useState(null);
  const panelRef = useRef(null);
  const sectionRefs = useRef({});

  // Update internal state when parent data changes
  useEffect(() => {
    setInternalAboutData(aboutData);
  }, [aboutData]);

  // Handle changes to about data
  const handleDataChange = useCallback((newData) => {
    setInternalAboutData(newData);
    onAboutDataChange(newData);
  }, [onAboutDataChange]);

  // Handle inline text changes
  const handleInlineTextChange = useCallback((field, value) => {
    const newData = { ...internalAboutData, [field]: value };
    handleDataChange(newData);
  }, [internalAboutData, handleDataChange]);

  // Handle array item changes (like team members, values, stats)
  const handleArrayItemChange = useCallback((arrayName, index, field, value) => {
    const newData = { ...internalAboutData };
    if (!newData[arrayName]) newData[arrayName] = [];
    
    const newArray = [...newData[arrayName]];
    if (!newArray[index]) newArray[index] = {};
    
    newArray[index] = { ...newArray[index], [field]: value };
    newData[arrayName] = newArray;
    
    handleDataChange(newData);
  }, [internalAboutData, handleDataChange]);

  // Handle adding/removing array items
  const handleAddArrayItem = useCallback((arrayName, defaultItem) => {
    const newData = { ...internalAboutData };
    if (!newData[arrayName]) newData[arrayName] = [];
    newData[arrayName] = [...newData[arrayName], defaultItem];
    handleDataChange(newData);
  }, [internalAboutData, handleDataChange]);

  const handleRemoveArrayItem = useCallback((arrayName, index) => {
    const newData = { ...internalAboutData };
    if (newData[arrayName]) {
      newData[arrayName] = newData[arrayName].filter((_, i) => i !== index);
      handleDataChange(newData);
    }
  }, [internalAboutData, handleDataChange]);

  // Toggle edit state for sections
  const handleToggleEditState = useCallback((sectionIdentifier) => {
    setActiveEditSection((prev) => {
      if (prev === sectionIdentifier) {
        // Closing panel - scroll down
        setTimeout(() => {
          const panelHeight = panelRef.current ? panelRef.current.offsetHeight : 400;
          const currentScrollY = window.scrollY;
          window.scrollTo({
            top: currentScrollY + panelHeight,
            behavior: 'smooth',
          });
        }, 100);
        return null;
      }

      // Opening panel - scroll to position
      setTimeout(() => {
        const sectionElement = sectionRefs.current[sectionIdentifier]?.current;
        if (sectionElement) {
          const elementTop = sectionElement.getBoundingClientRect().top + window.scrollY;
          const viewportHeight = window.innerHeight;
          const targetPosition = elementTop - (viewportHeight * 0.2);
          
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth',
          });
        }
      }, 100);
      
      return sectionIdentifier;
    });
  }, []);

  // Undo changes for a section
  const handleUndoSection = useCallback((sectionKey) => {
    if (initialAboutData) {
      handleDataChange(initialAboutData);
      setActiveEditSection(null);
    }
  }, [initialAboutData, handleDataChange]);

  // Get panel configuration for active section
  const getActiveSectionDataForPanel = useMemo(() => {
    if (!activeEditSection || !internalAboutData) return null;

    const sectionConfigs = {
      hero: {
        blockName: "AboutHero",
        config: {
          title: internalAboutData.title || '',
          subtitle: internalAboutData.subtitle || '',
          heroImage: internalAboutData.heroImage || '',
          images: internalAboutData.heroImage ? [internalAboutData.heroImage] : []
        },
        onPanelChange: (newConfig) => {
          const updatedData = {
            ...internalAboutData,
            title: newConfig.title,
            subtitle: newConfig.subtitle,
            heroImage: newConfig.images?.[0] || newConfig.heroImage,
          };
          handleDataChange(updatedData);
        },
        tabsConfig: {
          content: ({ currentData, onControlsChange }) => (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Hero Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title:</label>
                  <input
                    type="text"
                    value={currentData.title || ''}
                    onChange={(e) => onControlsChange({ ...currentData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle:</label>
                  <input
                    type="text"
                    value={currentData.subtitle || ''}
                    onChange={(e) => onControlsChange({ ...currentData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ),
          images: ({ currentData, onControlsChange }) => (
            <PanelImagesController
              currentData={currentData}
              onControlsChange={onControlsChange}
              imageArrayFieldName="images"
              maxImages={1}
              getItemName={(item, index) => `Hero Image`}
            />
          ),
        },
      },
      content: {
        blockName: "AboutContent",
        config: {
          history: internalAboutData.history || '',
          mission: internalAboutData.mission || '',
        },
        onPanelChange: (newConfig) => {
          const updatedData = {
            ...internalAboutData,
            history: newConfig.history,
            mission: newConfig.mission,
          };
          handleDataChange(updatedData);
        },
        tabsConfig: {
          content: ({ currentData, onControlsChange }) => (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">About Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">History:</label>
                  <textarea
                    value={currentData.history || ''}
                    onChange={(e) => onControlsChange({ ...currentData, history: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mission:</label>
                  <textarea
                    value={currentData.mission || ''}
                    onChange={(e) => onControlsChange({ ...currentData, mission: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ),
        },
      },
      values: {
        blockName: "AboutValues",
        config: {
          values: internalAboutData.values || []
        },
        onPanelChange: (newConfig) => {
          const updatedData = {
            ...internalAboutData,
            values: newConfig.values,
          };
          handleDataChange(updatedData);
        },
        tabsConfig: {
          content: ({ currentData, onControlsChange }) => (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Company Values</h3>
              <div className="space-y-4">
                {(currentData.values || []).map((value, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Value {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newValues = currentData.values.filter((_, i) => i !== index);
                          onControlsChange({ ...currentData, values: newValues });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Title:</label>
                      <input
                        type="text"
                        value={value.title || ''}
                        onChange={(e) => {
                          const newValues = [...currentData.values];
                          newValues[index] = { ...newValues[index], title: e.target.value };
                          onControlsChange({ ...currentData, values: newValues });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description:</label>
                      <textarea
                        value={value.description || ''}
                        onChange={(e) => {
                          const newValues = [...currentData.values];
                          newValues[index] = { ...newValues[index], description: e.target.value };
                          onControlsChange({ ...currentData, values: newValues });
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newValues = [...(currentData.values || []), { title: '', description: '' }];
                    onControlsChange({ ...currentData, values: newValues });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Value
                </button>
              </div>
            </div>
          ),
        },
      },
      team: {
        blockName: "AboutTeam",
        config: {
          team: internalAboutData.team || [],
          images: (internalAboutData.team || []).map(member => member.photo).filter(Boolean)
        },
        onPanelChange: (newConfig) => {
          // Update team member photos from images array
          const updatedTeam = (newConfig.team || []).map((member, index) => ({
            ...member,
            photo: newConfig.images?.[index] || member.photo
          }));
          
          const updatedData = {
            ...internalAboutData,
            team: updatedTeam,
          };
          handleDataChange(updatedData);
        },
        tabsConfig: {
          content: ({ currentData, onControlsChange }) => (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Team Members</h3>
              <div className="space-y-4">
                {(currentData.team || []).map((member, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Team Member {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newTeam = currentData.team.filter((_, i) => i !== index);
                          const newImages = currentData.images.filter((_, i) => i !== index);
                          onControlsChange({ ...currentData, team: newTeam, images: newImages });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Name:</label>
                      <input
                        type="text"
                        value={member.name || ''}
                        onChange={(e) => {
                          const newTeam = [...currentData.team];
                          newTeam[index] = { ...newTeam[index], name: e.target.value };
                          onControlsChange({ ...currentData, team: newTeam });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Position:</label>
                      <input
                        type="text"
                        value={member.position || ''}
                        onChange={(e) => {
                          const newTeam = [...currentData.team];
                          newTeam[index] = { ...newTeam[index], position: e.target.value };
                          onControlsChange({ ...currentData, team: newTeam });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newTeam = [...(currentData.team || []), { name: '', position: '', photo: '' }];
                    const newImages = [...(currentData.images || []), ''];
                    onControlsChange({ ...currentData, team: newTeam, images: newImages });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Team Member
                </button>
              </div>
            </div>
          ),
          images: ({ currentData, onControlsChange }) => (
            <PanelImagesController
              currentData={currentData}
              onControlsChange={onControlsChange}
              imageArrayFieldName="images"
              getItemName={(item, index) => `${currentData.team?.[index]?.name || `Team Member ${index + 1}`} Photo`}
            />
          ),
        },
      },
      stats: {
        blockName: "AboutStats",
        config: {
          stats: internalAboutData.stats || []
        },
        onPanelChange: (newConfig) => {
          const updatedData = {
            ...internalAboutData,
            stats: newConfig.stats,
          };
          handleDataChange(updatedData);
        },
        tabsConfig: {
          content: ({ currentData, onControlsChange }) => (
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Company Stats</h3>
              <div className="space-y-4">
                {(currentData.stats || []).map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Stat {index + 1}</h4>
                      <button
                        onClick={() => {
                          const newStats = currentData.stats.filter((_, i) => i !== index);
                          onControlsChange({ ...currentData, stats: newStats });
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Title:</label>
                      <input
                        type="text"
                        value={stat.title || ''}
                        onChange={(e) => {
                          const newStats = [...currentData.stats];
                          newStats[index] = { ...newStats[index], title: e.target.value };
                          onControlsChange({ ...currentData, stats: newStats });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Value:</label>
                      <input
                        type="number"
                        value={stat.value || ''}
                        onChange={(e) => {
                          const newStats = [...currentData.stats];
                          newStats[index] = { ...newStats[index], value: parseInt(e.target.value) || 0 };
                          onControlsChange({ ...currentData, stats: newStats });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Icon:</label>
                      <input
                        type="text"
                        value={stat.icon || ''}
                        onChange={(e) => {
                          const newStats = [...currentData.stats];
                          newStats[index] = { ...newStats[index], icon: e.target.value };
                          onControlsChange({ ...currentData, stats: newStats });
                        }}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., FaAward, FaUsers"
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newStats = [...(currentData.stats || []), { title: '', value: 0, icon: '' }];
                    onControlsChange({ ...currentData, stats: newStats });
                  }}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500"
                >
                  + Add Stat
                </button>
              </div>
            </div>
          ),
        },
      },
    };

    return sectionConfigs[activeEditSection] || null;
  }, [activeEditSection, internalAboutData, handleDataChange]);

  if (!internalAboutData) {
    return <div className="p-4 text-center">Loading about data...</div>;
  }

  return (
    <div className="about-page-form">
      {activeEditSection && getActiveSectionDataForPanel && (
        <BottomStickyEditPanel
          ref={panelRef}
          isOpen={!!activeEditSection}
          onClose={() => handleToggleEditState(activeEditSection)}
          activeBlockData={getActiveSectionDataForPanel}
          forcedPreviewStates={forcedPreviewStates}
          onPreviewStateChange={onPreviewStateChange}
        />
      )}

      {/* Hero Section */}
      <div
        ref={(el) => (sectionRefs.current['hero'] = { current: el })}
        className={`relative bg-white border transition-all duration-300 overflow-hidden ${
          activeEditSection === 'hero' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditSection === 'hero'}
          onToggleEdit={() => handleToggleEditState('hero')}
          onUndo={() => handleUndoSection('hero')}
          showUndo={activeEditSection === 'hero'}
          zIndex="z-[60]"
        />
        <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              contentEditable={activeEditSection !== 'hero'}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleInlineTextChange('title', e.target.textContent)}
              className="text-4xl md:text-5xl font-bold mb-4 outline-none focus:bg-blue-800/20 rounded px-2 py-1"
            >
              {internalAboutData.title || 'About Us'}
            </div>
            <div 
              contentEditable={activeEditSection !== 'hero'}
              suppressContentEditableWarning={true}
              onBlur={(e) => handleInlineTextChange('subtitle', e.target.textContent)}
              className="text-xl mb-8 outline-none focus:bg-blue-800/20 rounded px-2 py-1"
            >
              {internalAboutData.subtitle || 'Building Strong Roofs, Stronger Relationships'}
            </div>
            {internalAboutData.heroImage && (
              <div className="max-w-3xl mx-auto">
                <img 
                  src={typeof internalAboutData.heroImage === 'object' ? internalAboutData.heroImage.url : internalAboutData.heroImage}
                  alt="About Hero"
                  className="w-full h-64 object-cover rounded-lg shadow-xl"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        ref={(el) => (sectionRefs.current['content'] = { current: el })}
        className={`relative bg-white border transition-all duration-300 overflow-hidden ${
          activeEditSection === 'content' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditSection === 'content'}
          onToggleEdit={() => handleToggleEditState('content')}
          onUndo={() => handleUndoSection('content')}
          showUndo={activeEditSection === 'content'}
          zIndex="z-[60]"
        />
        <div className="py-16 px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our History</h3>
                <div 
                  contentEditable={activeEditSection !== 'content'}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleInlineTextChange('history', e.target.textContent)}
                  className="text-gray-600 leading-relaxed outline-none focus:bg-gray-100 rounded px-2 py-2"
                >
                  {internalAboutData.history || 'Our company history...'}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Mission</h3>
                <div 
                  contentEditable={activeEditSection !== 'content'}
                  suppressContentEditableWarning={true}
                  onBlur={(e) => handleInlineTextChange('mission', e.target.textContent)}
                  className="text-gray-600 leading-relaxed outline-none focus:bg-gray-100 rounded px-2 py-2"
                >
                  {internalAboutData.mission || 'Our mission statement...'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div
        ref={(el) => (sectionRefs.current['values'] = { current: el })}
        className={`relative bg-gray-50 border transition-all duration-300 overflow-hidden ${
          activeEditSection === 'values' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditSection === 'values'}
          onToggleEdit={() => handleToggleEditState('values')}
          onUndo={() => handleUndoSection('values')}
          showUndo={activeEditSection === 'values'}
          zIndex="z-[60]"
        />
        <div className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Values</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(internalAboutData.values || []).map((value, index) => (
                <div key={index} className="text-center">
                  <h4 
                    contentEditable={activeEditSection !== 'values'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleArrayItemChange('values', index, 'title', e.target.textContent)}
                    className="text-xl font-semibold mb-3 text-blue-600 outline-none focus:bg-blue-50 rounded px-2 py-1"
                  >
                    {value.title || 'Value Title'}
                  </h4>
                  <div 
                    contentEditable={activeEditSection !== 'values'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleArrayItemChange('values', index, 'description', e.target.textContent)}
                    className="text-gray-600 outline-none focus:bg-gray-100 rounded px-2 py-2"
                  >
                    {value.description || 'Value description...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div
        ref={(el) => (sectionRefs.current['team'] = { current: el })}
        className={`relative bg-white border transition-all duration-300 overflow-hidden ${
          activeEditSection === 'team' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditSection === 'team'}
          onToggleEdit={() => handleToggleEditState('team')}
          onUndo={() => handleUndoSection('team')}
          showUndo={activeEditSection === 'team'}
          zIndex="z-[60]"
        />
        <div className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Meet Our Team</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(internalAboutData.team || []).map((member, index) => (
                <div key={index} className="text-center">
                  {member.photo && (
                    <div className="mb-4">
                      <img 
                        src={typeof member.photo === 'object' ? member.photo.url : member.photo}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg"
                      />
                    </div>
                  )}
                  <h4 
                    contentEditable={activeEditSection !== 'team'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleArrayItemChange('team', index, 'name', e.target.textContent)}
                    className="text-xl font-semibold mb-2 text-gray-800 outline-none focus:bg-gray-50 rounded px-2 py-1"
                  >
                    {member.name || 'Team Member Name'}
                  </h4>
                  <div 
                    contentEditable={activeEditSection !== 'team'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleArrayItemChange('team', index, 'position', e.target.textContent)}
                    className="text-blue-600 font-medium outline-none focus:bg-blue-50 rounded px-2 py-1"
                  >
                    {member.position || 'Position'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={(el) => (sectionRefs.current['stats'] = { current: el })}
        className={`relative bg-blue-900 text-white border transition-all duration-300 overflow-hidden ${
          activeEditSection === 'stats' 
            ? 'ring-4 ring-blue-500/50 shadow-lg shadow-blue-500/25 animate-pulse-glow' 
            : ''
        }`}
      >
        <BlockEditControl
          isEditing={activeEditSection === 'stats'}
          onToggleEdit={() => handleToggleEditState('stats')}
          onUndo={() => handleUndoSection('stats')}
          showUndo={activeEditSection === 'stats'}
          zIndex="z-[60]"
        />
        <div className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(internalAboutData.stats || []).map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold mb-2">
                    <span 
                      contentEditable={activeEditSection !== 'stats'}
                      suppressContentEditableWarning={true}
                      onBlur={(e) => handleArrayItemChange('stats', index, 'value', parseInt(e.target.textContent) || 0)}
                      className="outline-none focus:bg-blue-800/20 rounded px-2 py-1"
                    >
                      {stat.value || 0}
                    </span>
                  </div>
                  <div 
                    contentEditable={activeEditSection !== 'stats'}
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleArrayItemChange('stats', index, 'title', e.target.textContent)}
                    className="text-lg font-medium outline-none focus:bg-blue-800/20 rounded px-2 py-1"
                  >
                    {stat.title || 'Stat Title'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AboutPageForm.propTypes = {
  aboutData: PropTypes.object.isRequired,
  onAboutDataChange: PropTypes.func.isRequired,
  themeColors: PropTypes.object,
  sitePalette: PropTypes.array,
  initialAboutData: PropTypes.object,
  forcedPreviewStates: PropTypes.object,
  onPreviewStateChange: PropTypes.func,
  deviceViewport: PropTypes.string,
};

export default AboutPageForm; 