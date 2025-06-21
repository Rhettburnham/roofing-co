import React, { useState, useEffect } from 'react';

export default function HeroBlock({
  heroconfig: heroconfigProp = { 
    // ... existing code ...
  },
  readOnly = false,
  onConfigChange = () => {},
  themeColors = [],
  lastSavedConfig = null, // NEW: last saved config for undo
  onUndoBlock = null,     // NEW: undo handler
  onSaveBlock = null,     // NEW: save handler
}) {
  // ... existing code ...
  // Track local edit state and last saved state
  const [localData, setLocalData] = useState(() => {
    // ... existing code ...
  });
  const [editing, setEditing] = useState(false); // NEW: track edit mode

  // NEW: Reset localData to lastSavedConfig on undo
  const handleUndo = () => {
    if (lastSavedConfig) {
      setLocalData({ ...lastSavedConfig });
      if (onUndoBlock) onUndoBlock();
    }
  };

  // NEW: On save (panel close), call onSaveBlock with updated config
  useEffect(() => {
    if (!editing && prevReadOnlyRef.current === false) {
      if (typeof onSaveBlock === 'function') {
        // Prepare config for saving (update image path to /personal/new/...)
        const dataForParent = prepareDataForOnConfigChange({ ...localData });
        if (dataForParent.images && dataForParent.images.length > 0) {
          const img = dataForParent.images[0];
          const filename = img.name || 'hero_split_background.jpg';
          img.url = `/personal/new/img/main_page_images/HeroBlock/${filename}`;
          dataForParent.heroImage = { ...img, url: img.url };
        }
        onSaveBlock(dataForParent);
      }
    }
    prevReadOnlyRef.current = editing;
  }, [editing]);

  // ... existing code ...
  // UI: Add Undo button next to edit/check icon
  // (Assume parent renders the edit/check/undo buttons, but if not, add here)
  // ... existing code ...
} 