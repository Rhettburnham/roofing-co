# Standardized Text Section Management System

## Overview

This document explains the new standardized text section management system that follows the same pattern as `PanelStylingController` for managing text content sections across blocks.

## Core Components

### PanelTextSectionController

A reusable component for managing text sections (adding/deleting/reordering text portions) that follows the same standardization pattern as `PanelStylingController`.

**Location**: `src/components/common/PanelTextSectionController.jsx`

### Usage Patterns

The system is designed to work with the TopStickyEditPanel's tabsConfig pattern, providing a standardized "general" tab for content management.

## Implementation Guide

### 1. Basic Integration

To add standardized text section management to a block component:

```jsx
import PanelTextSectionController from '../common/PanelTextSectionController';

// Add tabsConfig to your block component
YourBlock.tabsConfig = (config, onControlsChange, themeColors) => {
  return {
    general: () => (
      <PanelTextSectionController
        currentData={config}
        onControlsChange={onControlsChange}
        controlType="bullets" // or 'items', 'simpleItems', 'sections'
        blockType="YourBlock"
      />
    ),
    // ... other tabs (images, colors, styling)
  };
};
```

### 2. Control Types

The system supports different control types for different use cases:

#### `bullets` - For advantage lists (OverviewAndAdvantagesBlock)
```jsx
controlType="bullets"
// Manages: config.bullets array
// Template: { id, title, desc, icon }
```

#### `items` - For structured service items (GeneralList)
```jsx
controlType="items" 
// Manages: config.items array
// Template: { id, name, description, advantages, colorPossibilities, installationTime, pictures }
```

#### `simpleItems` - For simple text lists (GeneralList)
```jsx
controlType="simpleItems"
// Manages: config.items array  
// Template: "New List Item" (string)
```

#### `sections` - For generic content sections
```jsx
controlType="sections"
// Manages: config.sections array
// Template: { id, title, content }
```

### 3. Custom Configuration

You can provide custom configuration for specific needs:

```jsx
<PanelTextSectionController
  currentData={config}
  onControlsChange={onControlsChange}
  controlType="bullets"
  blockType="YourBlock"
  sectionConfig={{
    label: 'Custom Features',
    itemLabel: 'Feature',
    arrayFieldName: 'features',
    itemTemplate: {
      id: Date.now(),
      title: "New Feature",
      description: "Feature description",
      isEnabled: true
    },
    showIcons: false,
    showDescriptions: true,
    isStructured: true
  }}
/>
```

## Implementation Examples

### Example 1: OverviewAndAdvantagesBlock

```jsx
// src/components/blocks/OverviewAndAdvantagesBlock.jsx

OverviewAndAdvantagesBlock.tabsConfig = (config, onControlsChange, themeColors) => {
  return {
    general: () => (
      <PanelTextSectionController
        currentData={config}
        onControlsChange={onControlsChange}
        controlType="bullets"
        blockType="OverviewAndAdvantagesBlock"
      />
    ),
    images: () => (/* ... */),
    colors: () => (/* ... */),
    styling: () => (/* ... */)
  };
};
```

### Example 2: GeneralList (Dynamic)

```jsx
// src/components/blocks/GeneralList.jsx

GeneralList.tabsConfig = (config, onControlsChange, themeColors) => {
  const hasStructuredItems = config?.items?.length > 0 && 
    typeof config.items[0] === "object" && 
    config.items[0] !== null && 
    !Array.isArray(config.items[0]);

  return {
    general: () => {
      const controlType = hasStructuredItems ? 'items' : 'simpleItems';
      
      return (
        <PanelTextSectionController
          currentData={config}
          onControlsChange={onControlsChange}
          controlType={controlType}
          blockType="GeneralList"
          sectionConfig={hasStructuredItems ? {
            label: 'Service Items',
            itemLabel: 'Service',
            arrayFieldName: 'items',
            itemTemplate: {
              id: Date.now(),
              name: "New Service",
              description: "Service description",
              advantages: ["Advantage 1"],
              colorPossibilities: "Various",
              installationTime: "1-2 days",
              pictures: []
            },
            showIcons: false,
            showDescriptions: true,
            isStructured: true
          } : {
            label: 'List Items',
            itemLabel: 'Item',
            arrayFieldName: 'items',
            itemTemplate: "New List Item",
            showIcons: false,
            showDescriptions: false,
            isSimple: true
          }}
        />
      );
    },
    // ... other tabs
  };
};
```

## Features

### Core Functionality
- ✅ Add new items
- ✅ Remove existing items  
- ✅ Reorder items (move up/down)
- ✅ Clear all items (with confirmation)
- ✅ Real-time preview updates

### User Experience
- ✅ Consistent UI following design system
- ✅ Visual feedback for interactions
- ✅ Proper item numbering and labeling
- ✅ Performance tips and guidance
- ✅ Empty state handling

### Flexibility
- ✅ Multiple control types for different use cases
- ✅ Custom configuration support
- ✅ Structured and simple item templates
- ✅ Block-specific customization

## Integration with TopStickyEditPanel

The system integrates seamlessly with the existing TopStickyEditPanel tab system:

1. **Standard Tab Order**: `['general', 'images', 'colors', 'styling']`
2. **Automatic Tab Detection**: Only shows tabs that are properly configured
3. **Consistent Styling**: Follows the same design patterns as other controllers
4. **Error Handling**: Graceful fallback for missing configurations

## Benefits of Standardization

### For Developers
- **Consistent API**: Same interface across all blocks
- **Reduced Code Duplication**: Reusable component for common functionality
- **Easier Maintenance**: Single source of truth for text section management
- **Type Safety**: PropTypes validation for all configurations

### For Users
- **Consistent Experience**: Same UI patterns across different blocks
- **Predictable Behavior**: Standard interactions work the same everywhere
- **Better Performance**: Optimized component with best practices
- **Accessibility**: Built-in accessibility features

## Future Enhancements

- [ ] Drag and drop reordering
- [ ] Bulk edit operations
- [ ] Import/export functionality
- [ ] Undo/redo support
- [ ] Advanced filtering and search
- [ ] Template management system

## Migration Guide

### For Existing Blocks

1. **Remove existing editor panels**: Replace custom text management UI
2. **Add tabsConfig**: Implement the standardized tab configuration
3. **Update imports**: Add PanelTextSectionController import
4. **Configure control type**: Choose appropriate control type for your use case
5. **Test integration**: Verify all functionality works with the new system

### Breaking Changes

- Legacy EditorPanel components are still supported as fallback
- Existing data structures remain compatible
- No changes required to block display components

## Troubleshooting

### Common Issues

1. **Import Error**: Make sure to import from correct path
   ```jsx
   import PanelTextSectionController from '../common/PanelTextSectionController';
   ```

2. **Control Type Mismatch**: Ensure controlType matches your data structure
   - Use `bullets` for objects with `title` and `desc`
   - Use `items` for complex structured objects
   - Use `simpleItems` for string arrays

3. **Missing TabsConfig**: Verify tabsConfig is properly attached to component
   ```jsx
   YourBlock.tabsConfig = (config, onControlsChange, themeColors) => { ... };
   ```

4. **Data Not Updating**: Check that onControlsChange is properly passed and called
   ```jsx
   onControlsChange({ ...config, [arrayFieldName]: newArray });
   ```

## Support

For questions or issues related to the standardized text section management system, please refer to:
- Component documentation in source files
- TopStickyEditPanel integration guide
- PanelStylingController patterns (similar architecture) 